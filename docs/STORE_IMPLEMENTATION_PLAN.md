# Plan: `store()` — deep reactivity for Marjoram

> **Status: ✅ Complete — all phases shipped in v1.1.0.** This is a historical record of how the deep-reactivity initiative was built (Phases 0–8 + a 7.5 review-remediation pass), kept for the design rationale and the versioning/non-breaking-change rules. **For the current public contract, see [STORES.md](STORES.md); for the "why" behind each decision, see [STORE_RESEARCH_FINDINGS.md](STORE_RESEARCH_FINDINGS.md).** This file is not a live roadmap.

## Context

Marjoram currently exposes `signal()` (shallow, reference-based) as its only reactive primitive. Nested mutations (`vm.user.name = "x"`) don't trigger updates, forcing immutable-update patterns (`vm.user = { ...vm.user, name: "x" }`) that get painful at depth. The library has chosen explicitness as a core DX philosophy (`$prop` for reactive bindings vs. `prop` for values) — so the right answer is **not** to make all signals deep, but to add a _named peer primitive_: `store()`.

The bundle's ~5KB size is treated as a _result_ of disciplined design, not a budget to optimize against. Quality and DX come first.

## Goal

Add a `store()` primitive that lets users write `vm.user.address.city = "x"` and have only the subscribers to _that exact path_ re-run. It must feel as natural as mutating a plain object, while remaining as predictable as `signal()`. No flags, no global modes — a named primitive that earns its place by being unambiguously better than the alternatives for nested state.

## Guiding principles (each one closes a known failure mode in a competitor)

1. **Coherent with the `$` philosophy.** You opt into deep reactivity at the _import/constructor site_, not via a hidden flag. Reading `vm.$user.address.city` in a template means the exact same thing it always meant: "bind to a reactive value." Anyone reading the code can predict behavior.
2. **Path-level granularity.** Mutating `state.user.name` notifies only `state.user.name` subscribers. Not `state.user`, not the root. This is what Vue 3, Valtio, and (with explicit paths) Solid all do correctly — and what MobX's "deep observable" can get wrong by waking too many observers.
3. **Lazy proxying with stable identity.** Nested objects are only wrapped when accessed, and the wrapper is cached in a `WeakMap` so `state.user === state.user` across reads. This is the bug that bites consumers of naively-built proxy systems.
4. **Hard boundaries on what gets proxied.** Plain objects and arrays only. `Date`, `Map`, `Set`, `RegExp`, `Promise`, DOM nodes, and any object with a non-`Object` prototype pass through _untouched_. Wrapping a `Date` because it's an object is the kind of "magic" that destroys trust.
5. **Reuses the existing subscriber machinery.** No parallel reactivity system. Each tracked path corresponds to a lightweight `SignalNode` (the same one in [src/reactivity/signal.ts](../src/reactivity/signal.ts)). That means `computed`, `effect`, `batch`, `untracked`, and the view layer's existing dependency tracking all work with zero special-casing.
6. **Type-safe through arbitrary depth.** `Store<T>` preserves `T` exactly through the proxy. Reading `store.user.address.city` is typed `string`, not `unknown`. Tests assert this with `expectTypeOf`.
7. **Predictable identity rules.** Assigning the same value (per `Object.is`) is a no-op. Replacing a subtree (`state.user = newUser`) reuses the existing proxy for `state.user` if the new value is structurally compatible, otherwise replaces it cleanly. Subscribers to paths that no longer exist are GC'd.

## Phase 0 — `repeat()` discoverability (warm-up)

**Premise correction (2026-05-22):** `repeat` IS exported transitively via `src/view/index.ts` → `src/index.ts` (`export * from "./view"`), and the test at [**tests**/view/repeat.test.ts](../__tests__/view/repeat.test.ts) confirms it works. The real gap is _discoverability_:

- No explicit `export { repeat }` line in [src/index.ts](../src/index.ts) — surfaces only through `export *` chains.
- Not documented in [README.md](../README.md).

Phase 0 therefore becomes:

1. Add explicit named `export { repeat }` to [src/index.ts](../src/index.ts) (improves IDE go-to-definition, signals "this is public API" to readers).
2. Add a `repeat()` section to [README.md](../README.md) with the example already in the JSDoc.
3. Confirm the trio (`type-check`, `lint`, `test`) still passes.

**Acceptance:** `repeat` shows up in IDE autocomplete for `import { ... } from "marjoram"` without users having to dig. README example exists. CI green.

**Release:** v1.0.1 (patch — no behavior change, docs and surface clarity only).

## Phase 1 — Design doc (`docs/STORES.md`)

Write this _before_ any implementation. Sections:

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

The patterns below are verified against competitor source in [STORE_RESEARCH_FINDINGS.md](STORE_RESEARCH_FINDINGS.md). All cite-able file:line refs resolve inside `.research/{solid,vue,valtio}` (gitignored).

### Internal layout

Three well-known symbols on raw objects (Solid `store.ts:6-9` pattern, generalized):

```ts
const $RAW = Symbol("marjoram.raw"); // proxy → raw lookup via get-trap
const $PROXY = Symbol("marjoram.proxy"); // raw → proxy identity cache (defineProperty, non-enumerable)
const $NODE = Symbol("marjoram.node"); // raw → Record<key, SignalNode>, lazy
```

Plus Vue-style flag keys ([Vue `constants.ts:11-24`](../../.research/vue/packages/reactivity/src/constants.ts)) intercepted in the `get` trap:

```ts
const FLAG_IS_STORE = "__m_isStore";
const FLAG_SKIP = "__m_skip"; // markRaw bypass
```

### Hot path — `get` trap

```ts
// Pseudo-code, ~25 lines in real impl
function get(raw: object, key: PropertyKey, receiver: object): unknown {
  // Flag interceptions (~5 LoC, free)
  if (key === FLAG_IS_STORE) return true;
  if (key === $RAW) return raw;

  const value = Reflect.get(raw, key, receiver);

  // Tracking — only if a subscriber is active (reads-are-free guarantee)
  if (activeSubscriber) trackPath(raw, key);

  // Lazy nested proxying
  if (shouldProxy(value)) return wrap(value as object);
  return value;
}
```

`shouldProxy` returns false for: primitives, `null`, `undefined`, `markRaw`-tagged values (`FLAG_SKIP`), class instances (non-Object prototype), `Date`/`Map`/`Set`/`RegExp`/`Promise`/typed arrays, DOM nodes, frozen objects.

### Hot path — `set` trap

```ts
function set(
  raw: object,
  key: PropertyKey,
  value: unknown,
  receiver: object
): boolean {
  const oldValue = (raw as any)[key];
  if (Object.is(oldValue, value)) return true;
  const isNewKey = !(key in raw);
  (raw as any)[key] = value;
  notifyPath(raw, key); // SignalNode for this path
  if (isNewKey) notifyKeys(raw); // iteration sentinel on parent
  if (typeof oldValue === "object" && oldValue !== null) {
    invalidateProxy(oldValue); // replaced subtree → drop $PROXY/$NODE
  }
  return true;
}
```

### Lazy identity cache

```ts
// Solid store.ts:49-84 pattern
function wrap(raw: object): object {
  let proxy = (raw as any)[$PROXY];
  if (!proxy) {
    proxy = new Proxy(raw, handler);
    Object.defineProperty(raw, $PROXY, { value: proxy }); // non-enumerable
  }
  return proxy;
}
```

`state.user === state.user` follows for free; no parallel WeakMap.

### Lazy SignalNode allocation

```ts
// Solid store.ts:138-153 pattern, using our existing SignalNode
function trackPath(raw: object, key: PropertyKey): void {
  // activeSubscriber check already happened in get()
  let nodes = (raw as any)[$NODE];
  if (!nodes) {
    nodes = Object.create(null);
    Object.defineProperty(raw, $NODE, { value: nodes });
  }
  let node: SignalNode | undefined = nodes[key];
  if (!node) {
    node = createSignalNode((raw as any)[key]);
    nodes[key] = node;
  }
  // Subscribe via existing signal machinery
  node._subscribers.add(activeSubscriber!);
  activeSubscriber!._sources.add(node);
}
```

Critical: nodes are **not** created at proxy time or read time — only when a tracked read actually needs one. This is the implementation of the "reads are free outside reactive contexts" guarantee.

### Cycle handling

```ts
// Valtio vanilla.ts:143 pattern — short-circuit on already-proxied input
function store<T extends object>(initial: T): Store<T> {
  if ((initial as any)[FLAG_IS_STORE]) return initial as Store<T>;
  return wrap(initial) as Store<T>;
}
```

A store created from a sub-proxy returns the sub-proxy itself. Cycles in the data graph resolve naturally because `wrap` is idempotent via the `$PROXY` cache.

### `markRaw`

```ts
// Vue reactive.ts:423-428 pattern
export function markRaw<T extends object>(value: T): T {
  Object.defineProperty(value, FLAG_SKIP, { value: true, configurable: true });
  return value;
}
```

Checked in `shouldProxy()`. ~3 LoC of integration.

### Acceptance criteria

- `store()` exists with full TypeScript types (`Store<T>`, `Path<T>`, `PathValue<T, P>` per [STORE_RESEARCH_FINDINGS.md §8](STORE_RESEARCH_FINDINGS.md)).
- `state.user === state.user` holds across reads.
- Reading outside any tracked context allocates zero `SignalNode`s (assert via instrumentation in tests).
- Writing `state.a.b = x` notifies exactly the subscribers of path `a.b` — no parent, no siblings (granularity test).
- `markRaw(obj)` round-trips: `(store({x: markRaw(o)}).x === o) === true`, and mutations to `o.foo` do not notify.
- Existing tests for `signal`, `computed`, `effect`, `batch`, `untracked` still pass byte-identical.

## Phase 3 — Array and built-in handling

The patterns below are verified in `.research/` (gitignored, see [STORE_RESEARCH_FINDINGS.md §5](STORE_RESEARCH_FINDINGS.md)).

### Array mutating methods — Solid `createMutable` pattern

The elegant move from [Solid `mutable.ts:55-58`](../../.research/solid/packages/solid/store/src/mutable.ts):

```ts
// Inside the get-trap, before flag/raw checks:
if (
  Array.isArray(raw) &&
  typeof (raw as any)[key] === "function" &&
  key in Array.prototype
) {
  const method = (raw as any)[key];
  return (...args: unknown[]) => batch(() => method.apply(receiver, args));
}
```

Three lines, replaces Vue's 373-LoC `arrayInstrumentations.ts`. A single `arr.push(a, b, c)` runs inside `batch()`, so the inner index writes + length write fire as one notification round.

- **Indices and `.length` are tracked as ordinary path keys.** No special instrumentation table.
- **Read-only methods** (`map`/`filter`/`forEach`/`find`/`some`/`every`/...) work via the standard proxy `get` path — iteration registers per-index dependencies, no override needed.
- **Iteration sentinel**: a single `keysNode` on the parent ([Vue `dep.ts:242` `ITERATE_KEY` pattern](../../.research/vue/packages/reactivity/src/dep.ts)) notifies on key add/delete (for `for...in` reactivity and `arr.length`-aware iteration).

### Built-in passthrough — `shouldProxy()` rules

Verified against [Valtio `vanilla.ts:64-76`](../../.research/valtio/src/vanilla.ts) plus standard JS semantics:

```ts
function shouldProxy(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false;
  if ((value as any)[FLAG_SKIP]) return false; // markRaw
  if (Object.isFrozen(value)) return false; // frozen objects
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== Array.prototype && proto !== null)
    return false;
  return true;
}
```

Result: `Date`, `Map`, `Set`, `WeakMap`, `WeakSet`, `RegExp`, `Promise`, `ArrayBuffer`, typed arrays, DOM nodes, functions, class instances all pass through untouched. Mutating them is invisible to the store. **No `markRaw` needed for any of them** — the prototype check handles it.

Reactive `Map`/`Set` variants are explicitly **out of scope** for v1.1 ([STORES.md §13](STORES.md)). Vue's `collectionHandlers.ts` (330 LoC) shows the complexity; the embeddable-widget use case rarely needs it.

### Acceptance

- `arr.push(a, b, c)` produces exactly one notification round (instrumented assertion).
- Setting `arr[3] = x` notifies subscribers of `arr[3]` only — not `arr.length`, not `arr[0..2]`.
- `Object.isFrozen(obj) === true` ⇒ `store({ x: obj }).x === obj` (identity preserved, not proxied).
- `new Date()` round-trips by reference; `state.d.setHours(...)` is invisible (documented behavior).
- `markRaw(plainObj)` round-trips; mutations don't notify.

## Phase 4 — Integration

The point of building on existing primitives is that integration should be _trivial_:

- **`html` templates**: `$store.user.name` returns a `SchemaProp`-equivalent reactive binding. Mechanism: when `$`-access on the store hits a leaf path, we wrap that path's `SignalNode` in the existing `SchemaProp` shape.
- **`useViewModel`**: accepts stores as model values. Nested objects in a `useViewModel` definition automatically become stores (this is the one place where "deep by default" is the right call, because the user has already explicitly chosen `useViewModel`). **Pending decision** — see open questions.
- **`repeat()`**: passing a reactive store array Just Works because `repeat` already consumes anything with `.value` + `.observe()`; we expose those on store-array bindings.
- **`computed` / `effect` / `batch` / `untracked`**: zero changes required. They subscribe to `SignalNode`s; our paths _are_ `SignalNode`s.

**Acceptance:** Integration tests pass. Existing `useViewModel`, `html`, `repeat()` tests still green. Demo widget using a store renders and updates granularly.

## Phase 5 — DX polish (the "exceptional" part)

### `snapshot(store)`

Deep-clone to a plain object. Critical for `JSON.stringify`, structural equality testing, time-travel debugging. Pattern follows [Valtio `vanilla.ts:78-120`](../../.research/valtio/src/vanilla.ts) but **without** Valtio's snap-cache (we don't need React's render-stability guarantee). Walks the raw graph (using `$RAW` symbol), deep-copies plain objects and arrays, returns built-ins by reference. **Does not** register any reactive subscription.

### `subscribe(s, path, callback)`

Path-typed escape hatch ([STORES.md §4.3](STORES.md)). Internally: resolves path → terminal `SignalNode`, registers a non-tracked subscriber, returns unsubscribe. Microtask-batched by default ([Valtio `vanilla.ts:330-341`](../../.research/valtio/src/vanilla.ts) precedent).

### Custom devtools formatter

Vue ships [`runtime-core/src/customFormatter.ts`](../../.research/vue/packages/runtime-core/src/customFormatter.ts) (212 LoC) confirming the `window.devtoolsFormatters` API is alive in 2026. Pattern to copy:

```ts
export function initStoreDevtoolsFormatter(): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "production") return;

  const formatter = {
    __marjoram_store_formatter: true,
    header(obj: unknown) {
      if (!isStore(obj)) return null;
      return ["div", {}, ["span", { style: "color:#3ba776" }, "Store"]];
    },
    hasBody(obj: unknown) {
      return isStore(obj);
    },
    body(obj: unknown) {
      // CRITICAL: unwrap to render the raw data, not the proxy.
      // Use untracked() so the formatter doesn't subscribe DevTools to the store.
      return untracked(() => [
        "div",
        {},
        ["object", { object: unwrap(obj as Store<object>) }],
      ]);
    },
  };

  const w = window as any;
  if (w.devtoolsFormatters) w.devtoolsFormatters.push(formatter);
  else w.devtoolsFormatters = [formatter];
}
```

Key implementation notes from reading Vue's version:

- **`untracked()` wrap** any reactive reads inside the formatter. Vue uses `pauseTracking()`/`resetTracking()` ([`customFormatter.ts:40-42`](../../.research/vue/packages/runtime-core/src/customFormatter.ts)); we use the existing `untracked()` primitive.
- **Production stripping** via Rollup `@rollup/plugin-replace` substituting `process.env.NODE_ENV` at build time. Confirm the existing Rollup config does this; add it if not.
- **No "enable custom formatters" check needed in code** — that's a DevTools setting users toggle.
- **Firefox/Safari** silently no-op (neither reads `window.devtoolsFormatters`).

Invoked once per process from the public entry: `init` on first `store()` call, guarded by a module-level boolean.

### Build-config precondition (verified 2026-05-22)

Current [rollup.config.js](../rollup.config.js) does **not** include `@rollup/plugin-replace`. Without it, `process.env.NODE_ENV` is left as the literal expression at runtime (in the browser, where `process` is undefined, the dev branches throw). Phase 5 must add `@rollup/plugin-replace` as a dev dependency and configure it to substitute `process.env.NODE_ENV` with `'production'` in the published builds (and `'development'` in the dev build). This is the single new dev-dependency added by the whole initiative; covered in the Phase 5 PR description.

### Dev-mode warnings

`process.env.NODE_ENV !== "production"` checks for:

- Mutating during a `computed` body (use `effect` for side effects).
- Setting a property to its current value (no-op; usually a code smell).
- `unwrap(s)` + mutation pattern (silently bypasses reactivity).
- Replacing a store root via assignment (`Object.assign(state, newState)` instead).

All stripped in production via the Rollup replace.

### Stable diagnostic names

`store({...}, { name: "app" })`. Stored in the `$NODE` record as a non-enumerable label. Shown in devtools formatter header and dev-mode warnings.

### Ownership

Stores created inside an `effect`/`computed` body inherit that scope's owner; when the scope tears down, the store's `$NODE` map is cleared and per-path subscribers are notified of disposal. This is symmetric with existing `signal()` cleanup. No new API — the existing `effect()` return value (a disposer) covers it.

### Acceptance

- Stores render as `Store { ... }` in Chrome DevTools with custom formatters enabled.
- Reading a store inside the devtools formatter does **not** subscribe the formatter to changes (verified with an instrumented `effect`).
- Production build (`npm run build`) contains no string `__marjoram_store_formatter` (formatter stripped by Rollup replace).
- `snapshot(s)` round-trips via `JSON.stringify`/`JSON.parse` and produces structurally equal output to the source (test fixture).
- `subscribe(s, "user.name", cb)` is a TypeScript error if `user.name` doesn't exist on `T`.

## Phase 6 — Test suite

Three layers, all in `__tests__/reactivity/store/`:

1. **Parity tests**: port Solid's `createStore` test suite verbatim where applicable. If they pass, we're at table stakes.
2. **Granularity assertions**: instrument `effect` runs and assert exact counts. "Setting `state.a.b` triggered N effects, expected 1."
3. **Edge cases** ([**tests**/edge-cases/](../__tests__/edge-cases/)): cycles, deletion of subscribed paths, replacing a subtree, freezing, prototype pollution attempts, Symbol keys, getters on the source object, accessor descriptors, very deep trees (1000 levels) for stack safety.
4. **Memory leak tests**: create + dispose 10k stores, assert heap doesn't grow (using `--expose-gc` and `process.memoryUsage()` deltas).
5. **Type tests** via `expectTypeOf` for the depth-preservation claim.

**Acceptance:** ≥95% coverage on `store.ts`. All edge cases pass. Memory test shows no leak.

## Phase 7 — Benchmarks

[**tests**/benchmarks/](../__tests__/benchmarks/) per the ratio-vs-baseline rules in [PERFORMANCE_TESTING_PHILOSOPHY.md](../PERFORMANCE_TESTING_PHILOSOPHY.md). Compare:

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
- Bundle-size note in the PR description — _not as a budget check_, but as informational disclosure.

**Acceptance:** Released to npm. Demo runs. README + STORES.md reflect final API.

## Versioning and release strategy

Current: **v1.0.0**, manual versioning via `package.json` + `npm run release` (test + build + publish). Semver applies strictly from here on.

Phased releases (all additive, all non-breaking by design):

| Version | Phases           | Scope                                                   | Bump        |
| ------- | ---------------- | ------------------------------------------------------- | ----------- |
| v1.0.1  | Phase 0          | Explicit `repeat` export + README docs                  | patch       |
| v1.1.0  | Phases 2 + 3 + 4 | `store()` core + array support + view-layer integration | minor       |
| v1.2.0  | Phases 5 + 6 + 7 | DX polish, full test suite, benchmarks                  | minor       |
| v1.2.x  | Phase 8          | Demo + README finalization (may overlap into v1.2.0)    | minor/patch |

Phase 1 (design doc) does not ship to npm — it lands as a PR adding `docs/STORES.md`.

### Non-breaking-change rules (binding for this initiative)

The whole point of `store()` being a _peer_ primitive is that nothing existing changes. These rules are how we enforce that:

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
- Project conventions and contracts: [AGENTS.md](../AGENTS.md) (symlinked from `CLAUDE.md` and `.github/copilot-instructions.md`)
- Performance testing philosophy: [PERFORMANCE_TESTING_PHILOSOPHY.md](../PERFORMANCE_TESTING_PHILOSOPHY.md)
