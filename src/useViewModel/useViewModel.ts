import { SchemaProp, useSchema } from "../schema";
import { Schema, SchemaPropValue } from "../schema/types";
import {
  computed as signalComputed,
  effect as signalEffect,
  type ReadonlySignal,
} from "../reactivity";

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
 * Creates a reactive view model that automatically updates connected views when properties change.
 *
 * Backed by fine-grained signal-based dependency tracking: computed properties
 * automatically track which signals they read and only re-evaluate when those
 * specific signals change — no brute-force invalidation.
 *
 * @param model - The initial data object to make reactive
 * @returns A proxied object that tracks changes and updates views automatically
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
      delete model[key];
    }
  }

  // Create proxy reference for computed functions to access
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let proxyRef: any;

  // Signal-backed computed properties: each creates a ReadonlySignal that
  // auto-tracks which vm properties it reads, so it only re-runs when
  // those specific dependencies change.
  const computedSignals = new Map<string, ReadonlySignal>();

  // Effect disposers for computed→SchemaProp bridges
  const computedEffectDisposers: (() => void)[] = [];

  function getOrCreateComputedSignal(key: string): ReadonlySignal {
    let sig = computedSignals.get(key);
    if (!sig) {
      const computeFn = computedFunctions.get(key)!;
      sig = signalComputed(() => computeFn(proxyRef));
      computedSignals.set(key, sig);
    }
    return sig;
  }

  /**
   * Creates a signal effect that bridges a computed signal to its SchemaProp.
   * When the computed signal's dependencies change, the effect re-runs and
   * pushes the new value to the SchemaProp observers — no brute-force iteration.
   */
  function bridgeComputedToSchema(
    computedSig: ReadonlySignal,
    schemaProp: SchemaProp
  ): void {
    // Skip the initial effect run — the SchemaProp already has the correct value
    let initialized = false;
    const dispose = signalEffect(() => {
      const newValue = computedSig();
      if (initialized) {
        schemaProp.update(newValue as SchemaPropValue);
      }
      initialized = true;
    });
    computedEffectDisposers.push(dispose);
  }

  // Define proxy intercept methods
  const traps: ProxyHandler<TModel> = {
    get(model, key) {
      if (typeof key === "symbol") return undefined;

      // Lifecycle escape hatch — disposes all schema state owned by this view model
      if (key === "$destroy") {
        return () => {
          // Dispose computed→SchemaProp bridge effects
          for (const dispose of computedEffectDisposers) {
            dispose();
          }
          computedEffectDisposers.length = 0;
          // Dispose signal-backed computed properties
          for (const sig of computedSignals.values()) {
            sig.dispose();
          }
          computedSignals.clear();
          schema.dispose();
        };
      }

      // If the key is prefixed with a `$`, we are building the view and should always return the prop object, if possible
      const isConstructing = key[0] === "$";
      const actualKey = isConstructing ? key.replace("$", "") : key;

      // Check if this is a computed property
      if (computedFunctions.has(actualKey)) {
        const computedSig = getOrCreateComputedSignal(actualKey);

        // Get existing schema prop or create new one for this computed property
        let schemaProp = schema.getPropertyByKey(actualKey);

        if (!schemaProp) {
          // Read current computed value (this triggers signal tracking)
          const computedValue = computedSig.peek();
          schemaProp = schema.defineProperty(
            computedValue as SchemaPropValue,
            actualKey
          );

          // Bridge: when the computed signal changes, push to SchemaProp observers
          bridgeComputedToSchema(computedSig, schemaProp);
        } else {
          // Re-read from signal to get fresh value
          const newValue = computedSig.peek();
          // Update value directly so reads are current
          schemaProp.value = newValue;
        }

        if (isConstructing) return schemaProp;
        return schemaProp.value;
      }

      // If prop doesn't exist return undefined
      if (!(actualKey in model)) return undefined;

      const prop = Reflect.get(model, actualKey);
      const isSchemaProp = prop instanceof SchemaProp;

      // Our property exists in our model, but not necessarily our schema. Let's define it.
      // If the schema already has a prop for this key, reuse it to avoid
      // redundant SchemaProp creation on repeated nested object access.
      let schemaProp = schema.getPropertyByKey(actualKey);
      if (!schemaProp) {
        schemaProp = schema.defineProperty(prop as SchemaPropValue, actualKey);
        Reflect.set(model, actualKey, schemaProp);
      } else if (!isSchemaProp) {
        // Model entry drifted (e.g. replaced with proxy). Re-anchor it.
        Reflect.set(model, actualKey, schemaProp);
      }

      // To access a property in construction mode is to access the schema property. We are
      // certain the schemaProp exists in both our model and schema, so we can return it.
      if (isConstructing) return schemaProp;

      // The accessed property has been reassigned as a schema property.
      // The user is requesting the value, so we return it instead.
      // Always read through schemaProp.value so the signal getter is called,
      // enabling fine-grained dependency tracking in computed properties.
      if (isSchemaProp) {
        const value = Reflect.get(prop, "value");
        if (Array.isArray(value)) {
          return createArrayMutationProxy(value, prop as SchemaProp);
        }
        return value;
      }

      // First-time access: value was just wrapped in SchemaProp above.
      // Read through schemaProp.value so signal dependency tracking works.
      const currentValue = schemaProp.value;

      // If the value is an array, wrap it in a mutation proxy
      if (Array.isArray(currentValue)) {
        return createArrayMutationProxy(currentValue, schemaProp);
      }

      // If the prop is an object (not a node or array),
      // proxify and return it to make it responsive to changes
      if (
        typeof currentValue === "object" &&
        currentValue !== null &&
        !(currentValue instanceof Node)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proxified = new Proxy(currentValue, this as any);
        Reflect.set(model, actualKey, proxified);
        return proxified;
      }

      // The prop is neither an object, nor a schema property that the user trying to access.
      return currentValue;
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

      // Update the property value (this writes to the underlying signal,
      // which triggers fine-grained dependency tracking for computed properties).
      // Computed properties automatically re-evaluate via their signal effects —
      // no manual iteration needed.
      prop.update(value);

      return !!prop;
    },
  };

  const proxy = new Proxy<TModel>(model, traps);
  proxyRef = proxy; // Store reference for computed functions
  return proxy as ViewModel<TModel>;
};
