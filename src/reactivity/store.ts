// ---------------------------------------------------------------------------
// store() — deep reactivity primitive.
//
// Peer to signal(): where signal() is shallow and reference-based, store() is
// deep and path-granular. Mutating state.user.address.city = "x" notifies only
// subscribers to that exact path. Built on the same SignalNode + Subscriber
// machinery as signal() — no parallel reactivity system.
//
// Design contract: docs/STORES.md.
// Patterns verified against competitor source: docs/STORE_RESEARCH_FINDINGS.md.
// ---------------------------------------------------------------------------

import {
  type SignalNode,
  _isTracking,
  _createNode,
  _track,
  _notify,
  batch,
  effect as signalEffect,
  untracked,
} from "./signal";

// ---------------------------------------------------------------------------
// Private symbols & flags. Not exported — module-scope only.
//
// $PROXY  — non-enumerable property on raw object, points to its Proxy.
//           Gives us O(1) identity caching with no parallel WeakMap.
//           (Pattern: Solid `packages/solid/store/src/store.ts:49-84`.)
// $NODE   — non-enumerable property on raw object, points to its per-key
//           SignalNode map. Allocated only when something tracks a read.
// $RAW    — well-known symbol consumed by the get-trap so unwrap() works.
// $KEYS   — sentinel key inside the $NODE record for iteration / key-set
//           reactivity (for ... in, Object.keys). One node per parent,
//           regardless of how many keys.
//
// FLAG_IS_STORE / FLAG_SKIP — string-keyed flags answered by the get-trap.
//           (Pattern: Vue `packages/reactivity/src/constants.ts:11-24` +
//           baseHandlers `:66-85`.)
// ---------------------------------------------------------------------------

const $RAW = Symbol("marjoram.raw");
const $PROXY = Symbol("marjoram.proxy");
const $NODE = Symbol("marjoram.node");
const $KEYS = Symbol("marjoram.keys");

const FLAG_IS_STORE = "__m_isStore";
const FLAG_SKIP = "__m_skip";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

declare const STORE_BRAND: unique symbol;

/**
 * A deeply-reactive view of T. Structurally is T — readable and writable
 * exactly like the underlying object. Reads inside a reactive context track
 * the path; writes notify subscribers to that path.
 */
export type Store<T extends object> = T & { readonly [STORE_BRAND]: true };

// ---------------------------------------------------------------------------
// Boundary rules — what gets proxied.
//
// Plain objects and arrays only. Everything else (primitives, class instances,
// Date / Map / Set / RegExp / Promise / typed arrays / DOM nodes, frozen
// objects, markRaw'd values) is stored and returned by reference, untouched.
// ---------------------------------------------------------------------------

function shouldProxy(value: unknown): value is object {
  if (value === null || typeof value !== "object") return false;
  // markRaw opt-out
  if ((value as Record<PropertyKey, unknown>)[FLAG_SKIP] === true) return false;
  // Frozen objects can't be safely proxied (writes would throw).
  if (Object.isFrozen(value)) return false;
  // Only plain objects and arrays. Class instances, Date, Map, Set, DOM
  // nodes, etc. all have non-Object/non-Array prototypes.
  const proto = Object.getPrototypeOf(value);
  return (
    proto === Object.prototype || proto === Array.prototype || proto === null
  );
}

// ---------------------------------------------------------------------------
// Per-raw-object SignalNode map. Created lazily, on first tracked read.
// ---------------------------------------------------------------------------

type NodeMap = Record<PropertyKey, SignalNode>;

function getOrCreateNodeMap(raw: object): NodeMap {
  let nodes = (raw as Record<symbol, unknown>)[$NODE] as NodeMap | undefined;
  if (!nodes) {
    nodes = Object.create(null) as NodeMap;
    Object.defineProperty(raw, $NODE, {
      value: nodes,
      enumerable: false,
      configurable: false,
      writable: false,
    });
  }
  return nodes;
}

/**
 * Subscribe the active reactive context (if any) to raw[key]. No-op outside
 * a tracked context — this is the "reads are free" guarantee.
 */
function trackPath(raw: object, key: PropertyKey): void {
  if (!_isTracking()) return;
  const nodes = getOrCreateNodeMap(raw);
  let node = nodes[key];
  if (!node) {
    node = _createNode(undefined);
    nodes[key] = node;
  }
  _track(node);
}

/**
 * Track iteration / key-set reactivity. Used by `has` and `ownKeys` traps so
 * `for (k in store)` and `Object.keys(store)` re-run when keys are added or
 * removed.
 */
function trackKeys(raw: object): void {
  if (!_isTracking()) return;
  const nodes = getOrCreateNodeMap(raw);
  let node = nodes[$KEYS];
  if (!node) {
    node = _createNode(undefined);
    nodes[$KEYS] = node;
  }
  _track(node);
}

/** Fire subscribers of raw[key]. No-op if nothing ever tracked it. */
function notifyPath(raw: object, key: PropertyKey): void {
  const nodes = (raw as Record<symbol, unknown>)[$NODE] as NodeMap | undefined;
  if (!nodes) return;
  const node = nodes[key];
  if (node) _notify(node);
}

/** Fire iteration / key-set subscribers. */
function notifyKeys(raw: object): void {
  const nodes = (raw as Record<symbol, unknown>)[$NODE] as NodeMap | undefined;
  if (!nodes) return;
  const node = nodes[$KEYS];
  if (node) _notify(node);
}

// ---------------------------------------------------------------------------
// The proxy handler. One instance, shared by every store. The handler is
// stateless — all per-store state lives on the raw object via the private
// symbols above.
// ---------------------------------------------------------------------------

const storeHandler: ProxyHandler<object> = {
  get(raw, key, receiver) {
    // Flag interceptions — answered without reading raw or tracking.
    if (key === FLAG_IS_STORE) return true;
    if (key === $RAW) return raw;

    const value = Reflect.get(raw, key, receiver);

    // Array-method batching (Phase 3): when reading a function-typed key off
    // an array that exists on Array.prototype, return a wrapper that runs the
    // method inside `batch()`. This coalesces the internal index/length
    // writes of mutating methods (push/pop/shift/unshift/splice/sort/reverse/
    // fill/copyWithin) into a single notification round, so a subscribed
    // effect re-runs once per call instead of once per inner write.
    //
    // Pattern: Solid `packages/solid/store/src/mutable.ts:55-58`.
    //
    // Non-mutating methods (map/filter/forEach/...) also flow through this
    // path. The batch is a no-op for them — no extra work, no behavior
    // change.
    if (
      Array.isArray(raw) &&
      typeof value === "function" &&
      typeof key === "string" &&
      key in Array.prototype
    ) {
      return (...args: unknown[]): unknown => {
        let result: unknown;
        batch(() => {
          result = (value as (...a: unknown[]) => unknown).apply(
            receiver,
            args
          );
        });
        return result;
      };
    }

    // Don't track reads of private symbols, function values, or inherited
    // accessors that aren't part of the user's data model.
    if (typeof key !== "symbol") {
      trackPath(raw, key);
    }

    if (shouldProxy(value)) {
      return wrap(value);
    }
    return value;
  },

  set(raw, key, newValue, receiver) {
    const oldValue = Reflect.get(raw, key, receiver);
    if (Object.is(oldValue, newValue)) return true;

    const isArray = Array.isArray(raw);
    // Capture length before the write — writing an out-of-bounds index on an
    // array auto-bumps `length` as a native side-effect. We need to notify
    // length subscribers from inside this set, because by the time push()
    // explicitly writes `this.length = N` (its final step), the value is
    // already N and Object.is would skip the notification.
    const oldLength = isArray ? (raw as unknown[]).length : 0;

    const isNewKey = !(key in raw);
    const ok = Reflect.set(raw, key, newValue, receiver);
    if (!ok) return false;

    notifyPath(raw, key);
    if (isNewKey) notifyKeys(raw);

    if (isArray && key !== "length") {
      const newLength = (raw as unknown[]).length;
      if (newLength !== oldLength) notifyPath(raw, "length");
    }

    return true;
  },

  deleteProperty(raw, key) {
    if (!(key in raw)) return true;
    const ok = Reflect.deleteProperty(raw, key);
    if (!ok) return false;
    notifyPath(raw, key);
    notifyKeys(raw);
    return true;
  },

  has(raw, key) {
    trackKeys(raw);
    return Reflect.has(raw, key);
  },

  ownKeys(raw) {
    trackKeys(raw);
    return Reflect.ownKeys(raw);
  },
};

// ---------------------------------------------------------------------------
// Identity cache — same raw → same proxy across all reads.
// ---------------------------------------------------------------------------

function wrap<T extends object>(raw: T): T {
  let proxy = (raw as Record<symbol, unknown>)[$PROXY] as T | undefined;
  if (!proxy) {
    proxy = new Proxy(raw, storeHandler) as T;
    Object.defineProperty(raw, $PROXY, {
      value: proxy,
      enumerable: false,
      configurable: false,
      writable: false,
    });
  }
  return proxy;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a deeply-reactive store from a plain object or array.
 *
 * - Reads inside a reactive context (`computed`, `effect`, `html` templates)
 *   register the active context as a subscriber to the exact path read.
 * - Writes notify only the subscribers to the affected path.
 * - `state.user === state.user` holds across reads — nested proxies are cached
 *   on the raw object via a non-enumerable symbol.
 * - Reads outside any reactive context allocate nothing.
 *
 * @example
 * ```ts
 * const state = store({ user: { name: "Alice", age: 30 } });
 *
 * effect(() => console.log(state.user.name));   // logs "Alice"
 * state.user.age = 31;                          // ← effect does NOT re-run
 * state.user.name = "Bob";                      // ← effect re-runs, logs "Bob"
 * ```
 */
export function store<T extends object>(initial: T): Store<T> {
  // Lazy one-time install of the DevTools custom formatter. In production
  // builds the `process.env.NODE_ENV === "production"` check inlined below
  // short-circuits, and Terser dead-code-eliminates the entire formatter
  // body via the @rollup/plugin-replace substitution.
  installDevtoolsFormatter();
  // Already a store — return as-is (idempotent, handles cycles).
  if ((initial as Record<PropertyKey, unknown>)[FLAG_IS_STORE] === true) {
    return initial as Store<T>;
  }
  // markRaw'd or built-in — gracefully pass through without proxying.
  if (!shouldProxy(initial)) {
    return initial as Store<T>;
  }
  return wrap(initial) as Store<T>;
}

// ---------------------------------------------------------------------------
// DevTools custom formatter — dev-only, stripped from production builds.
//
// Without this, stores render as opaque `Proxy { ... }` blobs in the console.
// With it: `Store { user: { name: "Alice" } }` with inspectable nested data.
//
// The whole block is gated behind `process.env.NODE_ENV !== "production"`.
// The Rollup build substitutes `process.env.NODE_ENV` to the string
// "production" at compile time so Terser drops the entire body.
//
// Pattern: Vue 3's `runtime-core/src/customFormatter.ts`. Users must enable
// "Custom formatters" in DevTools preferences for this to render. Firefox /
// Safari ignore `window.devtoolsFormatters` — harmless no-op.
// ---------------------------------------------------------------------------

let formatterInstalled = false;

function installDevtoolsFormatter(): void {
  if (process.env.NODE_ENV === "production") return;
  if (formatterInstalled) return;
  if (typeof window === "undefined") return;
  formatterInstalled = true;

  const labelStyle = { style: "color:#3ba776;font-weight:bold" };

  const formatter = {
    __marjoram_store_formatter: true,
    header(obj: unknown) {
      if (!isStore(obj)) return null;
      return ["div", {}, ["span", labelStyle, "Store"]];
    },
    hasBody(obj: unknown) {
      return isStore(obj);
    },
    body(obj: unknown) {
      return untracked(() => [
        "div",
        {},
        ["object", { object: unwrap(obj as Store<object>) }],
      ]);
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.devtoolsFormatters) {
    w.devtoolsFormatters.push(formatter);
  } else {
    w.devtoolsFormatters = [formatter];
  }
}

/**
 * Mark a plain object or array so `store()` will never proxy it. Reads return
 * the raw value; mutations to nested keys are invisible to reactivity.
 *
 * Use for embedding non-reactive payloads (parsed AST, large config blob, 3rd-
 * party state) inside a store.
 *
 * @example
 * ```ts
 * const state = store({
 *   user: { name: "Alice" },          // reactive
 *   ast: markRaw(largeParsedTree),    // ignored by reactivity
 * });
 * ```
 */
export function markRaw<T extends object>(value: T): T {
  Object.defineProperty(value, FLAG_SKIP, {
    value: true,
    enumerable: false,
    configurable: true,
    writable: false,
  });
  return value;
}

/** Type guard. `true` for values created by `store()`. */
export function isStore(value: unknown): value is Store<object> {
  return (
    value !== null &&
    typeof value === "object" &&
    (value as Record<PropertyKey, unknown>)[FLAG_IS_STORE] === true
  );
}

/**
 * Return the raw object backing a store. Mutating the raw object BYPASSES
 * reactivity — no subscribers fire. Use only for interop with code that
 * requires a plain object (e.g., `structuredClone`, libraries that key off
 * object identity, JSON serialization through the proxy is fine without this).
 */
export function unwrap<T extends object>(value: Store<T> | T): T {
  if (isStore(value)) {
    return (value as unknown as Record<symbol, unknown>)[$RAW] as T;
  }
  return value as T;
}

// ---------------------------------------------------------------------------
// snapshot() — deep plain-object copy
// ---------------------------------------------------------------------------

/**
 * Deep-clone a store to a plain object. Returned value is structurally `T`,
 * contains no reactivity, and is safe to `JSON.stringify`, structurally
 * compare, or hand to non-reactive code.
 *
 * Reading via `snapshot()` does **not** register reactive subscriptions —
 * it's a non-tracking deep read suitable for use outside reactive contexts.
 * If you call it inside an `effect`, the effect will not re-run on store
 * mutations.
 *
 * Built-in values (Date, Map, Set, RegExp, class instances, etc.) are
 * returned by reference — only plain objects and arrays are deep-copied.
 *
 * @example
 * ```ts
 * const state = store({ user: { name: "Alice" }, todos: [1, 2, 3] });
 * const json = JSON.stringify(snapshot(state));
 * ```
 */
export function snapshot<T extends object>(s: Store<T>): T {
  // Walk through the proxy so cycles + nested stores resolve correctly, but
  // wrap in `untracked()` so the user-facing contract holds: snapshot() never
  // registers reactive subscriptions, even when called inside an effect.
  return untracked(() => cloneDeep(s, new WeakMap())) as T;
}

function cloneDeep(value: unknown, seen: WeakMap<object, object>): unknown {
  if (value === null || typeof value !== "object") return value;
  if (!shouldProxy(value)) return value; // pass built-ins/markRaw by reference
  const existing = seen.get(value);
  if (existing) return existing; // cycle
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    seen.set(value, out);
    for (let i = 0; i < value.length; i++) {
      out[i] = cloneDeep(value[i], seen);
    }
    return out;
  }
  const out: Record<string, unknown> = {};
  seen.set(value, out);
  for (const k of Object.keys(value)) {
    out[k] = cloneDeep((value as Record<string, unknown>)[k], seen);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Path<T> / PathValue<T, P> — typed dotted-string paths
//
// Pattern from STORE_RESEARCH_FINDINGS.md §8 (type-fest / react-hook-form
// heritage). Depth-capped recursion via tuple-length decrement; pure type-level,
// zero runtime cost.
// ---------------------------------------------------------------------------

type PathPrimitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;
// Treat these as path leaves — don't recurse into them.
type PathLeafObject =
  | Date
  | RegExp
  | Map<unknown, unknown>
  | Set<unknown>
  | Promise<unknown>
  | ((...args: unknown[]) => unknown);
type PathBuiltin = PathPrimitive | PathLeafObject;
type PrevDepth = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Union of all dotted paths through T, depth-capped (default 10). */
export type Path<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends PathBuiltin
    ? never
    : T extends ReadonlyArray<infer U>
      ? `${number}` | `${number}.${Path<U, PrevDepth[D]>}`
      : T extends object
        ? {
            [K in keyof T & (string | number)]: T[K] extends PathBuiltin
              ? `${K}`
              : `${K}` | `${K}.${Path<NonNullable<T[K]>, PrevDepth[D]>}`;
          }[keyof T & (string | number)]
        : never;

/** Value type at path P within T. Propagates `| undefined` if any segment is optional. */
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

// ---------------------------------------------------------------------------
// subscribe() — typed-path escape hatch
// ---------------------------------------------------------------------------

/**
 * Subscribe to changes at a typed dotted path within a store. Prefer
 * `effect()` for almost everything — `subscribe()` exists for interop with
 * non-reactive code (DOM event sinks, third-party libraries that take
 * callbacks).
 *
 * Pass `""` as the path to subscribe to any change anywhere in the store —
 * callback receives the whole-store value (as a snapshot). For finer-grained
 * whole-store work, write an `effect()` instead.
 *
 * Returns an unsubscribe function. Always call it during cleanup to avoid
 * leaking the underlying signal effect.
 *
 * @example
 * ```ts
 * const state = store({ user: { name: "Alice" } });
 * const off = subscribe(state, "user.name", (next, prev) => {
 *   console.log("name changed:", prev, "→", next);
 * });
 * state.user.name = "Bob"; // logs "name changed: Alice → Bob"
 * off();
 * ```
 */
export function subscribe<T extends object, P extends Path<T> | "">(
  s: Store<T>,
  path: P,
  callback: P extends ""
    ? (newValue: T, oldValue: T) => void
    : (newValue: PathValue<T, P>, oldValue: PathValue<T, P>) => void
): () => void {
  let prev: unknown;
  let initialized = false;

  return signalEffect(() => {
    let cur: unknown;
    if (path === "") {
      // Whole-store subscription: deep-walk through the proxy so every
      // accessed path registers as a dependency of this effect. Return a
      // snapshot-shaped value to the callback. (We deliberately do NOT use
      // snapshot() here because its public contract is "no tracking" via
      // untracked() — which is exactly what we want to opt OUT of.)
      cur = cloneDeep(s, new WeakMap());
    } else {
      cur = readPath(s, path as string);
    }
    if (initialized) {
      (callback as (newVal: unknown, oldVal: unknown) => void)(cur, prev);
    }
    prev = cur;
    initialized = true;
  });
}

function readPath(s: object, path: string): unknown {
  if (!path) return s;
  const parts = path.split(".");
  let cur: unknown = s;
  for (const p of parts) {
    if (cur === null || cur === undefined) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}
