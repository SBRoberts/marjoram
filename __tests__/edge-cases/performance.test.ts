import { html, useViewModel } from "../../src";
import { getByTestId } from "@testing-library/dom";

const TEST_ID = "performance-test";

describe("Performance & Memory Edge Cases", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Rapid Updates", () => {
    test("should handle rapid successive updates", () => {
      const viewModel = useViewModel({ count: 0 });
      const view = html`<div data-testid="${TEST_ID}">
        ${viewModel.$count}
      </div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe("\n        0\n      ");

      // Rapid updates
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        viewModel.count = i;
      }
      const end = performance.now();

      // Should complete quickly (less than 100ms for 100 updates)
      expect(end - start).toBeLessThan(100);
      expect(element.textContent).toBe("\n        99\n      ");
    });

    test("should handle rapid updates to multiple properties", () => {
      const viewModel = useViewModel({
        count: 0,
        text: "initial",
        flag: false,
      });

      const view = html`
        <div data-testid="${TEST_ID}">
          ${viewModel.$count} - ${viewModel.$text} - ${viewModel.$flag}
        </div>
      `;
      document.body.append(view);

      // Update all properties rapidly
      for (let i = 0; i < 50; i++) {
        viewModel.count = i;
        viewModel.text = `text-${i}`;
        viewModel.flag = i % 2 === 0;
      }

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toContain("49");
      expect(element.textContent).toContain("text-49");
      expect(element.textContent).toContain("false");
    });
  });

  describe("Updates to Non-Rendered Properties", () => {
    test("should handle updates to properties not in template", () => {
      const viewModel = useViewModel({
        visible: "rendered",
        hidden: "not rendered",
      });

      const view = html`<div data-testid="${TEST_ID}">
        ${viewModel.$visible}
      </div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe("\n        rendered\n      ");

      // Update non-rendered property multiple times
      for (let i = 0; i < 100; i++) {
        viewModel.hidden = `hidden-${i}`;
      }

      // Should not affect rendered content
      expect(element.textContent).toBe("\n        rendered\n      ");
      expect(viewModel.hidden).toBe("hidden-99");
    });

    test("should handle adding new properties that are not rendered", () => {
      const viewModel = useViewModel({ name: "John" });
      const view = html`<div data-testid="${TEST_ID}">${viewModel.$name}</div>`;
      document.body.append(view);

      // Add new properties
      for (let i = 0; i < 50; i++) {
        (viewModel as Record<string, unknown>)[`newProp${i}`] = `value${i}`;
      }

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe("John");
      expect((viewModel as Record<string, unknown>).newProp49).toBe("value49");
    });
  });

  describe("Large Number of Observers", () => {
    test("should handle many views observing the same property", () => {
      const viewModel = useViewModel({ sharedValue: 0 });
      const views: DocumentFragment[] = [];

      // Create many views observing the same property
      for (let i = 0; i < 100; i++) {
        const view = html`<div data-testid="observer-${i}">
          ${viewModel.$sharedValue}
        </div>`;
        document.body.append(view);
        views.push(view);
      }

      // Update the shared property
      viewModel.sharedValue = 42;

      // All views should be updated
      for (let i = 0; i < 100; i++) {
        const element = getByTestId(document.body, `observer-${i}`);
        expect(element.textContent).toBe("\n          42\n        ");
      }
    });

    test("should handle cleanup when elements are removed", () => {
      const viewModel = useViewModel({ count: 0 });
      const views: DocumentFragment[] = [];

      // Create views
      for (let i = 0; i < 10; i++) {
        const view = html`<div data-testid="cleanup-${i}">
          ${viewModel.$count}
        </div>`;
        document.body.append(view);
        views.push(view);
      }

      // Remove half the views
      for (let i = 0; i < 5; i++) {
        const element = getByTestId(document.body, `cleanup-${i}`);
        element.remove();
      }

      // Update should still work for remaining views
      viewModel.count = 100;

      for (let i = 5; i < 10; i++) {
        const element = getByTestId(document.body, `cleanup-${i}`);
        expect(element.textContent).toBe("\n          100\n        ");
      }
    });
  });

  describe("Memory Stress Tests", () => {
    test("should handle creating and destroying many viewModels", () => {
      const viewModels: ReturnType<typeof useViewModel>[] = [];

      // Create many viewModels
      for (let i = 0; i < 100; i++) {
        const vm = useViewModel({
          id: i,
          data: `data-${i}`,
          nested: { value: i * 2 },
        });
        viewModels.push(vm);
      }

      // Use them
      viewModels.forEach((vm, i) => {
        expect(vm.id).toBe(i);
        expect(vm.data).toBe(`data-${i}`);
      });

      // Clear references (simulate cleanup)
      viewModels.length = 0;
    });

    test("should handle large nested object updates", () => {
      interface NestedData extends Record<string, unknown> {
        level1: {
          level2: {
            level3: {
              value: string;
            };
          };
        };
      }

      const viewModel = useViewModel<NestedData>({
        level1: {
          level2: {
            level3: {
              value: "initial",
            },
          },
        },
      });

      const view = html`<div data-testid="${TEST_ID}">
        ${viewModel.level1.level2.level3.value}
      </div>`;
      document.body.append(view);

      // Update nested value many times
      for (let i = 0; i < 100; i++) {
        viewModel.level1.level2.level3.value = `value-${i}`;
      }

      const element = getByTestId(document.body, TEST_ID);
      // Note: Deep nested updates don't trigger reactivity in current implementation
      expect(element.textContent).toBe("\n        initial\n      ");
    });
  });

  describe("Computed Property Performance", () => {
    test("should handle expensive computed properties", () => {
      const viewModel = useViewModel({ input: 10 });

      // Expensive computation
      const computed = viewModel.$input.compute((value: number) => {
        let result = 0;
        for (let i = 0; i < value * 1000; i++) {
          result += i;
        }
        return result;
      });

      const view = html`<div data-testid="${TEST_ID}">${computed}</div>`;
      document.body.append(view);

      const start = performance.now();
      viewModel.input = 5; // Should trigger recomputation
      const end = performance.now();

      // Should complete in reasonable time
      expect(end - start).toBeLessThan(50);
    });

    test("should handle multiple computed properties", () => {
      const viewModel = useViewModel({ base: 10 });

      const doubled = viewModel.$base.compute((x: number) => x * 2);
      const tripled = viewModel.$base.compute((x: number) => x * 3);
      const squared = viewModel.$base.compute((x: number) => x * x);

      const view = html`
        <div data-testid="${TEST_ID}">${doubled} | ${tripled} | ${squared}</div>
      `;
      document.body.append(view);

      viewModel.base = 5;

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toContain("10"); // doubled
      expect(element.textContent).toContain("15"); // tripled
      expect(element.textContent).toContain("25"); // squared
    });
  });
});
