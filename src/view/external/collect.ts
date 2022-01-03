import { View } from "..";
import { useCollectFn, collectFn, elementCollection } from "../types";
/**
 * @description call the collect method to create an object containing all dom nodes with a 'ref' attribute
 * @returns An object containing keys with the 'ref' attribute name and values with the dom nodes themselves
 */
export const useCollect: useCollectFn = function (view: View): collectFn {
  const refElements = view.querySelectorAll(`[ref]`);
  return () => {
    if (view?.refs) return view.refs;
    const refs = Array.from(refElements).reduce(
      (elementCollection: elementCollection, node: HTMLElement) => {
        const ref = node.getAttribute("ref");
        elementCollection[ref] = node;
        return elementCollection;
      },
      {}
    );
    view.refs = refs;
    return refs;
  };
};
