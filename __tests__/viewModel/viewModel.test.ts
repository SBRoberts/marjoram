import {
  findAllByDisplayValue,
  fireEvent,
  getAllByTestId,
  getByTestId,
  getByText,
  waitFor,
} from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect";

import { html, useViewModel, ViewModel } from "../../src";
import { SchemaProp } from "../../src/schema";

import {
  testViewModelChange,
  testViewModelCompute,
  TEST_ID,
} from "../viewModel.utils";

describe("View Model Tests", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("String Values", () => {
    const text: string = "Hello, world!";
    const newText: string = "This is new text";
    it("should render changes in view model", () => {
      testViewModelChange(text, newText);
    });
    it("should compute and render changes in view model", () => {
      testViewModelCompute(text, newText, (text) => `${text} but computed`);
    });
  });

  describe("Number Values", () => {
    const number = 9;
    const newNumber = 99;
    it("should render changes in view model", () => {
      testViewModelChange(number, newNumber);
    });
    it("should compute and render changes in view model", () => {
      testViewModelCompute(number, newNumber, (number) => number * 3);
    });
  });

  describe("Object Values", () => {
    const two = "two";
    const three = "three";

    const inputObj = { one: { two, three } };

    it("should render changes in view model", () => {
      const viewModel = useViewModel(inputObj);

      // const handleCompute = (inputObj) => {};
      const element = html`
        <h1 ref=${TEST_ID} data-testid="${TEST_ID}">
          <span data-testid="${two}"
            >${viewModel.$one.compute(({ two }) => two)}</span
          >
          <span data-testid="${three}"
            >${viewModel.$one.compute(({ three }) => three)}</span
          >
        </h1>
      `;
      document.body.append(element);

      const domElement = getByTestId(document.body, TEST_ID);

      expect(domElement).toBeInTheDocument();
      expect(getByTestId(document.body, two)).toBeInTheDocument();
      expect(getByTestId(document.body, three)).toBeInTheDocument();
      // expect(domElement).toHaveTextContent(inputObj.two);
    });
    // it("should compute and render changes in view model", () => {
    //   testViewModelCompute(number, newNumber, (number) => number * 3);
    // });
  });

  describe("View Model Array type arguments", () => {
    const testListItemLengthAndDomContent = (
      viewModel: ViewModel<{ items: any }>,
      itemCount: number
    ) => {
      // Ensure all list items
      const listItemElements = getAllByTestId(document.body, TEST_ID);
      expect(listItemElements).toHaveLength(itemCount);

      viewModel.items.forEach((item: any) => {
        const element = getByText(document.body, item);
        expect(element).toBeInTheDocument();
        expect(element.textContent).toEqual(item);
      });
    };

    it("should render changes in view model", () => {
      const ref = "list";
      const listItemText = [`item 1`, `item 2`, `item 3`];
      const initialState = { items: listItemText };
      const viewModel = useViewModel(initialState);

      const listItemView = viewModel.$items.compute((items: string[]) =>
        items.map(
          (item, i) =>
            html`<li data-testid="${TEST_ID}" ref="item-${i}">${item}</li>`
        )
      );
      const listView = html` <ul ref="${ref}">
        ${listItemView}
      </ul>`;
      document.body.append(listView);

      let elements = listView.collect();
      testListItemLengthAndDomContent(viewModel, listItemText.length);
      viewModel.items = [...viewModel.items, "item 4"];

      testListItemLengthAndDomContent(viewModel, 4);
    });
  });
});
