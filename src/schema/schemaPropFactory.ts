import {
  Schema,
  SchemaPropValue,
  SchemaPropNotify,
  SchemaPropExpression,
} from "./types";
import {
  signal,
  computed as signalComputed,
  effect as signalEffect,
  isStore,
  type Signal,
} from "../reactivity";

export class SchemaProp {
  // Public
  key: string;
  id: string;

  // Private Fields
  #expression?: SchemaPropExpression;
  #observers: { (newValue: SchemaPropValue): void }[] = [];
  #pendingUpdate = false;
  #pendingValue?: SchemaPropValue;
  #signal: Signal;
  #schema: Schema;
  /** Disposers for computed→SchemaProp bridges created by store-aware compute(). */
  #computeBridgeDisposers: (() => void)[] = [];
  /** Disposers registered externally via addDisposer() — e.g. by repeat() when it sets up a store-array signal effect. Run in dispose() so the effect tears down when the owning SchemaProp / schema disposes. */
  #externalDisposers: (() => void)[] = [];

  constructor(schema: Schema, key: string, value: unknown) {
    this.key = key;
    this.#signal = signal(value);
    this.id = "_" + Math.random().toString(36).slice(2, 11);
    this.#schema = schema;
  }

  /**
   * Read/write the current value.
   * Reading participates in signal dependency tracking.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get value(): any {
    return this.#signal();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set value(v: any) {
    this.#signal.set(v);
  }

  /**
   * Read the value without creating a tracking subscription.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  peek(): any {
    return this.#signal.peek();
  }

  /**
   * Get the underlying signal for direct use in the reactivity system.
   */
  get _signal(): Signal {
    return this.#signal;
  }

  // Helper method to get array methods dynamically
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getArrayMethod<K extends keyof any[]>(methodName: K) {
    const val = this.#signal.peek();
    return Array.isArray(val) ? val[methodName].bind(val) : undefined;
  }

  // Dynamic array method getters that always operate on current value
  get map() {
    return this.getArrayMethod("map");
  }
  get filter() {
    return this.getArrayMethod("filter");
  }
  get forEach() {
    return this.getArrayMethod("forEach");
  }
  get find() {
    return this.getArrayMethod("find");
  }
  get reduce() {
    return this.getArrayMethod("reduce");
  }
  get includes() {
    return this.getArrayMethod("includes");
  }
  get indexOf() {
    return this.getArrayMethod("indexOf");
  }
  get slice() {
    return this.getArrayMethod("slice");
  }
  get concat() {
    return this.getArrayMethod("concat");
  }
  get join() {
    return this.getArrayMethod("join");
  }
  get some() {
    return this.getArrayMethod("some");
  }
  get every() {
    return this.getArrayMethod("every");
  }
  get findIndex() {
    return this.getArrayMethod("findIndex");
  }
  get length() {
    const val = this.#signal.peek();
    return Array.isArray(val) ? val.length : undefined;
  }

  /**
   * Updates the schema property's value and notifies observers.
   * Observer notifications are batched via the microtask queue to prevent layout thrashing.
   *
   * @param value - The new value to assign
   * @returns The SchemaProp instance for chaining
   */
  update(value: SchemaPropValue) {
    const newValue = this.#expression ? this.#expression(value) : value;

    // Write to the signal (triggers signal-graph propagation)
    this.#signal.set(newValue);

    // Batch observer notifications to prevent layout thrashing
    if (!this.#pendingUpdate) {
      this.#pendingUpdate = true;
      this.#pendingValue = newValue;

      queueMicrotask(() => {
        this.#pendingUpdate = false;
        const valueToNotify = this.#pendingValue as SchemaPropValue;
        this.#pendingValue = undefined;

        // Notify all observers with the latest value
        this.#observers &&
          this.#observers.forEach(notify => notify(valueToNotify));
      });
    } else {
      // If already pending, just update the pending value
      this.#pendingValue = newValue;
    }

    return this;
  }

  /**
   * Registers a callback that fires whenever this property's value changes.
   * Accepts either a function or a DOM Node (which will be auto-updated via text/attribute replacement).
   *
   * @param callback - A function receiving the new value, or a DOM Node to auto-update
   * @param context - Optional SchemaProp to bind as `this` for the callback
   */
  observe(callback: SchemaPropNotify | Node, context: SchemaProp = this): void {
    if (callback instanceof Node) {
      callback = this.nodeObserver(callback);
    }
    this.#observers.push(callback.bind(context));
  }

  /**
   * Creates a derived SchemaProp whose value is computed from this property's value.
   * The derived prop updates automatically whenever this property changes.
   *
   * @param expression - A transform function that receives the current value and returns a new value
   * @returns A new SchemaProp containing the computed result
   */
  compute(expression: SchemaPropExpression) {
    // Store-aware bridging: when `this.value` is a store, its inner mutations
    // don't fire the SchemaProp's observer chain — the store has its own
    // path-level subscription system. Wrap the expression in a real
    // `computed()` so it auto-tracks whatever store paths the expression
    // touches, then bridge the computed back to the derived SchemaProp.
    //
    // Critically: do NOT set `schemaProp.#expression` in this path. update()
    // would re-apply the expression to the already-computed value, breaking
    // the derivation. The expression is captured in the computed's closure.
    if (isStore(this.value)) {
      const computedSig = signalComputed(() =>
        expression(this.#signal.peek() as SchemaPropValue)
      );
      // signalComputed eagerly evaluates its fn once on creation to register
      // dependencies. .peek() returns that cached value without re-running.
      const initial = computedSig.peek() as SchemaPropValue;
      const schemaProp = this.#schema.defineProperty(initial);

      let initialized = false;
      const dispose = signalEffect(() => {
        const newValue = computedSig();
        if (initialized) {
          schemaProp.update(newValue as SchemaPropValue);
        }
        initialized = true;
      });
      this.#computeBridgeDisposers.push(() => {
        dispose();
        computedSig.dispose();
      });

      return schemaProp;
    }

    // Non-store path: the original observer-chained derivation.
    const schemaProp = this.#schema.defineProperty(expression(this.value));
    schemaProp.#expression = expression;
    this.observe(schemaProp.update, schemaProp);
    return schemaProp;
  }

  /**
   * Clears all observers, signal subscribers, and pending state, releasing memory.
   * Called automatically by `view.unmount()` and `vm.$destroy()`.
   */
  /**
   * Register a function to be called when this SchemaProp is disposed.
   * Used by higher-level helpers (e.g. `repeat()`) to tie an internal
   * signal effect's lifecycle to the SchemaProp / owning schema so the
   * effect tears down on `view.unmount()` or `vm.$destroy()`.
   */
  addDisposer(fn: () => void): void {
    this.#externalDisposers.push(fn);
  }

  dispose(): void {
    for (const d of this.#externalDisposers) d();
    this.#externalDisposers = [];
    for (const d of this.#computeBridgeDisposers) d();
    this.#computeBridgeDisposers = [];
    this.#observers = [];
    this.#pendingUpdate = false;
    this.#pendingValue = undefined;
    this.#signal.dispose();
  }

  private nodeObserver(node: Node | Attr) {
    let oldValue = this.#signal.peek() as SchemaPropValue;
    const parent = node.parentElement;
    return (newValue: SchemaPropValue): void => {
      if (node instanceof Attr) {
        node.value = node.value.replace(String(oldValue), String(newValue));
      } else if (Array.isArray(newValue)) {
        parent?.replaceChildren(...(newValue as (string | Node)[]));
      } else {
        node.textContent =
          node.textContent?.replace(String(oldValue), String(newValue)) ||
          String(newValue);
      }

      // Update oldValue AFTER the update for next time
      oldValue = newValue;
    };
  }
}
