import { View } from "..";
import { useCollectFn, collectFn, elementCollection } from "../types";
/**
 * @description call the collect method to create an object containing all dom nodes with a 'ref' attribute
 * @returns An object containing keys with the 'ref' attribute name and values with the dom nodes themselves
 */
export const useCollect: useCollectFn = function (
  view: DocumentFragment
): collectFn {
  const refElements = view.querySelectorAll(`[ref]`);
  return () => {
    // Note: This cast is necessary as we're extending DocumentFragment at runtime
    const viewWithRefs = view as View;
    if (viewWithRefs?.refs) return viewWithRefs.refs;
    const refs = Array.from(refElements).reduce(
      (elementCollection: elementCollection, node: Element) => {
        const ref = node.getAttribute("ref");
        if (ref) {
          // Note: querySelectorAll returns Element, but we know these are HTMLElements
          elementCollection[ref] = node as HTMLElement;
        }
        return elementCollection;
      },
      {} satisfies elementCollection
    );
    viewWithRefs.refs = refs;
    return refs;
  };
};
