// Comprehensive edge-case coverage for store(). These tests probe corners
// most production reactive libraries get wrong: cycles, key deletion,
// subtree replacement, frozen objects, Symbol keys, accessor descriptors,
// very deep trees, prototype-pollution attempts, and disposal semantics.

import {
  store,
  effect,
  computed,
  signal,
  unwrap,
  isStore,
  markRaw,
} from "../../src/reactivity";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe("store() — edge cases (Phase 6)", () => {
  // -------------------------------------------------------------------------
  // Cycles in store data
  // -------------------------------------------------------------------------
  describe("cycles", () => {
    it("self-cycle: state.self = state does not stack-overflow on read", () => {
      interface Node {
        name: string;
        self?: Node;
      }
      const raw: Node = { name: "root" };
      raw.self = raw;
      const s = store(raw);
      expect(s.name).toBe("root");
      expect(s.self).toBeDefined();
      // Reading through the cycle is the same proxy at every level.
      expect(s.self).toBe(s);
      expect(s.self!.self).toBe(s);
    });

    it("two-node cycle: a→b→a — mutations on the cycle are granular", async () => {
      interface Node {
        name: string;
        peer?: Node;
      }
      const a: Node = { name: "a" };
      const b: Node = { name: "b" };
      a.peer = b;
      b.peer = a;
      const s = store(a);
      expect(s.peer!.name).toBe("b");
      expect(s.peer!.peer).toBe(s);

      let runs = 0;
      effect(() => {
        s.peer!.name;
        runs++;
      });
      expect(runs).toBe(1);
      s.peer!.name = "B";
      await flush();
      expect(runs).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  // Key deletion semantics
  // -------------------------------------------------------------------------
  describe("deletion", () => {
    it("delete state.k notifies subscribers of that key", async () => {
      const s = store<{ a?: number; b?: number }>({ a: 1, b: 2 });
      let runs = 0;
      effect(() => {
        s.a;
        runs++;
      });
      expect(runs).toBe(1);

      delete s.a;
      await flush();
      expect(runs).toBe(2);
      expect(s.a).toBeUndefined();
    });

    it("delete also wakes iteration subscribers", async () => {
      const s = store<Record<string, number>>({ a: 1, b: 2, c: 3 });
      let iterations = 0;
      let lastKeys: string[] = [];
      effect(() => {
        lastKeys = Object.keys(s);
        iterations++;
      });
      expect(iterations).toBe(1);
      expect(lastKeys).toEqual(["a", "b", "c"]);

      delete s.b;
      await flush();
      expect(iterations).toBe(2);
      expect(lastKeys).toEqual(["a", "c"]);
    });

    it("delete of a non-existent key is a no-op", async () => {
      const s = store<{ a?: number }>({ a: 1 });
      let runs = 0;
      effect(() => {
        s.a;
        runs++;
      });
      expect(runs).toBe(1);
      delete (s as { b?: number }).b;
      await flush();
      expect(runs).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // Subtree replacement
  // -------------------------------------------------------------------------
  describe("subtree replacement", () => {
    it("state.subtree = newObj wakes existing leaf subscribers via re-tracking", async () => {
      const s = store({ user: { name: "Alice" } as { name: string } });
      let runs = 0;
      let observed = "";
      effect(() => {
        observed = s.user.name;
        runs++;
      });
      expect(runs).toBe(1);
      expect(observed).toBe("Alice");

      s.user = { name: "Carol" };
      await flush();
      expect(runs).toBe(2);
      expect(observed).toBe("Carol");
    });

    it("replacing a subtree with the same structural data still re-runs effects (reference identity matters)", async () => {
      const s = store({ user: { name: "Alice" } as { name: string } });
      let runs = 0;
      effect(() => {
        s.user;
        runs++;
      });
      expect(runs).toBe(1);
      s.user = { name: "Alice" }; // new object, same structure
      await flush();
      expect(runs).toBe(2);
    });

    it("nested store: store(...) returned object stays reactive after being placed inside a parent store", async () => {
      const inner = store({ count: 0 });
      const outer = store({ child: inner });
      let runs = 0;
      effect(() => {
        outer.child.count;
        runs++;
      });
      expect(runs).toBe(1);
      inner.count = 5;
      await flush();
      expect(runs).toBe(2);
      // And through the outer path:
      outer.child.count = 10;
      await flush();
      expect(runs).toBe(3);
      expect(inner.count).toBe(10);
    });
  });

  // -------------------------------------------------------------------------
  // Frozen objects
  // -------------------------------------------------------------------------
  describe("frozen objects", () => {
    it("Object.freeze'd nested object passes through unproxied", () => {
      const frozen = Object.freeze({ x: 1 });
      const s = store({ payload: frozen });
      expect(s.payload).toBe(frozen);
      expect(isStore(s.payload)).toBe(false);
    });

    it("Object.freeze'd root passes through unproxied (returned as-is)", () => {
      const raw = Object.freeze({ x: 1 });
      const s = store(raw);
      expect(s).toBe(raw);
      expect(isStore(s)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Symbol keys
  // -------------------------------------------------------------------------
  describe("Symbol keys in store data", () => {
    it("symbol-keyed reads return the value but do not register tracking", async () => {
      const SYM = Symbol("user-defined");
      const s = store<Record<string | symbol, unknown>>({
        [SYM]: "secret",
        normal: 1,
      });
      expect(s[SYM]).toBe("secret");

      // Reading a symbol key inside an effect should NOT subscribe — we
      // deliberately skip path tracking for symbols (private to library).
      let runs = 0;
      effect(() => {
        void s[SYM];
        runs++;
      });
      expect(runs).toBe(1);
      (s as Record<symbol, unknown>)[SYM] = "changed";
      await flush();
      expect(runs).toBe(1); // unchanged — symbols don't track
    });
  });

  // -------------------------------------------------------------------------
  // Getters / accessor descriptors on the source object
  // -------------------------------------------------------------------------
  describe("getters and accessor descriptors", () => {
    it("getter on the raw object is invoked through the proxy", () => {
      const raw = {
        _x: 5,
        get x() {
          return this._x * 2;
        },
      };
      const s = store(raw);
      expect(s.x).toBe(10);
    });

    it("mutating the underlying field that a getter depends on tracks the field, not the getter", async () => {
      // The getter accesses `this._x`. Through the proxy, `this` is the proxy,
      // so the getter's internal read tracks `_x`. Effects depending on the
      // getter result re-run when `_x` changes.
      const raw = {
        _x: 5,
        get x() {
          return this._x * 2;
        },
      };
      const s = store(raw);
      let observed = 0;
      let runs = 0;
      effect(() => {
        observed = s.x;
        runs++;
      });
      expect(runs).toBe(1);
      expect(observed).toBe(10);

      s._x = 7;
      await flush();
      expect(runs).toBe(2);
      expect(observed).toBe(14);
    });
  });

  // -------------------------------------------------------------------------
  // Very deep trees (stack safety)
  // -------------------------------------------------------------------------
  describe("deep trees", () => {
    it("100-level deep object can be read and written without stack overflow", async () => {
      // Build { a: { a: { a: ... { a: 42 } } } } 100 levels deep
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let inner: any = { value: 42 };
      for (let i = 0; i < 100; i++) {
        inner = { a: inner };
      }
      const s = store(inner);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let cursor: any = s;
      for (let i = 0; i < 100; i++) {
        cursor = cursor.a;
      }
      expect(cursor.value).toBe(42);

      let runs = 0;
      effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let c: any = s;
        for (let i = 0; i < 100; i++) c = c.a;
        c.value;
        runs++;
      });
      expect(runs).toBe(1);

      // Mutate the deep leaf — effect should re-run.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let c: any = s;
      for (let i = 0; i < 100; i++) c = c.a;
      c.value = 99;
      await flush();
      expect(runs).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  // Prototype pollution attempts
  // -------------------------------------------------------------------------
  describe("prototype pollution safety", () => {
    it("setting __proto__ via the proxy does NOT pollute Object.prototype", () => {
      const s = store<Record<string, unknown>>({ x: 1 });
      // Attempt to pollute. Strict-mode in test would throw on Object.prototype,
      // but the proxy may accept and write to a local __proto__ key.
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s as any).__proto__ = { polluted: true };
      } catch {
        // some engines throw, fine
      }
      // Any other plain object should NOT have `polluted`.
      const safe: Record<string, unknown> = {};
      expect(safe.polluted).toBeUndefined();
    });

    it("Object.prototype is not extended via store writes", () => {
      const s = store<Record<string, unknown>>({});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s as any).safelyAdded = "ok";
      expect(s.safelyAdded).toBe("ok");
      // Other plain objects don't inherit `safelyAdded`
      expect(({} as Record<string, unknown>).safelyAdded).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Disposal / no-tracking semantics
  // -------------------------------------------------------------------------
  describe("disposal & no-tracking guarantees", () => {
    it("an effect disposed via its return value stops re-running", async () => {
      const s = store({ x: 0 });
      let runs = 0;
      const dispose = effect(() => {
        s.x;
        runs++;
      });
      expect(runs).toBe(1);
      s.x = 1;
      await flush();
      expect(runs).toBe(2);

      dispose();
      s.x = 2;
      await flush();
      expect(runs).toBe(2); // no further runs
    });

    it("a computed disposed via its return stops being notified", async () => {
      const s = store({ x: 1 });
      let recomputes = 0;
      const c = computed(() => {
        recomputes++;
        return s.x * 2;
      });
      expect(c()).toBe(2);
      expect(recomputes).toBe(1);

      // Recompute on read after change
      s.x = 5;
      expect(c()).toBe(10);
      expect(recomputes).toBe(2);

      c.dispose();
      s.x = 99;
      await flush();
      // After dispose, the computed is detached from sources; reading still
      // works (returns last value) but no more recomputes happen.
      expect(recomputes).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  // Composition with signals
  // -------------------------------------------------------------------------
  describe("composition with signal()", () => {
    it("a computed reading both a signal and a store path stays correct under both kinds of changes", async () => {
      const s = store({ x: 10 });
      const offset = signal(1);
      const total = computed(() => s.x + offset());
      expect(total()).toBe(11);

      s.x = 20;
      expect(total()).toBe(21);

      offset.set(100);
      expect(total()).toBe(120);

      s.x = 0;
      offset.set(0);
      expect(total()).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // markRaw edge cases
  // -------------------------------------------------------------------------
  describe("markRaw edge cases", () => {
    it("markRaw an array — mutations to the array are invisible", async () => {
      const arr = markRaw([1, 2, 3]);
      const s = store({ list: arr });
      let runs = 0;
      effect(() => {
        s.list;
        runs++;
      });
      expect(runs).toBe(1);
      arr.push(4);
      await flush();
      expect(runs).toBe(1);
    });

    it("markRaw is idempotent (calling twice has no extra effect)", () => {
      const o = { x: 1 };
      const a = markRaw(o);
      const b = markRaw(o);
      expect(a).toBe(o);
      expect(b).toBe(o);
    });
  });

  // -------------------------------------------------------------------------
  // unwrap edge cases
  // -------------------------------------------------------------------------
  describe("unwrap edge cases", () => {
    it("unwrap of a nested store proxy returns the inner raw object", () => {
      const s = store({ user: { name: "Alice" } });
      const userRaw = unwrap(s.user);
      expect(userRaw).toEqual({ name: "Alice" });
      // Mutating raw bypasses reactivity (documented behavior).
    });

    it("unwrap of a non-object value returns it unchanged", () => {
      // unwrap signature accepts Store<T>|T; calling with a plain primitive
      // via type assertion should also work gracefully via the runtime check.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(unwrap("hello" as any)).toBe("hello");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(unwrap(42 as any)).toBe(42);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(unwrap(null as any)).toBe(null);
    });
  });
});
