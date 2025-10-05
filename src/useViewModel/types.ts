import { TypedSchemaProp } from "../schema";
// expands object types one level deep
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type Model = Record<string, unknown>;

/**
 * Reactive view model type with $ prefixed properties for template binding
 */
export type ViewModel<T extends Model> = T & {
  [K in keyof T as `$${string & K}`]: Expand<TypedSchemaProp<T[K]>>;
};
