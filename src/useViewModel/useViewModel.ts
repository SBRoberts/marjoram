import { SchemaProp, useSchema } from "../schema";
import { Schema } from "../schema/types";

import { ViewModel, Model } from "./types";

/**
 * Creates a reactive view model that automatically updates connected views when properties change
 * @param model - The initial data object to make reactive
 * @returns A proxied object that tracks changes and updates views automatically
 *
 * @example
 * ```typescript
 * const viewModel = useViewModel({ name: 'John', age: 30 });
 * const view = html`<div>Hello ${viewModel.$name}, you are ${viewModel.$age}</div>`;
 *
 * // This will automatically update the view
 * viewModel.name = 'Jane';
 * ```
 */
export const useViewModel = function <TModel extends Model>(
  model: TModel
): ViewModel<TModel> {
  const schema: Schema = useSchema();
  model = { ...model };

  // Define proxy intercept methods
  const traps: ProxyHandler<TModel> = {
    get(model, key) {
      if (typeof key === "symbol") return undefined;

      // If the key is prefixed with a `$`, we are building the view and should always return the prop object, if possible
      const isConstructing = key[0] === "$";
      key = isConstructing ? key.replace("$", "") : key;

      // If prop doesn't exist return undefined
      if (!(key in model)) return undefined;

      const prop = Reflect.get(model, key);
      const isSchemaProp = SchemaProp.prototype.isPrototypeOf(prop);

      // Our property exists in our model, but not necessarily our schema. Let's define it
      const schemaProp = schema.defineProperty(prop, key);
      Reflect.set(model, key, schemaProp);

      // To access a property in construction mode is to access the schema property. We are
      // certain the schemaProp exists in both our model and schema, so we can return it.
      if (isConstructing) return schemaProp;

      // The accessed property has been reassigned as a schema property.
      // The user is requesting the value, so we return it instead
      if (isSchemaProp) return Reflect.get(prop, "value");

      // If the prop is an object (not a node or array),
      // proxify and return it to make it responsive to changes
      if (
        typeof prop === "object" &&
        prop !== null &&
        !Array.isArray(prop) &&
        !((prop as unknown) instanceof Node)
      ) {
        const proxified = new Proxy(prop, this);
        Reflect.set(model, key, proxified);
        return proxified;
      }

      // The prop is neither an object, nor a schema property that the user trying to access.
      return prop;
    },
    set(_model, key, value) {
      if (typeof key === "symbol") return false;

      const prop = schema.getPropertyByKey(key);

      // Return true if the prop isn't defined (allow new properties)
      if (!prop) return true;

      prop.update(value);

      return !!prop;
    },
  };

  const proxy = new Proxy<TModel>(model, traps);
  return proxy as ViewModel<TModel>;
};
