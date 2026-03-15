import { getByTestId, getAllByTestId } from "@testing-library/dom";
import { html, useViewModel } from "../../src";

const TEST_ID = "mutation-test";

describe("Array Mutation Proxy", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  const flush = () =>
    new Promise<void>(resolve => queueMicrotask(() => resolve()));

  describe("push()", () => {
    it("should trigger a DOM update after push()", async () => {
      const vm = useViewModel({ items: ["a", "b"] });
      const listView = html`
        <ul>
          ${vm.$items.compute((items: string[]) =>
            items.map(item => html`<li data-testid="${TEST_ID}">${item}</li>`)
          )}
        </ul>
      `;
      document.body.append(listView);

      expect(getAllByTestId(document.body, TEST_ID)).toHaveLength(2);

      vm.items.push("c");
      await flush();

      expect(getAllByTestId(document.body, TEST_ID)).toHaveLength(3);
      expect(getAllByTestId(document.body, TEST_ID)[2]).toHaveTextContent("c");
    });

    it("should return the new array length (standard push return value)", () => {
      const vm = useViewModel({ items: ["a"] });
      const result = vm.items.push("b");
      expect(result).toBe(2);
    });
  });

  describe("pop()", () => {
    it("should trigger a DOM update after pop()", async () => {
      const vm = useViewModel({ items: ["a", "b", "c"] });
      const listView = html`
        <ul>
          ${vm.$items.compute((items: string[]) =>
            items.map(item => html`<li data-testid="${TEST_ID}">${item}</li>`)
          )}
        </ul>
      `;
      document.body.append(listView);

      expect(getAllByTestId(document.body, TEST_ID)).toHaveLength(3);

      vm.items.pop();
      await flush();

      expect(getAllByTestId(document.body, TEST_ID)).toHaveLength(2);
    });

    it("should return the removed element (standard pop return value)", () => {
      const vm = useViewModel({ items: ["a", "b"] });
      const removed = vm.items.pop();
      expect(removed).toBe("b");
    });
  });

  describe("splice()", () => {
    it("should trigger a DOM update after splice()", async () => {
      const vm = useViewModel({ items: ["a", "b", "c"] });
      const listView = html`
        <ul>
          ${vm.$items.compute((items: string[]) =>
            items.map(item => html`<li data-testid="${TEST_ID}">${item}</li>`)
          )}
        </ul>
      `;
      document.body.append(listView);

      vm.items.splice(1, 1, "x", "y");
      await flush();

      const rendered = getAllByTestId(document.body, TEST_ID);
      expect(rendered).toHaveLength(4);
      expect(rendered[1]).toHaveTextContent("x");
      expect(rendered[2]).toHaveTextContent("y");
    });
  });

  describe("sort() and reverse()", () => {
    it("should trigger a DOM update after sort()", async () => {
      const vm = useViewModel({ items: ["banana", "apple", "cherry"] });
      const listView = html`
        <ul>
          ${vm.$items.compute((items: string[]) =>
            items.map(item => html`<li data-testid="${TEST_ID}">${item}</li>`)
          )}
        </ul>
      `;
      document.body.append(listView);

      vm.items.sort();
      await flush();

      const rendered = getAllByTestId(document.body, TEST_ID);
      expect(rendered[0]).toHaveTextContent("apple");
      expect(rendered[1]).toHaveTextContent("banana");
    });

    it("should trigger a DOM update after reverse()", async () => {
      const vm = useViewModel({ items: ["a", "b", "c"] });
      const listView = html`
        <ul>
          ${vm.$items.compute((items: string[]) =>
            items.map(item => html`<li data-testid="${TEST_ID}">${item}</li>`)
          )}
        </ul>
      `;
      document.body.append(listView);

      vm.items.reverse();
      await flush();

      const rendered = getAllByTestId(document.body, TEST_ID);
      expect(rendered[0]).toHaveTextContent("c");
      expect(rendered[2]).toHaveTextContent("a");
    });
  });

  describe("Non-mutating methods still work (no spurious updates)", () => {
    it("map() should return results without triggering an update", async () => {
      const vm = useViewModel({ items: [1, 2, 3] });
      const mapped = vm.items.map((n: number) => n * 2);
      expect(mapped).toEqual([2, 4, 6]);
      // items should still be [1, 2, 3], not mutated
      expect(vm.items).toEqual([1, 2, 3]);
    });

    it("filter() should not mutate the underlying array", () => {
      const vm = useViewModel({ items: [1, 2, 3, 4] });
      const result = vm.items.filter((n: number) => n > 2);
      expect(result).toEqual([3, 4]);
      expect(vm.items).toHaveLength(4);
    });
  });

  describe("Multiple consecutive mutations", () => {
    it("should batch multiple pushes into a final DOM update", async () => {
      const vm = useViewModel({ items: [] as string[] });
      const listView = html`
        <ul>
          ${vm.$items.compute((items: string[]) =>
            items.map(item => html`<li data-testid="${TEST_ID}">${item}</li>`)
          )}
        </ul>
      `;
      document.body.append(listView);

      vm.items.push("a");
      vm.items.push("b");
      vm.items.push("c");
      await flush();

      expect(getAllByTestId(document.body, TEST_ID)).toHaveLength(3);
    });
  });
});
