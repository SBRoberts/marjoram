/**
 * Marjoram store() Performance Benchmarks
 *
 * Per PERFORMANCE_TESTING_PHILOSOPHY.md: ratio-vs-baseline assertions, adaptive
 * thresholds (lenient in CI, strict locally), median not mean, with warmup.
 *
 * Baseline for every comparison is the existing `signal()` primitive — we
 * measure how much overhead store() adds for equivalent work, and we measure
 * granularity wins at scale (the case where signal can't compete because the
 * user would have to spread/replace the whole object).
 *
 * Run with: npx jest __tests__/benchmarks/store-benchmark.test.ts --verbose
 */

import { store, signal, effect, computed } from "../../src/reactivity";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

// ---------------------------------------------------------------------------
// Helpers — match the conventions of __tests__/benchmarks/benchmark.test.ts
// ---------------------------------------------------------------------------

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function runTimed(fn: () => void, iterations: number): number[] {
  const times: number[] = [];
  fn(); // warmup
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  return times;
}

async function runTimedAsync(
  fn: () => Promise<void>,
  iterations: number
): Promise<number[]> {
  const times: number[] = [];
  await fn(); // warmup
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    times.push(performance.now() - start);
  }
  return times;
}

function formatMs(ms: number): string {
  return ms < 1 ? `${(ms * 1000).toFixed(0)}μs` : `${ms.toFixed(2)}ms`;
}

// Adaptive bounds: CI is noisier and slower, so we accept looser ratios.
// These are diagnostic ceilings to catch regressions, not target numbers —
// the headline value of store() is granularity at scale (see the 10k-row
// benchmark below), not single-op throughput vs the leanest signal write.
const IS_CI = !!process.env.CI;
const PATH_WRITE_RATIO_LIMIT = IS_CI ? 20 : 12;

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

describe("store() benchmarks (Phase 7)", () => {
  const ITERATIONS = 10;

  describe("Path-write throughput vs signal baseline", () => {
    test("store path-write overhead per op is within bounds of signal.set", () => {
      const N = 100_000;

      // Baseline: 100k signal.set calls.
      const baselineTimes = runTimed(() => {
        const s = signal(0);
        for (let i = 0; i < N; i++) s.set(i);
      }, ITERATIONS);
      const baselineMed = median(baselineTimes);
      const baselineOps = N / baselineMed;

      // Candidate: 100k store path-writes (state.x = i).
      const candidateTimes = runTimed(() => {
        const s = store({ x: 0 });
        for (let i = 0; i < N; i++) s.x = i;
      }, ITERATIONS);
      const candidateMed = median(candidateTimes);
      const candidateOps = N / candidateMed;

      const ratio = candidateMed / baselineMed;

      // eslint-disable-next-line no-console
      console.log(
        `  signal.set: ${formatMs(baselineMed)} (${baselineOps.toFixed(0)} ops/ms) | ` +
          `store path-write: ${formatMs(candidateMed)} (${candidateOps.toFixed(0)} ops/ms) | ` +
          `ratio: ${ratio.toFixed(2)}× (limit: ${PATH_WRITE_RATIO_LIMIT}×)`
      );

      expect(ratio).toBeLessThan(PATH_WRITE_RATIO_LIMIT);
    });
  });

  describe("Read overhead vs raw object read (logged, not asserted)", () => {
    test("logs untracked-read ratio for visibility — no upper bound", () => {
      // Diagnostic-only: the raw-object baseline is so heavily JIT-optimized
      // that tiny absolute differences produce huge ratios, and the ratio
      // varies materially across Node versions and runner generations (160×
      // on local M-series, ~500× on GHA Node 18 runners). The "reads are
      // free" guarantee is about NO SignalNode allocation (next test) — that
      // is robust and asserted. Use this number to spot regressions, not
      // as a gate.
      const N = 100_000;
      const data = { x: 0 };

      const baselineTimes = runTimed(() => {
        let sum = 0;
        for (let i = 0; i < N; i++) sum += data.x;
        if (sum === Infinity) throw new Error("unreachable");
      }, ITERATIONS);
      const baselineMed = median(baselineTimes);

      const s = store({ x: 0 });
      const candidateTimes = runTimed(() => {
        let sum = 0;
        for (let i = 0; i < N; i++) sum += s.x;
        if (sum === Infinity) throw new Error("unreachable");
      }, ITERATIONS);
      const candidateMed = median(candidateTimes);

      const ratio = candidateMed / baselineMed;

      // eslint-disable-next-line no-console
      console.log(
        `  raw read: ${formatMs(baselineMed)} | store untracked read: ${formatMs(candidateMed)} | ratio: ${ratio.toFixed(2)}× (DIAGNOSTIC — not asserted)`
      );

      // No upper bound. The store benchmark passes as long as the loop runs.
      expect(candidateMed).toBeGreaterThan(0);
    });
  });

  describe('"reads are free outside reactive contexts" — allocation guarantee', () => {
    test("plain reads do not allocate any per-path SignalNode metadata", () => {
      // Asserted structurally rather than via timing: confirmed by inspecting
      // the raw object's symbol properties. The reactivity tests already
      // verify the contract (__tests__/reactivity/store.test.ts §"reads are
      // free"). This benchmark exists to prove the cost shape at scale.
      const N = 10_000;
      const raw = { x: 0 };
      const s = store(raw);
      const times = runTimed(() => {
        for (let i = 0; i < N; i++) void s.x;
      }, ITERATIONS);
      const med = median(times);
      const opsPerMs = N / med;
      const hasNode = Object.getOwnPropertySymbols(raw).some(
        sym => sym.description === "marjoram.node"
      );
      // eslint-disable-next-line no-console
      console.log(
        `  10k untracked reads: ${formatMs(med)} (${opsPerMs.toFixed(0)} ops/ms), $NODE allocated: ${hasNode}`
      );
      expect(hasNode).toBe(false);
    });
  });

  describe("Identity cache: stable nested proxies", () => {
    test("state.user === state.user across 100k reads (no per-read allocation)", () => {
      const s = store({ user: { name: "Alice" } });
      const N = 100_000;
      let allEqual = true;
      const times = runTimed(() => {
        const u = s.user;
        for (let i = 0; i < N; i++) {
          if (s.user !== u) {
            allEqual = false;
            break;
          }
        }
      }, ITERATIONS);
      const med = median(times);
      // eslint-disable-next-line no-console
      console.log(
        `  100k identity checks: ${formatMs(med)}, all equal: ${allEqual}`
      );
      expect(allEqual).toBe(true);
    });
  });

  describe("Granularity at scale — 10k rows, update 1 cell", () => {
    test("a 10k-row store with 1 cell mutation re-runs exactly 1 subscriber", async () => {
      interface Row {
        id: number;
        value: number;
      }
      const rows: Row[] = [];
      for (let i = 0; i < 10_000; i++) rows.push({ id: i, value: i });
      const s = store({ rows });

      // Set up one effect PER ROW reading its `value`.
      const runCounts: number[] = new Array(10_000).fill(0);
      const disposers: Array<() => void> = [];
      for (let i = 0; i < 10_000; i++) {
        const idx = i;
        disposers.push(
          effect(() => {
            void s.rows[idx].value;
            runCounts[idx]++;
          })
        );
      }
      // Initial run counts: all 1.
      for (let i = 0; i < 10_000; i++) expect(runCounts[i]).toBe(1);

      // Mutate one specific row's value. Time the mutation+flush.
      const start = performance.now();
      s.rows[5000].value = 999;
      await flush();
      const elapsed = performance.now() - start;

      // Effect for row 5000 re-runs exactly once; nothing else moves.
      expect(runCounts[5000]).toBe(2);
      const otherRuns = runCounts.reduce(
        (a, c, i) => (i === 5000 ? a : a + c),
        0
      );
      expect(otherRuns).toBe(9_999); // 9_999 unrelated effects, each still at 1

      // eslint-disable-next-line no-console
      console.log(
        `  10k effects, 1 mutated path: ${formatMs(elapsed)} for the mutation round`
      );

      // Granular update should be very fast even at scale (sub-millisecond
      // typical, generous bound for CI noise).
      expect(elapsed).toBeLessThan(IS_CI ? 50 : 20);

      for (const d of disposers) d();
    });
  });

  describe("Computed-over-store update propagation", () => {
    test("path-granular computed only invalidates when its specific path changes", async () => {
      const s = store({ a: 0, b: 0, c: 0 });
      let derivations = 0;
      const c = computed(() => {
        derivations++;
        return s.a * 2;
      });
      expect(c()).toBe(0);
      expect(derivations).toBe(1);

      // Mutate b and c many times — derivations must NOT increase.
      const N = 1000;
      const start = performance.now();
      for (let i = 0; i < N; i++) {
        s.b = i;
        s.c = i;
      }
      const elapsed = performance.now() - start;

      expect(c()).toBe(0); // still no recompute
      expect(derivations).toBe(1);

      // Now mutate a, expect 1 invalidation.
      s.a = 5;
      expect(c()).toBe(10);
      expect(derivations).toBe(2);

      // eslint-disable-next-line no-console
      console.log(
        `  ${N}×2 unrelated mutations: ${formatMs(elapsed)} (computed un-invalidated)`
      );
    });
  });

  describe("Array mutating method batching (Phase 3 win)", () => {
    test("push(...args) produces a single notification round, not one per inner write", async () => {
      const s = store({ arr: [0, 0, 0] });
      let runs = 0;
      effect(() => {
        s.arr.length;
        runs++;
      });
      expect(runs).toBe(1);

      // Push 100 items. Without batching, each inner write triggers a
      // microtask reschedule; with batching, the whole push coalesces.
      const start = performance.now();
      s.arr.push(...Array.from({ length: 100 }, (_, i) => i));
      await flush();
      const elapsed = performance.now() - start;

      // Effect ran exactly once for the entire push.
      expect(runs).toBe(2);
      expect(s.arr.length).toBe(103);

      // eslint-disable-next-line no-console
      console.log(
        `  push(100 items): ${formatMs(elapsed)} with 1 effect re-run`
      );
    });

    test("splice / sort / reverse / fill each coalesce inner writes", async () => {
      const s = store({ arr: Array.from({ length: 100 }, (_, i) => i) });
      let runs = 0;
      effect(() => {
        s.arr.forEach(() => {});
        runs++;
      });
      expect(runs).toBe(1);

      s.arr.sort((a, b) => b - a);
      await flush();
      expect(runs).toBe(2); // single coalesced round

      s.arr.reverse();
      await flush();
      expect(runs).toBe(3);

      s.arr.fill(0);
      await flush();
      expect(runs).toBe(4);

      s.arr.splice(0, 50, ...Array(25).fill(1));
      await flush();
      expect(runs).toBe(5);
    });
  });

  describe("Subscriber notification throughput", () => {
    test("fan-out: 1k subscribers wake on a single path change", async () => {
      const s = store({ x: 0 });
      const counters = new Array(1000).fill(0);
      const disposers: Array<() => void> = [];
      for (let i = 0; i < 1000; i++) {
        const idx = i;
        disposers.push(
          effect(() => {
            void s.x;
            counters[idx]++;
          })
        );
      }
      for (let i = 0; i < 1000; i++) expect(counters[i]).toBe(1);

      const times = await runTimedAsync(async () => {
        s.x = s.x + 1;
        await flush();
      }, ITERATIONS);
      const med = median(times);
      // eslint-disable-next-line no-console
      console.log(`  fan-out 1k subscribers, single write: ${formatMs(med)}`);

      for (const d of disposers) d();
    });
  });
});
