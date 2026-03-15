import { getByTestId } from "@testing-library/dom";
import { html, useViewModel } from "../src";

export const TEST_ID = 12345;

// Helper to wait for microtask queue to flush (for batched updates)
const flushMicrotasks = () => new Promise<void>(resolve => queueMicrotask(() => resolve()));

export const testViewModelChange = async (value: any, newValue: any) => {
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
  await flushMicrotasks();

  expect(domElement).toHaveTextContent(newValue);

  const elementCollection = element.collect();

  expect(elementCollection).toHaveProperty(ref, domElement);
  expect(elementCollection[ref] instanceof HTMLHeadingElement).toBe(true);
};

export const testViewModelCompute = async (
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
  await flushMicrotasks();

  expect(domElement).toHaveTextContent(compute(newValue));

  const elementCollection = element.collect();

  expect(elementCollection).toHaveProperty(ref, domElement);
  expect(elementCollection[ref] instanceof HTMLHeadingElement).toBe(true);
};
