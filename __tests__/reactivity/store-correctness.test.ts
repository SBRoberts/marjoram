// Correctness fixes from the pre-v1.1.0 review (Phase 7.5b):
// 1. Replacing a store-valued vm prop keeps path-bindings live.
// 2. Path<T> includes array "length".
// 3. arr.length = N direct writes notify removed-index + iteration subscribers.
// 4. Subtree replacement re-runs dependents (via parent-path notification).
// 5. Per-path SignalNode GC on key deletion (no $NODE map growth).

import {
  store,
  subscribe,
  effect,
  type Path,
  type PathValue,
} from "../../src/reactivity";
import { useViewModel } from "../../src";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));
const flushTwice = async () => {
  await flush();
  await flush();
};

const NODE_SYM_DESC = "marjoram.node";
function nodeMapKeys(raw: object): string[] {
  const sym = Object.getOwnPropertySymbols(raw).find(
    s => s.description === NODE_SYM_DESC
  );
  if (!sym) return [];
  const nodes = (raw as Record<symbol, object>)[sym];
  return Object.keys(nodes);
}

describe("store() correctness fixes (Phase 7.5b)", () => {
  describe("1. replacing a store-valued vm prop keeps path-bindings live", () => {
    it("vm.$user.name still updates after vm.user is reassigned to a new store", async () => {
      const vm = useViewModel({
        user: store({ name: "Alice" }),
      });
      const nameProp = vm.$user.name;
      expect(nameProp.value).toBe("Alice");

      // Reassign the whole store value.
      vm.user = store({ name: "Bob" });
      await flushTwice();
      // The path-binding must reflect the new store, not go stale.
      expect(nameProp.value).toBe("Bob");

      // And further mutations of the NEW store propagate.
      vm.user.name = "Carol";
      await flushTwice();
      expect(nameProp.value).toBe("Carol");
    });
  });

  describe("2. Path<T> includes array length", () => {
    it("'length' is a valid path on an array branch (compile-time)", () => {
      interface Schema {
        todos: Array<{ id: number }>;
      }
      const p: Path<Schema> = "todos.length";
      void p;
      // PathValue resolves to number.
      const n: PathValue<Schema, "todos.length"> = 3;
      expect(n).toBe(3);
    });

    it("subscribe(state, 'arr.length', cb) type-checks and fires", async () => {
      const s = store({ arr: [1, 2, 3] });
      let received: number | undefined;
      const off = subscribe(s, "arr.length", next => {
        received = next as number;
      });
      s.arr.push(4);
      await flush();
      expect(received).toBe(4);
      off();
    });
  });

  describe("3. arr.length = N direct writes", () => {
    it("truncation notifies subscribers of removed indices", async () => {
      const s = store({ arr: [10, 20, 30, 40] });
      let idx3Runs = 0;
      effect(() => {
        s.arr[3];
        idx3Runs++;
      });
      expect(idx3Runs).toBe(1);

      s.arr.length = 2; // removes indices 2 and 3
      await flush();
      expect(idx3Runs).toBe(2); // index-3 subscriber re-ran
      expect(s.arr).toEqual([10, 20]);
    });

    it("truncation notifies length + iteration subscribers", async () => {
      const s = store({ arr: [1, 2, 3] });
      let lenRuns = 0;
      let iterRuns = 0;
      effect(() => {
        s.arr.length;
        lenRuns++;
      });
      effect(() => {
        s.arr.forEach(() => {});
        iterRuns++;
      });
      expect(lenRuns).toBe(1);
      expect(iterRuns).toBe(1);

      s.arr.length = 1;
      await flush();
      expect(lenRuns).toBe(2);
      expect(iterRuns).toBe(2);
    });

    it("growth notifies iteration subscribers", async () => {
      const s = store({ arr: [1, 2] });
      let iterRuns = 0;
      effect(() => {
        s.arr.forEach(() => {});
        iterRuns++;
      });
      expect(iterRuns).toBe(1);
      s.arr.length = 5;
      await flush();
      expect(iterRuns).toBe(2);
      expect(s.arr.length).toBe(5);
    });
  });

  describe("4. subtree replacement re-runs dependents", () => {
    it("replacing a subtree fires effects reading through the parent path", async () => {
      const s = store({ user: { name: "Alice" } as { name: string } });
      let observed = "";
      effect(() => {
        observed = s.user.name;
      });
      expect(observed).toBe("Alice");
      s.user = { name: "Bob" };
      await flush();
      expect(observed).toBe("Bob");
    });

    it("a key that disappears after replacement reads back undefined", async () => {
      interface User {
        name: string;
        nickname?: string;
      }
      const s = store<{ user: User }>({
        user: { name: "Alice", nickname: "Al" },
      });
      let nick: string | undefined = "init";
      effect(() => {
        nick = s.user.nickname;
      });
      expect(nick).toBe("Al");
      s.user = { name: "Bob" }; // no nickname
      await flush();
      expect(nick).toBeUndefined();
    });
  });

  describe("5. per-path SignalNode GC", () => {
    it("deleting a key drops its node when no active subscriber re-reads it", async () => {
      const raw: Record<string, number> = { a: 1, b: 2 };
      const s = store(raw);
      // Track both keys, then dispose so nothing re-reads after deletion.
      const dispose = effect(() => {
        s.a;
        s.b;
      });
      expect(nodeMapKeys(raw).sort()).toEqual(["a", "b"]);
      dispose();

      delete s.a;
      await flush();
      // Node for "a" is dropped — no active reader re-creates it.
      expect(nodeMapKeys(raw)).not.toContain("a");
    });

    it("a still-active subscriber legitimately re-creates the node after delete (correct, not a leak)", async () => {
      const raw: Record<string, number | undefined> = { a: 1 };
      const s = store(raw);
      let runs = 0;
      effect(() => {
        s.a; // keeps reading "a" even after it's deleted
        runs++;
      });
      delete s.a;
      await flush();
      // The effect re-ran (observing undefined) and re-subscribed — so the
      // node correctly exists again. This is desired: an active dependency
      // must keep its node.
      expect(runs).toBe(2);
      expect(nodeMapKeys(raw)).toContain("a");
    });

    it("churning keys do not grow the node map without bound", async () => {
      const raw: Record<string, number> = {};
      const s = store(raw);
      // Add + delete 1000 distinct keys.
      for (let i = 0; i < 1000; i++) {
        s[`k${i}`] = i;
        delete s[`k${i}`];
      }
      // The $NODE map should not retain 1000 dead keys. (May retain $KEYS
      // sentinel and any currently-live keys, but not the churned ones.)
      const remaining = nodeMapKeys(raw).filter(k => k.startsWith("k"));
      expect(remaining.length).toBe(0);
    });

    it("re-adding a deleted key still tracks correctly", async () => {
      const s = store<{ a?: number }>({ a: 1 });
      let runs = 0;
      effect(() => {
        s.a;
        runs++;
      });
      expect(runs).toBe(1);

      delete s.a;
      await flush();
      expect(runs).toBe(2);

      s.a = 99;
      await flush();
      expect(runs).toBe(3); // re-subscribed to the fresh node
      expect(s.a).toBe(99);
    });
  });
});
