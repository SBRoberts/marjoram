# Store() Research Findings — Phase 1.5

> **Status: historical.** Findings from reading competitor source directly, captured before implementation. These shaped the v1.1.0 design; kept for the rationale. One decision below was later revised — see the note on §3. For the current public contract, see [STORES.md](STORES.md).
>
> **Sources read (with commit SHAs):**
>
> - **SolidJS** — `solidjs/solid` @ `128225942095f51f9b49a3f8fdc1bd7e3b9ee97b` — `packages/solid/store/src/{store.ts, mutable.ts, modifiers.ts}` (1092 LoC total)
> - **Vue 3** — `vuejs/core` @ `bbdf86dcc6e3a8108c6313484ddfb52019b3e0e8` — `packages/reactivity/src/{dep.ts, reactive.ts, effect.ts, effectScope.ts, baseHandlers.ts, collectionHandlers.ts, arrayInstrumentations.ts, constants.ts}` (~3929 LoC)
> - **Valtio** — `pmndrs/valtio` @ `706350c29948eb9f59ff6219b229365737218cd8` (v2.3.2) — `src/vanilla.ts` (459 LoC), utils
> - **Chrome devtools formatters** — verified live via Vue's `runtime-core/src/customFormatter.ts` (212 LoC), which still ships and uses the API in 2026.
> - **Path types** — pattern from `react-hook-form` `eager.ts` and `type-fest` `paths.d.ts` (references-by-recollection; pattern is type-level and stable across versions).

---

## 1. Identity caching — LOCKED: symbol on raw

Three competitors, three approaches:

| Library    | Mechanism                                                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Solid**  | `$PROXY` symbol stashed via `Object.defineProperty(raw, $PROXY, { value: proxy })` — non-enumerable. `store.ts:49-84`. One symbol-property lookup per read. |
| **Vue**    | `proxyMap: WeakMap<Target, Proxy>` (`reactive.ts:26-35`). One WeakMap lookup per read.                                                                      |
| **Valtio** | `proxyCache: WeakMap<base, proxyObject>` (`vanilla.ts:172`). Same as Vue.                                                                                   |

**Decision: Solid's `$PROXY` symbol approach.** Two reasons:

- One fewer indirection on the hot path (symbol property read vs WeakMap.get).
- No global mutable state — the cache lives on the raw object itself, GC's with the data.

**Cost:** mutates user data with a non-enumerable symbol property. Invisible to `JSON.stringify` (Symbols are skipped), `for...in` (non-enumerable), and `Object.keys` (Symbols only show via `Object.getOwnPropertySymbols`). Solid has shipped this for years without incident.

## 2. Metadata storage — LOCKED: `$NODE` record of lazy SignalNodes

Solid's pattern (`store.ts:138-153`): a single `$NODE` symbol on each raw object holds a `Record<PropertyKey, DataNode>`. The record is lazily populated by `getNode(nodes, key)` — **only when a reactive listener is active** (`getListener()` guard). This is the architectural answer to "reads are free outside reactive contexts."

```ts
// Sketch — Solid's pattern, adapted to our SignalNode shape
function trackPath(raw: object, key: PropertyKey): void {
  if (!activeSubscriber) return; // reads-are-free guarantee
  let nodes = raw[$NODE];
  if (!nodes) {
    nodes = Object.create(null);
    Object.defineProperty(raw, $NODE, { value: nodes });
  }
  let node = nodes[key];
  if (!node) {
    node = createSignalNode(raw[key]);
    nodes[key] = node;
  }
  subscribe(node, activeSubscriber);
}
```

**Steal**: the lazy-allocation guard. Without it, every read from a store allocates `SignalNode`s for every accessed path, even on the server or in tight loops.

**Leave**: Solid's separate `$HAS` symbol for `in`-check reactivity. We'll combine `in` and key-existence tracking into a single sentinel `keysNode` on the parent (Vue's `ITERATE_KEY` pattern, simplified).

## 3. Flag-property pattern for `isStore`/`unwrap`/`markRaw` — Vue-style flags

> **Superseded by the 7.5a security pass:** this section originally locked Vue-style _string_ flag keys (`__m_isStore`/`__m_skip`). The pre-release security review found that string keys let untrusted JSON spoof store identity or escape reactivity, so the shipped implementation uses **`Symbol` flags** instead (JSON can't produce symbol keys). The get-trap interception pattern below is otherwise as shipped.

Vue uses `ReactiveFlags` (`constants.ts:11-24`): `__v_isReactive`, `__v_isReadonly`, `__v_raw`, `__v_skip`, `__v_isShallow`. The base `get` handler (`baseHandlers.ts:66-85`) intercepts these and returns answers without going to the underlying data.

```ts
// Sketch — what our get-trap does
if (key === STORE_FLAGS.IS_STORE) return true;
if (key === STORE_FLAGS.RAW) return raw;
if (key === STORE_FLAGS.SKIP) return false; // would be set by markRaw
```

**Decision:** adopt this for free `isStore()`/`unwrap()`/`markRaw()`. No side WeakMaps. ~5 LoC of get-trap per flag.

**Update to design:** add `markRaw<T>(value: T): T` to the public API (Vue precedent — opt out a single object from being proxied, even if it's plain). Updates STORES.md API surface §4.

## 4. Batching — LOCKED: reuse existing `signal.ts` batch

Marjoram's existing batch system ([src/reactivity/signal.ts:55-66, 256-266](../src/reactivity/signal.ts)) already implements:

- `batchDepth` counter
- `pendingNotifications: Set<Subscriber>` for de-duplication
- Flush on outermost `endBatch`
- Synchronous (no microtask)

Vue's batch (`effect.ts:247-310`) is the same shape, slightly more sophisticated (singly-linked list via `sub.next` for O(1) insert, vs our `Set.add`). Our `Set` is fine for v1 — same time complexity, simpler.

**Decision:** stores route writes through `notifySubscribers` (the existing primitive). No new batch system. Confirms a key non-breaking-change rule.

## 5. Array handling — LOCKED: Solid `createMutable` pattern

```ts
// Solid mutable.ts:55-58 — the elegant move
if (Array.isArray(target) && property in Array.prototype) {
  return (...args) =>
    batch(() => Array.prototype[property].apply(receiver, args));
}
```

Wraps every Array prototype method access in `batch()`. A single `arr.push(a, b, c)` produces one notification round because the inner writes (`arr[length]=a`, `arr[length]=b`, ..., `arr.length=...`) all happen inside the batch.

Indices are tracked as ordinary path keys; `length` is tracked as a key too. No special instrumentation table needed — the proxy `set` trap fires per index, and the batch deduplicates.

**Decision:** copy this pattern verbatim. ~3 LoC. Avoids Vue's 373-LoC `arrayInstrumentations.ts` complexity entirely.

## 6. Valtio version-counter — REJECTED for our case

Valtio (`vanilla.ts:171-217`) uses a single global counter + per-proxy version. Every write bumps the global. Reads bubble child versions up to compute a parent's effective version. The trick: `subscribe(state, cb)` fires on **any write anywhere in the subtree**; `subscribeKey(state, "user.name", cb)` is implemented as `subscribe + Object.is diff` — every write triggers every keyed subscriber, who then bail out.

This is fine for Valtio because its primary consumer is React's `useSnapshot`, which re-tracks on every render. The over-invalidation is invisible.

**Decision: not for us.** Marjoram's reactive consumers are fine-grained DOM bindings without a re-track step. Per-path `SignalNode`s (Solid pattern, our existing direction) are strictly better for our case.

**What to steal anyway** (orthogonal to invalidation strategy):

- Microtask-batched subscribe with sync escape hatch (`vanilla.ts:330-341`) — useful for the `subscribe()` escape-hatch API; our `effect()` already uses microtask scheduling so this is consistent.
- Lazy wiring of nested listeners only when a top-level listener exists (`vanilla.ts:239-245`) — the "reads are free" cousin.

## 7. Devtools formatter — LOCKED: ship in v1.1

Vue ships `customFormatter.ts` (212 LoC) in current `main` (Vue 3.5+). Confirms `window.devtoolsFormatters` is still the API in 2026. Pattern:

```ts
// Our adaptation
export function initStoreDevtoolsFormatter(): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "production") return;

  const formatter = {
    __marjoram_store_formatter: true, // identifier for "which library's formatter is this"
    header(obj: unknown) {
      if (!isStore(obj)) return null;
      return [
        "div",
        {},
        ["span", { style: "color:#3ba776" }, "Store"],
        " ",
        formatRaw(obj),
      ];
    },
    hasBody(obj: unknown) {
      return isStore(obj);
    },
    body(obj: unknown) {
      return ["div", {}, ["object", { object: unwrap(obj) }]]; // render raw
    },
  };

  if ((window as any).devtoolsFormatters) {
    (window as any).devtoolsFormatters.push(formatter);
  } else {
    (window as any).devtoolsFormatters = [formatter];
  }
}
```

Key points (from reading Vue's implementation):

- **Pause tracking inside the formatter** — reads during the formatter must not subscribe the devtools to the store. Vue uses `pauseTracking()`/`resetTracking()` (`customFormatter.ts:40-42`); we use `untracked(() => ...)`.
- **Production stripping** — Vue uses `__DEV__` build-time constant. We use `process.env.NODE_ENV !== 'production'`, which Rollup's replace plugin can strip at build time. (Confirm during Phase 5 implementation.)
- **No "enable custom formatters" check in code** — that's a DevTools setting users toggle once; we can't enable it programmatically.
- **Firefox/Safari**: no support. The code is harmlessly no-op there (assigning to a property neither browser reads).

## 8. Compile-time path types — LOCKED: type-fest-style depth-capped recursion

The reference pattern (from path-types research, references-by-recollection from `react-hook-form/eager.ts` and `type-fest/paths.d.ts`):

```ts
type Primitive = string | number | boolean | bigint | symbol | null | undefined;
type Builtin = Primitive | Date | RegExp | ((...a: any[]) => any);
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export type Path<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends Builtin
    ? never
    : T extends ReadonlyArray<infer U>
      ? `${number}` | `${number}.${Path<U, Prev[D]>}`
      : T extends object
        ? {
            [K in keyof T & (string | number)]: T[K] extends Builtin
              ? `${K}`
              : `${K}` | `${K}.${Path<NonNullable<T[K]>, Prev[D]>}`;
          }[keyof T & (string | number)]
        : never;

export type PathValue<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof NonNullable<T>
    ?
        | PathValue<NonNullable<T>[K], R>
        | (undefined extends T ? undefined : never)
    : NonNullable<T> extends ReadonlyArray<infer U>
      ? PathValue<U, R> | (undefined extends T ? undefined : never)
      : never
  : P extends keyof NonNullable<T>
    ? NonNullable<T>[P] | (undefined extends T ? undefined : never)
    : NonNullable<T> extends ReadonlyArray<infer U>
      ? U | (undefined extends T ? undefined : never)
      : never;
```

**Caveats** (to document in STORES.md for users):

1. Depth cap of 10 by default. Deeper requires bumping `Prev` tuple and accepting compile-time cost.
2. Arrays use dot-numeric paths only (`"items.0.name"`), not brackets (`"items[0].name"`).
3. Discriminated unions distribute keys but lose discriminator correlation (no `Path<T>` library solves this; it would require correlated-union techniques from Hejlsberg's `microsoft/TypeScript#47109`).
4. Type-only — zero runtime cost.

**Decision:** use this pattern for `subscribe<T, P extends Path<T>>(s, path, cb)` and any other path-taking API. Lock it before implementation so the test suite can pin behavior.

## 9. What this changes in the design doc

Updates to [STORES.md](STORES.md):

1. **§4 API surface** — add `markRaw<T>(value: T): T` (opt out a value from being proxied). Vue precedent.
2. **§4 API surface** — `subscribe()` signature becomes path-typed: `subscribe<T, P extends Path<T>>(s, path: P | "", cb: (v: PathValue<T, P>) => void)` with `""` meaning "any change anywhere." Closes open question #3 from STORES.md §14.
3. **§4 / §11** — lock the identity-cache mechanism: symbol-on-raw, not WeakMap.
4. **§11 Open question #1** (`produce`-style transactions) — **LOCKED to "no"**. `batch()` is the only batching primitive; Valtio confirms this is sufficient, and Solid's path-setter is the alternative we deliberately rejected.
5. **§11 Open question #2** (method-vs-data collision) — **LOCKED to "method wins, dev warning"**. Matches Vue's `.value` precedent.

## 10. What this changes in the implementation plan

Updates to [STORE_IMPLEMENTATION_PLAN.md](STORE_IMPLEMENTATION_PLAN.md) Phase 2:

Replace the generic "Proxy handler, lazy nested proxying, path-level SignalNodes, identity caching" bullet list with concrete patterns to copy (all citations resolvable in `.research/`):

- **Identity cache:** Solid `store.ts:49-84` — `$PROXY` symbol on raw.
- **Lazy SignalNode allocation:** Solid `store.ts:138-153` — `$NODE` record + `getListener()` guard.
- **Flag properties:** Vue `constants.ts:11-24` + `baseHandlers.ts:66-85` — `__v_isReactive`, `__v_raw`, `__v_skip` answered in the get-trap.
- **Array methods:** Solid `mutable.ts:55-58` — batch-wrap Array prototype methods.
- **Iteration tracking:** Vue `dep.ts:242` — single `ITERATE_KEY` sentinel for parent's keyset.
- **Cycle handling in proxy creation:** Valtio `vanilla.ts:143` — short-circuit on already-proxied input.
- **`markRaw`:** Vue `reactive.ts:423-428` — `def(value, '__v_skip', true)`.

## 11. Files kept on disk

`.research/{solid,vue,valtio}` — ~14MB of cloned source, gitignored. Kept for spot-checks during Phase 2 implementation. Delete with `rm -rf .research/` after v1.1.0 ships.

## 12. Open questions now closed

| ID     | Question                                                 | Resolution                                           |
| ------ | -------------------------------------------------------- | ---------------------------------------------------- |
| §11 #1 | `produce`-style transactions?                            | **No.** `batch()` covers it. Locked.                 |
| §11 #2 | Method-vs-data collision policy on path-binding proxies? | **Method wins, dev warning.** Vue precedent. Locked. |
| §11 #3 | `subscribe()` accepts a path filter?                     | **Yes — typed path.** Use `Path<T>` from §8. Locked. |

[STORES.md](STORES.md) §14 (Open Questions) is now empty. Phase 2 can begin without further design discussion.
