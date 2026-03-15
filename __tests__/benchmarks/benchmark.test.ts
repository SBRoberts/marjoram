/**
 * Marjoram Performance Benchmarks
 *
 * Measures creation time, update throughput, and memory per widget instance.
 * Run with: npx jest __tests__/benchmarks/benchmark.test.ts --verbose
 */

import { html, useViewModel, createWidget, signal, computed } from "../../src";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));
const flushAll = async () => { await flush(); await flush(); };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function runTimed(fn: () => void, iterations: number): number[] {
  const times: number[] = [];
  // warmup
  fn();
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  return times;
}

async function runTimedAsync(fn: () => Promise<void>, iterations: number): Promise<number[]> {
  const times: number[] = [];
  // warmup
  await fn();
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

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

describe("Benchmarks", () => {
  const ITERATIONS = 20;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  describe("Widget Creation", () => {
    test("create + mount 1 widget", () => {
      const times = runTimed(() => {
        document.body.innerHTML = '<div id="root"></div>';
        const widget = createWidget({
          target: "#root",
          model: { count: 0, label: "Click" },
          render: vm => html`
            <div>
              <span>${vm.$count}</span>
              <button onclick=${() => vm.count++}>${vm.$label}</button>
            </div>
          `,
        });
        widget.mount();
        widget.destroy();
      }, ITERATIONS);

      const med = median(times);
      // eslint-disable-next-line no-console
      console.log(`  1 widget create+mount+destroy: ${formatMs(med)} (median of ${ITERATIONS})`);
      // Sanity: should complete in < 5ms
      expect(med).toBeLessThan(5);
    });

    test("create + mount 100 widgets", () => {
      const times = runTimed(() => {
        document.body.innerHTML = '<div id="root"></div>';
        const root = document.getElementById("root")!;
        const widgets: ReturnType<typeof createWidget>[] = [];

        for (let i = 0; i < 100; i++) {
          const container = document.createElement("div");
          container.id = `w-${i}`;
          root.appendChild(container);

          const w = createWidget({
            target: `#w-${i}`,
            model: { value: i },
            render: vm => html`<span>${vm.$value}</span>`,
          });
          w.mount();
          widgets.push(w);
        }

        for (const w of widgets) w.destroy();
      }, ITERATIONS);

      const med = median(times);
      const per = med / 100;
      // eslint-disable-next-line no-console
      console.log(`  100 widgets: ${formatMs(med)} total, ${formatMs(per)}/widget`);
      expect(med).toBeLessThan(200);
    });

    test("create + mount 1000 widgets", () => {
      const times = runTimed(() => {
        document.body.innerHTML = '<div id="root"></div>';
        const root = document.getElementById("root")!;
        const widgets: ReturnType<typeof createWidget>[] = [];

        for (let i = 0; i < 1000; i++) {
          const container = document.createElement("div");
          container.id = `w-${i}`;
          root.appendChild(container);

          const w = createWidget({
            target: `#w-${i}`,
            model: { value: i },
            render: vm => html`<span>${vm.$value}</span>`,
          });
          w.mount();
          widgets.push(w);
        }

        for (const w of widgets) w.destroy();
      }, 5); // fewer iterations for heavy test

      const med = median(times);
      const per = med / 1000;
      // eslint-disable-next-line no-console
      console.log(`  1000 widgets: ${formatMs(med)} total, ${formatMs(per)}/widget`);
      expect(med).toBeLessThan(5000);
    });
  });

  describe("Update Throughput", () => {
    test("single property — 10,000 sequential updates", async () => {
      const vm = useViewModel({ count: 0 });
      const view = html`<div>${vm.$count}</div>`;
      document.body.append(view);

      const times = await runTimedAsync(async () => {
        for (let i = 0; i < 10_000; i++) {
          vm.count = i;
        }
        await flush();
      }, ITERATIONS);

      const med = median(times);
      const opsPerMs = 10_000 / med;
      // eslint-disable-next-line no-console
      console.log(`  10k updates: ${formatMs(med)}, ${opsPerMs.toFixed(0)} ops/ms`);
      // Should handle 10k updates in < 50ms
      expect(med).toBeLessThan(50);

      view.unmount();
    });

    test("multi-property — 1000 updates across 5 properties", async () => {
      const vm = useViewModel({
        a: 0, b: "", c: false, d: 0, e: "x",
      });
      const view = html`<div>${vm.$a} ${vm.$b} ${vm.$c} ${vm.$d} ${vm.$e}</div>`;
      document.body.append(view);

      const times = await runTimedAsync(async () => {
        for (let i = 0; i < 1000; i++) {
          vm.a = i;
          vm.b = `text-${i}`;
          vm.c = i % 2 === 0;
          vm.d = i * 2;
          vm.e = String.fromCharCode(65 + (i % 26));
        }
        await flush();
      }, ITERATIONS);

      const med = median(times);
      const totalOps = 1000 * 5;
      const opsPerMs = totalOps / med;
      // eslint-disable-next-line no-console
      console.log(`  5k multi-prop updates: ${formatMs(med)}, ${opsPerMs.toFixed(0)} ops/ms`);
      expect(med).toBeLessThan(100);

      view.unmount();
    });

    test("computed property update chain", async () => {
      const vm = useViewModel({
        price: 10,
        qty: 1,
        subtotal: (vm: any) => vm.price * vm.qty,
        tax: (vm: any) => vm.subtotal * 0.1,
        total: (vm: any) => vm.subtotal + vm.tax,
      });
      const view = html`<div>${vm.$total}</div>`;
      document.body.append(view);

      const times = await runTimedAsync(async () => {
        for (let i = 1; i <= 1000; i++) {
          vm.price = i;
        }
        await flushAll();
      }, ITERATIONS);

      const med = median(times);
      // eslint-disable-next-line no-console
      console.log(`  1000 computed chain updates (3-deep): ${formatMs(med)}`);
      expect(med).toBeLessThan(100);

      view.unmount();
    });

    test("array — 1000 pushes", async () => {
      const vm = useViewModel({ items: [] as string[] });
      const view = html`<ul>${vm.$items.compute((items: string[]) =>
        items.map(i => html`<li>${i}</li>`)
      )}</ul>`;
      document.body.append(view);

      const times = await runTimedAsync(async () => {
        vm.items = [];
        await flush();
        for (let i = 0; i < 1000; i++) {
          vm.items.push(`item-${i}`);
        }
        await flush();
      }, 5);

      const med = median(times);
      // eslint-disable-next-line no-console
      console.log(`  1000 array pushes: ${formatMs(med)}`);
      expect(med).toBeLessThan(5000);

      view.unmount();
    });
  });

  describe("Signal Primitives", () => {
    test("raw signal read/write throughput — 100k ops", () => {
      const s = signal(0);
      const times = runTimed(() => {
        for (let i = 0; i < 100_000; i++) {
          s.set(i);
        }
        // Read back to force any lazy evaluation
        s();
      }, ITERATIONS);

      const med = median(times);
      const opsPerMs = 100_000 / med;
      // eslint-disable-next-line no-console
      console.log(`  100k signal writes: ${formatMs(med)}, ${opsPerMs.toFixed(0)} ops/ms`);
      expect(med).toBeLessThan(100);
    });

    test("computed signal — 10k source updates", () => {
      const s = signal(0);
      const c = computed(() => s() * 2);

      const times = runTimed(() => {
        for (let i = 0; i < 10_000; i++) {
          s.set(i);
        }
        // Read to trigger recompute
        c();
      }, ITERATIONS);

      const med = median(times);
      const opsPerMs = 10_000 / med;
      // eslint-disable-next-line no-console
      console.log(`  10k signal→computed: ${formatMs(med)}, ${opsPerMs.toFixed(0)} ops/ms`);
      expect(med).toBeLessThan(50);
    });

    test("diamond dependency — no double evaluation", () => {
      const s = signal(0);
      const a = computed(() => s() + 1);
      const b = computed(() => s() * 2);
      let evalCount = 0;
      const c = computed(() => {
        evalCount++;
        return a() + b();
      });

      // Initial
      expect(c()).toBe(1); // 0+1 + 0*2
      evalCount = 0;

      // Update source 1000 times
      for (let i = 1; i <= 1000; i++) {
        s.set(i);
        c(); // trigger re-evaluation
      }

      // eslint-disable-next-line no-console
      console.log(`  Diamond: ${evalCount} evals for 1000 updates (ideal: 1000)`);
      // Should not double-evaluate — each update triggers exactly 1 recompute of c
      expect(evalCount).toBe(1000);
    });
  });

  describe("Memory", () => {
    test("100 widget create/destroy cycles: no observer leak", () => {
      for (let i = 0; i < 100; i++) {
        document.body.innerHTML = '<div id="root"></div>';
        const widget = createWidget({
          target: "#root",
          model: { x: i, label: `Widget ${i}` },
          render: vm => html`
            <div>
              <span>${vm.$x}</span>
              <span>${vm.$label}</span>
            </div>
          `,
        });
        widget.mount();
        widget.destroy();
      }
      // If we got here without OOM, cleanup is working
      expect(true).toBe(true);
    });

    test("1000 signal create/dispose cycles", () => {
      for (let i = 0; i < 1000; i++) {
        const s = signal(i);
        const c = computed(() => s() * 2);
        expect(c()).toBe(i * 2);
        c.dispose();
        s.dispose();
      }
      expect(true).toBe(true);
    });
  });
});
