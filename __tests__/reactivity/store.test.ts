import {
  store,
  markRaw,
  isStore,
  unwrap,
  effect,
  computed,
  batch,
  untracked,
} from "../../src/reactivity";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe("store() — Phase 2 core", () => {
  describe("basic shape", () => {
    it("creates a store that reads and writes like a plain object", () => {
      const s = store({ count: 0, name: "Alice" });
      expect(s.count).toBe(0);
      expect(s.name).toBe("Alice");
      s.count = 5;
      expect(s.count).toBe(5);
    });

    it("is structurally T (you can pass it where T is expected)", () => {
      interface User {
        name: string;
        age: number;
      }
      const s = store<User>({ name: "Alice", age: 30 });
      // Should type-check as User:
      const u: User = s;
      expect(u.name).toBe("Alice");
    });

    it("returns the same proxy for the same input (idempotent)", () => {
      const raw = { x: 1 };
      const a = store(raw);
      const b = store(raw);
      expect(a).toBe(b);
    });

    it("returns the store itself when called on an existing store", () => {
      const a = store({ x: 1 });
      const b = store(a);
      expect(a).toBe(b);
    });
  });

  describe("identity caching", () => {
    it("nested object access returns the same proxy across reads", () => {
      const s = store({ user: { name: "Alice" } });
      expect(s.user).toBe(s.user);
    });

    it("does not break referential equality of read-back values", () => {
      const s = store({ user: { name: "Alice" } });
      const u1 = s.user;
      const u2 = s.user;
      expect(u1).toBe(u2);
    });

    it("returns a fresh proxy after a subtree is replaced", () => {
      const s = store({ user: { name: "Alice" } as { name: string } });
      const before = s.user;
      s.user = { name: "Bob" };
      const after = s.user;
      expect(after).not.toBe(before);
      expect(after.name).toBe("Bob");
    });
  });

  describe("path-level granularity", () => {
    it("writing one path does not wake subscribers of a sibling path", () => {
      const s = store({ user: { name: "Alice", age: 30 } });
      let nameRuns = 0;
      let ageRuns = 0;
      effect(() => {
        s.user.name;
        nameRuns++;
      });
      effect(() => {
        s.user.age;
        ageRuns++;
      });
      expect(nameRuns).toBe(1);
      expect(ageRuns).toBe(1);

      s.user.name = "Bob";
      return flush().then(() => {
        expect(nameRuns).toBe(2);
        expect(ageRuns).toBe(1);
      });
    });

    it("setting a property to its current value is a no-op", () => {
      const s = store({ x: 1 });
      let runs = 0;
      effect(() => {
        s.x;
        runs++;
      });
      expect(runs).toBe(1);
      s.x = 1;
      return flush().then(() => {
        expect(runs).toBe(1);
      });
    });

    it("writes to a nested path notify only that path's subscribers", () => {
      const s = store({ a: { b: { c: 0 } } });
      let runs = 0;
      effect(() => {
        s.a.b.c;
        runs++;
      });
      expect(runs).toBe(1);
      s.a.b.c = 1;
      return flush().then(() => {
        expect(runs).toBe(2);
      });
    });

    it("subtree-identity subscriber fires only when the subtree is replaced", () => {
      const s = store({ user: { name: "Alice" } as { name: string } });
      let runs = 0;
      effect(() => {
        s.user; // subscribe to user-identity
        runs++;
      });
      expect(runs).toBe(1);

      // Mutating inside the subtree does not change subtree identity.
      s.user.name = "Bob";
      return flush()
        .then(() => {
          expect(runs).toBe(1);

          // Replacing the subtree changes identity, fires the subscriber.
          s.user = { name: "Carol" };
          return flush();
        })
        .then(() => {
          expect(runs).toBe(2);
        });
    });
  });

  describe("reads are free outside reactive contexts", () => {
    it("plain reads do not allocate metadata on the raw object", () => {
      const raw = { user: { name: "Alice" } };
      const s = store(raw);
      // Force several reads outside any tracked context:
      void s.user.name;
      void s.user.name;
      void s.user;

      // No tracking ⇒ no $NODE allocation on the raw root, and no $NODE on
      // the nested user object. We assert by Object.getOwnPropertySymbols.
      const rootSymbols = Object.getOwnPropertySymbols(raw);
      const userSymbols = Object.getOwnPropertySymbols(raw.user);
      // $PROXY may be present (identity cache), but $NODE must NOT be.
      const hasNodeSymbol = (target: object) =>
        Object.getOwnPropertySymbols(target).some(
          s => s.description === "marjoram.node"
        );
      expect(hasNodeSymbol(raw)).toBe(false);
      expect(hasNodeSymbol(raw.user)).toBe(false);
      // Sanity — at least one read happened on each, so $PROXY may exist
      expect(rootSymbols.length + userSymbols.length).toBeGreaterThanOrEqual(0);
    });

    it("a tracked read allocates a single SignalNode for that path", () => {
      const raw = { x: 1 };
      const s = store(raw);
      effect(() => {
        s.x;
      });
      const symbols = Object.getOwnPropertySymbols(raw);
      const nodeSymbol = symbols.find(
        sym => sym.description === "marjoram.node"
      );
      expect(nodeSymbol).toBeDefined();
      const nodes = (raw as unknown as Record<symbol, Record<string, unknown>>)[
        nodeSymbol!
      ];
      expect(Object.keys(nodes)).toContain("x");
    });
  });

  describe("computed integration", () => {
    it("computed values derived from store paths update on write", () => {
      const s = store({ a: 1, b: 2 });
      const sum = computed(() => s.a + s.b);
      expect(sum()).toBe(3);
      s.a = 10;
      expect(sum()).toBe(12);
      s.b = 20;
      expect(sum()).toBe(30);
    });

    it("computed reads of unrelated paths do not invalidate", () => {
      const s = store({ a: 1, b: 2 });
      let derivations = 0;
      const doubled = computed(() => {
        derivations++;
        return s.a * 2;
      });
      expect(doubled()).toBe(2);
      expect(derivations).toBe(1);

      // Writing to `b` should not invalidate doubled (depends only on `a`).
      s.b = 999;
      expect(doubled()).toBe(2);
      expect(derivations).toBe(1);

      // Writing to `a` should invalidate.
      s.a = 5;
      expect(doubled()).toBe(10);
      expect(derivations).toBe(2);
    });
  });

  describe("batch integration", () => {
    it("multiple writes inside batch() produce one effect re-run", async () => {
      const s = store({ a: 1, b: 2 });
      let runs = 0;
      effect(() => {
        s.a;
        s.b;
        runs++;
      });
      expect(runs).toBe(1);

      batch(() => {
        s.a = 10;
        s.b = 20;
      });

      await flush();
      expect(runs).toBe(2); // not 3
    });
  });

  describe("untracked integration", () => {
    it("reads inside untracked() do not create subscriptions", async () => {
      const s = store({ a: 1 });
      let runs = 0;
      effect(() => {
        untracked(() => s.a);
        runs++;
      });
      expect(runs).toBe(1);
      s.a = 999;
      await flush();
      expect(runs).toBe(1); // not 2 — untracked
    });
  });

  describe("key add / delete", () => {
    it("adding a new key notifies iteration subscribers", async () => {
      interface Bag {
        [k: string]: unknown;
      }
      const s = store<Bag>({ x: 1 });
      let keys: string[] = [];
      let runs = 0;
      effect(() => {
        keys = Object.keys(s);
        runs++;
      });
      expect(runs).toBe(1);
      expect(keys).toEqual(["x"]);

      s.y = 2;
      await flush();
      expect(runs).toBe(2);
      expect(keys).toContain("y");
    });

    it("deleting a key notifies iteration subscribers", async () => {
      interface Bag {
        x?: number;
        y?: number;
      }
      const s = store<Bag>({ x: 1, y: 2 });
      let keys: string[] = [];
      let runs = 0;
      effect(() => {
        keys = Object.keys(s);
        runs++;
      });
      expect(runs).toBe(1);
      expect(keys.length).toBe(2);

      delete s.y;
      await flush();
      expect(runs).toBe(2);
      expect(keys).toEqual(["x"]);
    });

    it("setting an existing key to a new value does NOT notify iteration subscribers", async () => {
      const s = store({ x: 1, y: 2 });
      let runs = 0;
      effect(() => {
        Object.keys(s);
        runs++;
      });
      expect(runs).toBe(1);

      s.x = 5; // existing key, not a new key
      await flush();
      expect(runs).toBe(1);
    });
  });

  describe("markRaw", () => {
    it("prevents an object from being proxied inside a store", () => {
      const raw = { nested: { secret: 42 } };
      markRaw(raw);
      const s = store({ payload: raw });
      // The raw object passes through identity-preserved:
      expect(s.payload).toBe(raw);
      // It is not a store:
      expect(isStore(s.payload)).toBe(false);
    });

    it("mutations to a markRaw'd object do not notify the store", async () => {
      const raw = { value: 1 };
      markRaw(raw);
      const s = store({ payload: raw });
      let runs = 0;
      effect(() => {
        s.payload.value;
        runs++;
      });
      expect(runs).toBe(1);
      raw.value = 2;
      await flush();
      expect(runs).toBe(1); // not 2 — raw mutations bypass reactivity
    });
  });

  describe("isStore", () => {
    it("returns true for stores", () => {
      const s = store({ x: 1 });
      expect(isStore(s)).toBe(true);
    });

    it("returns true for nested store accesses", () => {
      const s = store({ user: { name: "Alice" } });
      expect(isStore(s.user)).toBe(true);
    });

    it("returns false for plain objects", () => {
      expect(isStore({ x: 1 })).toBe(false);
    });

    it("returns false for primitives, null, undefined", () => {
      expect(isStore(null)).toBe(false);
      expect(isStore(undefined)).toBe(false);
      expect(isStore(42)).toBe(false);
      expect(isStore("string")).toBe(false);
      expect(isStore(true)).toBe(false);
    });

    it("returns false for class instances", () => {
      class C {
        x = 1;
      }
      expect(isStore(new C())).toBe(false);
    });
  });

  describe("unwrap", () => {
    it("returns the underlying raw object", () => {
      const raw = { x: 1, nested: { y: 2 } };
      const s = store(raw);
      expect(unwrap(s)).toBe(raw);
    });

    it("returns the value as-is when given a non-store", () => {
      const plain = { x: 1 };
      expect(unwrap(plain)).toBe(plain);
    });

    it("mutations to unwrapped raw do NOT notify subscribers", async () => {
      const raw = { x: 1 };
      const s = store(raw);
      let runs = 0;
      effect(() => {
        s.x;
        runs++;
      });
      expect(runs).toBe(1);

      // Mutate via raw, bypassing the proxy.
      const r = unwrap(s);
      r.x = 999;
      await flush();
      expect(runs).toBe(1); // intentional — documented behavior
    });
  });

  describe("boundary rules — built-ins pass through", () => {
    it("Date instances are not proxied", () => {
      const d = new Date();
      const s = store({ when: d });
      expect(s.when).toBe(d); // identity preserved
      expect(isStore(s.when)).toBe(false);
    });

    it("class instances are not proxied", () => {
      class Widget {
        name = "x";
      }
      const w = new Widget();
      const s = store({ w });
      expect(s.w).toBe(w);
      expect(isStore(s.w)).toBe(false);
    });

    it("frozen objects pass through unproxied", () => {
      const frozen = Object.freeze({ x: 1 });
      const s = store({ payload: frozen });
      expect(s.payload).toBe(frozen);
      expect(isStore(s.payload)).toBe(false);
    });

    it("Map and Set pass through unproxied", () => {
      const m = new Map();
      const st = new Set();
      const s = store({ m, st });
      expect(s.m).toBe(m);
      expect(s.st).toBe(st);
    });
  });

  describe("does not break existing primitives", () => {
    it("signal, computed, effect, batch, untracked still work unchanged", async () => {
      // This test exists to lock the non-breaking-change rule for Phase 2.
      // If it ever fails after edits to store.ts or signal.ts, the change
      // probably regressed existing behavior.
      const { signal: sig } = await import("../../src/reactivity");
      const a = sig(1);
      let runs = 0;
      effect(() => {
        a();
        runs++;
      });
      expect(runs).toBe(1);
      a.set(2);
      await flush();
      expect(runs).toBe(2);
    });
  });
});
