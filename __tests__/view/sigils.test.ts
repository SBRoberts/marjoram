import { fireEvent, getByTestId } from "@testing-library/dom";
import { html, useViewModel } from "../../src";

const TEST_ID = "sigil-test";
const flush = () =>
  new Promise<void>(resolve => queueMicrotask(() => resolve()));

describe("Sigil attribute bindings", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // ---------------------------------------------------------------------------
  // @event — addEventListener binding
  // ---------------------------------------------------------------------------
  describe("@event sigil", () => {
    it("should bind a click handler via @click", () => {
      const handler = jest.fn();
      const view = html`<button data-testid="${TEST_ID}" @click=${handler}>
        Go
      </button>`;
      document.body.append(view);

      fireEvent.click(getByTestId(document.body, TEST_ID));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should not leave @click as an attribute on the element", () => {
      const handler = jest.fn();
      const view = html`<button data-testid="${TEST_ID}" @click=${handler}>
        Go
      </button>`;
      document.body.append(view);

      const btn = getByTestId(document.body, TEST_ID);
      expect(btn.hasAttribute("click")).toBe(false);
      expect(btn.hasAttribute("@click")).toBe(false);
    });

    it("should pass the event object to the handler", () => {
      let received: Event | null = null;
      const view = html`<button
        data-testid="${TEST_ID}"
        @click=${(e: Event) => {
          received = e;
        }}
      >
        Go
      </button>`;
      document.body.append(view);

      fireEvent.click(getByTestId(document.body, TEST_ID));
      expect(received).toBeInstanceOf(Event);
    });

    it("should support non-click event names like @input", () => {
      const handler = jest.fn();
      const view = html`<input data-testid="${TEST_ID}" @input=${handler} />`;
      document.body.append(view);

      fireEvent.input(getByTestId(document.body, TEST_ID), {
        target: { value: "hi" },
      });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should swap handler when reactive SchemaProp updates", async () => {
      const log: string[] = [];
      const handlerA = () => log.push("A");
      const handlerB = () => log.push("B");

      // useViewModel treats plain functions as computed properties, so produce
      // the reactive handler via .compute() from a boolean toggle instead.
      const vm = useViewModel({ useB: false });
      const handlerProp = vm.$useB.compute((useB: boolean) =>
        useB ? handlerB : handlerA
      );

      const view = html`<button data-testid="${TEST_ID}" @click=${handlerProp}>
        Go
      </button>`;
      document.body.append(view);

      fireEvent.click(getByTestId(document.body, TEST_ID));
      expect(log).toEqual(["A"]);

      vm.useB = true;
      await flush();

      fireEvent.click(getByTestId(document.body, TEST_ID));
      expect(log).toEqual(["A", "B"]);
    });
  });

  // ---------------------------------------------------------------------------
  // .prop — DOM property assignment
  // ---------------------------------------------------------------------------
  describe(".prop sigil", () => {
    it("should set a DOM property directly via .value", () => {
      const view = html`<input data-testid="${TEST_ID}" .value=${"hello"} />`;
      document.body.append(view);

      const input = getByTestId(document.body, TEST_ID) as HTMLInputElement;
      expect(input.value).toBe("hello");
    });

    it("should not leave .value as an HTML attribute", () => {
      const view = html`<input data-testid="${TEST_ID}" .value=${"hello"} />`;
      document.body.append(view);

      const input = getByTestId(document.body, TEST_ID);
      // .value becomes an attribute in some browsers but not as ".value"
      expect(input.hasAttribute(".value")).toBe(false);
    });

    it("should reactively update the DOM property", async () => {
      const vm = useViewModel({ text: "initial" });
      const view = html`<input data-testid="${TEST_ID}" .value=${vm.$text} />`;
      document.body.append(view);

      const input = getByTestId(document.body, TEST_ID) as HTMLInputElement;
      expect(input.value).toBe("initial");

      vm.text = "updated";
      await flush();

      expect(input.value).toBe("updated");
    });

    it("should set checked property on a checkbox", async () => {
      const vm = useViewModel({ checked: false });
      const view = html`<input
        type="checkbox"
        data-testid="${TEST_ID}"
        .checked=${vm.$checked}
      />`;
      document.body.append(view);

      const checkbox = getByTestId(document.body, TEST_ID) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      vm.checked = true;
      await flush();

      expect(checkbox.checked).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // ?bool — toggleAttribute binding
  // ---------------------------------------------------------------------------
  describe("?bool sigil", () => {
    it("should add the attribute when value is truthy", () => {
      const view = html`<button data-testid="${TEST_ID}" ?disabled=${true}>
        Click
      </button>`;
      document.body.append(view);

      expect(getByTestId(document.body, TEST_ID)).toHaveAttribute("disabled");
    });

    it("should not add the attribute when value is falsy", () => {
      const view = html`<button data-testid="${TEST_ID}" ?disabled=${false}>
        Click
      </button>`;
      document.body.append(view);

      expect(getByTestId(document.body, TEST_ID)).not.toHaveAttribute(
        "disabled"
      );
    });

    it("should reactively toggle the attribute", async () => {
      const vm = useViewModel({ isDisabled: false });
      const view = html`<button
        data-testid="${TEST_ID}"
        ?disabled=${vm.$isDisabled}
      >
        Click
      </button>`;
      document.body.append(view);

      const btn = getByTestId(document.body, TEST_ID);
      expect(btn).not.toHaveAttribute("disabled");

      vm.isDisabled = true;
      await flush();
      expect(btn).toHaveAttribute("disabled");

      vm.isDisabled = false;
      await flush();
      expect(btn).not.toHaveAttribute("disabled");
    });

    it("should work with custom boolean attributes", async () => {
      const vm = useViewModel({ active: true });
      const view = html`<div
        data-testid="${TEST_ID}"
        ?aria-pressed=${vm.$active}
      ></div>`;
      document.body.append(view);

      const el = getByTestId(document.body, TEST_ID);
      expect(el).toHaveAttribute("aria-pressed");

      vm.active = false;
      await flush();
      expect(el).not.toHaveAttribute("aria-pressed");
    });
  });

  // ---------------------------------------------------------------------------
  // Template caching — same call site reuses the parsed template
  // ---------------------------------------------------------------------------
  describe("template caching", () => {
    it("should produce independent instances from the same call site", async () => {
      const makeCounter = (initial: number) => {
        const vm = useViewModel({ count: initial });
        const view = html`<span data-testid="${initial}">${vm.$count}</span>`;
        document.body.append(view);
        return vm;
      };

      const vmA = makeCounter(0);
      const vmB = makeCounter(1);

      const elA = getByTestId(document.body, 0) as HTMLElement;
      const elB = getByTestId(document.body, 1) as HTMLElement;

      expect(elA.textContent).toBe("0");
      expect(elB.textContent).toBe("1");

      vmA.count = 99;
      await flush();

      // Only elA should update — instances are independent despite sharing the cache
      expect(elA.textContent).toBe("99");
      expect(elB.textContent).toBe("1");
    });

    it("each html() call gets its own reactive scope", async () => {
      const makeView = (label: string) => {
        const vm = useViewModel({ label });
        const view = html`<p data-testid="${label}">${vm.$label}</p>`;
        document.body.append(view);
        return vm;
      };

      const vmA = makeView("alpha");
      const vmB = makeView("beta");

      vmA.label = "ALPHA";
      await flush();

      expect(getByTestId(document.body, "alpha").textContent).toBe("ALPHA");
      expect(getByTestId(document.body, "beta").textContent).toBe("beta");
    });
  });
});
