import { SchemaProp } from "./schemaPropFactory";

export type SchemaPropValue =
  | string
  | number
  | boolean
  | Node
  | SchemaProp
  | SchemaPropValue[];
export type SchemaPropNotify = (newValue: SchemaPropValue) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaPropExpression = (value: any) => any;

// Array method types for schema properties
export type SchemaArrayMethods<T> = Pick<
  readonly T[],
  // Core transformation methods
  | "map"
  | "filter"
  | "forEach"
  | "find"
  | "reduce"
  // Search and test methods
  | "includes"
  | "indexOf"
  | "findIndex"
  | "some"
  | "every"
  // Utility methods
  | "slice"
  | "concat"
  | "join"
  | "length"
>;

// Intersection type combining SchemaProp with array methods for array values
export type SchemaArrayProp<T> = SchemaProp &
  SchemaArrayMethods<T> & {
    value: T[];
  };

// Path-binding type for stores: mirrors the store's data shape on top of
// SchemaProp so `vm.$user.address.city` is typed as the leaf TypedSchemaProp.
// Each level is a SchemaProp (so SchemaProp methods like .value/.compute work),
// intersected with a dictionary of typed child accesses for traversal.
//
// The runtime is implemented in src/useViewModel/storePathBinding.ts.
export type StorePathBinding<T> = SchemaProp & {
  [K in keyof T]-?: T[K] extends
    | Date
    | RegExp
    | Map<unknown, unknown>
    | Set<unknown>
    | Promise<unknown>
    | ((...args: unknown[]) => unknown)
    ? SchemaProp
    : T[K] extends readonly unknown[]
      ? SchemaArrayProp<T[K][number]>
      : T[K] extends object
        ? StorePathBinding<T[K]>
        : SchemaProp;
};

// Conditional type: arrays get array-prop, stores get path-binding, otherwise
// plain SchemaProp.
//
// Store detection: the Store<T> brand from src/reactivity/store.ts is a
// `unique symbol`, which is private to that module. We can't import the
// symbol itself, but `T extends Store<infer U>` works because Store<U> = U &
// { [BRAND]: true } — only matches values carrying that brand.
//
// Import-cycle note: schema → reactivity is already established by the
// signal import; this adds a type-only re-import which doesn't introduce a
// new dependency direction.
import type { Store } from "../reactivity";

export type TypedSchemaProp<T> =
  T extends Store<infer U>
    ? StorePathBinding<U>
    : T extends readonly unknown[]
      ? SchemaArrayProp<T[number]>
      : SchemaProp;

// Schema interface with typed property methods
interface SchemaMethods {
  defineProperty: <T extends SchemaPropValue>(
    value: T,
    key?: string
  ) => TypedSchemaProp<T>;
  getPropertyByKey: (key: string) => SchemaProp | undefined;
  getPropertyByValue: (value: SchemaPropValue) => SchemaProp | undefined;
  getPropertyById: (id: string) => SchemaProp | undefined;
  hasProperty: (key: string) => boolean;
  hasId: (id: string) => boolean;
  /** Disposes all schema props and clears the schema. Call when the owning view or widget is destroyed. */
  dispose: () => void;
}

export interface Schema extends SchemaMethods {
  ids: string[];
  props: SchemaProp[];
  keyMap: Map<string, SchemaProp>;
  idMap: Map<string, SchemaProp>;
}
