import { useViewModel, store, html } from "../../src";
import { SchemaProp } from "../../src/schema";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));
// Two flushes: one for the signal-effect microtask (bridge), one for the
// SchemaProp.update() observer-dispatch microtask.
const flushTwice = async () => {
  await flush();
  await flush();
};

describe("store path-binding $-proxy (Phase 4b)", () => {
  describe("basic traversal", () => {
    it("vm.$store.key returns a SchemaProp reactive to that path", async () => {
      const vm = useViewModel({
        user: store({ name: "Alice", age: 30 }),
      });

      const nameProp = vm.$user.name;
      expect(nameProp).toBeInstanceOf(SchemaProp);
      expect(nameProp.value).toBe("Alice");

      let observed: unknown = null;
      nameProp.observe(v => {
        observed = v;
      });

      vm.user.name = "Bob";
      await flushTwice();
      expect(nameProp.value).toBe("Bob");
      expect(observed).toBe("Bob");
    });

    it("vm.$store.a.b.c works for deeply-nested paths", async () => {
      const vm = useViewModel({
        data: store({
          user: { profile: { name: "Alice" } },
        }),
      });

      const nameProp = vm.$data.user.profile.name;
      expect(nameProp).toBeInstanceOf(SchemaProp);
      expect(nameProp.value).toBe("Alice");

      vm.data.user.profile.name = "Carol";
      await flushTwice();
      expect(nameProp.value).toBe("Carol");
    });

    it("identical paths return the same SchemaProp instance (stable identity)", () => {
      const vm = useViewModel({
        user: store({ name: "Alice" }),
      });
      const a = vm.$user.name;
      const b = vm.$user.name;
      expect(a).toBe(b);
    });
  });

  describe("granularity", () => {
    it("mutating one path does not wake sibling-path observers", async () => {
      const vm = useViewModel({
        user: store({ name: "Alice", age: 30 }),
      });

      let nameRuns = 0;
      let ageRuns = 0;
      vm.$user.name.observe(() => {
        nameRuns++;
      });
      vm.$user.age.observe(() => {
        ageRuns++;
      });

      vm.user.name = "Bob";
      await flushTwice();
      expect(nameRuns).toBe(1);
      expect(ageRuns).toBe(0);
    });
  });

  describe("composition with existing SchemaProp methods", () => {
    it("vm.$store.key.compute(fn) layers another derivation on top", async () => {
      const vm = useViewModel({
        user: store({ name: "Alice" }),
      });

      const upper = vm.$user.name.compute(
        n => (n as string)?.toUpperCase?.() ?? ""
      );
      expect(upper.value).toBe("ALICE");

      vm.user.name = "Bob";
      await flushTwice();
      expect(upper.value).toBe("BOB");
    });

    it("vm.$store.key.peek() reads without registering tracking", () => {
      const vm = useViewModel({
        user: store({ name: "Alice" }),
      });
      expect(vm.$user.name.peek()).toBe("Alice");
    });
  });

  describe("html template interpolation", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("vm.$store.key interpolates as a reactive binding in html", async () => {
      const vm = useViewModel({
        user: store({ name: "Alice" }),
      });

      const view = html`<p data-testid="name">${vm.$user.name}</p>`;
      view.mount(document.body);

      const el = document.querySelector('[data-testid="name"]') as HTMLElement;
      expect(el.textContent).toBe("Alice");

      vm.user.name = "Bob";
      await flushTwice();
      expect(el.textContent).toBe("Bob");
    });

    it("vm.$store.a.b.c works in templates", async () => {
      const vm = useViewModel({
        data: store({
          user: { profile: { name: "Alice" } },
        }),
      });

      // prettier-ignore
      const view = html`<p data-testid="deep">${vm.$data.user.profile.name}</p>`;
      view.mount(document.body);

      const el = document.querySelector('[data-testid="deep"]') as HTMLElement;
      expect(el.textContent).toBe("Alice");

      vm.data.user.profile.name = "Carol";
      await flushTwice();
      expect(el.textContent).toBe("Carol");
    });
  });

  describe("collision policy: method wins on data keys named like SchemaProp methods", () => {
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it("the SchemaProp method takes precedence and a warning fires in dev mode", () => {
      // Data has a key "compute" that collides with SchemaProp.compute.
      const vm = useViewModel({
        bag: store<Record<string, unknown>>({
          compute: "I am data, not a method",
          normalKey: 42,
        }),
      });

      const computeAccess = vm.$bag.compute;
      // Method wins:
      expect(typeof computeAccess).toBe("function");

      // Dev-mode warning fired.
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('key "compute"')
      );

      // Non-colliding access is normal path-binding.
      const normalProp = vm.$bag.normalKey;
      expect(normalProp).toBeInstanceOf(SchemaProp);
      expect(normalProp.value).toBe(42);
    });
  });

  describe("non-store $-prefix still works (no regression)", () => {
    it("plain signal-style vm.$key returns a plain SchemaProp", () => {
      const vm = useViewModel({
        count: 0,
      });
      expect(vm.$count).toBeInstanceOf(SchemaProp);
      expect(vm.$count.value).toBe(0);
    });
  });
});
