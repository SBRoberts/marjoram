import { SchemaProp } from "../schema";
// expands object types one level deep
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type Model = {
  [key: string]: any;
};

type PropType<T extends Model, P extends string> = {
  value: T[P];
  compute: (callback: (value: T[P]) => any) => SchemaProp;
  observe: (callback: (newValue: T[P]) => void) => void;
};

type ViewModelSchemaProps<TModel extends Model> = {
  [P in keyof TModel & string as `$${P}`]?: Expand<PropType<TModel, P>>;
};

export type ViewModel<TModel extends Model> = TModel &
  ViewModelSchemaProps<TModel>;
