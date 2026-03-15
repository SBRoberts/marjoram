// ---------------------------------------------------------------------------
// Fine-grained reactive signal system with automatic dependency tracking.
//
// Three primitives:
//   signal(value)   — writable reactive value
//   computed(fn)    — read-only derived value, auto-tracks dependencies
//   effect(fn)      — side-effect that re-runs when dependencies change
//
// Dependency tracking uses a global stack: when a computed or effect reads
// a signal, the signal records that subscriber. On write, only the signals
// that were actually read are notified — no brute-force re-evaluation.
// ---------------------------------------------------------------------------

export interface Signal<T = unknown> {
  /** Read the current value (and track the caller as a subscriber). */
  (): T;
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
  /** Read without tracking. */
  peek(): T;
  /** Remove all subscribers and stop tracking dependencies. */
  dispose(): void;
}

// ---------------------------------------------------------------------------
// Subscriber tracking
// ---------------------------------------------------------------------------

interface Subscriber {
  /** Signals this subscriber depends on. */
  _sources: Set<SignalNode>;
  /** Called when a dependency changes. */
  _notify(): void;
  /** Whether this subscriber is currently computing/running. */
  _running: boolean;
}

interface SignalNode<T = unknown> {
  _value: T;
  _subscribers: Set<Subscriber>;
}

/** Stack of the currently evaluating subscriber (computed or effect). */
let activeSubscriber: Subscriber | null = null;

/** Batch depth counter. When > 0, notifications are deferred. */
let batchDepth = 0;
/** Set of subscribers that need notification when batch completes. */
const pendingNotifications = new Set<Subscriber>();

function flushPending(): void {
  const subscribers = [...pendingNotifications];
  pendingNotifications.clear();
  for (const sub of subscribers) {
    sub._notify();
  }
}

/**
 * Notify subscribers synchronously. Computed signals just mark themselves dirty
 * (a cheap boolean flip). DOM-level batching is handled by SchemaProp.update()
 * which uses queueMicrotask independently.
 */
function notifySubscribers(node: SignalNode): void {
  for (const sub of node._subscribers) {
    if (sub._running) continue; // prevent cycles
    if (batchDepth > 0) {
      pendingNotifications.add(sub);
    } else {
      sub._notify();
    }
  }
}

// ---------------------------------------------------------------------------
// signal() — writable reactive value
// ---------------------------------------------------------------------------

export function signal<T>(initialValue: T): Signal<T> {
  const node: SignalNode<T> = {
    _value: initialValue,
    _subscribers: new Set(),
  };

  // Read: track dependency
  const read = (): T => {
    if (activeSubscriber) {
      node._subscribers.add(activeSubscriber);
      activeSubscriber._sources.add(node);
    }
    return node._value;
  };

  read.set = (value: T): void => {
    if (Object.is(node._value, value)) return;
    node._value = value;
    notifySubscribers(node);
  };

  read.peek = (): T => node._value;

  read.dispose = (): void => {
    node._subscribers.clear();
  };

  return read as Signal<T>;
}

// ---------------------------------------------------------------------------
// computed() — derived reactive value with auto-tracking
// ---------------------------------------------------------------------------

export function computed<T>(fn: () => T): ReadonlySignal<T> {
  const node: SignalNode<T> = {
    _value: undefined as T,
    _subscribers: new Set(),
  };

  let dirty = true;

  const sub: Subscriber = {
    _sources: new Set(),
    _running: false,
    _notify() {
      if (!dirty) {
        dirty = true;
        // Propagate to downstream subscribers
        notifySubscribers(node);
      }
    },
  };

  function recompute(): T {
    // Unsubscribe from old sources
    for (const source of sub._sources) {
      source._subscribers.delete(sub);
    }
    sub._sources.clear();

    // Track new dependencies
    const prevSubscriber = activeSubscriber;
    activeSubscriber = sub;
    sub._running = true;
    try {
      node._value = fn();
    } finally {
      sub._running = false;
      activeSubscriber = prevSubscriber;
    }
    dirty = false;
    return node._value;
  }

  // Eager initial computation to register dependencies
  recompute();

  const read = (): T => {
    if (dirty) recompute();
    if (activeSubscriber) {
      node._subscribers.add(activeSubscriber);
      activeSubscriber._sources.add(node);
    }
    return node._value;
  };

  read.peek = (): T => {
    if (dirty) recompute();
    return node._value;
  };

  read.dispose = (): void => {
    for (const source of sub._sources) {
      source._subscribers.delete(sub);
    }
    sub._sources.clear();
    node._subscribers.clear();
    dirty = false;
  };

  return read as ReadonlySignal<T>;
}

// ---------------------------------------------------------------------------
// effect() — side-effect that re-runs when dependencies change
// ---------------------------------------------------------------------------

export function effect(fn: () => void | (() => void)): () => void {
  let cleanup: (() => void) | void;
  let scheduled = false;
  let disposed = false;

  const sub: Subscriber = {
    _sources: new Set(),
    _running: false,
    _notify() {
      // Defer re-execution to microtask to prevent synchronous recursion
      if (!scheduled && !disposed) {
        scheduled = true;
        queueMicrotask(() => {
          scheduled = false;
          if (!disposed) run();
        });
      }
    },
  };

  function run(): void {
    // Run cleanup from previous execution
    if (typeof cleanup === "function") cleanup();

    // Unsubscribe from old sources
    for (const source of sub._sources) {
      source._subscribers.delete(sub);
    }
    sub._sources.clear();

    // Track new dependencies
    const prevSubscriber = activeSubscriber;
    activeSubscriber = sub;
    sub._running = true;
    try {
      cleanup = fn();
    } finally {
      sub._running = false;
      activeSubscriber = prevSubscriber;
    }
  }

  // Run immediately to establish initial subscriptions
  run();

  // Return a dispose function
  return () => {
    disposed = true;
    if (typeof cleanup === "function") cleanup();
    for (const source of sub._sources) {
      source._subscribers.delete(sub);
    }
    sub._sources.clear();
  };
}

// ---------------------------------------------------------------------------
// batch() — defer notifications until callback completes
// ---------------------------------------------------------------------------

export function batch(fn: () => void): void {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      flushPending();
    }
  }
}

// ---------------------------------------------------------------------------
// untracked() — read signals without creating subscriptions
// ---------------------------------------------------------------------------

export function untracked<T>(fn: () => T): T {
  const prev = activeSubscriber;
  activeSubscriber = null;
  try {
    return fn();
  } finally {
    activeSubscriber = prev;
  }
}
