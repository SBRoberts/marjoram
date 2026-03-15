/* eslint-disable @typescript-eslint/no-explicit-any */
import { getByTestId } from "@testing-library/dom";
import { html, useViewModel } from "../../src";

const TEST_ID = "computed-test";
const flushMicrotasks = () => new Promise<void>(resolve => queueMicrotask(() => resolve()));
// Helper to flush computed property updates (requires 2 microtask flushes)
const flushComputedUpdates = async () => {
  await flushMicrotasks();
  await flushMicrotasks();
};

describe("Computed Properties", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Basic Computed Properties", () => {
    it("should compute a property from a single dependency", async () => {
      const viewModel = useViewModel({
        count: 5,
        doubled: (vm: any) => vm.count * 2,
      });

      const element = html`<div data-testid="${TEST_ID}">
        <span>Count: ${viewModel.$count}</span>
        <span>Doubled: ${viewModel.$doubled}</span>
      </div>`;
      document.body.append(element);

      const domElement = getByTestId(document.body, TEST_ID);
      expect(domElement.textContent).toContain("Count: 5");
      expect(domElement.textContent).toContain("Doubled: 10");

      // Update count and verify doubled updates
      viewModel.count = 10;
      await flushComputedUpdates();

      expect(domElement.textContent).toContain("Count: 10");
      expect(domElement.textContent).toContain("Doubled: 20");
    });

    it("should compute a property from multiple dependencies", async () => {
      const viewModel = useViewModel({
        firstName: "John",
        lastName: "Doe",
        fullName: (vm: any) => `${vm.firstName} ${vm.lastName}`,
      });

      const element = html`<div data-testid="${TEST_ID}">
        ${viewModel.$fullName}
      </div>`;
      document.body.append(element);

      const domElement = getByTestId(document.body, TEST_ID);
      expect(domElement).toHaveTextContent("John Doe");

      // Update firstName
      viewModel.firstName = "Jane";
      await flushComputedUpdates();
      expect(domElement).toHaveTextContent("Jane Doe");

      // Update lastName
      viewModel.lastName = "Smith";
      await flushComputedUpdates();
      expect(domElement).toHaveTextContent("Jane Smith");
    });

    it("should handle multiple computed properties", async () => {
      const viewModel = useViewModel({
        price: 100,
        quantity: 2,
        subtotal: (vm: any) => vm.price * vm.quantity,
        tax: (vm: any) => vm.subtotal * 0.1,
        total: (vm: any) => vm.subtotal + vm.tax,
      });

      const element = html`<div data-testid="${TEST_ID}">
        <span>Subtotal: ${viewModel.$subtotal}</span>
        <span>Tax: ${viewModel.$tax}</span>
        <span>Total: ${viewModel.$total}</span>
      </div>`;
      document.body.append(element);

      const domElement = getByTestId(document.body, TEST_ID);
      expect(domElement.textContent).toContain("Subtotal: 200");
      expect(domElement.textContent).toContain("Tax: 20");
      expect(domElement.textContent).toContain("Total: 220");

      // Update price
      viewModel.price = 150;
      await flushComputedUpdates();
      expect(domElement.textContent).toContain("Subtotal: 300");
      expect(domElement.textContent).toContain("Tax: 30");
      expect(domElement.textContent).toContain("Total: 330");

      // Update quantity
      viewModel.quantity = 3;
      await flushComputedUpdates();
      expect(domElement.textContent).toContain("Subtotal: 450");
      expect(domElement.textContent).toContain("Tax: 45");
      expect(domElement.textContent).toContain("Total: 495");
    });
  });

  describe("Computed Properties with Complex Values", () => {
    it("should compute from array properties", async () => {
      const viewModel = useViewModel({
        items: [1, 2, 3, 4, 5],
        total: (vm: any) => vm.items.reduce((sum: number, n: number) => sum + n, 0),
        average: (vm: any) => vm.total / vm.items.length,
      });

      const element = html`<div data-testid="${TEST_ID}">
        <span>Total: ${viewModel.$total}</span>
        <span>Average: ${viewModel.$average}</span>
      </div>`;
      document.body.append(element);

      const domElement = getByTestId(document.body, TEST_ID);
      expect(domElement.textContent).toContain("Total: 15");
      expect(domElement.textContent).toContain("Average: 3");

      // Update items
      viewModel.items = [10, 20, 30];
      await flushComputedUpdates();
      expect(domElement.textContent).toContain("Total: 60");
      expect(domElement.textContent).toContain("Average: 20");
    });

    it("should compute from object properties", async () => {
      const viewModel = useViewModel({
        firstName: "John",
        lastName: "Doe",
        age: 30,
        displayName: (vm: any) => `${vm.firstName} ${vm.lastName} (${vm.age})`,
      });

      const element = html`<div data-testid="${TEST_ID}">
        ${viewModel.$displayName}
      </div>`;
      document.body.append(element);

      const domElement = getByTestId(document.body, TEST_ID);
      expect(domElement).toHaveTextContent("John Doe (30)");

      // Update individual properties
      viewModel.firstName = "Jane";
      await flushComputedUpdates();
      expect(domElement).toHaveTextContent("Jane Doe (30)");
      
      viewModel.lastName = "Smith";
      await flushComputedUpdates();
      expect(domElement).toHaveTextContent("Jane Smith (30)");

      viewModel.age = 25;
      await flushComputedUpdates();
      expect(domElement).toHaveTextContent("Jane Smith (25)");
    });
  });

  describe("Computed Properties Edge Cases", () => {
    it("should prevent direct assignment to computed properties", () => {
      const viewModel = useViewModel({
        count: 5,
        doubled: (vm: any) => vm.count * 2,
      });

      expect(() => {
        (viewModel as any).doubled = 100;
      }).toThrow('Cannot set computed property "doubled". Computed properties are read-only.');
    });

    it("should handle computed properties that return complex types", async () => {
      const viewModel = useViewModel({
        items: ["apple", "banana", "cherry"],
        itemElements: (vm: any) => vm.items.map((item: string) => 
          html`<li>${item}</li>`
        ),
      });

      const element = html`<ul data-testid="${TEST_ID}">
        ${viewModel.$itemElements}
      </ul>`;
      document.body.append(element);

      const domElement = getByTestId(document.body, TEST_ID);
      expect(domElement.querySelectorAll("li")).toHaveLength(3);
      expect(domElement.textContent).toContain("apple");
      expect(domElement.textContent).toContain("banana");

      // Update items
      viewModel.items = ["orange", "grape"];
      await flushComputedUpdates();
      expect(domElement.querySelectorAll("li")).toHaveLength(2);
      expect(domElement.textContent).toContain("orange");
      expect(domElement.textContent).toContain("grape");
    });

    it("should access computed properties without $ prefix", () => {
      const viewModel = useViewModel({
        count: 5,
        doubled: (vm: any) => vm.count * 2,
      });

      // Should be able to read the computed value directly
      expect(viewModel.doubled).toBe(10);
      
      viewModel.count = 20;
      expect(viewModel.doubled).toBe(40);
    });
  });

  describe("Computed Properties Type Safety", () => {
    it("should work with boolean computed properties", async () => {
      const viewModel = useViewModel({
        email: "",
        isValidEmail: (vm: any) => vm.email.includes("@") && vm.email.includes("."),
      });

      const element = html`<div data-testid="${TEST_ID}">
        Valid: ${viewModel.$isValidEmail}
      </div>`;
      document.body.append(element);

      const domElement = getByTestId(document.body, TEST_ID);
      expect(domElement).toHaveTextContent("Valid: false");

      viewModel.email = "test@example.com";
      await flushComputedUpdates();
      expect(domElement).toHaveTextContent("Valid: true");
    });

    it("should work with number computed properties", async () => {
      const viewModel = useViewModel({
        radius: 5,
        area: (vm: any) => Math.PI * vm.radius * vm.radius,
        circumference: (vm: any) => 2 * Math.PI * vm.radius,
      });

      const element = html`<div data-testid="${TEST_ID}">
        Area: ${viewModel.$area}, Circ: ${viewModel.$circumference}
      </div>`;
      document.body.append(element);

      const domElement = getByTestId(document.body, TEST_ID);
      expect(domElement.textContent).toContain("Area: 78.5");
      expect(domElement.textContent).toContain("Circ: 31.4");

      viewModel.radius = 10;
      await flushComputedUpdates();
      expect(domElement.textContent).toContain("Area: 314.1");
      expect(domElement.textContent).toContain("Circ: 62.8");
    });
  });
});
