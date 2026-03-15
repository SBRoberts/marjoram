import { getAllByTestId, getByTestId, getByText } from "@testing-library/dom";

import { html, useViewModel, ViewModel } from "../../src";

import {
  testViewModelChange,
  testViewModelCompute,
  TEST_ID,
} from "../viewModel.utils";

describe("View Model Tests", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Primitive Values", () => {
    it("should render and update string values", async () => {
      await testViewModelChange("Hello, world!", "This is new text");
    });

    it("should render and update number values", async () => {
      await testViewModelChange(9, 99);
    });

    it("should compute string values", async () => {
      await testViewModelCompute(
        "Hello, world!",
        "This is new text",
        text => `${text} but computed`
      );
    });

    it("should compute number values", async () => {
      await testViewModelCompute(9, 99, number => number * 3);
    });
  });

  describe("Object Values", () => {
    it("should compute nested object properties", () => {
      const inputObj = { one: { two: "two", three: "three" } };
      const viewModel = useViewModel(inputObj);

      const element = html`
        <h1 ref=${TEST_ID} data-testid="${TEST_ID}">
          <span data-testid="two"
            >${viewModel.$one.compute(({ two }) => two)}</span
          >
          <span data-testid="three"
            >${viewModel.$one.compute(({ three }) => three)}</span
          >
        </h1>
      `;
      document.body.append(element);

      expect(getByTestId(document.body, TEST_ID)).toBeInTheDocument();
      expect(getByTestId(document.body, "two")).toHaveTextContent("two");
      expect(getByTestId(document.body, "three")).toHaveTextContent("three");
    });
  });

  describe("Array Values", () => {
    it("should render and update array values", async () => {
      const listItemText = ["item 1", "item 2", "item 3"];
      const viewModel = useViewModel({ items: listItemText });

      const listItemView = viewModel.$items.compute((items: string[]) =>
        items.map(
          (item, i) =>
            html`<li data-testid="${TEST_ID}" ref="item-${i}">${item}</li>`
        )
      );
      const listView = html`<ul ref="list">${listItemView}</ul>`;
      document.body.append(listView);

      // Verify initial render
      let listItemElements = getAllByTestId(document.body, TEST_ID);
      expect(listItemElements).toHaveLength(3);
      listItemText.forEach(item => {
        expect(getByText(document.body, item)).toBeInTheDocument();
      });

      // Update array
      viewModel.items = [...viewModel.items, "item 4"];
      await new Promise<void>(resolve => queueMicrotask(() => resolve()));

      // Verify updated render
      listItemElements = getAllByTestId(document.body, TEST_ID);
      expect(listItemElements).toHaveLength(4);
      expect(getByText(document.body, "item 4")).toBeInTheDocument();
    });
  });
});
