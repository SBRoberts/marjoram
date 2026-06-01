import {
  signal,
  computed,
  effect,
  watcher,
  Signal,
  type Signal as SignalT,
  type ReadonlySignal,
} from "../../src/reactivity";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe("Spec-shaped surface (Phase 3+4)", () => {
  describe("SignalOptions.equals", () => {
    it("suppresses notifications when equals returns true", async () => {
      const s = signal({ x: 1 }, { equals: (a, b) => a.x === b.x });
      let runs = 0;
      effect(() => {
        s();
        runs++;
      });
      expect(runs).toBe(1);
      s.set({ x: 1 }); // same logical value
      await flush();
      expect(runs).toBe(1);
      s.set({ x: 2 });
      await flush();
      expect(runs).toBe(2);
    });

    it("works on computed too", async () => {
      const s = signal(1);
      const c = computed(() => ({ doubled: s() * 2 }), {
        equals: (a, b) => a.doubled === b.doubled,
      });
      let runs = 0;
      effect(() => {
        c();
        runs++;
      });
      expect(runs).toBe(1);
      // Set source to something that yields the same computed result via equals
      s.set(1);
      await flush();
      expect(runs).toBe(1);
    });
  });

  describe("[Signal.subtle.watched] / [Signal.subtle.unwatched]", () => {
    it("fires watched on 0→1 transition, unwatched on 1→0", () => {
      const events: string[] = [];
      const s = signal(1, {
        [Signal.subtle.watched]: () => events.push("watched"),
        [Signal.subtle.unwatched]: () => events.push("unwatched"),
      });
      expect(events).toEqual([]);
      const dispose = effect(() => {
        s();
      });
      expect(events).toEqual(["watched"]);
      dispose();
      expect(events).toEqual(["watched", "unwatched"]);
    });

    it("does not double-fire when adding a second consumer", () => {
      const events: string[] = [];
      const s = signal(1, {
        [Signal.subtle.watched]: () => events.push("watched"),
      });
      const d1 = effect(() => {
        s();
      });
      const d2 = effect(() => {
        s();
      });
      expect(events).toEqual(["watched"]);
      d1();
      d2();
    });

    it("propagates transitively through computed", () => {
      const events: string[] = [];
      const s = signal(1, {
        [Signal.subtle.watched]: () => events.push("watched"),
        [Signal.subtle.unwatched]: () => events.push("unwatched"),
      });
      const c = computed(() => s() * 2);
      // No live consumer yet — computed alone does NOT make s "watched"
      expect(events).toEqual([]);
      const dispose = effect(() => {
        c();
      });
      expect(events).toEqual(["watched"]);
      dispose();
      expect(events).toEqual(["watched", "unwatched"]);
    });

    it("forbids signal I/O inside a lifecycle hook (dev mode)", () => {
      const s = signal(1, {
        [Signal.subtle.watched]: () => {
          s(); // illegal
        },
      });
      expect(() =>
        effect(() => {
          s();
        })
      ).toThrow(/Cannot read a signal/);
    });
  });

  describe("Signal.subtle introspection", () => {
    it("currentComputed returns the active computed during evaluation", () => {
      let seen: ReadonlySignal<unknown> | null = "untouched" as unknown as null;
      const s = signal(1);
      const c = computed(() => {
        seen = Signal.subtle.currentComputed();
        return s();
      });
      c(); // force evaluation
      expect(seen).toBe(c);
      expect(Signal.subtle.currentComputed()).toBe(null);
    });

    it("introspectSources / hasSources reflect the dependency set", () => {
      const a = signal(1);
      const b = signal(2);
      const c = computed(() => a() + b());
      c();
      const sources = Signal.subtle.introspectSources(c);
      expect(sources).toContain(a);
      expect(sources).toContain(b);
      expect(Signal.subtle.hasSources(c)).toBe(true);
    });

    it("introspectSinks / hasSinks reflect downstream subscribers", () => {
      const a = signal(1);
      const c = computed(() => a() * 2);
      c(); // wire up
      const sinks = Signal.subtle.introspectSinks(a);
      expect(sinks).toContain(c);
      expect(Signal.subtle.hasSinks(a)).toBe(true);
    });

    it("untrack is an alias for untracked", () => {
      const s = signal(1);
      let runs = 0;
      effect(() => {
        Signal.subtle.untrack(() => s());
        runs++;
      });
      expect(runs).toBe(1);
      s.set(2);
      return flush().then(() => expect(runs).toBe(1));
    });
  });

  describe("Dual API surface (.get / .set / .peek)", () => {
    it("signal exposes both callable and .get/.set/.peek", () => {
      const s: SignalT<number> = signal(10);
      expect(s()).toBe(10);
      expect(s.get()).toBe(10);
      s.set(20);
      expect(s()).toBe(20);
      expect(s.get()).toBe(20);
      expect(s.peek()).toBe(20);
    });

    it("computed exposes both callable and .get/.peek", () => {
      const s = signal(3);
      const c = computed(() => s() * 2);
      expect(c()).toBe(6);
      expect(c.get()).toBe(6);
      expect(c.peek()).toBe(6);
    });

    it(".get is reactive-tracking just like calling the signal", async () => {
      const s = signal(1);
      let runs = 0;
      effect(() => {
        s.get();
        runs++;
      });
      expect(runs).toBe(1);
      s.set(2);
      await flush();
      expect(runs).toBe(2);
    });
  });

  describe("Cycle detection", () => {
    it("throws when a computed reads itself during evaluation", () => {
      // Initial eval doesn't recurse — only after we flip the trigger.
      const trigger = signal(0);
      /* eslint-disable prefer-const */
      let c: ReadonlySignal<number>;
      c = computed(() => {
        const t = trigger();
        if (t > 0) return c();
        return 0;
      });
      /* eslint-enable prefer-const */
      expect(c()).toBe(0);
      trigger.set(1);
      expect(() => c()).toThrow(/Cycle detected/);
    });
  });

  describe("Watcher dev-mode I/O", () => {
    it("throws when notify tries to write a signal", () => {
      const s = signal(1);
      const w = watcher(() => {
        s.set(99);
      });
      w.watch(s);
      expect(() => s.set(2)).toThrow(/Cannot write a signal/);
      w.dispose();
    });
  });
});
