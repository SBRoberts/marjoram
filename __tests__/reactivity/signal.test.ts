import { signal, computed, effect, batch, untracked } from "../../src/reactivity";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe("Signal Primitives", () => {
  describe("signal()", () => {
    it("should store and return an initial value", () => {
      const s = signal(42);
      expect(s()).toBe(42);
    });

    it("should update value via set()", () => {
      const s = signal("hello");
      s.set("world");
      expect(s()).toBe("world");
    });

    it("should peek without tracking", () => {
      const s = signal(10);
      expect(s.peek()).toBe(10);
    });

    it("should skip notification for identical values (Object.is)", async () => {
      const s = signal(5);
      const log: number[] = [];
      effect(() => {
        log.push(s());
      });
      expect(log).toEqual([5]);

      s.set(5); // same value
      await flush();
      expect(log).toEqual([5]); // no re-run
    });

    it("should clear subscribers on dispose()", async () => {
      const s = signal(0);
      const log: number[] = [];
      effect(() => {
        log.push(s());
      });
      expect(log).toEqual([0]);

      s.dispose();
      s.set(99);
      await flush();
      expect(log).toEqual([0]); // effect not re-triggered
    });
  });

  describe("computed()", () => {
    it("should derive a value from one signal", () => {
      const count = signal(3);
      const doubled = computed(() => count() * 2);
      expect(doubled()).toBe(6);
    });

    it("should update when the source signal changes", () => {
      const count = signal(3);
      const doubled = computed(() => count() * 2);
      count.set(10);
      expect(doubled()).toBe(20);
    });

    it("should be lazy (recompute on read, not on signal write)", () => {
      let runs = 0;
      const s = signal(1);
      const c = computed(() => {
        runs++;
        return s() + 1;
      });
      expect(runs).toBe(1); // initial eager computation

      s.set(2);
      // No read yet — still 1 computation
      expect(runs).toBe(1);

      // Reading triggers recompute
      expect(c()).toBe(3);
      expect(runs).toBe(2);
    });

    it("should chain through multiple computed signals", () => {
      const a = signal(2);
      const b = computed(() => a() * 3);
      const c = computed(() => b() + 10);
      expect(c()).toBe(16);

      a.set(5);
      expect(c()).toBe(25);
    });

    it("should track dynamic dependencies", () => {
      const flag = signal(true);
      const x = signal(10);
      const y = signal(20);
      const result = computed(() => (flag() ? x() : y()));

      expect(result()).toBe(10);

      // Change y — should NOT affect result since flag is true
      y.set(999);
      expect(result()).toBe(10);

      // Flip flag — now depends on y
      flag.set(false);
      expect(result()).toBe(999);

      // Now changing x doesn't matter
      x.set(0);
      expect(result()).toBe(999);
    });

    it("should support peek without tracking", () => {
      const s = signal(5);
      const c = computed(() => s() * 2);
      expect(c.peek()).toBe(10);
    });

    it("should clean up on dispose()", () => {
      const s = signal(1);
      const c = computed(() => s() * 2);
      expect(c()).toBe(2);

      c.dispose();
      s.set(100);
      // After dispose, value is stale
      expect(c()).toBe(2);
    });
  });

  describe("effect()", () => {
    it("should run immediately on creation", () => {
      const log: number[] = [];
      const s = signal(42);
      effect(() => {
        log.push(s());
      });
      // First run is synchronous
      expect(log).toEqual([42]);
    });

    it("should re-run when a dependency changes", async () => {
      const log: string[] = [];
      const name = signal("Alice");
      effect(() => {
        log.push(name());
      });
      expect(log).toEqual(["Alice"]);

      name.set("Bob");
      await flush();
      expect(log).toEqual(["Alice", "Bob"]);
    });

    it("should return a dispose function", async () => {
      const log: number[] = [];
      const s = signal(0);
      const dispose = effect(() => {
        log.push(s());
      });
      expect(log).toEqual([0]);

      s.set(1);
      await flush();
      expect(log).toEqual([0, 1]);

      dispose();
      s.set(2);
      await flush();
      expect(log).toEqual([0, 1]); // no re-run after dispose
    });

    it("should run cleanup function from previous execution", async () => {
      const cleanups: number[] = [];
      const s = signal(0);
      effect(() => {
        const val = s();
        return () => cleanups.push(val);
      });
      expect(cleanups).toEqual([]);

      s.set(1);
      await flush();
      expect(cleanups).toEqual([0]); // cleanup from the run with val=0

      s.set(2);
      await flush();
      expect(cleanups).toEqual([0, 1]);
    });

    it("should track through computed signals", async () => {
      const log: number[] = [];
      const count = signal(1);
      const doubled = computed(() => count() * 2);
      effect(() => {
        log.push(doubled());
      });
      expect(log).toEqual([2]);

      count.set(5);
      await flush();
      expect(log).toEqual([2, 10]);
    });
  });

  describe("batch()", () => {
    it("should defer effect re-runs until batch completes", async () => {
      const log: string[] = [];
      const a = signal("x");
      const b = signal("y");
      effect(() => {
        log.push(`${a()}-${b()}`);
      });
      expect(log).toEqual(["x-y"]);

      batch(() => {
        a.set("A");
        b.set("B");
      });

      await flush();
      // Effect should have re-run only once
      expect(log).toEqual(["x-y", "A-B"]);
    });
  });

  describe("untracked()", () => {
    it("should read a signal without creating a dependency", async () => {
      const log: number[] = [];
      const tracked = signal(1);
      const hidden = signal(100);
      effect(() => {
        log.push(tracked() + untracked(() => hidden()));
      });
      expect(log).toEqual([101]);

      // Changing hidden should not re-run the effect
      hidden.set(200);
      await flush();
      expect(log).toEqual([101]);

      // Changing tracked should re-run (with latest hidden value)
      tracked.set(2);
      await flush();
      expect(log).toEqual([101, 202]);
    });
  });

  describe("Fine-grained dependency tracking in ViewModel", () => {
    it("should only re-evaluate computed props that depend on the changed signal", () => {
      const { useViewModel } = require("../../src");

      let nameComputeCount = 0;
      let ageComputeCount = 0;

      const vm = useViewModel({
        firstName: "John",
        lastName: "Doe",
        age: 30,
        fullName: (vm: any) => {
          nameComputeCount++;
          return `${vm.firstName} ${vm.lastName}`;
        },
        isAdult: (vm: any) => {
          ageComputeCount++;
          return vm.age >= 18;
        },
      });

      // Initial computation
      expect(vm.fullName).toBe("John Doe");
      expect(vm.isAdult).toBe(true);
      const initialNameCount = nameComputeCount;
      const initialAgeCount = ageComputeCount;

      // Changing age should NOT re-evaluate fullName
      vm.age = 25;
      // Force reads to trigger recomputation
      expect(vm.isAdult).toBe(true);
      expect(vm.fullName).toBe("John Doe");

      // fullName should not have recomputed (it doesn't depend on age)
      // With fine-grained tracking, nameComputeCount stays the same
      expect(nameComputeCount).toBe(initialNameCount);
      // isAdult should have recomputed since age changed
      expect(ageComputeCount).toBeGreaterThan(initialAgeCount);
    });
  });
});
