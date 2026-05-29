# Changelog

All notable changes to Marjoram are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## [1.1.0] — 2026-05-29

Additive, non-breaking. Adds deep reactivity as a peer to `signal()`. No
existing API changed; all 1.0.0 code continues to work unchanged.

### Added

- **`store(initial)`** — deeply-reactive, path-granular state. Mutate nested
  paths directly (`state.user.address.city = "x"`) and only subscribers to
  that exact path re-run. Built on the existing signal graph; integrates with
  `computed`, `effect`, `batch`, and `untracked` with no new reactivity system.
- **Path-binding in templates** — `vm.$store.path.to.leaf` is a reactive
  binding to a specific store path, typed all the way to the leaf.
- **`repeat()` + store arrays** — `push`/`pop`/`splice`/`sort`/etc. reconcile
  a keyed list reactively; mutating array methods coalesce into one
  notification round.
- **`snapshot(store)`** — deep plain-object copy (safe to `JSON.stringify`).
- **`subscribe(store, path, cb)`** — typed-path escape hatch; `Path<T>` /
  `PathValue<T, P>` resolve dotted paths at compile time.
- **`markRaw(value)`** — opt a value out of being proxied.
- **`isStore(value)` / `unwrap(store)`** — type guard and raw-object accessor.
- **DevTools custom formatter** — stores render as `Store { … }` in the
  console (dev builds only; stripped from production).
- **`repeat` and `when`** are now explicit named exports (previously reachable
  only through `export *`).

### Security

- Internal store flags are `Symbol`s, so untrusted JSON cannot spoof store
  identity or escape reactivity.
- Prototype-pollution and prototype-chain exfiltration guards: `__proto__` /
  `constructor` / `prototype` are not writable or traversable through a store
  proxy or a `subscribe()` path.
- `markRaw()` throws on built-in prototypes (`Object`/`Array`/`Function`).

### Notes

- Bundle: ~5.9 KB gzipped (ESM), zero runtime dependencies. The DevTools
  formatter is dead-code-eliminated from production builds.
- `store()` is opt-in; `useViewModel` does not auto-wrap nested plain objects.
- Full contract and gotchas: [docs/STORES.md](docs/STORES.md).

## [1.0.0] — 2026-03-15

Initial release: `createWidget`, `html`, `useViewModel`, `signal`, `computed`,
`effect`, `batch`, `untracked`, `when`, `repeat`, Shadow DOM isolation,
XSS-safe templating.
