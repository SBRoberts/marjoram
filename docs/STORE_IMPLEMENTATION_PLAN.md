# Plan: `store()` — best-in-class deep reactivity for Marjoram

> **Status:** Proposal / implementation plan. Not yet started.
> **Owner:** TBD
> **Last updated:** 2026-05-22
>
> This is the cross-session reference for the deep-reactivity initiative. The eventual user-facing documentation lives at `docs/STORES.md` (to be written in Phase 1). This file is the *implementation* plan and design rationale.

## Context

Marjoram currently exposes `signal()` (shallow, reference-based) as its only reactive primitive. Nested mutations (`vm.user.name = "x"`) don't trigger updates, forcing immutable-update patterns (`vm.user = { ...vm.user, name: "x" }`) that get painful at depth. The library has chosen explicitness as a core DX philosophy (`$prop` for reactive bindings vs. `prop` for values) — so the right answer is **not** to make all signals deep, but to add a *named peer primitive*: `store()`.

The bundle's ~5KB size is treated as a *result* of disciplined design, not a budget to optimize against. Quality and DX come first.

## Goal

Add a `store()` primitive that lets users write `vm.user.address.city = "x"` and have only the subscribers to *that exact path* re-run. It must feel as natural as mutating a plain object, while remaining as predictable as `signal()`. No flags, no global modes — a named primitive that earns its place by being unambiguously better than the alternatives for nested state.

## Guiding principles (each one closes a known failure mode in a competitor)

1. **Coherent with the `$` philosophy.** You opt into deep reactivity at the *import/constructor site*, not via a hidden flag. Reading `vm.$user.address.city` in a template means the exact same thing it always meant: "bind to a reactive value." Anyone reading the code can predict behavior.
2. **Path-level granularity.** Mutating `state.user.name` notifies only `state.user.name` subscribers. Not `state.user`, not the root. This is what Vue 3, Valtio, and (with explicit paths) Solid all do correctly — and what MobX's "deep observable" can get wrong by waking too many observers.
3. **Lazy proxying with stable identity.** Nested objects are only wrapped when accessed, and the wrapper is cached in a `WeakMap` so `state.user === state.user` across reads. This is the bug that bites consumers of naively-built proxy systems.
4. **Hard boundaries on what gets proxied.** Plain objects and arrays only. `Date`, `Map`, `Set`, `RegExp`, `Promise`, DOM nodes, and any object with a non-`Object` prototype pass through *untouched*. Wrapping a `Date` because it's an object is the kind of "magic" that destroys trust.
5. **Reuses the existing subscriber machinery.** No parallel reactivity system. Each tracked path corresponds to a lightweight `SignalNode` (the same one in [src/reactivity/signal.ts](../src/reactivity/signal.ts)). That means `computed`, `effect`, `batch`, `untracked`, and the view layer's existing dependency tracking all work with zero special-casing.
6. **Type-safe through arbitrary depth.** `Store<T>` preserves `T` exactly through the proxy. Reading `store.user.address.city` is typed `string`, not `unknown`. Tests assert this with `expectTypeOf`.
7. **Predictable identity rules.** Assigning the same value (per `Object.is`) is a no-op. Replacing a subtree (`state.user = newUser`) reuses the existing proxy for `state.user` if the new value is structurally compatible, otherwise replaces it cleanly. Subscribers to paths that no longer exist are GC'd.

## Phase 0 — `repeat()` discoverability (warm-up)

**Premise correction (2026-05-22):** `repeat` IS exported transitively via `src/view/index.ts` → `src/index.ts` (`export * from "./view"`), and the test at [__tests__/view/repeat.test.ts](../__tests__/view/repeat.test.ts) confirms it works. The real gap is *discoverability*:
- No explicit `export { repeat }` line in [src/index.ts](../src/index.ts) — surfaces only through `export *` chains.
- Not documented in [README.md](../README.md).

Phase 0 therefore becomes:
1. Add explicit named `export { repeat }` to [src/index.ts](../src/index.ts) (improves IDE go-to-definition, signals "this is public API" to readers).
2. Add a `repeat()` section to [README.md](../README.md) with the example already in the JSDoc.
3. Confirm the trio (`type-check`, `lint`, `test`) still passes.

**Acceptance:** `repeat` shows up in IDE autocomplete for `import { ... } from "marjoram"` without users having to dig. README example exists. CI green.

**Release:** v1.0.1 (patch — no behavior change, docs and surface clarity only).

## Phase 1 — Design doc (`docs/STORES.md`)

Write this *before* any implementation. Sections:

- **Mental model**: stores are "graph of signals, lazily projected through proxies."
- **API surface**:
  - `store<T>(initial: T): Store<T>`
  - `snapshot<T>(s: Store<T>): T` — pure object copy for serialization, logging, hashing
  - `subscribe<T>(s: Store<T>, path: string[] | undefined, cb: (newVal, oldVal) => void): () => void` — escape hatch
  - `isStore(x): x is Store<unknown>`
  - `unwrap<T>(s: Store<T>): T` — get the underlying mutable object (advanced; same warning as Vue's `toRaw`)
- **Type signatures** with exhaustive generic preservation examples.
- **Boundary rules table**: every built-in JS type, what happens, why.
- **Comparison matrix**: Marjoram `store` vs. Solid `createStore` vs. Vue `reactive` vs. Valtio `proxy` vs. MobX `observable`. Honest — call out where competitors are better (e.g., Solid's path-setter syntax for atomic updates) and explain the design choice not to copy it.
- **Migration patterns**: when to choose `signal` vs `store`. Mixed-mode examples.

Land this as an issue/PR first to get alignment before code.

**Acceptance:** Design doc reviewed and approved. Open questions (below) resolved.

## Phase 2 — Core implementation

`src/reactivity/store.ts`. Built on the existing primitives — no new core.

- **One `SignalNode` per tracked path.** Created lazily on first read of that path. Stored in a tree mirroring the data shape, with `WeakRef`-based GC for paths no longer reachable.
- **Proxy handlers**:
  - `get`: registers the active subscriber against the path's `SignalNode`, returns either the primitive value or a (cached) child proxy.
  - `set`: `Object.is` short-circuit; updates underlying object; notifies the path's `SignalNode`; if the assigned value is itself an object, invalidates the cached child proxy.
  - `deleteProperty`: notifies the path *and* the parent (key set changed).
  - `has` / `ownKeys`: track parent for iteration sensitivity (so `for (k in store)` is reactive to key additions).
- **Identity cache**: `WeakMap<RawObject, Proxy>` so `store.user === store.user`.
- **Cycle detection**: `WeakSet` during proxy creation; cycles return the existing proxy.

**Acceptance:** Internal `store()` exists with full TypeScript types. Basic granularity test passes (writing to one path wakes only that path's subscriber). Not yet integrated with view layer.

## Phase 3 — Array and built-in handling

This is where most competitors leak abstraction. Specifically:

- **Array indices and `.length`**: each is its own tracked path. `arr.push(x)` notifies both the new index *and* `length` — `arr.map` over a reactive store wakes only on length+content changes, not on every index read.
- **Mutating array methods** (`push`/`pop`/`shift`/`unshift`/`splice`/`sort`/`reverse`/`fill`/`copyWithin`) are wrapped to batch their internal mutations and emit a single coherent notification round.
- **Read-only array methods** (`map`/`filter`/`forEach`/...) work via the standard proxy `get` path — no override needed.
- **Built-in passthrough**: `Date`, `Map`, `Set`, `WeakMap`, `WeakSet`, `RegExp`, `Promise`, `ArrayBuffer`, typed arrays, DOM nodes, functions, anything whose prototype isn't `Object.prototype` or `Array.prototype`. They're stored as-is; mutating them is invisible to the store (documented). For users who want reactive `Map`/`Set`, that's a future `reactiveMap`/`reactiveSet` discussion — out of scope.
- **Class instances**: bypass entirely. This is the "least surprise" choice; Vue's `markRaw` exists because they got this wrong initially.

**Acceptance:** Array mutation methods produce correct, batched notifications. Built-in types pass through verifiably (referential equality preserved).

## Phase 4 — Integration

The point of building on existing primitives is that integration should be *trivial*:

- **`html` templates**: `$store.user.name` returns a `SchemaProp`-equivalent reactive binding. Mechanism: when `$`-access on the store hits a leaf path, we wrap that path's `SignalNode` in the existing `SchemaProp` shape.
- **`useViewModel`**: accepts stores as model values. Nested objects in a `useViewModel` definition automatically become stores (this is the one place where "deep by default" is the right call, because the user has already explicitly chosen `useViewModel`). **Pending decision** — see open questions.
- **`repeat()`**: passing a reactive store array Just Works because `repeat` already consumes anything with `.value` + `.observe()`; we expose those on store-array bindings.
- **`computed` / `effect` / `batch` / `untracked`**: zero changes required. They subscribe to `SignalNode`s; our paths *are* `SignalNode`s.

**Acceptance:** Integration tests pass. Existing `useViewModel`, `html`, `repeat()` tests still green. Demo widget using a store renders and updates granularly.

## Phase 5 — DX polish (the "exceptional" part)

- **`snapshot(store)`**: deep-clone to a plain object. Critical for `JSON.stringify`, structural equality testing, time-travel debugging.
- **Custom devtools formatter**: Chrome supports custom object formatters via `window.devtoolsFormatters`. Ship one so stores render as `Store { user: { ... } }` in the console instead of `Proxy { ... }`. This single thing is what makes Vue's stores feel "polished" and Valtio's feel "raw."
- **Dev-mode warnings**: `process.env.NODE_ENV !== 'production'` checks that warn on common footguns (mutating during render, replacing a store root, holding a stale proxy reference after `dispose`). Stripped in production builds.
- **Stable diagnostic names**: `store({...}, { name: 'app' })` (optional) used in dev warnings and devtools labels.
- **`onCleanup`-style scoping**: stores created inside `effect`/`computed` auto-dispose when the owning scope tears down. Matches Solid's ownership model.

**Acceptance:** Stores render legibly in Chrome devtools. Dev-mode warnings fire and are stripped in prod build. `snapshot()` round-trips via `JSON.stringify`.

## Phase 6 — Test suite

Three layers, all in `__tests__/reactivity/store/`:

1. **Parity tests**: port Solid's `createStore` test suite verbatim where applicable. If they pass, we're at table stakes.
2. **Granularity assertions**: instrument `effect` runs and assert exact counts. "Setting `state.a.b` triggered N effects, expected 1."
3. **Edge cases** ([__tests__/edge-cases/](../__tests__/edge-cases/)): cycles, deletion of subscribed paths, replacing a subtree, freezing, prototype pollution attempts, Symbol keys, getters on the source object, accessor descriptors, very deep trees (1000 levels) for stack safety.
4. **Memory leak tests**: create + dispose 10k stores, assert heap doesn't grow (using `--expose-gc` and `process.memoryUsage()` deltas).
5. **Type tests** via `expectTypeOf` for the depth-preservation claim.

**Acceptance:** ≥95% coverage on `store.ts`. All edge cases pass. Memory test shows no leak.

## Phase 7 — Benchmarks

[__tests__/benchmarks/](../__tests__/benchmarks/) per the ratio-vs-baseline rules in [PERFORMANCE_TESTING_PHILOSOPHY.md](../PERFORMANCE_TESTING_PHILOSOPHY.md). Compare:

- `store` vs equivalent `signal`-only patterns (overhead measurement).
- `store` vs Solid `createStore` (peer comparison).
- `store` vs Vue `reactive` if we can isolate the reactivity layer.

**Acceptance:** Within 1.5× of Solid for path-write throughput and effect-fanout latency on the standard "10k rows, update 1 cell" benchmark.

## Phase 8 — Docs, demo, release

- Update [README.md](../README.md) with `store()` section after `signal()`. Show the side-by-side: when to pick which.
- Move the design doc from Phase 1 to its final home as user docs (`docs/STORES.md`).
- New `demo/nested-form/` example: a deeply-nested form editor that visibly proves only-the-edited-field re-renders. This is the demo that sells the feature.
- Export `store`, `snapshot`, `subscribe`, `isStore`, `unwrap` from [src/index.ts](../src/index.ts). Export `repeat` (from Phase 0, but reconfirm).
- Minor version bump (purely additive). Conventional commit `feat: add store() for deep reactivity`.
- Bundle-size note in the PR description — *not as a budget check*, but as informational disclosure.

**Acceptance:** Released to npm. Demo runs. README + STORES.md reflect final API.

## Versioning and release strategy

Current: **v1.0.0**, manual versioning via `package.json` + `npm run release` (test + build + publish). Semver applies strictly from here on.

Phased releases (all additive, all non-breaking by design):

| Version | Phases | Scope | Bump |
|---|---|---|---|
| v1.0.1 | Phase 0 | Explicit `repeat` export + README docs | patch |
| v1.1.0 | Phases 2 + 3 + 4 | `store()` core + array support + view-layer integration | minor |
| v1.2.0 | Phases 5 + 6 + 7 | DX polish, full test suite, benchmarks | minor |
| v1.2.x | Phase 8 | Demo + README finalization (may overlap into v1.2.0) | minor/patch |

Phase 1 (design doc) does not ship to npm — it lands as a PR adding `docs/STORES.md`.

### Non-breaking-change rules (binding for this initiative)

The whole point of `store()` being a *peer* primitive is that nothing existing changes. These rules are how we enforce that:

1. **Signatures locked.** Do not modify the signature, generics, or return type of any of: `signal`, `computed`, `effect`, `batch`, `untracked`, `html`, `useViewModel`, `createWidget`, `when`, `repeat`, `SchemaProp`, `Signal`, `ReadonlySignal`.
2. **Runtime semantics locked.** Existing code paths must produce byte-identical output and identical effect-fire counts before and after the change. Existing tests must pass unchanged.
3. **New module, new exports only.** `store()` lives in a new file (`src/reactivity/store.ts`). Edits to existing files are limited to: (a) adding `store` to the public-export list, (b) adding type-only entries to discriminate `Store<T>` in shared types if needed.
4. **`useViewModel` stays explicit.** Open question #1 below is now **locked to "explicit"**: `useViewModel({ user: {...} })` does NOT auto-store nested objects. Auto-storing would silently change behavior for existing consumers who currently rely on nested objects being plain (non-reactive). Users opt in via `useViewModel({ user: store({...}) })`. This is the safe-and-coherent choice; it also matches the `$` philosophy.
5. **No type widening in existing APIs.** If we need a new generic constraint to make stores integrate, it goes on `store()` itself, not on `useViewModel` / `html` / etc.
6. **Bundle-size disclosure, not gate.** Every PR in the initiative discloses the gzipped `dist/` size delta in the description. We do not block on a number, but we make the cost visible.
7. **Each phase is its own PR.** Reviewable, revertable independently. CI must be green on all three Node versions before merge.

### Rollout cadence

- **v1.0.1** ships immediately after Phase 0 merges. Low-risk warm-up; surfaces the existing `repeat` to consumers.
- **v1.1.0-rc.0** prerelease published once Phases 2+3+4 land on `main`. Tag prereleases via `npm publish --tag next` so `npm install marjoram@latest` is unaffected. Solicit dogfooding for ≥1 week.
- **v1.1.0** stable after the prerelease window has no blocking feedback.
- **v1.2.0-rc.0** same model after Phases 5–7.
- **v2.0.0 is reserved.** It exists only if we discover that a coherent `store()` requires a breaking change to an existing API. The current design explicitly avoids that — if it becomes necessary, that's a re-plan trigger, not a quiet bump.

## Open questions to resolve before Phase 2

1. **Auto-store inside `useViewModel`**: ~~should `useViewModel({ user: {...} })` make `user` a store automatically, or require `useViewModel({ user: store({...}) })`?~~ **LOCKED to explicit** (2026-05-22) — auto-storing would silently change behavior for existing consumers, violating the non-breaking-change rules above. Users opt in via `store(...)`. See §"Non-breaking-change rules" item 4.
2. **Atomic multi-path updates**: do we need a `produce`-style API (Immer/Solid) for transactional updates, or is `batch(() => { ... })` around direct mutations enough? Current lean: **batch is enough**, but flag it.
3. **`Map`/`Set` reactive variants**: defer to a follow-up, or include from day one? Current lean: **defer** — the feature is already large.

These get decided in Phase 1, written up in the design doc, and don't block starting.

## Cross-references

- Existing reactivity primitives: [src/reactivity/signal.ts](../src/reactivity/signal.ts)
- Existing schema/prop bridge: [src/schema/schemaPropFactory.ts](../src/schema/schemaPropFactory.ts)
- Existing keyed list helper (Phase 0 export target): [src/view/external/repeat.ts](../src/view/external/repeat.ts)
- Public API surface: [src/index.ts](../src/index.ts)
- Project conventions and contracts: [CLAUDE.md](../CLAUDE.md) (symlinks: `AGENTS.md`, `.github/copilot-instructions.md`)
- Performance testing philosophy: [PERFORMANCE_TESTING_PHILOSOPHY.md](../PERFORMANCE_TESTING_PHILOSOPHY.md)
