import {
  Schema,
  SchemaPropValue,
  SchemaPropNotify,
  SchemaPropExpression,
  SchemaPropObserve,
} from "./types";

export class SchemaProp {
  // Public
  key: string;
  value: any;
  id: string;

  // Private Fields
  #expression?: SchemaPropExpression;
  #observers: { (newValue: SchemaPropValue): void }[] = [];

  constructor(schema: Schema, key: string, value: any) {
    this.key = key;
    this.value = value;
    this.id = "_" + Math.random().toString(36).substr(2, 9);
    this.compute = this.compute.bind(this, schema);
  }
  /**
   * Given a new value:
   * 1. Update the schema property's value
   * 2. Notify each observing property of the updated value
   * @param value The new value to assign to the schema property
   */
  update(value: SchemaPropValue) {
    if (this.value !== value) {
      const newValue = this.#expression ? this.#expression(value) : value;
      this.#observers && this.#observers.forEach((notify) => notify(newValue));

      this.value = newValue;
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
  compute(schema: Schema, expression: SchemaPropExpression) {
    const schemaProp = schema.defineProperty(expression(this.value));
    schemaProp.#expression = expression;

    this.observe(schemaProp.update, schemaProp);

    return schemaProp;
  }

  private nodeObserver(node: Node | Attr) {
    let oldValue = this.value;
    const parent = node.parentElement;
    return (newValue: typeof this.value): void => {
      oldValue = this.value;

      if (node instanceof Attr) {
        node.value = node.value.replace(
          oldValue.toString(),
          newValue.toString()
        );
      } else if (Array.isArray(newValue)) {
        parent.replaceChildren(...newValue);
      } else {
        node.textContent = node.textContent.replace(
          oldValue.toString(),
          newValue.toString()
        );
      }
    };
  }
}
