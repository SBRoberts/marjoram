import {
  signal,
  computed,
  effect,
  watcher,
  store,
  Signal,
  type ReadonlySignal,
} from "../../src/reactivity";

const flush = () => new Promise<void>(r => queueMicrotask(r));

describe("Adversarial probes", () => {
  describe("hasSinks vs introspectSinks consistency", () => {
    it("agrees when only computeds subscribe", () => {
      const s = signal(0);
      const c = computed(() => s() * 2);
      c();
      expect(Signal.subtle.hasSinks(s)).toBe(true);
      expect(Signal.subtle.introspectSinks(s).length).toBe(1);
    });

    it("hasSinks is false for effect-only observers (spec-shaped); hasObservers is true", () => {
      const s = signal(0);
      const dispose = effect(() => {
        s();
      });
      // Effects are not first-class spec entities, so they don't appear
      // in introspectSinks / hasSinks. Marjoram exposes `hasObservers` to
      // count any subscriber type.
      expect(Signal.subtle.hasSinks(s)).toBe(false);
      expect(Signal.subtle.introspectSinks(s).length).toBe(0);
      expect(Signal.subtle.hasObservers(s)).toBe(true);
      dispose();
      expect(Signal.subtle.hasObservers(s)).toBe(false);
    });
  });

  describe("Path-signal GC under mixed live + non-live observers", () => {
    it("does NOT delete path node when a non-live computed is still subscribed", async () => {
      const raw: { x: number } = { x: 1 };
      const s = store(raw);
      const c = computed(() => s.x); // non-live computed
      c();
      const dispose = effect(() => { s.x; }); // live consumer
      // Both reading state.x. Path signal exists, watcherCount = 1.
      dispose();
      // After effect disposes, [unwatched] fires on path signal.
      // Computed is still subscribed → path signal should NOT be GC'd.
      s.x = 2;
      // Computed should still respond to mutation.
      expect(c()).toBe(2);
    });
  });

  describe("Multi-effect lifecycle hook count", () => {
    it("[watched] fires exactly once even with multiple consumers", () => {
      let watched = 0;
      let unwatched = 0;
      const s = signal(1, {
        [Signal.subtle.watched]: () => { watched++; },
        [Signal.subtle.unwatched]: () => { unwatched++; },
      });
      const d1 = effect(() => { s(); });
      const d2 = effect(() => { s(); });
      const d3 = effect(() => { s(); });
      expect(watched).toBe(1);
      expect(unwatched).toBe(0);
      d1();
      d2();
      expect(watched).toBe(1);
      expect(unwatched).toBe(0); // count still > 0
      d3();
      expect(unwatched).toBe(1); // last one
    });
  });

  describe("Re-subscribe transitions", () => {
    it("[watched]/[unwatched] cycle correctly through repeated subscribe/dispose", () => {
      const log: string[] = [];
      const s = signal(1, {
        [Signal.subtle.watched]: () => log.push("watched"),
        [Signal.subtle.unwatched]: () => log.push("unwatched"),
      });
      const d1 = effect(() => { s(); });
      d1();
      const d2 = effect(() => { s(); });
      d2();
      expect(log).toEqual(["watched", "unwatched", "watched", "unwatched"]);
    });
  });

  describe("Diamond dedup with versioning", () => {
    it("effect downstream of a no-op computed (equals=true) skips re-run", async () => {
      const s = signal(0);
      const c = computed(() => ({ neg: s() < 0 }), {
        equals: (a, b) => a.neg === b.neg,
      });
      let runs = 0;
      effect(() => {
        c();
        runs++;
      });
      expect(runs).toBe(1);
      // Source moves, but `neg` result stays the same → effect should not re-run.
      s.set(5);
      await flush();
      expect(runs).toBe(1);
      s.set(-1); // now neg flips
      await flush();
      expect(runs).toBe(2);
    });
  });

  describe("Cycle: indirect via two computeds", () => {
    it("throws when c1 → c2 → c1", () => {
      const trigger = signal(0);
      // Forward refs so each fn body can read the other.
      /* eslint-disable prefer-const */
      let c1: ReadonlySignal<number>;
      let c2: ReadonlySignal<number>;
      c2 = computed(() => {
        if (trigger() > 0) return c1();
        return 1;
      });
      c1 = computed(() => {
        if (trigger() > 0) return c2();
        return 0;
      });
      /* eslint-enable prefer-const */
      // Initial: both eval without recursion.
      expect(c1()).toBe(0);
      expect(c2()).toBe(1);
      // Trigger the cycle.
      trigger.set(1);
      expect(() => c1()).toThrow(/Cycle detected/);
    });
  });

  describe("Watcher pending tracking", () => {
    it("getPending returns moved sources after notify", () => {
      const s = signal(1);
      const c = computed(() => s() * 2);
      const log: string[] = [];
      const w = watcher(() => log.push("notify"));
      w.watch(c);
      expect(w.getPending()).toEqual([]);
      s.set(5);
      expect(log).toEqual(["notify"]);
      expect(w.getPending()).toEqual([c]);
      w.dispose();
    });
  });

  describe("Signal write inside notify throws", () => {
    it("write inside notify is rejected in dev mode", () => {
      const s = signal(0);
      const w = watcher(() => {
        s.set(99); // illegal
      });
      w.watch(s);
      expect(() => s.set(1)).toThrow(/Cannot write a signal/);
      w.dispose();
    });
  });

  describe("Effect inside batch doesn't re-run between writes", () => {
    it("multiple writes batch into one re-run", async () => {
      const a = signal(0);
      const b = signal(0);
      let runs = 0;
      effect(() => {
        a(); b();
        runs++;
      });
      expect(runs).toBe(1);
      // batch then await flush.
      // We need the batch import. Use a fresh import.
      const { batch } = await import("../../src/reactivity");
      batch(() => {
        a.set(1);
        a.set(2);
        b.set(3);
      });
      await flush();
      expect(runs).toBe(2);
    });
  });

  describe("Disposing an already-disposed effect doesn't crash", () => {
    it("double dispose is safe", () => {
      const s = signal(0);
      const dispose = effect(() => {
        s();
      });
      dispose();
      expect(() => dispose()).not.toThrow();
    });
  });

  describe("Frozen callback throws — state restoration", () => {
    it("activeSubscriber/inFrozenCallback restored after notify throws", () => {
      const s = signal(0);
      const w = watcher(() => {
        throw new Error("hook boom");
      });
      w.watch(s);
      expect(() => s.set(1)).toThrow(/hook boom/);
      // After the throw, normal reads/writes should work fine again.
      const after = signal(0);
      let runs = 0;
      const dispose = effect(() => {
        after();
        runs++;
      });
      expect(runs).toBe(1);
      after.set(1);
      return flush().then(() => {
        expect(runs).toBe(2);
        dispose();
        w.dispose();
      });
    });
  });

  describe("Watcher count propagation through deep computed chain", () => {
    it("transitively bumps and decrements through 3-level chain", () => {
      const events: string[] = [];
      const sig = signal(1, {
        [Signal.subtle.watched]: () => events.push("sig.watched"),
        [Signal.subtle.unwatched]: () => events.push("sig.unwatched"),
      });
      const a = computed(() => sig() + 1);
      const b = computed(() => a() + 1);
      const c = computed(() => b() + 1);
      // No live consumer yet — chain is dormant.
      expect(events).toEqual([]);
      // Effect on c → all three computeds become live → sig becomes live.
      const dispose = effect(() => {
        c();
      });
      expect(events).toEqual(["sig.watched"]);
      dispose();
      expect(events).toEqual(["sig.watched", "sig.unwatched"]);
    });
  });

  describe("Multiple watchers on the same signal", () => {
    it("count goes to 2; [watched] fires only on 0→1", () => {
      let watchedCount = 0;
      let unwatchedCount = 0;
      const s = signal(0, {
        [Signal.subtle.watched]: () => watchedCount++,
        [Signal.subtle.unwatched]: () => unwatchedCount++,
      });
      const w1 = watcher(() => {});
      const w2 = watcher(() => {});
      w1.watch(s);
      expect(watchedCount).toBe(1);
      w2.watch(s);
      expect(watchedCount).toBe(1); // still 1 — already live
      w1.dispose();
      expect(unwatchedCount).toBe(0); // still live (w2)
      w2.dispose();
      expect(unwatchedCount).toBe(1);
    });
  });

  describe("Reading a computed inside untracked()", () => {
    it("does not register as a dependency", async () => {
      const s = signal(1);
      const c = computed(() => s() * 10);
      let runs = 0;
      effect(() => {
        Signal.subtle.untrack(() => {
          c();
        });
        runs++;
      });
      expect(runs).toBe(1);
      s.set(5);
      await flush();
      // Effect did not subscribe to c (or transitively s), so no re-run.
      expect(runs).toBe(1);
    });
  });

  describe("Dynamic deps: computed switching sources mid-life", () => {
    it("[unwatched] fires on dropped source, [watched] on new", () => {
      const events: string[] = [];
      const a = signal(1, {
        [Signal.subtle.watched]: () => events.push("a.watched"),
        [Signal.subtle.unwatched]: () => events.push("a.unwatched"),
      });
      const b = signal(2, {
        [Signal.subtle.watched]: () => events.push("b.watched"),
        [Signal.subtle.unwatched]: () => events.push("b.unwatched"),
      });
      const which = signal<"a" | "b">("a");
      const c = computed(() => (which() === "a" ? a() : b()));
      const dispose = effect(() => {
        c();
      });
      expect(events).toContain("a.watched");
      expect(events).not.toContain("b.watched");
      // Flip the branch. Computed re-evaluates synchronously on next read.
      which.set("b");
      return flush().then(() => {
        expect(events).toContain("a.unwatched");
        expect(events).toContain("b.watched");
        dispose();
      });
    });
  });

  describe("Watching a disposed signal", () => {
    it("does not throw; just doesn't fire", () => {
      const s = signal(1);
      s.dispose();
      const w = watcher(() => {});
      // Disposed signals are still in the registry — watching them is legal,
      // just doesn't observe future writes (no notify path exists).
      expect(() => w.watch(s)).not.toThrow();
      w.dispose();
    });
  });

  describe("Computed read inside batch", () => {
    it("re-evaluates correctly after batch completes", async () => {
      const a = signal(1);
      const b = signal(2);
      const c = computed(() => a() + b());
      let runs = 0;
      effect(() => {
        c();
        runs++;
      });
      expect(runs).toBe(1);
      const { batch } = await import("../../src/reactivity");
      batch(() => {
        a.set(10);
        b.set(20);
      });
      await flush();
      expect(runs).toBe(2);
      expect(c()).toBe(30);
    });
  });
});
