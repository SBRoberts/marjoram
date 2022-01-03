import { SchemaProp } from "./schemaPropFactory";

export type SchemaPropValue =
  | string
  | number
  | boolean
  | Node
  | SchemaProp
  | SchemaPropValue[];
type SchemaPropUpdate = (newValue: SchemaPropValue) => void;
type SchemaPropCalc = (expression: () => string | number) => SchemaProp;
export type SchemaPropNotify = (newValue: SchemaPropValue) => void;
export type SchemaPropExpression = (value: SchemaPropValue) => SchemaPropValue;
export type SchemaPropObserve = (
  callback: SchemaPropNotify,
  context: ThisParameterType<SchemaProp>
) => void;

interface SchemaMethods {
  defineProperty: (
    this: Schema,
    value: SchemaPropValue,
    key?: string
  ) => SchemaProp;
  getPropertyByKey: (this: Schema, key: string) => SchemaProp | undefined;
  getPropertyByValue: (
    this: Schema,
    value: SchemaPropValue
  ) => SchemaProp | undefined;
  getPropertyById: (this: Schema, id: string) => SchemaProp | undefined;
  hasProperty: (this: Schema, key: string) => boolean;
  hasId: (this: Schema, id: string) => boolean;
}
export interface Schema extends SchemaMethods {
  ids: string[];
  props: SchemaProp[];
}
