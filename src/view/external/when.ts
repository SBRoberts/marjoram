import { SchemaProp } from "../../schema";
import { SchemaPropValue } from "../../schema/types";

/**
 * Minimal structural interface for what `when()` needs from a SchemaProp.
 * Using a structural type (instead of the SchemaProp class) keeps `when()`
 * compatible with the Expand<TypedSchemaProp<T>> shape returned by ViewModel.
 */
interface ConditionProp {
  value: unknown;
  observe(callback: (newValue: SchemaPropValue) => void): void;
}

/**
 * Conditionally renders one of two nodes based on a boolean condition.
 * Accepts either a static boolean or a reactive SchemaProp / computed prop.
 *
 * @param condition - A boolean value or a reactive prop whose truthiness drives rendering
 * @param truthy - Factory called to produce the node shown when condition is truthy
 * @param falsy - Optional factory called when condition is falsy; renders nothing if omitted
 * @returns A Node (stable span wrapper with display:contents for reactive conditions)
 *
 * @example
 * ```typescript
 * const vm = useViewModel({ isLoggedIn: false });
 * const view = html`<div>${when(vm.$isLoggedIn, () => html`<p>Welcome!</p>`, () => html`<p>Please log in</p>`)}</div>`;
 * vm.isLoggedIn = true; // swaps to the truthy branch automatically
 * ```
 */
export const when = (
  condition: ConditionProp | boolean,
  truthy: () => Node,
  falsy?: () => Node
): Node => {
  const empty = (): Node => document.createTextNode("");

  const getNode = (value: unknown): Node =>
    Boolean(value) ? truthy() : (falsy?.() ?? empty());

  // Static condition — return the correct node directly, no reactive overhead
  if (typeof condition === "boolean") {
    return getNode(condition);
  }

  // Reactive condition — wrap in a stable span so we can swap children without
  // losing our place in the DOM. display:contents makes it layout-transparent.
  const container = document.createElement("span");
  container.style.display = "contents";
  container.appendChild(getNode(condition.value));

  condition.observe((newValue: SchemaPropValue) => {
    container.replaceChildren(getNode(newValue));
  });

  return container;
};
