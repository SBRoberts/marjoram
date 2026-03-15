import { fireEvent, getByTestId } from "@testing-library/dom";
import { html } from "../../src";

const TEST_ID = "event-test";

describe("Inline Event Handler Binding", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Static handlers", () => {
    it("should call a handler bound via onclick=${fn}", () => {
      const handler = jest.fn();
      const view = html`<button data-testid="${TEST_ID}" onclick=${handler}>
        Click me
      </button>`;
      document.body.append(view);

      fireEvent.click(getByTestId(document.body, TEST_ID));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should not set the onclick attribute as a string on the element", () => {
      const handler = jest.fn();
      const view = html`<button data-testid="${TEST_ID}" onclick=${handler}>
        Click
      </button>`;
      document.body.append(view);

      const btn = getByTestId(document.body, TEST_ID);
      expect(btn.hasAttribute("onclick")).toBe(false);
    });

    it("should bind oninput handlers", () => {
      const handler = jest.fn();
      const view = html`<input data-testid="${TEST_ID}" oninput=${handler} />`;
      document.body.append(view);

      fireEvent.input(getByTestId(document.body, TEST_ID), {
        target: { value: "hello" },
      });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should allow multiple different event handlers on the same element", () => {
      const clickHandler = jest.fn();
      const mousedownHandler = jest.fn();
      const view = html`
        <button
          data-testid="${TEST_ID}"
          onclick=${clickHandler}
          onmousedown=${mousedownHandler}
        >
          Click
        </button>
      `;
      document.body.append(view);

      const btn = getByTestId(document.body, TEST_ID);
      fireEvent.click(btn);
      fireEvent.mouseDown(btn);

      expect(clickHandler).toHaveBeenCalledTimes(1);
      expect(mousedownHandler).toHaveBeenCalledTimes(1);
    });

    it("should pass the event object to the handler", () => {
      let receivedEvent: Event | null = null;
      const handler = (e: Event) => {
        receivedEvent = e;
      };
      const view = html`<button data-testid="${TEST_ID}" onclick=${handler}>
        Click
      </button>`;
      document.body.append(view);

      fireEvent.click(getByTestId(document.body, TEST_ID));
      expect(receivedEvent).toBeInstanceOf(Event);
    });
  });

  describe("Mixed: inline handler alongside normal attributes", () => {
    it("should correctly render other attributes on the same element", () => {
      const handler = jest.fn();
      const label = "Submit";
      const view = html`
        <button
          data-testid="${TEST_ID}"
          class="btn"
          aria-label="${label}"
          onclick=${handler}
        >
          ${label}
        </button>
      `;
      document.body.append(view);

      const btn = getByTestId(document.body, TEST_ID);
      expect(btn).toHaveAttribute("class", "btn");
      expect(btn).toHaveAttribute("aria-label", label);
      expect(btn.hasAttribute("onclick")).toBe(false);
    });
  });
});
