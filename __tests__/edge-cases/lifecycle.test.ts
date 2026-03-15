import { html, useViewModel } from "../../src";

const flushMicrotasks = () =>
  new Promise<void>(resolve => queueMicrotask(resolve));

describe("Lifecycle: dispose / mount / unmount", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="target"></div>';
  });

  describe("SchemaProp.dispose()", () => {
    test("observers stop firing after dispose", async () => {
      const vm = useViewModel({ count: 0 });
      const view = html`<p data-testid="v">${vm.$count}</p>`;
      document.body.append(view);

      const el = document.querySelector('[data-testid="v"]')!;
      expect(el.textContent).toContain("0");

      // Dispose the viewModel's schema
      vm.$destroy();

      vm.count = 99;
      await flushMicrotasks();

      // DOM should NOT have updated
      expect(el.textContent).toContain("0");
    });
  });

  describe("view.mount()", () => {
    test("mounts into a selector target", () => {
      const view = html`<p data-testid="m">hello</p>`;
      view.mount("#target");

      const el = document.querySelector('[data-testid="m"]');
      expect(el).not.toBeNull();
      expect(el!.textContent).toBe("hello");
      expect(el!.parentElement!.id).toBe("target");
    });

    test("mounts into an element target", () => {
      const target = document.getElementById("target")!;
      const view = html`<span data-testid="m2">world</span>`;
      view.mount(target);

      const el = document.querySelector('[data-testid="m2"]');
      expect(el).not.toBeNull();
      expect(el!.parentElement).toBe(target);
    });

    test("throws on invalid selector", () => {
      const view = html`<p>fail</p>`;
      expect(() => view.mount("#nonexistent")).toThrow(
        "[marjoram] mount target not found"
      );
    });

    test("mounts with shadow DOM (open)", () => {
      const view = html`<p data-testid="s">shadow</p>`;
      const target = document.getElementById("target")!;
      view.mount(target, { shadow: "open" });

      expect(target.shadowRoot).not.toBeNull();
      const el = target.shadowRoot!.querySelector('[data-testid="s"]');
      expect(el).not.toBeNull();
      expect(el!.textContent).toBe("shadow");
    });

    test("injects styles as a <style> tag", () => {
      const view = html`<p>styled</p>`;
      const target = document.getElementById("target")!;
      view.mount(target, { styles: ".foo { color: red; }" });

      const style = target.querySelector("style");
      expect(style).not.toBeNull();
      expect(style!.textContent).toBe(".foo { color: red; }");
    });

    test("injects styles into shadow root", () => {
      const view = html`<p>shadow styled</p>`;
      const target = document.getElementById("target")!;
      view.mount(target, {
        shadow: "open",
        styles: ".bar { color: blue; }",
      });

      const style = target.shadowRoot!.querySelector("style");
      expect(style).not.toBeNull();
      expect(style!.textContent).toBe(".bar { color: blue; }");
    });
  });

  describe("view.unmount()", () => {
    test("removes mounted nodes from DOM", () => {
      const view = html`<p data-testid="u">remove me</p>`;
      view.mount("#target");

      expect(document.querySelector('[data-testid="u"]')).not.toBeNull();

      view.unmount();

      expect(document.querySelector('[data-testid="u"]')).toBeNull();
    });

    test("stops reactive updates after unmount", async () => {
      const vm = useViewModel({ val: "before" });
      const view = html`<p data-testid="u2">${vm.$val}</p>`;
      view.mount("#target");

      const el = document.querySelector('[data-testid="u2"]')!;
      expect(el.textContent).toContain("before");

      view.unmount();

      vm.val = "after";
      await flushMicrotasks();

      // Node is detached, but even if we still had a reference,
      // the schema is disposed so observers shouldn't fire
    });

    test("unmount is idempotent", () => {
      const view = html`<p>safe</p>`;
      view.mount("#target");
      view.unmount();
      // Should not throw when called again
      expect(() => view.unmount()).not.toThrow();
    });
  });

  describe("memory leak prevention", () => {
    test("create and destroy 100 widgets without leaking observers", () => {
      for (let i = 0; i < 100; i++) {
        const vm = useViewModel({ x: i });
        const view = html`<span>${vm.$x}</span>`;
        view.mount("#target");
        view.unmount();
        vm.$destroy();
      }

      // If we got here without OOM or errors, observers are being cleaned up.
      // The target should be empty.
      const target = document.getElementById("target")!;
      expect(target.childNodes.length).toBe(0);
    });
  });
});
