// ---------------------------------------------------------------------------
// Fine-grained reactive signal system with automatic dependency tracking.
//
// Primitives:
//   signal(value, options?)   — writable reactive value
//   computed(fn, options?)    — read-only derived value, auto-tracks
//   effect(fn)                — side-effect that re-runs on dependency change
//   batch(fn)                 — defer notifications until the callback completes
//   untracked(fn)             — read signals without subscribing
//   watcher(notify)           — TC39-shaped observer (notify auto-re-arms)
//
// Memoization is epoch/version-based: every node carries a monotonic
// `_version` bumped only on actual value change. Subscribers record the
// last-seen version of each source; on read or microtask re-entry they
// skip work when nothing actually moved. Push-based notification drives
// scheduling — versions gate the work that follows.
//
// Live-watcher count: each node carries `_watcherCount`, transitively
// propagated from effects/watchers through computeds. A computed only
// contributes +1 to its sources while its own watcherCount > 0 — that's
// the distinction store() needs for lazy [watched]/[unwatched] hooks.
//
// Spec alignment: the TC39 Signals proposal's `Signal.subtle.watched` /
// `Signal.subtle.unwatched` symbols, equality customization, Watcher class,
// and introspection are all exposed via the `Signal` namespace exported
// from this module. The callable form (`s()`/`s.set(v)`) is the documented
// DX surface; `.get()`/`.set()` are spec-shaped aliases.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Lifecycle symbols — keyed options that fire on `_watcherCount` 0↔1
// transitions. Exposed publicly as `Signal.subtle.watched/unwatched`.
// ---------------------------------------------------------------------------

const WATCHED = Symbol("Signal.subtle.watched");
const UNWATCHED = Symbol("Signal.subtle.unwatched");

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface Signal<T = unknown> {
  /** Read the current value (and track the caller as a subscriber). */
  (): T;
  /** Read the current value (and track the caller). Alias for the callable. */
  get(): T;
  /** Write a new value, notifying subscribers. */
  set(value: T): void;
  /** Read without tracking (for use outside reactive contexts). */
  peek(): T;
  /** Remove all subscribers. */
  dispose(): void;
}

export interface ReadonlySignal<T = unknown> {
  /** Read the current value (and track the caller as a subscriber). */
  (): T;
  /** Read the current value (and track the caller). Alias for the callable. */
  get(): T;
  /** Read without tracking. */
  peek(): T;
  /** Remove all subscribers and stop tracking dependencies. */
  dispose(): void;
}

/**
 * Per-signal configuration, modeled on `SignalOptions` from the TC39 Signals
 * proposal. Optional on both `signal()` and `computed()`.
 *
 * - `equals` — overrides `Object.is` when deciding whether a write/recompute
 *   actually changed the value. Returning `true` suppresses notification.
 * - `[Signal.subtle.watched]` — fires the first time the signal gains a live
 *   downstream consumer.
 * - `[Signal.subtle.unwatched]` — fires when the last live consumer goes away.
 *
 * Hook callbacks must not read or write signals — same contract as a Watcher
 * notify callback (enforced in dev builds).
 */
export interface SignalOptions<T = unknown> {
  equals?: (oldValue: T, newValue: T) => boolean;
  [WATCHED]?: () => void;
  [UNWATCHED]?: () => void;
}

/**
 * Low-level synchronous observer in the shape of `Signal.subtle.Watcher`
 * from the TC39 Signals proposal: `watch`/`unwatch`/`getPending`/`dispose`,
 * a `notify` that fires synchronously when a watched signal becomes stale,
 * and a callback that must not read or write signals (dev-mode builds throw).
 *
 * Deliberate divergence from the spec contract: the spec's `notify` is
 * *one-shot* — it fires once on the clean→stale transition and stays quiet
 * until you re-arm via `watch()`. Marjoram's `notify` instead re-arms
 * automatically and fires on *every* qualifying change (see the smoke test
 * in `__tests__/reactivity/watcher.test.ts`). It is an "observe all changes"
 * observer, not a one-shot scheduler hook; consumers porting spec-style code
 * (notify → drain `getPending()` → `watch()` to re-arm) should know the
 * explicit re-arm is a no-op here.
 *
 * Use it to build custom schedulers. For everyday side effects use `effect()`,
 * which is an independent primitive — it does NOT build on `watcher()`.
 */
export interface Watcher {
  watch(...signals: (Signal<unknown> | ReadonlySignal<unknown>)[]): void;
  unwatch(...signals: (Signal<unknown> | ReadonlySignal<unknown>)[]): void;
  /** The watched signals that currently have a newer version than last seen. */
  getPending(): (Signal<unknown> | ReadonlySignal<unknown>)[];
  dispose(): void;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface Subscriber {
  _sources: Set<SignalNode>;
  _lastSeen: Map<SignalNode, number>;
  _notify(): void;
  _running: boolean;
  /** True for computed subscribers — gates watcher-count contribution. */
  _isComputed?: boolean;
  /**
   * True for effects and watchers — leaf consumers that always contribute
   * +1 to their sources. Computeds contribute only when their own node has
   * `_watcherCount > 0`.
   */
  _isLiveConsumer?: boolean;
  /** Back-pointer to the SignalNode this subscriber drives (computeds only). */
  _node?: SignalNode;
}

/** @internal */
export interface SignalNode<T = unknown> {
  _value: T;
  _version: number;
  _subscribers: Set<Subscriber>;
  _watcherCount: number;
  /** Computed-only: refresh `_version` if anything moved. */
  _refresh?: () => void;
  /** Back-pointer to the subscriber that drives this node (computed only). */
  _sub?: Subscriber;
  /**
   * Custom equality, defaults to Object.is. Internally typed as
   * `(unknown, unknown)` so SignalNode<T> remains assignable to
   * SignalNode<unknown> across the registry maps; signal()/computed()
   * cast at assignment, never invoke equals with foreign values.
   */
  _equals?: (oldValue: unknown, newValue: unknown) => boolean;
  /** Fires on `_watcherCount` 0 → 1 transition. */
  _onWatched?: () => void;
  /** Fires on `_watcherCount` 1 → 0 transition. */
  _onUnwatched?: () => void;
}

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

const nodeRegistry = new WeakMap<
  Signal<unknown> | ReadonlySignal<unknown>,
  SignalNode
>();
const watcherRegistry = new WeakMap<Watcher, Subscriber>();
const nodeToPublic = new WeakMap<
  SignalNode,
  Signal<unknown> | ReadonlySignal<unknown>
>();
const subToWatcher = new WeakMap<Subscriber, Watcher>();

let activeSubscriber: Subscriber | null = null;
let batchDepth = 0;
const pendingNotifications = new Set<Subscriber>();

/**
 * Dev-mode guard: while true, signal reads and writes throw. The Watcher
 * notify callback and `[watched]`/`[unwatched]` hooks run under this guard
 * so spec-forbidden I/O surfaces loudly instead of silently corrupting
 * graph state.
 */
let inFrozenCallback = false;

function flushPending(): void {
  const subscribers = [...pendingNotifications];
  pendingNotifications.clear();
  for (const sub of subscribers) {
    sub._notify();
  }
}

function notifySubscribers(node: SignalNode): void {
  // Snapshot before iterating: a downstream `_notify` can synchronously
  // refresh a computed source, which clears and re-tracks its source set,
  // re-inserting subscribers into `node._subscribers` mid-iteration. JS
  // Set iteration visits re-added entries again, which would fire the
  // same subscriber's notify twice for one upstream change.
  const subs = [...node._subscribers];
  for (const sub of subs) {
    if (sub._running) continue; // prevent cycles
    if (batchDepth > 0) {
      pendingNotifications.add(sub);
    } else {
      sub._notify();
    }
  }
}

// ---------------------------------------------------------------------------
// Watcher-count propagation
//
// Counts cross 0↔1 trigger propagation (and fire lifecycle hooks). Crossings
// within (1, ∞) are pure bookkeeping. A computed's contribution to each
// source is binary (+1 if live, 0 if dormant), regardless of how many
// watchers it carries downstream.
// ---------------------------------------------------------------------------

function runFrozenCallback(fn: () => void): void {
  const prevActive = activeSubscriber;
  activeSubscriber = null;
  const prevFlag = inFrozenCallback;
  if (process.env.NODE_ENV !== "production") inFrozenCallback = true;
  try {
    fn();
  } finally {
    if (process.env.NODE_ENV !== "production") inFrozenCallback = prevFlag;
    activeSubscriber = prevActive;
  }
}

function adjustWatcherCount(node: SignalNode, delta: 1 | -1): void {
  const before = node._watcherCount;
  node._watcherCount += delta;
  const after = node._watcherCount;

  if (before === 0 && after === 1) {
    if (node._sub) {
      for (const source of node._sub._sources) {
        adjustWatcherCount(source, 1);
      }
    }
    if (node._onWatched) runFrozenCallback(node._onWatched);
  } else if (before === 1 && after === 0) {
    if (node._sub) {
      for (const source of node._sub._sources) {
        adjustWatcherCount(source, -1);
      }
    }
    if (node._onUnwatched) runFrozenCallback(node._onUnwatched);
  }
}

function contributesWatch(sub: Subscriber): boolean {
  if (sub._isLiveConsumer) return true;
  if (sub._node) return sub._node._watcherCount > 0;
  return false;
}

function trackDependency(node: SignalNode): void {
  const sub = activeSubscriber;
  if (!sub) return;
  if (sub._sources.has(node)) return;
  node._subscribers.add(sub);
  sub._sources.add(node);
  if (contributesWatch(sub)) {
    adjustWatcherCount(node, 1);
  }
}

function assertNotFrozen(op: "read" | "write"): void {
  if (process.env.NODE_ENV === "production") return;
  if (inFrozenCallback) {
    throw new Error(
      `[marjoram] Cannot ${op} a signal inside a Watcher notify or [watched]/[unwatched] callback.`
    );
  }
}

// ---------------------------------------------------------------------------
// signal() — writable reactive value
// ---------------------------------------------------------------------------

export function signal<T>(
  initialValue: T,
  options?: SignalOptions<T>
): Signal<T> {
  const node: SignalNode<T> = {
    _value: initialValue,
    _version: 0,
    _subscribers: new Set(),
    _watcherCount: 0,
    _equals: options?.equals as
      | ((a: unknown, b: unknown) => boolean)
      | undefined,
    _onWatched: options?.[WATCHED],
    _onUnwatched: options?.[UNWATCHED],
  };

  const read = (): T => {
    assertNotFrozen("read");
    trackDependency(node);
    return node._value;
  };

  const setValue = (value: T): void => {
    assertNotFrozen("write");
    const equal = node._equals
      ? node._equals(node._value, value)
      : Object.is(node._value, value);
    if (equal) return;
    node._value = value;
    node._version++;
    notifySubscribers(node);
  };

  read.get = read;
  read.set = setValue;
  read.peek = (): T => node._value;
  read.dispose = (): void => {
    for (const sub of node._subscribers) {
      if (contributesWatch(sub)) adjustWatcherCount(node, -1);
    }
    node._subscribers.clear();
  };

  nodeRegistry.set(read as Signal<T>, node);
  nodeToPublic.set(node, read as Signal<T>);
  return read as Signal<T>;
}

// ---------------------------------------------------------------------------
// computed() — derived reactive value with auto-tracking
// ---------------------------------------------------------------------------

export function computed<T>(
  fn: () => T,
  options?: SignalOptions<T>
): ReadonlySignal<T> {
  const node: SignalNode<T> = {
    _value: undefined as T,
    _version: 0,
    _subscribers: new Set(),
    _watcherCount: 0,
    _equals: options?.equals as
      | ((a: unknown, b: unknown) => boolean)
      | undefined,
    _onWatched: options?.[WATCHED],
    _onUnwatched: options?.[UNWATCHED],
  };

  let dirty = true;
  let initialized = false;

  const sub: Subscriber = {
    _sources: new Set(),
    _lastSeen: new Map(),
    _running: false,
    _isComputed: true,
    _node: node,
    _notify() {
      if (!dirty) {
        dirty = true;
        notifySubscribers(node);
      }
    },
  };
  node._sub = sub;

  function clearSources(): void {
    const wasLive = node._watcherCount > 0;
    // Snapshot then atomically clear `sub` bookkeeping so a throwing
    // [unwatched] hook (via adjustWatcherCount) doesn't leave the
    // subscriber half-detached from its sources.
    const sources = [...sub._sources];
    sub._sources.clear();
    sub._lastSeen.clear();
    for (const source of sources) {
      source._subscribers.delete(sub);
    }
    if (wasLive) {
      for (const source of sources) {
        adjustWatcherCount(source, -1);
      }
    }
  }

  function recompute(): T {
    if (initialized) {
      let stale = false;
      for (const source of sub._sources) {
        source._refresh?.();
        if (source._version !== sub._lastSeen.get(source)) {
          stale = true;
          break;
        }
      }
      if (!stale) {
        dirty = false;
        return node._value;
      }
    }

    clearSources();

    const prevSubscriber = activeSubscriber;
    activeSubscriber = sub;
    sub._running = true;
    let newValue: T;
    try {
      newValue = fn();
    } finally {
      sub._running = false;
      activeSubscriber = prevSubscriber;
    }

    for (const source of sub._sources) {
      sub._lastSeen.set(source, source._version);
    }

    const equal =
      initialized &&
      (node._equals
        ? node._equals(node._value, newValue)
        : Object.is(node._value, newValue));
    if (!equal) {
      node._value = newValue;
      node._version++;
    }

    initialized = true;
    dirty = false;
    return node._value;
  }

  node._refresh = (): void => {
    if (dirty) recompute();
  };

  const read = (): T => {
    assertNotFrozen("read");
    if (sub._running) {
      throw new Error(
        "[marjoram] Cycle detected: a computed signal cannot read itself during evaluation."
      );
    }
    if (dirty) recompute();
    trackDependency(node);
    return node._value;
  };

  read.get = read;
  read.peek = (): T => {
    if (dirty) recompute();
    return node._value;
  };
  read.dispose = (): void => {
    clearSources();
    for (const downstream of node._subscribers) {
      if (contributesWatch(downstream)) adjustWatcherCount(node, -1);
    }
    node._subscribers.clear();
    node._refresh = undefined;
    dirty = false;
  };

  // Register before the initial recompute so `Signal.subtle.currentComputed()`
  // resolves to this callable on the first evaluation.
  nodeRegistry.set(read as ReadonlySignal<T>, node);
  nodeToPublic.set(node, read as ReadonlySignal<T>);

  recompute();

  return read as ReadonlySignal<T>;
}

// ---------------------------------------------------------------------------
// effect() — side-effect that re-runs when dependencies change
//
// An effect is a live consumer: it always contributes +1 to each source's
// watcher count, so transitive [watched]/[unwatched] hooks fire correctly.
// ---------------------------------------------------------------------------

export function effect(fn: () => void | (() => void)): () => void {
  let cleanup: (() => void) | void;
  let scheduled = false;
  let disposed = false;

  const sub: Subscriber = {
    _sources: new Set(),
    _lastSeen: new Map(),
    _running: false,
    _isLiveConsumer: true,
    _notify() {
      if (!scheduled && !disposed) {
        scheduled = true;
        queueMicrotask(() => {
          scheduled = false;
          if (disposed) return;
          let stale = false;
          for (const source of sub._sources) {
            source._refresh?.();
            if (source._version !== sub._lastSeen.get(source)) {
              stale = true;
              break;
            }
          }
          if (stale) run();
        });
      }
    },
  };

  function clearSources(): void {
    // Snapshot then atomically clear `sub` bookkeeping — same rationale as
    // computed.clearSources: throwing hooks shouldn't leave a half-detached
    // subscriber.
    const sources = [...sub._sources];
    sub._sources.clear();
    sub._lastSeen.clear();
    for (const source of sources) {
      source._subscribers.delete(sub);
    }
    for (const source of sources) {
      adjustWatcherCount(source, -1);
    }
  }

  function run(): void {
    if (typeof cleanup === "function") cleanup();
    clearSources();

    const prevSubscriber = activeSubscriber;
    activeSubscriber = sub;
    sub._running = true;
    try {
      cleanup = fn();
    } finally {
      sub._running = false;
      activeSubscriber = prevSubscriber;
    }

    for (const source of sub._sources) {
      sub._lastSeen.set(source, source._version);
    }
  }

  run();

  return () => {
    if (disposed) return;
    disposed = true;
    if (typeof cleanup === "function") cleanup();
    clearSources();
  };
}

// ---------------------------------------------------------------------------
// batch() / untracked()
// ---------------------------------------------------------------------------

export function batch(fn: () => void): void {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) flushPending();
  }
}

export function untracked<T>(fn: () => T): T {
  const prev = activeSubscriber;
  activeSubscriber = null;
  try {
    return fn();
  } finally {
    activeSubscriber = prev;
  }
}

// ---------------------------------------------------------------------------
// watcher() — low-level synchronous observer in the `Signal.subtle.Watcher`
// shape. NOTE: notify auto-re-arms (fires on every qualifying change), unlike
// the spec's one-shot notify. For custom schedulers and framework authors;
// effect() is the ergonomic choice for everyday work (and is independent of
// this primitive).
// ---------------------------------------------------------------------------

export function watcher(notify: () => void): Watcher {
  const watched: Array<{
    pub: Signal<unknown> | ReadonlySignal<unknown>;
    node: SignalNode;
  }> = [];

  const sub: Subscriber = {
    _sources: new Set(),
    _lastSeen: new Map(),
    _running: false,
    _isLiveConsumer: true,
    _notify() {
      for (const source of sub._sources) source._refresh?.();
      let moved = false;
      for (const source of sub._sources) {
        if (source._version !== sub._lastSeen.get(source)) {
          moved = true;
          break;
        }
      }
      if (!moved) return;

      sub._running = true;
      try {
        runFrozenCallback(notify);
      } finally {
        sub._running = false;
      }
    },
  };

  function nodeOf(
    s: Signal<unknown> | ReadonlySignal<unknown>
  ): SignalNode | undefined {
    return nodeRegistry.get(s);
  }

  const w: Watcher = {
    watch(...signals): void {
      for (const s of signals) {
        const node = nodeOf(s);
        if (!node) {
          throw new Error(
            "[marjoram] watcher.watch() received a value that is not a signal or computed."
          );
        }
        if (sub._sources.has(node)) continue;
        node._subscribers.add(sub);
        sub._sources.add(node);
        node._refresh?.();
        sub._lastSeen.set(node, node._version);
        watched.push({ pub: s, node });
        adjustWatcherCount(node, 1);
      }
    },
    unwatch(...signals): void {
      for (const s of signals) {
        const node = nodeOf(s);
        if (!node || !sub._sources.has(node)) continue;
        node._subscribers.delete(sub);
        sub._sources.delete(node);
        sub._lastSeen.delete(node);
        const idx = watched.findIndex(x => x.node === node);
        if (idx >= 0) watched.splice(idx, 1);
        adjustWatcherCount(node, -1);
      }
    },
    getPending(): (Signal<unknown> | ReadonlySignal<unknown>)[] {
      const pending: (Signal<unknown> | ReadonlySignal<unknown>)[] = [];
      for (const { pub, node } of watched) {
        node._refresh?.();
        if (node._version !== sub._lastSeen.get(node)) {
          pending.push(pub);
        }
      }
      return pending;
    },
    dispose(): void {
      for (const source of sub._sources) {
        source._subscribers.delete(sub);
        adjustWatcherCount(source, -1);
      }
      sub._sources.clear();
      sub._lastSeen.clear();
      watched.length = 0;
    },
  };

  watcherRegistry.set(w, sub);
  subToWatcher.set(sub, w);
  return w;
}

// ---------------------------------------------------------------------------
// Signal.subtle — spec-shaped namespace for advanced introspection and the
// `[watched]`/`[unwatched]` lifecycle symbols.
//
// Mirrors `Signal.subtle.*` from the TC39 Signals proposal. The callable
// `signal()`/`computed()` forms remain the primary DX surface; this
// namespace exists for spec parity and interop with `signal-utils` and
// other code written against the proposal.
// ---------------------------------------------------------------------------

function currentComputed(): ReadonlySignal<unknown> | null {
  if (!activeSubscriber || !activeSubscriber._node) return null;
  const pub = nodeToPublic.get(activeSubscriber._node);
  return (pub as ReadonlySignal<unknown>) ?? null;
}

/**
 * Whether reads are currently being tracked — true inside any `computed`,
 * `effect`, or `watcher` evaluation. A small extension to the TC39 surface
 * that lets reactive containers (like `store()`) preserve "untracked reads
 * allocate nothing" without poking at private state.
 */
function isTracking(): boolean {
  return activeSubscriber !== null;
}

type Source = Signal<unknown> | ReadonlySignal<unknown>;
type Sink = ReadonlySignal<unknown> | Watcher;

function subOfTarget(
  target: ReadonlySignal<unknown> | Watcher
): Subscriber | undefined {
  const node = nodeRegistry.get(target as ReadonlySignal<unknown>);
  if (node && node._sub) return node._sub;
  return watcherRegistry.get(target as Watcher);
}

function introspectSources(target: ReadonlySignal<unknown> | Watcher): Source[] {
  const sub = subOfTarget(target);
  if (!sub) return [];
  const out: Source[] = [];
  for (const node of sub._sources) {
    const pub = nodeToPublic.get(node);
    if (pub) out.push(pub);
  }
  return out;
}

function introspectSinks(target: Signal<unknown> | ReadonlySignal<unknown>): Sink[] {
  const node = nodeRegistry.get(target);
  if (!node) return [];
  const out: Sink[] = [];
  for (const sub of node._subscribers) {
    if (sub._node) {
      const pub = nodeToPublic.get(sub._node);
      if (pub) out.push(pub as ReadonlySignal<unknown>);
    } else {
      const w = subToWatcher.get(sub);
      if (w) out.push(w);
    }
  }
  return out;
}

function hasSources(target: ReadonlySignal<unknown> | Watcher): boolean {
  const sub = subOfTarget(target);
  return !!sub && sub._sources.size > 0;
}

/**
 * Spec-shaped: true iff `introspectSinks(target).length > 0` — does any
 * Computed or Watcher observe this signal. Effect-only observation returns
 * false (effects are not first-class spec entities); use `hasObservers` to
 * include effects.
 */
function hasSinks(target: Signal<unknown> | ReadonlySignal<unknown>): boolean {
  const node = nodeRegistry.get(target);
  if (!node) return false;
  for (const sub of node._subscribers) {
    if (sub._node && nodeToPublic.has(sub._node)) return true;
    if (subToWatcher.has(sub)) return true;
  }
  return false;
}

/**
 * Marjoram extension: true if ANY observer (computed, watcher, OR effect)
 * is subscribed to this signal. Used by `store()` to decide whether to
 * reclaim a per-path slot in its `[unwatched]` hook.
 */
function hasObservers(
  target: Signal<unknown> | ReadonlySignal<unknown>
): boolean {
  const node = nodeRegistry.get(target);
  return !!node && node._subscribers.size > 0;
}

/**
 * Spec-shaped namespace, modeled on `Signal.subtle.*` from the TC39 Signals
 * proposal. Exposes lifecycle symbols and introspection helpers.
 *
 * - `Signal.subtle.watched` / `Signal.subtle.unwatched` — option keys passed
 *   to `signal()`/`computed()` to subscribe to live-watcher transitions.
 * - `Signal.subtle.untrack(fn)` — alias for `untracked()`.
 * - `Signal.subtle.currentComputed()` — the computed currently being
 *   evaluated, or `null` if not inside one.
 * - `Signal.subtle.introspectSources(target)` — sources of a computed or watcher.
 * - `Signal.subtle.introspectSinks(target)` — downstream subscribers of a signal/computed.
 * - `Signal.subtle.hasSources(target)` / `hasSinks(target)` — boolean shortcuts.
 */
export const Signal = {
  subtle: {
    watched: WATCHED,
    unwatched: UNWATCHED,
    untrack: untracked,
    currentComputed,
    introspectSources,
    introspectSinks,
    hasSources,
    hasSinks,
    hasObservers,
    isTracking,
  },
} as const;

// The internal escape hatches `_isTracking`/`_createNode`/`_track`/`_notify`
// that earlier versions exposed to store() have been removed: store() now
// builds on the public signal() primitive plus the `Signal.subtle` surface.
// If you need "am I in a reactive context?" use `Signal.subtle.isTracking()`.
