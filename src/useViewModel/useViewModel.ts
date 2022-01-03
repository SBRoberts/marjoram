/* eslint-disable prefer-rest-params */
import { SchemaProp, useSchema } from "../schema";
import { Schema, SchemaPropValue } from "../schema/types";

import { View } from "../view";
import { ViewModel, Model } from "./types";
/**
 * @description A View Model is a collection of data that is used within your view. When you update this data,
 * your view will also update. If you are reusing properties within your view, it is important to prefix your properties with **`$`**.
 * Otherwise, you can get and set properties in your object like you would normally
 * * Ex: `<span style="color: ${data.$myColour}">${data.$myColour}</span>`
 * @param model the object whose data will populate the view. Updating this model will also update the view.
 */
export const useViewModel = function <TModel extends Model>(
  model: TModel
): ViewModel<TModel> {
  const schema: Schema = useSchema();
  model = { ...model };
  // Define proxy intercept methods
  const traps: ProxyHandler<TModel> = {
    get(model, key) {
      if (typeof key === "symbol") return;

      // If the key is prefixed with a `$`, we are building the view and should always return the prop object, if possible
      const isContructing = key[0] === "$";
      key = isContructing ? key.replace("$", "") : key;

      // If prop doesn't exist return undefined
      if (!(key in model)) return;

      const prop = Reflect.get(model, key);
      const isSchemaProp = SchemaProp.prototype.isPrototypeOf(prop);

      // Our property exists in our model, but not necesserily our schema. Let's define it
      const schemaProp = schema.defineProperty(prop, key);
      Reflect.set(model, key, schemaProp);

      // To access a property in construction mode is to access the schema property. We are
      // certain the schemaProp exists in both our model and schema, so we can return it.
      if (isContructing) return schemaProp;

      // The accessed property has been reassigned as a schema property.
      // The user is requesting the value, so we return it instead
      if (isSchemaProp) return Reflect.get(prop, "value");

      // If the prop is an object (not a node or array),
      // proxify and return it to make it responsive to changes
      if (
        typeof prop === "object" &&
        !Array.isArray(prop) &&
        !(prop instanceof Node)
      ) {
        const proxified = new Proxy(prop, this);
        Reflect.set(model, key, proxified);
        return proxified;
      }

      // The prop is neither an object, nor a schema property that the user trying to access.
      return prop;
    },
    set(model, key, value) {
      if (typeof key === "symbol") return false;

      const prop = schema.getPropertyByKey(key);

      // Return undefined if the prop isn't defined.
      if (!prop) return true;

      prop.update(value);

      return !!prop;
    },
  };

  const proxy = new Proxy<TModel>(model, traps);
  return proxy as ViewModel<TModel>;
};
