import { SchemaProp } from "../../schema";
import { SchemaPropValue } from "../../schema/types";

/**
 * Minimal structural interface for what `repeat()` needs from a SchemaProp.
 * Using a structural type keeps `repeat()` compatible with the
 * Expand<TypedSchemaProp<T>> shape returned by ViewModel.
 */
interface ItemsProp<T = unknown> {
  value: T[];
  observe(callback: (newValue: SchemaPropValue) => void): void;
}

interface KeyedEntry {
  key: unknown;
  nodes: Node[];
}

/**
 * Efficiently renders a keyed list with DOM reconciliation.
 * Reuses DOM nodes for items that persist across updates, only creating/removing
 * nodes for items that are actually added/removed. Maintains correct order via
 * minimal moves.
 *
 * @param items - A reactive SchemaProp containing the array, or a static array
 * @param keyFn - Extracts a unique key from each item (e.g. `item => item.id`)
 * @param templateFn - Produces a DOM node (typically via `html`) for each item
 * @returns A stable container Node that reconciles its children on updates
 *
 * @example
 * ```typescript
 * const vm = useViewModel({ todos: [{ id: 1, text: "Buy milk" }] });
 * const view = html`<ul>
 *   ${repeat(vm.$todos, t => t.id, t => html`<li>${t.text}</li>`)}
 * </ul>`;
 * ```
 */
export const repeat = <T>(
  items: ItemsProp<T> | T[],
  keyFn: (item: T, index: number) => unknown,
  templateFn: (item: T, index: number) => Node
): Node => {
  const container = document.createElement("span");
  container.style.display = "contents";

  // Resolve initial items
  const initialItems: T[] = Array.isArray(items) ? items : (items.value ?? []);

  // Current keyed entries in DOM order
  let entries: KeyedEntry[] = [];

  // Map from key → entry for O(1) lookup during reconciliation
  let keyMap = new Map<unknown, KeyedEntry>();

  /**
   * Extracts child nodes from a rendered template result.
   * DocumentFragments lose their children on append, so we snapshot them.
   */
  function renderItem(item: T, index: number): Node[] {
    const result = templateFn(item, index);
    if (result instanceof DocumentFragment) {
      const nodes = Array.from(result.childNodes);
      return nodes.length > 0 ? nodes : [document.createTextNode("")];
    }
    return [result];
  }

  /**
   * Performs keyed reconciliation: reuses DOM for matching keys,
   * removes orphaned entries, inserts new entries, reorders as needed.
   */
  function reconcile(newItems: T[]): void {
    const newEntries: KeyedEntry[] = [];
    const newKeyMap = new Map<unknown, KeyedEntry>();
    const newKeys = new Set<unknown>();

    // Build new entries, reusing existing DOM where keys match
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      const key = keyFn(item, i);
      newKeys.add(key);

      const existing = keyMap.get(key);
      if (existing) {
        // Reuse existing DOM nodes
        newEntries.push(existing);
        newKeyMap.set(key, existing);
      } else {
        // New item — render fresh DOM
        const nodes = renderItem(item, i);
        const entry: KeyedEntry = { key, nodes };
        newEntries.push(entry);
        newKeyMap.set(key, entry);
      }
    }

    // Remove orphaned entries (keys no longer present)
    for (const entry of entries) {
      if (!newKeys.has(entry.key)) {
        for (const node of entry.nodes) {
          node.parentNode?.removeChild(node);
        }
      }
    }

    // Reorder / insert: walk the new list and ensure DOM matches
    let refNode: Node | null = container.firstChild;

    for (const entry of newEntries) {
      const firstNode = entry.nodes[0];

      if (firstNode === refNode) {
        // Already in correct position — advance past this entry's nodes
        refNode = entry.nodes[entry.nodes.length - 1].nextSibling;
      } else {
        // Insert/move all nodes of this entry before refNode
        for (const node of entry.nodes) {
          container.insertBefore(node, refNode);
        }
      }
    }

    entries = newEntries;
    keyMap = newKeyMap;
  }

  // Initial render
  reconcile(initialItems);

  // Subscribe to reactive updates if items is a SchemaProp
  if (!Array.isArray(items)) {
    items.observe((newValue: SchemaPropValue) => {
      reconcile(Array.isArray(newValue) ? (newValue as T[]) : []);
    });
  }

  return container;
};
