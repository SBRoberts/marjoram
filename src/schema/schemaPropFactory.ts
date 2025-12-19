import {
  Schema,
  SchemaPropValue,
  SchemaPropNotify,
  SchemaPropExpression,
} from "./types";

export class SchemaProp {
  // Public
  key: string;
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  id: string;

  // Private Fields
  #expression?: SchemaPropExpression;
  #observers: { (newValue: SchemaPropValue): void }[] = [];
  #pendingUpdate = false;
  #pendingValue?: SchemaPropValue;

  constructor(schema: Schema, key: string, value: unknown) {
    this.key = key;
    this.value = value;
    this.id = "_" + Math.random().toString(36).slice(2, 11);
    // Store schema for use in compute method
    this.#schema = schema;
  }

  // Private field to store schema
  #schema: Schema;

  // Helper method to get array methods dynamically
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getArrayMethod<K extends keyof any[]>(methodName: K) {
    return Array.isArray(this.value)
      ? this.value[methodName].bind(this.value)
      : undefined;
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
    return Array.isArray(this.value) ? this.value.length : undefined;
  }
  /**
   * Given a new value:
   * 1. Update the schema property's value
   * 2. Notify each observing property of the updated value (batched via microtask queue)
   * @param value The new value to assign to the schema property
   */
  update(value: SchemaPropValue) {
    const newValue = this.#expression ? this.#expression(value) : value;
    
    // Update value synchronously so reads are always current
    this.value = newValue;
    
    // Batch observer notifications to prevent layout thrashing
    if (!this.#pendingUpdate) {
      this.#pendingUpdate = true;
      this.#pendingValue = newValue;
      
      queueMicrotask(() => {
        this.#pendingUpdate = false;
        const valueToNotify = this.#pendingValue as SchemaPropValue;
        this.#pendingValue = undefined;
        
        // Notify all observers with the latest value
        this.#observers && this.#observers.forEach(notify => notify(valueToNotify));
      });
    } else {
      // If already pending, just update the pending value
      this.#pendingValue = newValue;
    }

    return this;
  }

  /**
   * @param callback {Node | Function(property value)} Fire a callback every time a property in your model changes
   */
  observe(callback: SchemaPropNotify | Node, context: SchemaProp = this): void {
    if (callback instanceof Node) {
      callback = this.nodeObserver(callback);
    }
    this.#observers.push(callback.bind(context));
  }

  /**
   * Perform logic on your view model properties before rendering them.
   */
  compute(expression: SchemaPropExpression) {
    const schemaProp = this.#schema.defineProperty(expression(this.value));
    schemaProp.#expression = expression;

    this.observe(schemaProp.update, schemaProp);

    return schemaProp;
  }

  private nodeObserver(node: Node | Attr) {
    let oldValue = this.value;
    const parent = node.parentElement;
    return (newValue: typeof this.value): void => {
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
