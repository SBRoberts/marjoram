// ---------------------------------------------------------------------------
// Path-binding proxy for `vm.$store.path.to.leaf` ergonomics (Phase 4b).
//
// `vm.$user` already returns a SchemaProp wrapping the store (Phase 4a). This
// module wraps that SchemaProp in a Proxy so that arbitrary dot-traversal
// produces nested SchemaProps reactive to that specific path.
//
// Mechanism: child paths are materialized lazily via SchemaProp.compute(),
// which already routes through signalComputed for stores (Phase 4a). The
// proxy intercepts arbitrary keys and recursively delegates to
// `parent.compute(v => v[key])`, building a chain of path-bound SchemaProps.
//
// Method-vs-data collision policy (locked in docs/STORES.md §10.1): method
// wins. If a store key collides with a SchemaProp method/property name (key,
// id, value, peek, compute, observe, update, dispose, etc.), the SchemaProp
// method is returned and a dev-mode warning fires.
// ---------------------------------------------------------------------------

import { SchemaProp } from "../schema";

/**
 * The set of keys reserved by SchemaProp — accessed through the proxy, these
 * delegate to the underlying SchemaProp instance instead of traversing into
 * the store. Derived once from SchemaProp.prototype so it stays in sync with
 * the class.
 */
const SCHEMA_PROP_KEYS = new Set<string | symbol>([
  // Static/dynamic instance fields
  "key",
  "id",
  "_signal",
  // Core methods
  "value",
  "peek",
  "compute",
  "observe",
  "update",
  "dispose",
  "addDisposer",
  // Array passthrough getters on SchemaProp
  "map",
  "filter",
  "forEach",
  "find",
  "reduce",
  "includes",
  "indexOf",
  "slice",
  "concat",
  "join",
  "some",
  "every",
  "findIndex",
  "length",
]);

/**
 * Wrap a store-backed SchemaProp in a path-binding proxy. Returning the
 * proxy still passes `instanceof SchemaProp` because Proxy preserves the
 * target's prototype chain.
 */
export function createStorePathBinding(rootSchemaProp: SchemaProp): SchemaProp {
  return wrap(rootSchemaProp);
}

const proxyMap = new WeakMap<SchemaProp, SchemaProp>();

function wrap(target: SchemaProp): SchemaProp {
  const existing = proxyMap.get(target);
  if (existing) return existing;

  // Cache for child path bindings keyed by the data property name.
  const childCache = new Map<string | symbol, SchemaProp>();

  const proxied = new Proxy(target, {
    get(t, key) {
      // SchemaProp uses ES private fields (`#signal`, `#schema`, etc.) which
      // are identity-bound to the instance. Inside a getter/method called via
      // `proxy.value` or `proxy.compute()`, `this` resolves to the Proxy, not
      // the underlying instance — and `this.#signal` throws because the Proxy
      // isn't in the class's private-field slot map. Fix: when delegating to a
      // SchemaProp own property, set the receiver to `t` for getters, and
      // bind() methods to `t`.
      if (typeof key === "symbol") return Reflect.get(t, key, t);

      if (SCHEMA_PROP_KEYS.has(key)) {
        if (process.env.NODE_ENV !== "production") {
          // Dev-mode collision warning: data has a key shadowing a SchemaProp
          // method. Per the locked decision, method wins. Read via peek() so
          // the dev-only check does NOT register a tracking dependency (which
          // would mask perf characteristics that don't appear in production).
          const value = (t as unknown as { peek(): unknown }).peek();
          if (
            value !== null &&
            typeof value === "object" &&
            Object.prototype.hasOwnProperty.call(value, key)
          ) {
            // eslint-disable-next-line no-console
            console.warn(
              `[marjoram] Store data has a key "${key}" that collides with a SchemaProp method/property. The SchemaProp method takes precedence. Rename the data key or use vm.$store.compute(v => v["${key}"]) to access the data.`
            );
          }
        }
        const val = Reflect.get(t, key, t);
        return typeof val === "function" ? val.bind(t) : val;
      }

      // Prototype-chain guard: `vm.$store.__proto__.x` must not traverse into
      // Object.prototype. Return undefined for dangerous keys.
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return undefined;
      }

      // Child path binding. Each child is a SchemaProp produced via .compute()
      // — which, for store-backed parents, routes through signalComputed and
      // is reactive to the specific path. Cached so identity is stable.
      if (childCache.has(key)) return childCache.get(key)!;
      const childProp = t.compute(
        v => (v as Record<string, unknown>)?.[key]
      ) as unknown as SchemaProp;
      const childProxy = wrap(childProp);
      childCache.set(key, childProxy);
      return childProxy;
    },

    set(t, key, value) {
      // Mirror the get-trap fix for setters (`schemaProp.value = x`).
      return Reflect.set(t, key, value, t);
    },
  }) as SchemaProp;

  proxyMap.set(target, proxied);
  return proxied;
}
