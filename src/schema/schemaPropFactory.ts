import {
  Schema,
  SchemaPropValue,
  SchemaPropNotify,
  SchemaPropExpression,
} from "./types";
import { signal, type Signal } from "../reactivity";

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
    const schemaProp = this.#schema.defineProperty(expression(this.value));
    schemaProp.#expression = expression;

    this.observe(schemaProp.update, schemaProp);

    return schemaProp;
  }

  /**
   * Clears all observers, signal subscribers, and pending state, releasing memory.
   * Called automatically by `view.unmount()` and `vm.$destroy()`.
   */
  dispose(): void {
    this.#observers = [];
    this.#pendingUpdate = false;
    this.#pendingValue = undefined;
    this.#signal.dispose();
  }

  private nodeObserver(node: Node | Attr) {
    let oldValue = this.#signal.peek();
    const parent = node.parentElement;
    return (newValue: typeof oldValue): void => {
      if (node instanceof Attr) {
        node.value = node.value.replace(
          oldValue.toString(),
          newValue.toString()
        );
      } else if (Array.isArray(newValue)) {
        parent?.replaceChildren(...newValue);
      } else {
        node.textContent =
          node.textContent?.replace(oldValue.toString(), newValue.toString()) ||
          newValue.toString();
      }

      // Update oldValue AFTER the update for next time
      oldValue = newValue;
    };
  }
}
