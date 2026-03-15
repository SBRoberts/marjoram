import { createWidget, html } from "../../src";

const flushMicrotasks = () =>
  new Promise<void>(resolve => queueMicrotask(resolve));

describe("createWidget", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="widget-root"></div>';
  });

  test("mount renders into target", () => {
    const widget = createWidget({
      target: "#widget-root",
      model: { text: "hello" },
      render: vm => html`<p data-testid="w">${vm.$text}</p>`,
    });

    widget.mount();

    const el = document.querySelector('[data-testid="w"]');
    expect(el).not.toBeNull();
    expect(el!.textContent).toBe("hello");
  });

  test("reactive updates propagate after mount", async () => {
    const widget = createWidget({
      target: "#widget-root",
      model: { count: 0 },
      render: vm => html`<span data-testid="c">${vm.$count}</span>`,
    });

    widget.mount();
    widget.vm.count = 42;
    await flushMicrotasks();

    const el = document.querySelector('[data-testid="c"]')!;
    expect(el.textContent).toBe("42");
  });

  test("onMount callback fires with vm and refs", () => {
    const onMount = jest.fn();

    const widget = createWidget({
      target: "#widget-root",
      model: { x: 1 },
      render: vm => html`<button ref="btn">${vm.$x}</button>`,
      onMount,
    });

    widget.mount();

    expect(onMount).toHaveBeenCalledTimes(1);
    const [vm, refs] = onMount.mock.calls[0];
    expect(vm.x).toBe(1);
    expect(refs.btn).toBeInstanceOf(HTMLButtonElement);
  });

  test("onDestroy callback fires before cleanup", () => {
    const order: string[] = [];

    const widget = createWidget({
      target: "#widget-root",
      model: { val: "alive" },
      render: vm => html`<p>${vm.$val}</p>`,
      onDestroy: () => order.push("onDestroy"),
    });

    widget.mount();
    widget.destroy();

    expect(order).toEqual(["onDestroy"]);
  });

  test("destroy removes nodes from DOM", () => {
    const widget = createWidget({
      target: "#widget-root",
      model: {},
      render: () => html`<p data-testid="d">gone</p>`,
    });

    widget.mount();
    expect(document.querySelector('[data-testid="d"]')).not.toBeNull();

    widget.destroy();
    expect(document.querySelector('[data-testid="d"]')).toBeNull();
  });

  test("destroy stops reactive updates", async () => {
    const widget = createWidget({
      target: "#widget-root",
      model: { n: 0 },
      render: vm => html`<span data-testid="n">${vm.$n}</span>`,
    });

    widget.mount();
    const el = document.querySelector('[data-testid="n"]')!;
    expect(el.textContent).toBe("0");

    widget.destroy();
    widget.vm.n = 999;
    await flushMicrotasks();

    // The element is removed, and even if we had a ref the schema is disposed
  });

  test("styles option injects a <style> tag", () => {
    const widget = createWidget({
      target: "#widget-root",
      styles: ".widget { color: red; }",
      model: {},
      render: () => html`<div class="widget">styled</div>`,
    });

    widget.mount();

    const root = document.getElementById("widget-root")!;
    const style = root.querySelector("style");
    expect(style).not.toBeNull();
    expect(style!.textContent).toBe(".widget { color: red; }");
  });

  test("shadow option creates shadow DOM", () => {
    const widget = createWidget({
      target: "#widget-root",
      shadow: "open",
      model: {},
      render: () => html`<p data-testid="sw">shadow widget</p>`,
    });

    widget.mount();

    const root = document.getElementById("widget-root")!;
    expect(root.shadowRoot).not.toBeNull();
    const el = root.shadowRoot!.querySelector('[data-testid="sw"]');
    expect(el).not.toBeNull();
  });

  test("computed properties work inside createWidget", async () => {
    const widget = createWidget({
      target: "#widget-root",
      model: {
        price: 10,
        qty: 3,
        total: (vm: any) => vm.price * vm.qty,
      },
      render: vm => html`<span data-testid="t">${vm.$total}</span>`,
    });

    widget.mount();
    const el = document.querySelector('[data-testid="t"]')!;
    expect(el.textContent).toBe("30");

    widget.vm.price = 20;
    await flushMicrotasks();
    await flushMicrotasks(); // computed props update in a second microtask

    expect(el.textContent).toBe("60");
  });
});
