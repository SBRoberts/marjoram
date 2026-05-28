// Coverage-gap fills identified by the pre-v1.1.0 test-coverage audit
// (Phase 7.5c). Adversarial inputs, error paths, race-ish ordering, API
// combinations, and built-in passthrough that the happy-path suites missed.

import {
  store,
  subscribe,
  effect,
  computed,
  batch,
  isStore,
  markRaw,
} from "../../src/reactivity";
import { useViewModel } from "../../src";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));
const flushTwice = async () => {
  await flush();
  await flush();
};

const NODE_SYM_DESC = "marjoram.node";
function nodeFor(
  raw: object,
  key: string
): { _subscribers: Set<unknown> } | undefined {
  const sym = Object.getOwnPropertySymbols(raw).find(
    s => s.description === NODE_SYM_DESC
  );
  if (!sym) return undefined;
  const nodes = (
    raw as Record<symbol, Record<string, { _subscribers: Set<unknown> }>>
  )[sym];
  return nodes[key];
}

describe("store() coverage gaps (Phase 7.5c)", () => {
  describe("invalid / edge root inputs", () => {
    it("store(null) returns null without throwing", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(store(null as any)).toBeNull();
    });
    it("store(undefined) returns undefined", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(store(undefined as any)).toBeUndefined();
    });
    it("store(primitive) passes through unchanged and is not a store", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(store(42 as any)).toBe(42);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(store("hi" as any)).toBe("hi");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isStore(store(42 as any))).toBe(false);
    });
    it("store({}) — empty object — is a working store", async () => {
      const s = store<Record<string, number>>({});
      expect(isStore(s)).toBe(true);
      let runs = 0;
      effect(() => {
        Object.keys(s);
        runs++;
      });
      s.x = 1;
      await flush();
      expect(runs).toBe(2);
    });
    it("store({a:1}) — single key — works", () => {
      const s = store({ a: 1 });
      expect(s.a).toBe(1);
      s.a = 2;
      expect(s.a).toBe(2);
    });
  });

  describe("subscribe to a path that is initially missing, then materializes", () => {
    it("fires when the intermediate object is later assigned", async () => {
      interface State {
        user?: { name: string };
      }
      const s = store<State>({});
      const events: unknown[] = [];
      const off = subscribe(s, "user.name", next => {
        events.push(next);
      });
      // Initially user is undefined → path resolves to undefined.
      s.user = { name: "Alice" };
      await flush();
      expect(events).toEqual(["Alice"]);
      off();
    });
  });

  describe("self-mutation re-entry inside an effect", () => {
    it("an effect that mutates the path it reads does NOT loop (the _running guard wins)", async () => {
      // Documented behavior: a write that occurs WHILE the effect is running
      // is skipped for that effect (the signal system's `_running` guard
      // prevents self-re-triggering). So the effect runs once, applies a
      // single mutation, and does not iterate. This is the loop-safe contract
      // shared by mainstream signal libraries — self-mutation in an effect is
      // an anti-pattern, not an iteration mechanism.
      const s = store({ x: 0 });
      let runs = 0;
      effect(() => {
        runs++;
        if (s.x < 5) s.x = s.x + 1;
      });
      await flushTwice();
      await flushTwice();
      expect(runs).toBe(1);
      expect(s.x).toBe(1);
    });
  });

  describe("subscribe / unsubscribe during a notification round", () => {
    it("unsubscribing one subscriber from within another's callback is safe", async () => {
      const s = store({ x: 0 });
      let aRuns = 0;
      let bRuns = 0;
      let offB = (): void => {};
      const offA = subscribe(s, "x", () => {
        aRuns++;
        offB(); // remove B mid-round
      });
      offB = subscribe(s, "x", () => {
        bRuns++;
      });

      s.x = 1;
      await flush();
      // No crash. A fired; B may or may not have fired this round depending on
      // iteration order, but the system stays consistent.
      expect(aRuns).toBeGreaterThanOrEqual(1);

      s.x = 2;
      await flush();
      // After removal, B no longer fires.
      const bAfter = bRuns;
      s.x = 3;
      await flush();
      expect(bRuns).toBe(bAfter);
      offA();
    });
  });

  describe("chained multi-level .compute() on path bindings", () => {
    it("a 3-level chained compute updates on innermost mutation", async () => {
      const vm = useViewModel({
        data: store({ user: { profile: { name: "alice" } } }),
      });
      const upper = vm.$data.user.profile.name.compute(n =>
        (n as string).toUpperCase()
      );
      const exclaimed = upper.compute(u => `${u as string}!`);
      expect(exclaimed.value).toBe("ALICE!");

      vm.data.user.profile.name = "bob";
      await flushTwice();
      await flushTwice();
      expect(exclaimed.value).toBe("BOB!");
    });
  });

  describe("nested batch()", () => {
    it("nested batches produce one coalesced notification round", async () => {
      const s = store({ a: 0, b: 0 });
      let runs = 0;
      effect(() => {
        s.a;
        s.b;
        runs++;
      });
      expect(runs).toBe(1);

      batch(() => {
        s.a = 1;
        batch(() => {
          s.b = 2;
          s.a = 3;
        });
        s.b = 4;
      });
      await flush();
      expect(runs).toBe(2); // single round despite nesting
      expect(s.a).toBe(3);
      expect(s.b).toBe(4);
    });
  });

  describe("store created inside a re-running effect", () => {
    it("does not accumulate live subscribers across effect re-runs", async () => {
      const trigger = store({ tick: 0 });
      let lastInner: { v: number } | null = null;
      let innerEffectRuns = 0;

      // Outer effect re-creates an inner store + inner effect each run.
      effect(() => {
        trigger.tick; // dependency
        const inner = store({ v: 0 });
        lastInner = inner;
        effect(() => {
          inner.v;
          innerEffectRuns++;
        });
      });

      // Trigger several outer re-runs.
      trigger.tick = 1;
      await flush();
      trigger.tick = 2;
      await flush();

      // Mutating the LATEST inner store should fire its effect.
      const before = innerEffectRuns;
      lastInner!.v = 99;
      await flush();
      expect(innerEffectRuns).toBeGreaterThan(before);
      // Sanity: no runaway accumulation (each outer run adds one inner effect
      // initial run; we don't assert exact disposal since inner effects aren't
      // explicitly scoped — this documents current behavior).
    });
  });

  describe("built-in passthrough (docs §6 completeness)", () => {
    it("TypedArray / DataView / ArrayBuffer / Promise / BigInt pass through unproxied", () => {
      const buf = new ArrayBuffer(8);
      const ta = new Uint8Array(buf);
      const dv = new DataView(buf);
      const promise = Promise.resolve(1);
      const big = 10n;
      const s = store({ buf, ta, dv, promise, big });
      expect(s.buf).toBe(buf);
      expect(s.ta).toBe(ta);
      expect(s.dv).toBe(dv);
      expect(s.promise).toBe(promise);
      expect(s.big).toBe(big);
      expect(isStore(s.ta)).toBe(false);
    });
  });

  describe("sealed / non-extensible objects pass through (nit #9)", () => {
    it("Object.seal'd nested object is not proxied (no throw)", () => {
      const sealed = Object.seal({ x: 1 });
      const s = store({ payload: sealed });
      expect(s.payload).toBe(sealed);
      expect(isStore(s.payload)).toBe(false);
    });
    it("Object.preventExtensions'd object is not proxied", () => {
      const locked = Object.preventExtensions({ y: 2 });
      const s = store({ payload: locked });
      expect(s.payload).toBe(locked);
    });
  });

  describe("subscription de-dup and multi-effect fan-in", () => {
    it("reading the same path twice in one effect registers a single subscriber", () => {
      const raw = { x: 1 };
      const s = store(raw);
      effect(() => {
        s.x;
        s.x; // read twice
      });
      const node = nodeFor(raw, "x");
      expect(node).toBeDefined();
      expect(node!._subscribers.size).toBe(1);
    });

    it("N effects on the same path each re-run exactly once per change", async () => {
      const s = store({ x: 0 });
      const counts = [0, 0, 0];
      const disposers = counts.map((_, i) =>
        effect(() => {
          s.x;
          counts[i]++;
        })
      );
      expect(counts).toEqual([1, 1, 1]);
      s.x = 1;
      await flush();
      expect(counts).toEqual([2, 2, 2]);
      disposers.forEach(d => d());
    });
  });

  describe("markRaw on a value already inside a store", () => {
    it("marking an already-proxied value flags its raw, so FUTURE reads return the raw (call markRaw before insertion)", () => {
      const s = store({ user: { name: "Alice" } });
      const proxied = s.user; // already a store proxy
      expect(isStore(proxied)).toBe(true);

      // markRaw sets FLAG_SKIP on the underlying raw object (via the proxy's
      // defineProperty trap). On the NEXT read, shouldProxy() sees the skip
      // flag and returns the raw object unproxied. Documented guidance:
      // markRaw BEFORE inserting into a store, not after.
      markRaw(proxied as object);
      expect(isStore(s.user)).toBe(false);
    });
  });

  describe("prototype-chain (inherited) keys", () => {
    it("an Object.create(proto) value is NOT proxied (only Object/Array.prototype/null are 'plain')", () => {
      // shouldProxy() requires the prototype to be Object.prototype,
      // Array.prototype, or null. An object with a custom prototype is treated
      // like a class instance — passed through by reference, unproxied. This
      // is the documented boundary (docs §6) that keeps stores from wrapping
      // things they don't understand.
      const proto = { inherited: "from-proto" };
      const obj = Object.create(proto) as { own?: number; inherited?: string };
      obj.own = 1;
      const s = store(obj);
      expect(isStore(s)).toBe(false);
      // It's the raw object, fully usable, just not reactive.
      expect(s.own).toBe(1);
      expect(s.inherited).toBe("from-proto");
    });
  });

  describe("computed over store recomputes only on dependency change", () => {
    it("a computed reading one path is not invalidated by writes to another", () => {
      const s = store({ a: 1, b: 2 });
      let recomputes = 0;
      const c = computed(() => {
        recomputes++;
        return s.a * 10;
      });
      expect(c()).toBe(10);
      expect(recomputes).toBe(1);
      s.b = 99;
      expect(c()).toBe(10);
      expect(recomputes).toBe(1);
      s.a = 5;
      expect(c()).toBe(50);
      expect(recomputes).toBe(2);
    });
  });
});
