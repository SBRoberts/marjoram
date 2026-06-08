// ---------------------------------------------------------------------------
// Sufficiency study: keyed-cache GC strategies built on the public primitives.
//
// store() backs each reached path with `signal(undefined, { equals: () => false })`
// and reclaims the per-path node in `[unwatched]`. This file pins, using only
// the public reactivity surface, the facts behind that GC design and the
// spec-pure alternative described in store.ts's header comment. It doubles as
// a runnable artifact for the TC39 Signals discussion on `watched`/`unwatched`
// liveness vs. subscription (tc39/proposal-signals#227).
//
// Three things are demonstrated:
//   1. What is actually subscribed to a per-path node when `[unwatched]` fires
//      — the operative case is a DORMANT COMPUTED, never a lingering effect.
//   2. Gating eviction on liveness alone ORPHANS that dormant computed (the
//      trap a spec-`hasSinks` gate falls into, since spec `hasSinks` is
//      liveness-gated and excludes unwatched computeds).
//   3. The spec-pure deferred-notify GC: reclaim promptly on the public
//      surface alone, at a cost of one spurious recompute per dormant reader.
// ---------------------------------------------------------------------------

import { signal, computed, effect, Signal } from "../../src/reactivity";
import type { Signal as SignalCallable } from "../../src/reactivity";

const flush = () => new Promise<void>(resolve => queueMicrotask(() => resolve()));

describe("keyed-cache GC strategies on the public primitives", () => {
  // -------------------------------------------------------------------------
  // 1. Introspection at the [unwatched] edge.
  //
  // A per-path node fires [unwatched] when its live-watcher count drops to 0.
  // Question: what can still be subscribed at that instant? Effects are live
  // consumers — a subscribed effect keeps the count > 0, and effect teardown
  // removes the effect from the node's subscriber set *before* decrementing to
  // 0 — so no effect is ever present when [unwatched] fires. The only thing
  // that can remain is a dormant computed (read the node, no live downstream),
  // which contributes 0 to the count.
  // -------------------------------------------------------------------------
  describe("the [unwatched] edge", () => {
    it("a dormant computed is still subscribed; an effect is not", () => {
      const atEdge: Array<{ hasSinks: boolean; hasObservers: boolean }> = [];

      const node: SignalCallable<undefined> = signal<undefined>(undefined, {
        equals: () => false,
        [Signal.subtle.unwatched]: () => {
          atEdge.push({
            hasSinks: Signal.subtle.hasSinks(node),
            hasObservers: Signal.subtle.hasObservers(node),
          });
        },
      });

      // Dormant computed reads the node → subscribes, contributes 0 to liveness.
      const c = computed(() => {
        node();
        return 1;
      });
      c(); // evaluate so the subscription is established

      // A live effect makes the node live (count 0 → 1), then goes away,
      // dropping it back to 0 and firing [unwatched].
      const dispose = effect(() => {
        node();
      });
      dispose();

      expect(atEdge).toHaveLength(1);
      // hasObservers (any subscriber) sees the dormant computed → store() will
      // NOT evict, which is correct.
      expect(atEdge[0].hasObservers).toBe(true);
      // Marjoram's hasSinks is a non-liveness-gated superset, so it ALSO sees
      // the dormant computed here. The spec's hasSinks/introspectSinks would
      // NOT — they include a computed sink only "if that computed signal is
      // (recursively) watched" — so a spec-hasSinks gate would wrongly report
      // "no sinks" and evict. That is the trap exercised in section 2.
      expect(atEdge[0].hasSinks).toBe(true);
    });

    it("no subscriber remains when the last reader was an effect", () => {
      const atEdge: Array<{ hasObservers: boolean }> = [];

      const node: SignalCallable<undefined> = signal<undefined>(undefined, {
        equals: () => false,
        [Signal.subtle.unwatched]: () => {
          atEdge.push({ hasObservers: Signal.subtle.hasObservers(node) });
        },
      });

      const disposeA = effect(() => {
        node();
      });
      const disposeB = effect(() => {
        node();
      });
      disposeA(); // count 2 → 1, no [unwatched]
      disposeB(); // count 1 → 0 → [unwatched]; the last effect is already gone

      expect(atEdge).toHaveLength(1);
      // Confirms effects do not linger at the edge: hasObservers is false, so
      // the "hasSinks misses effect-only readers" concern cannot arise here —
      // the operative reason to prefer hasObservers over the SPEC's hasSinks is
      // the dormant computed of section 1, not a lingering effect.
      expect(atEdge[0].hasObservers).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Liveness-gated eviction orphans a dormant computed.
  //
  // A one-key "store": `box` holds the value, `node` is the invalidation pulse.
  // read() subscribes the active context; write() notifies. We compare two GC
  // gates inside [unwatched].
  // -------------------------------------------------------------------------
  describe("liveness-gated eviction is unsafe", () => {
    it("evicting without checking subscribers orphans a dormant computed", async () => {
      let box = 1;
      let node: SignalCallable<undefined> | null = null;
      let evicted = false;

      const ensure = (): SignalCallable<undefined> => {
        if (!node) {
          node = signal<undefined>(undefined, {
            equals: () => false,
            // LIVENESS-ONLY gate: reclaim as soon as no live watcher remains,
            // ignoring dormant readers — what a spec-`hasSinks` gate would do.
            [Signal.subtle.unwatched]: () => {
              node = null;
              evicted = true;
            },
          });
        }
        return node;
      };
      const read = (): number => {
        ensure()();
        return box;
      };
      const write = (v: number): void => {
        box = v;
        node?.set(undefined);
      };

      const c = computed(() => read());
      expect(c()).toBe(1);

      const dispose = effect(() => {
        read();
      });
      dispose(); // [unwatched] → eviction nulls `node`
      expect(evicted).toBe(true);

      // The dormant computed memorized the evicted node. write() finds
      // node === null, notifies nothing, and c is never invalidated.
      write(2);
      await flush();
      expect(c()).toBe(1); // STALE — the orphan bug, pinned.
    });

    it("the hasObservers gate keeps the node and stays correct", async () => {
      let box = 1;
      const make = (): {
        read: () => number;
        write: (v: number) => void;
      } => {
        let node: SignalCallable<undefined> | null = null;
        const ensure = (): SignalCallable<undefined> => {
          if (!node) {
            const created: SignalCallable<undefined> = signal<undefined>(
              undefined,
              {
                equals: () => false,
                [Signal.subtle.unwatched]: () => {
                  // Reclaim only when no subscriber of any kind remains.
                  if (!Signal.subtle.hasObservers(created)) node = null;
                },
              }
            );
            node = created;
          }
          return node;
        };
        return {
          read: () => {
            ensure()();
            return box;
          },
          write: (v: number) => {
            box = v;
            node?.set(undefined);
          },
        };
      };

      const { read, write } = make();
      const c = computed(() => read());
      expect(c()).toBe(1);

      const dispose = effect(() => {
        read();
      });
      dispose(); // [unwatched] fires, but the dormant computed keeps the node alive

      write(2);
      await flush();
      expect(c()).toBe(2); // fresh — no orphan.
    });
  });

  // -------------------------------------------------------------------------
  // 3. Deferred-notify GC — spec-pure, bounded memory, with a measurable cost.
  //
  // [unwatched] cannot .set() (frozen-callback rule). So defer: schedule a
  // microtask, track liveness with the watched/unwatched hooks, and if still
  // dormant, set(undefined) (now allowed — outside the frozen callback) then
  // delete the node. A dormant computed is spuriously invalidated and re-links
  // to a fresh node on its next read. This reclaims promptly using ONLY the
  // public surface — no hasObservers — at the cost of one extra recompute.
  // -------------------------------------------------------------------------
  describe("deferred-notify GC is spec-pure", () => {
    it("reclaims promptly and costs exactly one spurious recompute", async () => {
      let box = 1;
      let node: SignalCallable<undefined> | null = null;
      let live = false;
      let reclaimed = false;
      let recomputes = 0;

      const ensure = (): SignalCallable<undefined> => {
        if (!node) {
          const created: SignalCallable<undefined> = signal<undefined>(
            undefined,
            {
              equals: () => false,
              [Signal.subtle.watched]: () => {
                live = true;
              },
              [Signal.subtle.unwatched]: () => {
                live = false;
                queueMicrotask(() => {
                  if (live) return; // re-armed by a new live reader since
                  created.set(undefined); // notify dormant readers (not frozen here)
                  if (node === created) {
                    node = null;
                    reclaimed = true;
                  }
                });
              },
            }
          );
          node = created;
        }
        return node;
      };
      const read = (): number => {
        ensure()();
        return box;
      };
      const write = (v: number): void => {
        box = v;
        node?.set(undefined);
      };

      const c = computed(() => {
        recomputes++;
        return read();
      });
      expect(c()).toBe(1);
      expect(recomputes).toBe(1);

      const dispose = effect(() => {
        read();
      });
      dispose(); // schedules the deferred reclaim
      await flush();

      // Bounded memory: the slot was reclaimed promptly, no hasObservers needed.
      expect(reclaimed).toBe(true);
      // The dormant computed was spuriously invalidated; reading it recomputes
      // (re-linking to a fresh node) — value unchanged, one extra recompute.
      expect(c()).toBe(1);
      expect(recomputes).toBe(2);

      // Correctness preserved: later writes still reach the computed.
      write(2);
      await flush();
      expect(c()).toBe(2);
    });
  });
});
