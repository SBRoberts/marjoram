import {
  findAllByDisplayValue,
  fireEvent,
  getAllByTestId,
  getByTestId,
  getByText,
  waitFor,
} from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect";
import { html, useViewModel } from "../src";
export const TEST_ID = 12345;
export type primitive = string | number | boolean;
export const testViewModel = {
  primitive: {
    change<T extends primitive>(value: T, newValue: T) {
      const ref = "heading";

      const viewModel = useViewModel({ value });

      const element = html`<h1 ref="${ref}" data-testid="${TEST_ID}">
        ${viewModel.$value}
      </h1>`;
      document.body.append(element);

      const domElement = getByTestId(document.body, TEST_ID);

      expect(domElement).toBeInTheDocument();
      // The DOM's text content is a string, thus we
      expect(domElement).toHaveTextContent(value.toString());

      viewModel.value = newValue;

      expect(domElement).toHaveTextContent(newValue.toString());

      const elementCollection = element.collect();

      expect(elementCollection).toHaveProperty(ref, domElement);
      expect(elementCollection[ref] instanceof HTMLHeadingElement).toBe(true);
    },
    compute(
      value: primitive,
      newValue: primitive,
      compute: (value: primitive) => any
    ) {
      const ref = "heading";

      const viewModel = useViewModel({ value });

      const element = html`<h1 ref="${ref}" data-testid="${TEST_ID}">
        ${viewModel.$value.compute(compute)}
      </h1>`;
      document.body.append(element);

      const domElement = getByTestId(document.body, TEST_ID);

      expect(domElement).toBeInTheDocument();
      expect(domElement).toHaveTextContent(compute(value).toString());

      viewModel.value = newValue;

      expect(domElement).toHaveTextContent(compute(newValue).toString());

      const elementCollection = element.collect();

      expect(elementCollection).toHaveProperty(ref, domElement);
      expect(elementCollection[ref] instanceof HTMLHeadingElement).toBe(true);
    },
  },
  array: {
    // change,
  },
};
export const testViewModelChange = (value: any, newValue: any) => {
  const ref = "heading";

  const viewModel = useViewModel({ value });

  const element = html`<h1 ref="${ref}" data-testid="${TEST_ID}">
    ${viewModel.$value}
  </h1>`;
  document.body.append(element);

  const domElement = getByTestId(document.body, TEST_ID);

  expect(domElement).toBeInTheDocument();
  expect(domElement).toHaveTextContent(value);

  viewModel.value = newValue;

  expect(domElement).toHaveTextContent(newValue);

  const elementCollection = element.collect();

  expect(elementCollection).toHaveProperty(ref, domElement);
  expect(elementCollection[ref] instanceof HTMLHeadingElement).toBe(true);
};

export const testViewModelCompute = (
  value: any,
  newValue: any,
  compute: (value: any) => any
) => {
  const ref = "heading";

  const viewModel = useViewModel({ value });

  const element = html`<h1 ref="${ref}" data-testid="${TEST_ID}">
    ${viewModel.$value.compute(compute)}
  </h1>`;
  document.body.append(element);

  const domElement = getByTestId(document.body, TEST_ID);

  expect(domElement).toBeInTheDocument();
  expect(domElement).toHaveTextContent(compute(value));

  viewModel.value = newValue;

  expect(domElement).toHaveTextContent(compute(newValue));

  const elementCollection = element.collect();

  expect(elementCollection).toHaveProperty(ref, domElement);
  expect(elementCollection[ref] instanceof HTMLHeadingElement).toBe(true);
};
