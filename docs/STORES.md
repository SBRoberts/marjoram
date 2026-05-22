# Stores — Deep Reactivity for Marjoram

> **Status:** Design proposal — not yet implemented. Tracks the work outlined in [STORE_IMPLEMENTATION_PLAN.md](STORE_IMPLEMENTATION_PLAN.md). This document defines the public contract; the plan defines how we get there.
>
> **Audience:** Two readers. (1) End users deciding whether and how to use `store()`. (2) Contributors implementing or reviewing the work. Sections are flagged where one audience matters more than the other.

---

## 1. Overview

`store()` is a new reactivity primitive being added as a **peer to `signal()`**. Where `signal()` is shallow and reference-based (good for primitives, atoms, references to whole objects), `store()` is **deep and path-granular**: you can mutate `state.user.address.city = "x"` and only the subscribers to `user.address.city` re-run. No spread/replace ceremony, no `.update(fn)` wrapper, no virtual DOM, no whole-object invalidation.

Both primitives remain valid. Pick at the import site:

```ts
import { signal, store } from "marjoram";

const count   = signal(0);                          // shallow, reference-based
const state   = store({ user: { name: "Alice" }}); // deep, path-granular

count.set(5);
state.user.name = "Bob";   // ← just works; subscribers to that path re-run
```

This document is the contract `store()` will be held to.

## 2. Why a separate primitive (not "deep by default")

Marjoram's existing API is built on **explicitness at the call site**. The `$` prefix rule (`vm.$name` reactive, `vm.name` value) makes reactivity legible to anyone reading the code. A flag like `{ deep: true }` declared once and acting invisibly everywhere would break that contract — the most consequential reactivity (nested state) would become the *least* visible.

Two named primitives keeps the principle intact:
- `signal(x)` at the call site means "shallow, reference-based."
- `store(x)` at the call site means "deep, path-granular."

A reader can predict behavior from the import line alone.

## 3. When to use which (audience: users)

Choose based on the *shape* of the state, not its size:

| State shape | Use |
|---|---|
| Primitive (number, string, boolean, etc.) | `signal()` |
| Reference to a whole opaque object that's swapped wholesale (DOM node, class instance, `Date`) | `signal()` |
| Plain object or array you'll *mutate in place* | `store()` |
| Plain object you treat as immutable (always replaced wholesale) | `signal()` works fine — `store()` is overkill |
| Mixed: a viewmodel that holds primitives *and* nested objects | Use `signal()` for the primitives at top level and `store()` for the nested branches, or wrap the whole viewmodel in one `store()` if every leaf is plain-data |

**Rules of thumb:**

- "I want to write `obj.a.b = c`" → `store()`.
- "I want to write `signal.set(newValue)`" → `signal()`.
- "It's just a number" → `signal()`. (Wrapping a number in a `store` is technically allowed but pointless; the primitive itself isn't proxiable.)

## 4. The API surface (audience: both)

The whole public surface, deliberately small:

```ts
// Core
export function store<T extends object>(initial: T, options?: StoreOptions): Store<T>;

// Type
export type Store<T extends object> = T & { readonly [__brand]: "Store" };

// Inspect & escape hatches
export function snapshot<T extends object>(s: Store<T>): T;
export function subscribe<T extends object>(
  s: Store<T>,
  callback: (newValue: T, oldValue: T, path: ReadonlyArray<PropertyKey>) => void
): () => void;
export function isStore(value: unknown): value is Store<object>;
export function unwrap<T extends object>(s: Store<T>): T;

// Options
export interface StoreOptions {
  /** Optional name for devtools display and dev-mode warnings. */
  name?: string;
}
```

### 4.1 `store(initial, options?)`

Wraps a plain object or array in a deeply reactive proxy. Returns a value that **is** structurally `T` (you can pass it anywhere `T` is expected) but is also reactive: reads inside a `computed`/`effect`/`html` template track the exact paths touched, and writes notify only subscribers to the affected paths.

```ts
const state = store({
  user: { name: "Alice", age: 30 },
  todos: [{ id: 1, text: "Buy milk", done: false }],
});

state.user.name; // "Alice"
state.user.name = "Bob"; // notifies only subscribers to user.name
state.todos.push({ id: 2, text: "Walk dog", done: false }); // notifies todos.length + todos[1]
```

### 4.2 `snapshot(s)`

Returns a deep plain-object copy of the store at this moment. Use for serialization, structural equality, logging, and tests. Reading `snapshot` does *not* track dependencies — it's a side-effect-free read for use *outside* reactive contexts. If you read it inside an `effect`, the effect won't re-run when the store changes.

```ts
JSON.stringify(snapshot(state)); // safe, deep, plain
```

### 4.3 `subscribe(s, callback)`

The low-level escape hatch. Use only when `effect()` doesn't fit (e.g., wiring stores to non-reactive subsystems). Callback receives `(newValue, oldValue, path)` where `path` is the property keys from the store root to the changed location. Returns an unsubscribe function.

Prefer `effect()` for almost everything — `subscribe` exists for interop, not idiomatic use.

```ts
const off = subscribe(state, (next, prev, path) => {
  console.log("Changed at", path.join("."), prev, "→", next);
});
// later:
off();
```

### 4.4 `isStore(value)` and `unwrap(s)`

Type guard and raw-object accessor. `unwrap` is the same shape as Vue's `toRaw` — useful for interop with code that needs the underlying object (libraries that key off identity, DOM diff'ers, etc.). Mutating the unwrapped object **does not** notify subscribers — it bypasses reactivity. This is intentional and matches the precedent.

```ts
if (isStore(value)) {
  const raw = unwrap(value);
  externalLibraryThatExpectsAPlainObject(raw);
}
```

## 5. Granularity guarantees (audience: both)

This is the load-bearing contract. Implementations and tests will assert it exactly.

### 5.1 What reads track

Reading a path inside a reactive context (`computed`, `effect`, `html`) subscribes to **exactly that path**:

```ts
effect(() => {
  // Subscribes to `user.name`. Not `user`. Not the root.
  console.log(state.user.name);
});

state.user.age = 31;     // ← does NOT re-run the effect above
state.user.name = "Bob"; // ← re-runs the effect
```

Reading an object subtree subscribes to *that subtree's identity*, not to every descendant:

```ts
effect(() => {
  // Subscribes to `user` as a whole — fires only if `user` itself is replaced.
  console.log(state.user);
});

state.user.name = "Bob";          // ← does NOT re-run
state.user = { name: "Carol" };   // ← re-runs
```

Iteration subscribes to the *key set* (so iteration is reactive to add/remove, not to value changes you didn't iterate over):

```ts
effect(() => {
  for (const k in state.user) {
    /* uses k */
  }
});

state.user.email = "a@b";  // ← re-runs (new key)
state.user.name = "Bob";   // ← does NOT re-run (key set unchanged)
```

### 5.2 What writes notify

| Operation | Notifies |
|---|---|
| `state.a.b = x` (same value per `Object.is`) | nothing (no-op) |
| `state.a.b = x` (different value) | subscribers to `a.b` |
| `state.a.b = x` (where `b` is a new key) | subscribers to `a.b` *and* iteration subscribers on `a` |
| `delete state.a.b` | subscribers to `a.b` *and* iteration subscribers on `a` |
| `state.a = newObj` (replacing subtree) | subscribers to `a` (subtree identity changed) *and* any active per-path subscribers in the old `a` subtree that no longer have a counterpart |
| `arr.push(x)` | subscribers to `arr[length]` (the new index) *and* `arr.length` — coalesced into a single notification round |
| `arr.splice(i, n, ...items)` | each affected index, plus `length`, plus iteration — single round |
| `arr[i] = x` | subscribers to `arr[i]` only |

### 5.3 Batching

Multiple writes inside `batch(() => { ... })` produce a single notification round at the end, just like `signal()`. Stores reuse the existing batch machinery — there is no separate "store batch."

```ts
batch(() => {
  state.user.name = "Bob";
  state.user.age = 31;
}); // ← effects re-run once, not twice
```

## 6. Boundary rules — what gets proxied (audience: both)

A store proxies **only plain objects and arrays**. Everything else is stored and returned by reference, unmodified. The boundary is checked once at proxy-creation time per nested value.

| Input type | Behavior |
|---|---|
| Plain object (`Object.getPrototypeOf(x) === Object.prototype` or `null`) | **Proxied** |
| Array (`Array.isArray(x)`) | **Proxied** (see §7 for array specifics) |
| `null`, `undefined`, primitives | Stored by value, no proxy |
| `Date` | Pass through — `date.setHours(...)` is invisible to the store |
| `Map`, `Set`, `WeakMap`, `WeakSet` | Pass through — mutations invisible |
| `RegExp`, `Promise`, `ArrayBuffer`, typed arrays | Pass through |
| Functions | Pass through (used as-is; `this`-binding preserved) |
| DOM nodes, class instances (anything with a non-Object prototype) | **Pass through** |
| Frozen objects (`Object.isFrozen(x)`) | Stored as-is, no proxy. Writes throw in strict mode (same as JS native). |

**Rationale:** wrapping a `Date` because it happens to be an object is the kind of magic that destroys trust. Vue's `markRaw` exists because they got this wrong initially. We get it right from day one by being conservative: if the object has any non-`Object` prototype, it's user code or a built-in we don't understand, and we leave it alone.

**Consequence for users:** if you want reactive `Map` or `Set`, you store a plain object/array. Reactive `Map`/`Set` variants are explicitly out of scope for v1.1 (see §13).

## 7. Arrays (audience: both)

Arrays are first-class. Three subtleties to call out:

1. **Indices are tracked independently of `length`.** `arr[3] = x` notifies subscribers to `arr[3]` only, not to `arr.length` or `arr[2]`.
2. **Mutating methods produce a single notification round.** `arr.push(a, b, c)` notifies subscribers to indices `length`, `length+1`, `length+2`, and `length` itself — but they fire in one batched round, so a single effect re-runs once, not four times. Same for `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`.
3. **Read methods work via the normal proxy `get` path.** `map`, `filter`, `forEach`, `find`, `reduce`, `slice`, `concat`, `join`, `includes`, `indexOf`, `some`, `every`, `findIndex` — no special-casing. They iterate, the proxy registers the dependency, done.

`repeat()` (see [README.md](../README.md#repeat--keyed-list-reconciliation)) consumes store arrays directly. The integration is one of the deliverables in Phase 4.

## 8. Type system (audience: both)

`Store<T>` preserves `T` structurally through arbitrary depth. There is no `unknown`, no loss of generic parameters, no need for `as` casts.

```ts
interface User {
  name: string;
  address: { city: string; zip: string };
  tags: string[];
}

const state = store<User>({ name: "Alice", address: { city: "NYC", zip: "10001" }, tags: ["a"] });

state.name;             // string
state.address.city;     // string
state.tags[0];          // string
state.tags.length;      // number

state.address.city = "LA";  // ok
state.address = { city: "LA", zip: "90001" };  // ok
state.address = "wrong";   // ts error
```

The `Store<T>` brand is a phantom `unique symbol` property so that:
- `isStore(s)` can narrow.
- `store(plainObject)` and `plainObject` are not interchangeable in code that explicitly demands one — APIs can opt into requiring stores.

But: at any read site, the brand is transparent — you write `state.user.name` not `state.user.name.value` or anything similar. **There is no `.value` ceremony.** This is the headline DX win over Vue's `ref`.

## 9. Lifecycle and cleanup (audience: both)

### 9.1 Ownership

A store created at module scope lives forever (same as a top-level `signal`). A store created inside a `widget`'s `model` is owned by that widget — it gets disposed when the widget is destroyed. A store created inside an `effect` or `computed` body is owned by that scope.

This is the same ownership model that already governs `signal` and `computed` in the existing codebase; stores plug into it.

### 9.2 Per-path SignalNode GC

Internally, each tracked path gets its own `SignalNode`. When a path stops having subscribers *and* no longer exists in the data (because a parent was replaced or the key was deleted), the `SignalNode` is dropped. Implementation uses a tree keyed by the raw object identity, with `WeakRef`s where possible so unreachable subtrees GC naturally.

This matters because long-lived stores with churning data (e.g., a list of 100k items where you replace the entire list every minute) must not leak memory.

### 9.3 Manual disposal

`store()` does not return a `.dispose()` method. Disposal is implicit via the ownership chain: when the owning scope tears down, the store's subscribers are notified and the path tree is dropped. This matches `useViewModel`'s existing implicit-cleanup model. Users with exotic lifecycle needs can wrap a store in a custom scope.

## 10. Integration with the rest of Marjoram (audience: both)

### 10.1 `html` templates

```ts
const state = store({ user: { name: "Alice" } });

html`<p>Hello, ${state.$user.name}!</p>`;
```

`$`-prefix on a store value gives a **reactive path-binding proxy** that mirrors the store's shape. Each leaf access returns a `SchemaProp`-shaped reactive binding. Each intermediate access returns another path-binding proxy.

```ts
// All valid:
html`<p>${state.$user.name}</p>`             // leaf
html`<p>${state.$user}</p>`                  // whole subtree, re-renders on user identity change
html`<p>${state.$user.address.city}</p>`     // deep leaf
html`<p>${state.$user.compute(u => u.name.toUpperCase())}</p>`  // transform
```

The path-binding proxy supports the existing `SchemaProp` methods (`compute`, `observe`, `value`, `peek`). Naming collisions with data property names (`state.$user.compute` when `user` has a `compute` property) are resolved in favor of the method, and a dev-mode warning fires. This matches Vue's precedent with `.value`.

### 10.2 `useViewModel`

`useViewModel` accepts stores as values. **No auto-storing of nested plain objects** — this is locked by the non-breaking-change rules in [STORE_IMPLEMENTATION_PLAN.md](STORE_IMPLEMENTATION_PLAN.md). Existing code that passes a nested plain object continues to behave exactly as it does today.

```ts
const vm = useViewModel({
  count: 0,                              // signal — same as today
  user: store({ name: "Alice" }),        // store — opt-in
});

vm.count = 5;             // works as today
vm.user.name = "Bob";     // deep mutation, granular notification

html`
  <p>Count: ${vm.$count}</p>
  <p>Name: ${vm.$user.name}</p>
`;
```

### 10.3 `repeat()`

Passing a store array to `repeat()` Just Works. The integration is symmetric with the existing `SchemaProp` array case — `repeat` consumes anything with `.value` + `.observe()`, and store-array path-bindings provide both.

```ts
const vm = useViewModel({
  todos: store([{ id: 1, text: "Buy milk", done: false }]),
});

html`
  <ul>
    ${repeat(
      vm.$todos,
      t => t.id,
      t => html`<li>${t.text}</li>`
    )}
  </ul>
`;

vm.todos.push({ id: 2, text: "Walk dog", done: false });
// repeat reconciles — only the new <li> is created
```

### 10.4 `computed`, `effect`, `batch`, `untracked`

Zero changes required. Stores expose their tracked paths as `SignalNode`s — the exact data structure these primitives already subscribe to. Reading `state.user.name` inside a `computed` registers a dependency on that path. Writing it triggers re-computation. `batch` coalesces notifications. `untracked` bypasses subscription.

This is the central architectural win: there is no parallel reactivity system to maintain.

## 11. Comparison to peers (audience: users + contributors)

Honest. Where competitors are better, we say so.

| Feature | Marjoram `store` (this proposal) | Solid `createStore` | Vue 3 `reactive` | Valtio `proxy` | MobX `observable` |
|---|---|---|---|---|---|
| Deep reactive | ✅ | ✅ | ✅ | ✅ | ✅ |
| Path-level granularity | ✅ | ✅ | ✅ | ✅ | partial |
| Mutable-feeling API | ✅ | ⚠️ explicit setter | ✅ | ✅ | ✅ |
| Plain object/array only (no class wrapping) | ✅ | ✅ | partial (uses `markRaw` to opt out) | ✅ | needs config |
| Atomic multi-path updates | via `batch()` | ✅ path-setter | via `batch` | via `batch` | via `action` |
| `Map`/`Set` reactive variants | ❌ (deferred) | ❌ | ✅ | ✅ | ✅ |
| Snapshot to plain object | ✅ `snapshot()` | ✅ `unwrap`/manual | ✅ `toRaw` (shallow) | ✅ `snapshot` | partial |
| Devtools custom formatter | ✅ (planned) | ❌ | ✅ | ❌ | ✅ |
| Type-preserving through depth | ✅ | ✅ | ✅ | partial | partial |
| Zero runtime dependencies | ✅ | ✅ | ❌ | ❌ | ❌ |
| Library size (whole lib gzipped) | ~5KB target | ~7KB | ~34KB | ~3KB (just store) | ~16KB |

**Where competitors are honestly better:**
- **Solid's path-setter syntax** (`setState("user", "name", "Bob")`) is more explicit at the call site and lets you express conditional and functional updates in a single call. We deliberately chose mutable assignment for DX reasons (less ceremony for the 90% case), but recognize the readability tradeoff. Users who want the explicit form can write their own helper.
- **Vue's reactive `Map`/`Set`.** Deferred — adding them is a real cost in bundle size and complexity that we don't think pays rent for the typical embeddable-widget use case. Revisit in v1.3+ if demand is real.
- **MobX's `action` boundaries** for clearer transactional semantics. Our answer is `batch()`, which is functionally equivalent but less semantically opinionated.

## 12. Gotchas — document these up front (audience: users)

Failure modes we know exist and how to think about them.

### 12.1 Destructuring loses reactivity

```ts
const state = store({ user: { name: "Alice" } });

const { user } = state;        // ← user is now a stable proxy reference
user.name = "Bob";              // ✅ still reactive (same proxy)

const { name } = state.user;    // ← name is a primitive copy
state.user.name = "Bob";        // ← `name` const is stale, store updates correctly
```

Rule: destructuring an object pulls out the proxy (still reactive). Destructuring a primitive pulls out the value (snapshot). Same as JavaScript.

### 12.2 `for...in` order

Iteration tracks the key set, not the order. Adding a key mid-iteration is undefined behavior (same as native JS).

### 12.3 Mutating during render

Writing to a store inside a `computed` or `html` interpolation creates a cycle. Dev mode warns; prod silently absorbs (the existing batch system prevents infinite re-entry via `_running` flags). Don't do it.

### 12.4 Class instances are opaque

```ts
const state = store({ date: new Date() });
state.date.setHours(10);  // ← invisible to the store; no effect re-runs
state.date = new Date(); // ← visible; subscribers to `date` re-run
```

If you need reactivity inside a class instance, hold the *primitive* fields you care about as separate store keys.

### 12.5 `unwrap` mutations don't notify

```ts
const raw = unwrap(state);
raw.user.name = "Bob"; // ← no notification — you bypassed reactivity
```

If you write through `unwrap`, you broke the contract on purpose. Re-read through the proxy after.

## 13. What this design explicitly does NOT do (audience: both)

Scope guard — features we considered and rejected (for v1.1):

- **Reactive `Map`/`Set`.** Real complexity for narrow benefit in the embeddable-widget use case. Defer to v1.3 if demand is real.
- **Time-travel / undo built-in.** `snapshot()` is the primitive; building undo on top is a 30-line userland helper.
- **Schema validation on writes.** Out of scope; users compose validation themselves.
- **Reactive class properties via decorators.** Marjoram is class-free by design (see [CLAUDE.md](../CLAUDE.md) §7.2).
- **An Immer-style `produce(state, draft => ...)`.** `batch(() => { ... })` around direct mutations covers the same need without the bundle cost of structural sharing.
- **Cross-store derivations as a built-in primitive.** Already covered by `computed()` reading from multiple stores.
- **Server/client serialization protocol.** `snapshot()` is the building block; SSR hydration is a downstream library, not a primitive concern.

## 14. Open questions (still genuinely open)

Questions that need a decision before Phase 2 begins. The plan locked one of these already (auto-storing in `useViewModel` → **no**, explicit only). Remaining:

1. **`produce`-style transactions.** Confirmed: lean is to rely on `batch(() => { ... })` and not ship a separate `produce` API. Want a final yes before locking. (Argument for `produce`: easier mental model for users coming from Redux Toolkit / Immer. Argument against: it would require us to ship structural sharing, growing the bundle materially, for a use case `batch` already covers.)
2. **Path-binding proxy method collision policy.** When a store key happens to be named `compute`, `observe`, `value`, or `peek`, the method wins (per §10.1). Alternative: the data wins and methods move under a namespaced key like `state.$user.$$compute(...)`. Current lean: method wins + dev-mode warning, matches Vue precedent. Want a final decision.
3. **Should `subscribe()` accept a path filter?** E.g., `subscribe(s, ["user", "name"], cb)`. The leaner v1 API is "no — use `effect` for path-scoped subscription." Want confirmation.

## 15. Worked examples (audience: users)

### 15.1 A nested form

```ts
import { createWidget, html, useViewModel, store, when } from "marjoram";

interface FormState {
  user: { name: string; email: string };
  address: { street: string; city: string; zip: string };
  preferences: { newsletter: boolean; theme: "light" | "dark" };
}

createWidget<FormState>({
  target: "#form",
  model: {
    form: store<FormState>({
      user: { name: "", email: "" },
      address: { street: "", city: "", zip: "" },
      preferences: { newsletter: false, theme: "light" },
    }),
    isValid: vm => vm.form.user.email.includes("@") && vm.form.user.name.length > 0,
  },
  render: vm => html`
    <form>
      <input
        ref="name"
        value="${vm.$form.user.name}"
        oninput="${(e: Event) => (vm.form.user.name = (e.target as HTMLInputElement).value)}"
      />
      <input
        ref="email"
        value="${vm.$form.user.email}"
        oninput="${(e: Event) => (vm.form.user.email = (e.target as HTMLInputElement).value)}"
      />
      <button disabled="${vm.$isValid.compute(v => !v)}">Submit</button>
      ${when(vm.$isValid, () => html`<p>Looks good!</p>`, () => html`<p>Fill out name and email.</p>`)}
    </form>
  `,
});
```

The granularity guarantee: typing in the name field re-renders *only* the name input's binding and the `isValid` computed (which the disabled state and `when` depend on). The email input is untouched.

### 15.2 A keyed todo list

```ts
import { createWidget, html, useViewModel, store, repeat } from "marjoram";

interface Todo { id: number; text: string; done: boolean; }

createWidget({
  target: "#todos",
  model: {
    todos: store<Todo[]>([]),
    nextId: 1,
  },
  render: vm => html`
    <ul>
      ${repeat(
        vm.$todos,
        t => t.id,
        t => html`
          <li>
            <input
              type="checkbox"
              checked="${t.done}"
              onchange="${(e: Event) => {
                // Find the todo by id and mutate in place — granular update.
                const target = vm.todos.find(x => x.id === t.id);
                if (target) target.done = (e.target as HTMLInputElement).checked;
              }}"
            />
            ${t.text}
          </li>
        `
      )}
    </ul>
  `,
});

// Adding a todo:
vm.todos.push({ id: vm.nextId++, text: "Buy milk", done: false });
// Only the new <li> is created. Existing rows are untouched.

// Toggling done on todo 1:
vm.todos.find(t => t.id === 1).done = true;
// Only that <li>'s checkbox attribute updates.
```

## 16. Cross-references

- [STORE_IMPLEMENTATION_PLAN.md](STORE_IMPLEMENTATION_PLAN.md) — phased implementation roadmap, versioning, non-breaking-change rules.
- [src/reactivity/signal.ts](../src/reactivity/signal.ts) — existing primitives stores will compose with.
- [src/schema/schemaPropFactory.ts](../src/schema/schemaPropFactory.ts) — the `SchemaProp` shape that path-binding proxies will conform to.
- [src/view/external/repeat.ts](../src/view/external/repeat.ts) — keyed list reconciler stores will integrate with.
- [CLAUDE.md](../CLAUDE.md) §4, §5, §7 — the project conventions and anti-patterns this design respects.
