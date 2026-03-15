import { getByTestId } from "@testing-library/dom";
import { html, useViewModel, repeat } from "../../src";

const TEST_ID = "repeat-test";

describe("repeat() keyed list reconciliation", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  const flush = () =>
    new Promise<void>(resolve => queueMicrotask(() => resolve()));

  describe("Static arrays", () => {
    it("should render a static list of items", () => {
      const items = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];
      const view = html`<ul data-testid="${TEST_ID}">
        ${repeat(
          items,
          i => i.id,
          i => html`<li>${i.name}</li>`
        )}
      </ul>`;
      document.body.append(view);
      const el = getByTestId(document.body, TEST_ID);
      expect(el.querySelectorAll("li").length).toBe(2);
      expect(el.textContent).toContain("Alice");
      expect(el.textContent).toContain("Bob");
    });

    it("should render an empty list", () => {
      const view = html`<ul data-testid="${TEST_ID}">
        ${repeat(
          [] as { id: number }[],
          i => i.id,
          i => html`<li>${i.id}</li>`
        )}
      </ul>`;
      document.body.append(view);
      const el = getByTestId(document.body, TEST_ID);
      expect(el.querySelectorAll("li").length).toBe(0);
    });
  });

  describe("Reactive arrays", () => {
    it("should render the initial reactive list", () => {
      const vm = useViewModel({
        items: [
          { id: 1, text: "First" },
          { id: 2, text: "Second" },
        ],
      });
      const view = html`<ul data-testid="${TEST_ID}">
        ${repeat(
          vm.$items,
          i => i.id,
          i => html`<li>${i.text}</li>`
        )}
      </ul>`;
      document.body.append(view);
      const el = getByTestId(document.body, TEST_ID);
      expect(el.querySelectorAll("li").length).toBe(2);
      expect(el.textContent).toContain("First");
      expect(el.textContent).toContain("Second");
    });

    it("should add new items to the DOM", async () => {
      const vm = useViewModel({
        items: [{ id: 1, text: "First" }],
      });
      const view = html`<ul data-testid="${TEST_ID}">
        ${repeat(
          vm.$items,
          i => i.id,
          i => html`<li>${i.text}</li>`
        )}
      </ul>`;
      document.body.append(view);

      vm.items = [
        { id: 1, text: "First" },
        { id: 2, text: "Second" },
      ];
      await flush();

      const el = getByTestId(document.body, TEST_ID);
      expect(el.querySelectorAll("li").length).toBe(2);
      expect(el.textContent).toContain("Second");
    });

    it("should remove items from the DOM", async () => {
      const vm = useViewModel({
        items: [
          { id: 1, text: "First" },
          { id: 2, text: "Second" },
          { id: 3, text: "Third" },
        ],
      });
      const view = html`<ul data-testid="${TEST_ID}">
        ${repeat(
          vm.$items,
          i => i.id,
          i => html`<li>${i.text}</li>`
        )}
      </ul>`;
      document.body.append(view);

      vm.items = [
        { id: 1, text: "First" },
        { id: 3, text: "Third" },
      ];
      await flush();

      const el = getByTestId(document.body, TEST_ID);
      expect(el.querySelectorAll("li").length).toBe(2);
      expect(el.textContent).not.toContain("Second");
      expect(el.textContent).toContain("First");
      expect(el.textContent).toContain("Third");
    });

    it("should reorder items via key matching", async () => {
      const vm = useViewModel({
        items: [
          { id: 1, text: "A" },
          { id: 2, text: "B" },
          { id: 3, text: "C" },
        ],
      });
      const view = html`<ul data-testid="${TEST_ID}">
        ${repeat(
          vm.$items,
          i => i.id,
          i => html`<li>${i.text}</li>`
        )}
      </ul>`;
      document.body.append(view);

      const el = getByTestId(document.body, TEST_ID);
      const originalLis = Array.from(el.querySelectorAll("li"));

      // Reverse order
      vm.items = [
        { id: 3, text: "C" },
        { id: 2, text: "B" },
        { id: 1, text: "A" },
      ];
      await flush();

      const newLis = Array.from(el.querySelectorAll("li"));
      expect(newLis.length).toBe(3);
      expect(newLis[0].textContent).toBe("C");
      expect(newLis[1].textContent).toBe("B");
      expect(newLis[2].textContent).toBe("A");

      // DOM nodes are reused (same references) — just reordered
      expect(newLis[0]).toBe(originalLis[2]);
      expect(newLis[1]).toBe(originalLis[1]);
      expect(newLis[2]).toBe(originalLis[0]);
    });

    it("should reuse DOM nodes for persisting keys", async () => {
      const vm = useViewModel({
        items: [
          { id: 1, text: "Keep" },
          { id: 2, text: "Remove" },
          { id: 3, text: "Keep too" },
        ],
      });
      const view = html`<ul data-testid="${TEST_ID}">
        ${repeat(
          vm.$items,
          i => i.id,
          i => html`<li>${i.text}</li>`
        )}
      </ul>`;
      document.body.append(view);

      const el = getByTestId(document.body, TEST_ID);
      const orig1 = el.querySelectorAll("li")[0];
      const orig3 = el.querySelectorAll("li")[2];

      // Remove middle item, keep first and last
      vm.items = [
        { id: 1, text: "Keep" },
        { id: 3, text: "Keep too" },
      ];
      await flush();

      const newLis = el.querySelectorAll("li");
      expect(newLis.length).toBe(2);
      // Same DOM nodes reused
      expect(newLis[0]).toBe(orig1);
      expect(newLis[1]).toBe(orig3);
    });

    it("should handle complete list replacement", async () => {
      const vm = useViewModel({
        items: [
          { id: 1, text: "Old A" },
          { id: 2, text: "Old B" },
        ],
      });
      const view = html`<ul data-testid="${TEST_ID}">
        ${repeat(
          vm.$items,
          i => i.id,
          i => html`<li>${i.text}</li>`
        )}
      </ul>`;
      document.body.append(view);

      // All-new keys
      vm.items = [
        { id: 10, text: "New X" },
        { id: 20, text: "New Y" },
        { id: 30, text: "New Z" },
      ];
      await flush();

      const el = getByTestId(document.body, TEST_ID);
      expect(el.querySelectorAll("li").length).toBe(3);
      expect(el.textContent).toContain("New X");
      expect(el.textContent).toContain("New Y");
      expect(el.textContent).toContain("New Z");
    });

    it("should handle clearing the list", async () => {
      const vm = useViewModel({
        items: [
          { id: 1, text: "A" },
          { id: 2, text: "B" },
        ],
      });
      const view = html`<ul data-testid="${TEST_ID}">
        ${repeat(
          vm.$items,
          i => i.id,
          i => html`<li>${i.text}</li>`
        )}
      </ul>`;
      document.body.append(view);

      vm.items = [];
      await flush();

      const el = getByTestId(document.body, TEST_ID);
      expect(el.querySelectorAll("li").length).toBe(0);
    });

    it("should handle array mutation methods (push)", async () => {
      const vm = useViewModel({
        items: [{ id: 1, text: "First" }],
      });
      const view = html`<ul data-testid="${TEST_ID}">
        ${repeat(
          vm.$items,
          i => i.id,
          i => html`<li>${i.text}</li>`
        )}
      </ul>`;
      document.body.append(view);

      vm.items.push({ id: 2, text: "Pushed" });
      await flush();

      const el = getByTestId(document.body, TEST_ID);
      expect(el.querySelectorAll("li").length).toBe(2);
      expect(el.textContent).toContain("Pushed");
    });

    it("should preserve insertion order with interleaved add/remove", async () => {
      const vm = useViewModel({
        items: [
          { id: 1, text: "A" },
          { id: 2, text: "B" },
          { id: 3, text: "C" },
        ],
      });
      const view = html`<ul data-testid="${TEST_ID}">
        ${repeat(
          vm.$items,
          i => i.id,
          i => html`<li>${i.text}</li>`
        )}
      </ul>`;
      document.body.append(view);

      // Remove B, add D between A and C
      vm.items = [
        { id: 1, text: "A" },
        { id: 4, text: "D" },
        { id: 3, text: "C" },
      ];
      await flush();

      const el = getByTestId(document.body, TEST_ID);
      const lis = el.querySelectorAll("li");
      expect(lis.length).toBe(3);
      expect(lis[0].textContent).toBe("A");
      expect(lis[1].textContent).toBe("D");
      expect(lis[2].textContent).toBe("C");
    });
  });

  describe("Index parameter", () => {
    it("should pass the index to keyFn and templateFn", () => {
      const items = ["x", "y", "z"];
      const capturedIndices: number[] = [];

      const view = html`<div data-testid="${TEST_ID}">
        ${repeat(
          items,
          (_item, i) => i,
          (item, i) => {
            capturedIndices.push(i);
            return html`<span>${item}</span>`;
          }
        )}
      </div>`;
      document.body.append(view);

      expect(capturedIndices).toEqual([0, 1, 2]);
    });
  });
});
