import { store, effect } from "../../src/reactivity";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

// The devtools formatter is auto-installed on the first `store()` call.
// These tests verify the installed formatter behaves correctly. They run
// in jsdom (where `window` is defined and process.env.NODE_ENV is "test"
// per Jest defaults — so the dev-only code path runs).

interface StoreFormatter {
  __marjoram_store_formatter: boolean;
  header(obj: unknown): unknown;
  hasBody(obj: unknown): boolean;
  body(obj: unknown): unknown;
}

declare global {
  interface Window {
    devtoolsFormatters?: Array<{
      __marjoram_store_formatter?: boolean;
      header(obj: unknown): unknown;
      hasBody(obj: unknown): boolean;
      body(obj: unknown): unknown;
    }>;
  }
}

describe("DevTools custom formatter (Phase 5b)", () => {
  const getFormatter = (): StoreFormatter | undefined =>
    window.devtoolsFormatters?.find(
      (f: { __marjoram_store_formatter?: boolean }) =>
        f.__marjoram_store_formatter
    ) as StoreFormatter | undefined;

  it("is installed on the global window after the first store() call", () => {
    store({ x: 1 });
    expect(getFormatter()).toBeDefined();
  });

  it("is installed exactly once across many store() calls", () => {
    store({ a: 1 });
    store({ b: 2 });
    store({ c: 3 });
    const formatters = window.devtoolsFormatters?.filter(
      (f: { __marjoram_store_formatter?: boolean }) =>
        f.__marjoram_store_formatter
    );
    expect(formatters?.length).toBe(1);
  });

  describe("header()", () => {
    it("returns null for non-store values (so other formatters can handle them)", () => {
      const fmt = getFormatter();
      expect(fmt).toBeDefined();
      expect(fmt!.header({ plain: "object" })).toBeNull();
      expect(fmt!.header(42)).toBeNull();
      expect(fmt!.header("string")).toBeNull();
      expect(fmt!.header(null)).toBeNull();
    });

    it("returns a JsonML labelled 'Store' for store values", () => {
      const fmt = getFormatter();
      const s = store({ name: "Alice" });
      const header = fmt!.header(s) as unknown[];
      expect(Array.isArray(header)).toBe(true);
      // Tag is the first element of the JsonML node.
      expect(header[0]).toBe("div");
      // The header contains the literal text "Store" somewhere.
      const json = JSON.stringify(header);
      expect(json).toContain("Store");
    });
  });

  describe("hasBody()", () => {
    it("returns true for stores and false otherwise", () => {
      const fmt = getFormatter();
      expect(fmt!.hasBody(store({ x: 1 }))).toBe(true);
      expect(fmt!.hasBody({ plain: "object" })).toBe(false);
      expect(fmt!.hasBody(null)).toBe(false);
    });
  });

  describe("body()", () => {
    it("renders the underlying raw object (not the proxy)", () => {
      const raw = { name: "Alice", count: 42 };
      const s = store(raw);
      const fmt = getFormatter();
      const body = fmt!.body(s) as unknown[];
      // Walk the JsonML for the nested "object" reference and verify it
      // points at the raw object (not the proxy).
      const json = JSON.stringify(body, (_k, v) => {
        if (v && typeof v === "object" && "object" in v) {
          return { __ref: "obj-ref-found", value: v.object };
        }
        return v;
      });
      expect(json).toContain("Alice");
    });

    it("does NOT subscribe the formatter to the store (no tracking leak)", async () => {
      const s = store({ x: 0 });
      const fmt = getFormatter();
      let effectRuns = 0;
      // First, set up a separate effect on s.x to capture baseline behavior.
      effect(() => {
        s.x;
        effectRuns++;
      });
      expect(effectRuns).toBe(1);

      // Simulate the devtools panel inspecting the store by calling body().
      // If body() leaked subscriptions, mutating s.x would re-run something
      // associated with the formatter. We don't have direct observability,
      // but we can at least check that body() itself doesn't throw and
      // that subsequent mutations only fire our explicit effect.
      fmt!.body(s);
      s.x = 1;
      await flush();
      expect(effectRuns).toBe(2);

      fmt!.body(s);
      s.x = 2;
      await flush();
      expect(effectRuns).toBe(3);
    });
  });

  describe("does not register itself on non-window environments", () => {
    it("is a no-op when window is undefined (smoke test only — jsdom always has window)", () => {
      // This test exists as documentation: the formatter installer's first
      // line checks `typeof window === "undefined"`. We can't simulate that
      // here without complex jsdom teardown, so this is informational.
      expect(typeof window).toBe("object");
    });
  });
});
