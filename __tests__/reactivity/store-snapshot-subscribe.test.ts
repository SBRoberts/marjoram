import {
  store,
  markRaw,
  snapshot,
  subscribe,
  effect,
} from "../../src/reactivity";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe("snapshot() (Phase 5a)", () => {
  describe("basic semantics", () => {
    it("returns a deep plain-object copy", () => {
      const s = store({ user: { name: "Alice", age: 30 }, count: 5 });
      const snap = snapshot(s);
      expect(snap).toEqual({ user: { name: "Alice", age: 30 }, count: 5 });
    });

    it("the snapshot is structurally T but is not a store", () => {
      const s = store({ x: 1 });
      const snap = snapshot(s);
      expect(snap.x).toBe(1);
      // It's a plain object, not a proxy.
      expect(Object.getPrototypeOf(snap)).toBe(Object.prototype);
    });

    it("is safe to JSON.stringify (round-trips)", () => {
      const s = store({ user: { name: "Alice" }, ids: [1, 2, 3] });
      const json = JSON.stringify(snapshot(s));
      expect(JSON.parse(json)).toEqual({
        user: { name: "Alice" },
        ids: [1, 2, 3],
      });
    });

    it("arrays are deep-copied", () => {
      const s = store({ list: [{ x: 1 }, { x: 2 }] });
      const snap = snapshot(s);
      expect(snap.list).not.toBe(s.list);
      expect(snap.list[0]).not.toBe(s.list[0]);
      expect(snap.list).toEqual([{ x: 1 }, { x: 2 }]);
    });
  });

  describe("does not subscribe", () => {
    it("snapshot inside an effect does NOT cause re-runs on store mutations", async () => {
      const s = store({ name: "Alice" });
      let runs = 0;
      effect(() => {
        snapshot(s);
        runs++;
      });
      expect(runs).toBe(1);

      s.name = "Bob";
      await flush();
      expect(runs).toBe(1);
    });
  });

  describe("boundary rules", () => {
    it("Date / Map / Set / class instances pass through by reference", () => {
      class Widget {
        n = 1;
      }
      const date = new Date();
      const map = new Map();
      const set = new Set();
      const widget = new Widget();
      const s = store({ date, map, set, widget });
      const snap = snapshot(s);
      expect(snap.date).toBe(date);
      expect(snap.map).toBe(map);
      expect(snap.set).toBe(set);
      expect(snap.widget).toBe(widget);
    });

    it("markRaw'd values pass through by reference", () => {
      const blob = markRaw({ deeply: { nested: { value: 42 } } });
      const s = store({ payload: blob });
      const snap = snapshot(s);
      expect(snap.payload).toBe(blob);
    });
  });

  describe("cycles", () => {
    it("handles cyclic data without stack-overflowing", () => {
      interface Node {
        name: string;
        self?: Node;
      }
      const raw: Node = { name: "root" };
      raw.self = raw;
      const s = store(raw);
      // Should not throw.
      const snap = snapshot(s);
      expect(snap.name).toBe("root");
      expect(snap.self).toBe(snap); // cycle preserved in the snapshot
    });
  });
});

describe("subscribe() (Phase 5a)", () => {
  describe("path subscriptions", () => {
    it("fires on changes to the exact path", async () => {
      const s = store({ user: { name: "Alice", age: 30 } });
      const events: Array<[string | undefined, string | undefined]> = [];
      const off = subscribe(s, "user.name", (next, prev) => {
        events.push([next, prev]);
      });

      s.user.name = "Bob";
      await flush();
      expect(events).toEqual([["Bob", "Alice"]]);

      s.user.name = "Carol";
      await flush();
      expect(events).toEqual([
        ["Bob", "Alice"],
        ["Carol", "Bob"],
      ]);
      off();
    });

    it("does NOT fire on unrelated path changes", async () => {
      const s = store({ user: { name: "Alice", age: 30 } });
      let fired = 0;
      const off = subscribe(s, "user.name", () => {
        fired++;
      });

      s.user.age = 31;
      await flush();
      expect(fired).toBe(0);
      off();
    });

    it("works for deeply-nested paths", async () => {
      interface State {
        data: { user: { profile: { city: string } } };
      }
      const s = store<State>({ data: { user: { profile: { city: "NYC" } } } });
      let received: unknown = null;
      const off = subscribe(s, "data.user.profile.city", next => {
        received = next;
      });

      s.data.user.profile.city = "SF";
      await flush();
      expect(received).toBe("SF");
      off();
    });

    it("array index paths work (e.g. 'items.0.x')", async () => {
      interface State {
        items: Array<{ x: number }>;
      }
      const s = store<State>({ items: [{ x: 1 }, { x: 2 }] });
      let received: unknown = null;
      const off = subscribe(s, "items.0.x", next => {
        received = next;
      });

      s.items[0].x = 99;
      await flush();
      expect(received).toBe(99);
      off();
    });
  });

  describe('whole-store subscription via path=""', () => {
    it("fires on any mutation anywhere in the store", async () => {
      const s = store({ user: { name: "Alice" }, count: 0 });
      const events: number[] = [];
      const off = subscribe(s, "", () => {
        events.push(events.length);
      });

      s.user.name = "Bob";
      await flush();
      s.count = 5;
      await flush();
      expect(events.length).toBe(2);
      off();
    });

    it("receives whole-store snapshot values", async () => {
      const s = store({ count: 0 });
      let snap: { count: number } | null = null;
      const off = subscribe(s, "", next => {
        snap = next;
      });

      s.count = 42;
      await flush();
      expect(snap).toEqual({ count: 42 });
      // Snapshots are plain objects, not proxies
      expect(Object.getPrototypeOf(snap!)).toBe(Object.prototype);
      off();
    });
  });

  describe("unsubscribe", () => {
    it("the returned dispose function stops further callbacks", async () => {
      const s = store({ x: 0 });
      let fired = 0;
      const off = subscribe(s, "x", () => {
        fired++;
      });

      s.x = 1;
      await flush();
      expect(fired).toBe(1);

      off();
      s.x = 2;
      await flush();
      expect(fired).toBe(1);
    });
  });

  describe("type safety (compile-time)", () => {
    it("typed path narrows callback's value parameter", () => {
      const s = store({ user: { name: "Alice", age: 30 } });
      subscribe(s, "user.name", next => {
        // TS should narrow `next` to string at this line.
        const x: string = next;
        expect(typeof x).toBe("string");
      });
      subscribe(s, "user.age", next => {
        const x: number = next;
        expect(typeof x).toBe("number");
      });
      // Invalid path would be a type error at the call site (see ts-expect-error
      // assertions in dedicated type tests if added later).
    });
  });
});
