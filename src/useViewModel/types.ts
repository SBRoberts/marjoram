import { TypedSchemaProp } from "../schema";
// expands object types one level deep
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type Model = object;

/**
 * Reactive view model type with $ prefixed properties for template binding
 */
export type ViewModel<T extends Model> = T & {
  [K in keyof T as `$${string & K}`]: Expand<TypedSchemaProp<T[K]>>;
} & {
  /** Disposes all reactive schema state owned by this view model. Call when the widget is destroyed. */
  $destroy: () => void;
};
