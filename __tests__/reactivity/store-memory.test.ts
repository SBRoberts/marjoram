// Memory / disposal stress tests. Without `--expose-gc` we can't measure
// the heap directly, so these tests focus on observable correctness under
// load: a large number of stores can be created, mutated, and dropped
// without errors, and disposed subscriptions stop firing.

import { store, effect } from "../../src/reactivity";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe("store() — memory & disposal stress (Phase 6)", () => {
  it("creates 10,000 stores without errors", () => {
    const stores: { x: number }[] = [];
    for (let i = 0; i < 10_000; i++) {
      stores.push(store({ x: i }));
    }
    expect(stores.length).toBe(10_000);
    expect(stores[5000].x).toBe(5000);
  });

  it("creates + mutates + drops 1,000 stores without errors", () => {
    for (let i = 0; i < 1000; i++) {
      const s = store({ x: 0 });
      for (let j = 0; j < 10; j++) s.x = j;
      // Drop the reference. GC will reclaim eventually.
    }
    // If we got here without OOM or crash, success.
    expect(true).toBe(true);
  });

  it("disposed effects do not fire when their store mutates (no zombie subscribers)", async () => {
    const s = store({ x: 0 });
    let runs = 0;
    const dispose = effect(() => {
      s.x;
      runs++;
    });
    expect(runs).toBe(1);

    dispose();

    for (let i = 0; i < 100; i++) s.x = i;
    await flush();
    // After dispose, the effect should never re-run.
    expect(runs).toBe(1);
  });

  it("rapidly creating + disposing effects on the same store doesn't accumulate subscribers", async () => {
    const s = store({ x: 0 });
    for (let i = 0; i < 1000; i++) {
      const dispose = effect(() => {
        s.x;
      });
      dispose();
    }
    // Mutate after all are disposed.
    let stillFiring = 0;
    const finalEffect = effect(() => {
      s.x;
      stillFiring++;
    });
    expect(stillFiring).toBe(1);
    s.x = 999;
    await flush();
    // Only the active effect should re-run — not 1000 ghost ones.
    expect(stillFiring).toBe(2);
    finalEffect();
  });

  it("deep store with many tracked paths can be fully mutated without observable leak", async () => {
    // 50-property store with an effect tracking 10 specific paths.
    interface Big {
      [k: string]: number;
    }
    const init: Big = {};
    for (let i = 0; i < 50; i++) init[`k${i}`] = i;
    const s = store<Big>(init);

    let runs = 0;
    const dispose = effect(() => {
      for (let i = 0; i < 10; i++) s[`k${i}`];
      runs++;
    });
    expect(runs).toBe(1);

    // Mutate untracked paths — effect must not re-run.
    for (let i = 10; i < 50; i++) s[`k${i}`] = i * 2;
    await flush();
    expect(runs).toBe(1);

    // Mutate ONE tracked path — single re-run.
    s.k0 = 100;
    await flush();
    expect(runs).toBe(2);

    dispose();
  });
});
