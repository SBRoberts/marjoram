import { html, useViewModel } from "../../src";
import { getByTestId } from "@testing-library/dom";

const TEST_ID = "error-test";

describe("Error Handling & Edge Cases", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Invalid Template Values", () => {
    test("should handle null values in template", () => {
      const view = html`<div data-testid="${TEST_ID}">${null}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element).toBeInTheDocument();
      expect(element.textContent).toBe("");
    });

    test("should handle undefined values in template", () => {
      const view = html`<div data-testid="${TEST_ID}">${undefined}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element).toBeInTheDocument();
      expect(element.textContent).toBe("");
    });

    test("should handle NaN values in template", () => {
      const view = html`<div data-testid="${TEST_ID}">${NaN}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element).toBeInTheDocument();
      expect(element.textContent).toBe("NaN");
    });

    test("should handle Infinity values in template", () => {
      const view = html`<div data-testid="${TEST_ID}">${Infinity}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element).toBeInTheDocument();
      expect(element.textContent).toBe("Infinity");
    });
  });

  describe("Circular References", () => {
    test("should handle circular object references", () => {
      const obj: any = { name: "test" };
      obj.self = obj;

      expect(() => {
        const viewModel = useViewModel(obj);
        const view = html`<div data-testid="${TEST_ID}">
          ${viewModel.name}
        </div>`;
        document.body.append(view);
      }).not.toThrow();
    });

    test("should handle deeply circular references", () => {
      const a: any = { name: "a" };
      const b: any = { name: "b", ref: a };
      a.ref = b;

      expect(() => {
        const viewModel = useViewModel({ data: a });
        const view = html`<div data-testid="${TEST_ID}">
          ${viewModel.data.name}
        </div>`;
        document.body.append(view);
      }).not.toThrow();
    });
  });

  describe("Malformed Ref Attributes", () => {
    test("should handle empty ref attributes", () => {
      const view = html`<div ref="" data-testid="${TEST_ID}">content</div>`;
      document.body.append(view);

      const collection = view.collect();
      // Empty ref attributes should be ignored for better safety
      expect(collection[""]).toBeUndefined();
    });

    test("should handle whitespace-only ref attributes", () => {
      const view = html`<div ref="   " data-testid="${TEST_ID}">content</div>`;
      document.body.append(view);

      const collection = view.collect();
      expect(collection["   "]).toBeInstanceOf(HTMLDivElement);
    });

    test("should handle special characters in ref names", () => {
      const specialRef = "ref-with-special!@#$%^&*()characters";
      const view = html`<div ref="${specialRef}" data-testid="${TEST_ID}">
        content
      </div>`;
      document.body.append(view);

      const collection = view.collect();
      expect(collection[specialRef]).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("Property Deletion", () => {
    test("should handle property deletion from viewModel", () => {
      const viewModel = useViewModel({ name: "test", age: 25 });
      const view = html`<div data-testid="${TEST_ID}">${viewModel.$name}</div>`;
      document.body.append(view);

      // Delete property
      delete (viewModel as any).name;

      // Should not crash when accessing deleted property
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const value = viewModel.name;
      }).not.toThrow();

      expect(viewModel.name).toBeUndefined();
    });

    test("should handle accessing non-existent properties", () => {
      const viewModel = useViewModel({ name: "test" });

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const nonExistent = (viewModel as any).nonExistentProperty;
      }).not.toThrow();

      expect((viewModel as any).nonExistentProperty).toBeUndefined();
    });
  });

  describe("Symbol Keys", () => {
    test("should handle symbol keys in viewModel", () => {
      const symbolKey = Symbol("test");
      const viewModel = useViewModel({ [symbolKey]: "value", name: "test" });

      expect(() => {
        const view = html`<div data-testid="${TEST_ID}">
          ${viewModel.name}
        </div>`;
        document.body.append(view);
      }).not.toThrow();
    });

    test("should return undefined for symbol property access", () => {
      const viewModel = useViewModel({ name: "test" });
      const symbolKey = Symbol("test");

      expect((viewModel as any)[symbolKey]).toBeUndefined();
    });
  });

  describe("Type Coercion Edge Cases", () => {
    test("should handle boolean values", () => {
      const viewModel = useViewModel({ isTrue: true, isFalse: false });
      const view = html`<div data-testid="${TEST_ID}">
        ${viewModel.$isTrue} ${viewModel.$isFalse}
      </div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe("\n        true false\n      ");
    });

    test("should handle BigInt values", () => {
      const bigIntValue = BigInt(123456789012345678901234567890n);
      const viewModel = useViewModel({ bigNum: bigIntValue });
      const view = html`<div data-testid="${TEST_ID}">
        ${viewModel.$bigNum}
      </div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe(
        "\n        " + bigIntValue.toString() + "\n      "
      );
    });

    test("should handle Date objects", () => {
      const date = new Date("2023-01-01");
      const viewModel = useViewModel({ date });
      const view = html`<div data-testid="${TEST_ID}">${viewModel.$date}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe(date.toString());
    });
  });

  describe("Function Properties", () => {
    test("should handle function properties in viewModel", () => {
      const viewModel = useViewModel({
        name: "test",
        getName: () => "function result",
      });

      expect(() => {
        const view = html`<div data-testid="${TEST_ID}">
          ${viewModel.name}
        </div>`;
        document.body.append(view);
      }).not.toThrow();

      expect(typeof viewModel.getName).toBe("function");
      expect(viewModel.getName()).toBe("function result");
    });
  });
});
