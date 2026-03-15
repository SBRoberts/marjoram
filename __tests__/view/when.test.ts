import { getByTestId } from "@testing-library/dom";
import { html, useViewModel, when } from "../../src";

const TEST_ID = "when-test";

describe("when() conditional helper", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  const flush = () =>
    new Promise<void>(resolve => queueMicrotask(() => resolve()));

  describe("Static conditions", () => {
    it("should render the truthy branch when condition is true", () => {
      const view = html`<div data-testid="${TEST_ID}">
        ${when(true, () => html`<span>Visible</span>`)}
      </div>`;
      document.body.append(view);
      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("Visible");
    });

    it("should render nothing when condition is false and no falsy branch provided", () => {
      const view = html`<div data-testid="${TEST_ID}">
        ${when(false, () => html`<span>Hidden</span>`)}
      </div>`;
      document.body.append(view);
      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("");
    });

    it("should render the falsy branch when condition is false", () => {
      const view = html`<div data-testid="${TEST_ID}">
        ${when(
          false,
          () => html`<span>Yes</span>`,
          () => html`<span>No</span>`
        )}
      </div>`;
      document.body.append(view);
      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("No");
    });
  });

  describe("Reactive conditions", () => {
    it("should render the initial truthy branch for a truthy SchemaProp", () => {
      const vm = useViewModel({ show: true });
      const view = html`<div data-testid="${TEST_ID}">
        ${when(vm.$show, () => html`<span>Shown</span>`)}
      </div>`;
      document.body.append(view);
      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("Shown");
    });

    it("should render nothing initially for a falsy SchemaProp", () => {
      const vm = useViewModel({ show: false });
      const view = html`<div data-testid="${TEST_ID}">
        ${when(vm.$show, () => html`<span>Shown</span>`)}
      </div>`;
      document.body.append(view);
      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("");
    });

    it("should switch to truthful branch when SchemaProp becomes true", async () => {
      const vm = useViewModel({ show: false });
      const view = html`<div data-testid="${TEST_ID}">
        ${when(vm.$show, () => html`<span>Now visible</span>`)}
      </div>`;
      document.body.append(view);

      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("");

      vm.show = true;
      await flush();

      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent(
        "Now visible"
      );
    });

    it("should switch to falsy branch when SchemaProp becomes false", async () => {
      const vm = useViewModel({ active: true });
      const view = html`
        <div data-testid="${TEST_ID}">
          ${when(
            vm.$active,
            () => html`<span>Active</span>`,
            () => html`<span>Inactive</span>`
          )}
        </div>
      `;
      document.body.append(view);

      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("Active");

      vm.active = false;
      await flush();

      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("Inactive");
    });

    it("should toggle back and forth correctly", async () => {
      const vm = useViewModel({ on: true });
      const view = html`
        <div data-testid="${TEST_ID}">
          ${when(
            vm.$on,
            () => html`<span>ON</span>`,
            () => html`<span>OFF</span>`
          )}
        </div>
      `;
      document.body.append(view);

      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("ON");

      vm.on = false;
      await flush();
      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("OFF");

      vm.on = true;
      await flush();
      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("ON");
    });

    it("should work with a computed SchemaProp as the condition", async () => {
      const vm = useViewModel({ count: 0 });
      const hasItems = vm.$count.compute((n: number) => n > 0);
      const view = html`
        <div data-testid="${TEST_ID}">
          ${when(
            hasItems,
            () => html`<span>Has items</span>`,
            () => html`<span>Empty</span>`
          )}
        </div>
      `;
      document.body.append(view);

      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent("Empty");

      vm.count = 5;
      await flush();

      expect(getByTestId(document.body, TEST_ID)).toHaveTextContent(
        "Has items"
      );
    });
  });
});
