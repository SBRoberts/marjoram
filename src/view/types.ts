import { Model, ViewModel } from "..";
import { SchemaProp } from "../schema";
export type elementCollection = Record<string, HTMLElement>;

export type collectFn = () => elementCollection;
export type useCollectFn = (view: DocumentFragment) => collectFn;

export interface View extends DocumentFragment {
  collect: collectFn;
  viewModel?: ViewModel<Model>;
  refs?: elementCollection;
}
