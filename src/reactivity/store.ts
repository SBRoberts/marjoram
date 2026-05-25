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

    const isNewKey = !(key in raw);
    const ok = Reflect.set(raw, key, newValue, receiver);
    if (!ok) return false;

    notifyPath(raw, key);
    if (isNewKey) notifyKeys(raw);
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
