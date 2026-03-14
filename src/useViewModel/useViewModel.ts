import { SchemaProp, useSchema } from "../schema";
import { Schema, SchemaPropValue } from "../schema/types";

import { ViewModel, Model } from "./types";

const MUTATING_ARRAY_METHODS = new Set([
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
  "fill",
  "copyWithin",
]);

// Returns a proxy around an array that triggers a schemaProp update after any mutation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createArrayMutationProxy = (arr: any[], schemaProp: SchemaProp): any[] =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new Proxy(arr, {
    get(target, key) {
      if (typeof key === "string" && MUTATING_ARRAY_METHODS.has(key)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (...args: any[]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = (target as any)[key](...args);
          // Notify observers with a shallow copy so reference identity changes
          schemaProp.update([...target] as unknown as SchemaPropValue);
          return result;
        };
      }
      const val = Reflect.get(target, key);
      return typeof val === "function" ? val.bind(target) : val;
    },
  });

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

  // Identify computed properties (functions in the model)
  const computedFunctions = new Map<string, Function>();
  for (const key in model) {
    const value = model[key];
    if (typeof value === "function") {
      computedFunctions.set(key, value);
      // Remove function from model, we'll compute it on-demand
      delete model[key];
    }
  }

  // Create proxy reference for computed functions to access
  let proxyRef: any;
  let isUpdatingComputed = false; // Flag to prevent infinite loops

  // Define proxy intercept methods
  const traps: ProxyHandler<TModel> = {
    get(model, key) {
      if (typeof key === "symbol") return undefined;

      // If the key is prefixed with a `$`, we are building the view and should always return the prop object, if possible
      const isConstructing = key[0] === "$";
      const actualKey = isConstructing ? key.replace("$", "") : key;

      // Check if this is a computed property
      if (computedFunctions.has(actualKey)) {
        const computeFn = computedFunctions.get(actualKey)!;

        // Get existing schema prop or create new one for this computed property
        let schemaProp = schema.getPropertyByKey(actualKey);

        if (!schemaProp) {
          // Compute initial value
          const computedValue = computeFn(proxyRef);
          schemaProp = schema.defineProperty(
            computedValue as SchemaPropValue,
            actualKey
          );

          // Store the compute function on the schema prop for re-evaluation
          (schemaProp as any).__computeFn = computeFn;
          (schemaProp as any).__proxyRef = proxyRef;
        } else {
          // Re-compute the value on every read to ensure it's always fresh
          const newValue = computeFn(proxyRef);
          // Directly update the value without triggering observers
          // (observers will be notified via the batched update in set trap)
          schemaProp.value = newValue;
        }

        // If constructing ($key), return the schema prop
        if (isConstructing) return schemaProp;

        // Otherwise return the computed value
        return schemaProp.value;
      }

      // If prop doesn't exist return undefined
      if (!(actualKey in model)) return undefined;

      const prop = Reflect.get(model, actualKey);
      const isSchemaProp = prop instanceof SchemaProp;

      // Our property exists in our model, but not necessarily our schema. Let's define it
      const schemaProp = schema.defineProperty(
        prop as SchemaPropValue,
        actualKey
      );
      Reflect.set(model, actualKey, schemaProp);

      // To access a property in construction mode is to access the schema property. We are
      // certain the schemaProp exists in both our model and schema, so we can return it.
      if (isConstructing) return schemaProp;

      // The accessed property has been reassigned as a schema property.
      // The user is requesting the value, so we return it instead
      if (isSchemaProp) {
        const value = Reflect.get(prop, "value");
        if (Array.isArray(value)) {
          return createArrayMutationProxy(value, prop as SchemaProp);
        }
        return value;
      }

      // If the value is an array (first-time access, before the model stores a SchemaProp),
      // wrap it in a mutation proxy so push/pop/etc. trigger reactive updates
      if (Array.isArray(prop)) {
        return createArrayMutationProxy(prop, schemaProp);
      }

      // If the prop is an object (not a node or array),
      // proxify and return it to make it responsive to changes
      if (
        typeof prop === "object" &&
        prop !== null &&
        !(prop instanceof Node)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proxified = new Proxy(prop, this as any);
        Reflect.set(model, actualKey, proxified);
        return proxified;
      }

      // The prop is neither an object, nor a schema property that the user trying to access.
      return prop;
    },
    set(_model, key, value) {
      if (typeof key === "symbol") return false;

      // Prevent setting computed properties
      if (computedFunctions.has(key)) {
        throw new Error(
          `Cannot set computed property "${key}". Computed properties are read-only.`
        );
      }

      const prop = schema.getPropertyByKey(key);

      // If prop isn't defined, set it directly on the model (allow new properties)
      if (!prop) {
        Reflect.set(_model, key, value);
        return true;
      }

      // Update the property value (this will batch DOM updates to microtask)
      prop.update(value);

      // Only re-evaluate computed properties if we're not already in a computed update
      if (!isUpdatingComputed) {
        // Use the SAME microtask as the property update to keep things in sync
        // We queue after the property update so computed values reflect the new state
        const originalUpdate = (prop as any).update;
        if (originalUpdate) {
          queueMicrotask(() => {
            isUpdatingComputed = true;
            try {
              // Re-evaluate all computed properties that might depend on this change
              computedFunctions.forEach((computeFn, computedKey) => {
                const computedProp = schema.getPropertyByKey(computedKey);
                if (computedProp) {
                  try {
                    const newValue = computeFn(proxyRef);
                    computedProp.update(newValue);
                  } catch (error) {
                    // Silently ignore errors in computed properties during update
                    // This handles cases where dependencies aren't fully ready
                  }
                }
              });
            } finally {
              isUpdatingComputed = false;
            }
          });
        }
      }

      return !!prop;
    },
  };

  const proxy = new Proxy<TModel>(model, traps);
  proxyRef = proxy; // Store reference for computed functions
  return proxy as ViewModel<TModel>;
};
