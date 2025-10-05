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
export type SchemaPropExpression = (value: any) => SchemaPropValue;

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

// Conditional type that provides array methods for array values, plain SchemaProp otherwise
export type TypedSchemaProp<T> = T extends readonly unknown[]
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
}

export interface Schema extends SchemaMethods {
  ids: string[];
  props: SchemaProp[];
}
