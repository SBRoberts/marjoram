import { signal, computed, effect, watcher } from "../../src/reactivity";

describe("Watcher smoke", () => {
  it("fires notify when a watched signal moves", () => {
    const s = signal(1);
    let calls = 0;
    const w = watcher(() => { calls++; });
    w.watch(s);
    expect(calls).toBe(0);
    s.set(2);
    expect(calls).toBe(1);
    s.set(3);
    expect(calls).toBe(2);
    w.dispose();
    s.set(4);
    expect(calls).toBe(2);
  });

  it("propagates watcherCount through computed (transitively)", () => {
    // Effect (live consumer) watching a computed that reads a signal —
    // signal should see watcher-count > 0 by transitivity.
    const s = signal(10);
    let runs = 0;
    const dispose = effect(() => {
      s();
      runs++;
    });
    expect(runs).toBe(1);
    s.set(11);
    return new Promise<void>(r => queueMicrotask(() => {
      expect(runs).toBe(2);
      dispose();
      r();
    }));
  });

  it("forbids signal I/O inside notify (dev mode)", () => {
    const s = signal(1);
    const w = watcher(() => {
      s(); // illegal
    });
    w.watch(s);
    expect(() => s.set(2)).toThrow(/Cannot read a signal inside a Watcher notify/);
    w.dispose();
  });

  it("getPending returns watched signals that moved", () => {
    const s = signal(1);
    const c = computed(() => s() * 2);
    const w = watcher(() => {});
    w.watch(c);
    expect(w.getPending()).toEqual([]);
    s.set(5);
    const pending = w.getPending();
    expect(pending).toHaveLength(1);
    expect(pending[0]).toBe(c);
    w.dispose();
  });

  it("re-watching the same signal is idempotent", () => {
    const s = signal(0);
    let calls = 0;
    const w = watcher(() => calls++);
    w.watch(s);
    w.watch(s);
    s.set(1);
    expect(calls).toBe(1);
    w.dispose();
  });
});
