# Changelog

All notable changes to Marjoram are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## [1.2.0] — 2026-06-01

Additive, non-breaking. Aligns the reactivity layer with the
[TC39 Signals proposal](https://github.com/tc39/proposal-signals): adds
`SignalOptions`, lifecycle hooks, a `Signal.subtle.Watcher`-shaped primitive,
and an introspection namespace. Internals switch from a dirty flag to
epoch/version memoization with skip-on-stale for both computeds and effects.

`store()` is rebuilt on these public primitives — no internal escape hatches
into the reactivity engine — proving the spec surface is sufficient for deep
reactivity.

### Added

- **`SignalOptions<T>`** — second arg to `signal()` and `computed()`:
  - `equals?: (a, b) => boolean` — overrides `Object.is` when deciding
    whether a write/recompute actually changed the value.
  - `[Signal.subtle.watched]` / `[Signal.subtle.unwatched]` — lifecycle
    callbacks that fire on the 0↔1 live-watcher transition. Hook callbacks
    must not read or write signals (dev-mode I/O assertion, stripped in
    production).
- **`watcher(notify)`** — TC39 `Signal.subtle.Watcher`-shaped low-level
  observer. `notify` fires synchronously when a watched signal becomes
  stale; for everyday side effects, keep using `effect()`.
- **`Signal.subtle` namespace** — spec-shaped introspection and lifecycle
  symbols:
  - `watched` / `unwatched` (option keys)
  - `untrack(fn)` (alias for `untracked`)
  - `currentComputed()` — the computed currently being evaluated, or `null`
  - `introspectSources(target)` / `introspectSinks(target)`
  - `hasSources(target)` / `hasSinks(target)`
  - `isTracking()` — small Marjoram extension for reactive containers
- **Dual API on signal callables** — `.get()` / `.set()` / `.peek()` exist
  alongside the callable form (`s()` / `s.set(v)`). The callable stays the
  documented DX surface; the methods are for interop with anything written
  against the spec or `signal-utils`.

### Changed

- **Computed memoization** uses epoch/version comparison instead of a dirty
  flag. Recompute is skipped when no source's version has actually changed
  since the last evaluation — invisible in single-source graphs, can
  legitimately reduce re-runs in multi-source/diamond shapes.
- **Effects** push-pull on microtask: if no source's version moved (e.g.
  because an upstream computed's `equals` returned `true`), the effect skips
  re-running entirely.
- **Cycle detection now throws.** Reading a computed during its own
  evaluation throws `Cycle detected`. Previously the read silently returned
  a stale value.
- **`store()` is rebuilt on public primitives.** Per-path tracking nodes are
  real `signal(undefined, { equals: () => false, [unwatched]: ... })`. The
  `[unwatched]` hook reclaims a path slot when its last live consumer
  disconnects (and no non-live computed reader is still observing). The
  internal `_isTracking`/`_createNode`/`_track`/`_notify` escape hatches
  that earlier versions exposed have been removed.

### Notes

- Bundle: ~6.8 KB gzipped (UMD/ESM), zero runtime dependencies. ~1 KB
  growth over 1.1 for the spec-shaped additions; the DevTools formatter
  is still dead-code-eliminated from production builds.
- Honest framing: this is spec-shape-compatible with `[watched]/[unwatched]`
  lifecycle and a Watcher primitive. It is **not** a pull-based glitch-free
  evaluation graph (Reactively / alien-signals style); push-based propagation
  is preserved. "TC39-aligned reference implementation" is defensible;
  "fastest signals engine in JS" is not.

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
