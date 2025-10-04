import { SchemaProp } from "../schema";
// expands object types one level deep
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type Model = Record<string, unknown>;

type PropType<T extends Model, P extends string> = {
  value: T[P];
  compute: (callback: (value: T[P]) => unknown) => SchemaProp; // eslint-disable-line @typescript-eslint/no-explicit-any
  observe: (callback: (newValue: T[P]) => void) => void;
};

/**
 * Reactive view model type with $ prefixed properties for template binding
 */
export type ViewModel<T extends Model> = T & {
  [K in keyof T as `$${string & K}`]: Expand<PropType<T, string & K>>;
};
