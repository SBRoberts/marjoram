import { store, effect, batch } from "../../src/reactivity";

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

describe("store() — Phase 3 array support", () => {
  describe("granular index tracking", () => {
    it("setting one index notifies only that index's subscribers", async () => {
      const s = store({ arr: [1, 2, 3] });
      let arr0Runs = 0;
      let arr1Runs = 0;
      effect(() => {
        s.arr[0];
        arr0Runs++;
      });
      effect(() => {
        s.arr[1];
        arr1Runs++;
      });
      expect(arr0Runs).toBe(1);
      expect(arr1Runs).toBe(1);

      s.arr[1] = 99;
      await flush();
      expect(arr0Runs).toBe(1);
      expect(arr1Runs).toBe(2);
    });

    it("setting an existing index does NOT wake length subscribers", async () => {
      const s = store({ arr: [1, 2, 3] });
      let lengthRuns = 0;
      effect(() => {
        s.arr.length;
        lengthRuns++;
      });
      expect(lengthRuns).toBe(1);

      s.arr[0] = 99;
      await flush();
      expect(lengthRuns).toBe(1);
    });
  });

  describe("push() — batched notifications", () => {
    it("push of one item produces one effect re-run", async () => {
      const s = store({ arr: [1, 2, 3] });
      let runs = 0;
      effect(() => {
        s.arr.length;
        runs++;
      });
      expect(runs).toBe(1);

      s.arr.push(4);
      await flush();
      expect(runs).toBe(2);
      expect(s.arr.length).toBe(4);
    });

    it("push of three items produces one effect re-run (not three)", async () => {
      const s = store({ arr: [1, 2, 3] });
      let runs = 0;
      effect(() => {
        s.arr.length;
        runs++;
      });
      expect(runs).toBe(1);

      s.arr.push(4, 5, 6);
      await flush();
      expect(runs).toBe(2);
      expect(s.arr).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("returns the new length", () => {
      const s = store({ arr: [1, 2] });
      const len = s.arr.push(3);
      expect(len).toBe(3);
    });
  });

  describe("pop() / shift() / unshift()", () => {
    it("pop() removes last item and returns it; one effect re-run", async () => {
      const s = store({ arr: [1, 2, 3] });
      let runs = 0;
      effect(() => {
        s.arr.length;
        runs++;
      });
      expect(runs).toBe(1);

      const popped = s.arr.pop();
      expect(popped).toBe(3);
      expect(s.arr).toEqual([1, 2]);

      await flush();
      expect(runs).toBe(2);
    });

    it("unshift() prepends; one effect re-run", async () => {
      const s = store({ arr: [2, 3] });
      let runs = 0;
      effect(() => {
        s.arr.length;
        runs++;
      });
      expect(runs).toBe(1);

      const len = s.arr.unshift(0, 1);
      expect(len).toBe(4);
      expect(s.arr).toEqual([0, 1, 2, 3]);

      await flush();
      expect(runs).toBe(2);
    });

    it("shift() removes first item; one effect re-run", async () => {
      const s = store({ arr: [1, 2, 3] });
      let runs = 0;
      effect(() => {
        s.arr.length;
        runs++;
      });
      expect(runs).toBe(1);

      const shifted = s.arr.shift();
      expect(shifted).toBe(1);
      expect(s.arr).toEqual([2, 3]);

      await flush();
      expect(runs).toBe(2);
    });
  });

  describe("splice() — most complex case", () => {
    it("splice that adds + removes produces one effect re-run", async () => {
      const s = store({ arr: [1, 2, 3, 4, 5] });
      let runs = 0;
      effect(() => {
        s.arr.length;
        runs++;
      });
      expect(runs).toBe(1);

      const removed = s.arr.splice(1, 2, 99, 98, 97);
      expect(removed).toEqual([2, 3]);
      expect(s.arr).toEqual([1, 99, 98, 97, 4, 5]);

      await flush();
      expect(runs).toBe(2);
    });

    it("splice that only removes returns the removed items", () => {
      const s = store({ arr: [1, 2, 3, 4] });
      const removed = s.arr.splice(1, 2);
      expect(removed).toEqual([2, 3]);
      expect(s.arr).toEqual([1, 4]);
    });
  });

  describe("sort() / reverse() / fill()", () => {
    it("sort() one effect re-run despite many internal swaps", async () => {
      const s = store({ arr: [3, 1, 4, 1, 5, 9, 2, 6] });
      let runs = 0;
      effect(() => {
        s.arr.forEach(() => {}); // depend on every index + length
        runs++;
      });
      expect(runs).toBe(1);

      s.arr.sort((a, b) => a - b);
      await flush();
      expect(runs).toBe(2); // single coalesced round
      expect(s.arr).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
    });

    it("reverse() one effect re-run", async () => {
      const s = store({ arr: [1, 2, 3, 4] });
      let runs = 0;
      effect(() => {
        s.arr.forEach(() => {});
        runs++;
      });
      expect(runs).toBe(1);

      s.arr.reverse();
      await flush();
      expect(runs).toBe(2);
      expect(s.arr).toEqual([4, 3, 2, 1]);
    });

    it("fill() one effect re-run", async () => {
      const s = store({ arr: [1, 2, 3, 4] });
      let runs = 0;
      effect(() => {
        s.arr.forEach(() => {});
        runs++;
      });
      expect(runs).toBe(1);

      s.arr.fill(0);
      await flush();
      expect(runs).toBe(2);
      expect(s.arr).toEqual([0, 0, 0, 0]);
    });
  });

  describe("read-only methods still reactive", () => {
    it("map() re-runs when array changes", async () => {
      const s = store({ arr: [1, 2, 3] });
      let snapshot: number[] = [];
      let runs = 0;
      effect(() => {
        snapshot = s.arr.map(x => x * 2);
        runs++;
      });
      expect(runs).toBe(1);
      expect(snapshot).toEqual([2, 4, 6]);

      s.arr.push(4);
      await flush();
      expect(runs).toBe(2);
      expect(snapshot).toEqual([2, 4, 6, 8]);
    });

    it("filter() works reactively", async () => {
      const s = store({ arr: [1, 2, 3, 4] });
      let evens: number[] = [];
      effect(() => {
        evens = s.arr.filter(x => x % 2 === 0);
      });
      expect(evens).toEqual([2, 4]);

      s.arr[0] = 8;
      await flush();
      expect(evens).toEqual([8, 2, 4]);
    });

    it("find() / some() / every() / reduce() all work", () => {
      const s = store({ arr: [1, 2, 3, 4, 5] });
      expect(s.arr.find(x => x > 3)).toBe(4);
      expect(s.arr.some(x => x > 4)).toBe(true);
      expect(s.arr.every(x => x > 0)).toBe(true);
      expect(s.arr.reduce((a, b) => a + b, 0)).toBe(15);
    });
  });

  describe("iteration reactivity", () => {
    it("for...of re-runs when array length changes", async () => {
      const s = store({ arr: [1, 2, 3] });
      let sum = 0;
      let runs = 0;
      effect(() => {
        sum = 0;
        for (const x of s.arr) sum += x;
        runs++;
      });
      expect(runs).toBe(1);
      expect(sum).toBe(6);

      s.arr.push(4);
      await flush();
      expect(runs).toBe(2);
      expect(sum).toBe(10);
    });

    it("forEach() re-runs when an item changes", async () => {
      const s = store({ arr: [1, 2, 3] });
      let sum = 0;
      effect(() => {
        sum = 0;
        s.arr.forEach(x => (sum += x));
      });
      expect(sum).toBe(6);

      s.arr[0] = 10;
      await flush();
      expect(sum).toBe(15);
    });
  });

  describe("array of objects — granular nested updates", () => {
    it("mutating an object inside an array updates only that path", async () => {
      const s = store({
        todos: [
          { id: 1, text: "a", done: false },
          { id: 2, text: "b", done: false },
        ],
      });
      let todo0TextRuns = 0;
      let todo1TextRuns = 0;
      effect(() => {
        s.todos[0].text;
        todo0TextRuns++;
      });
      effect(() => {
        s.todos[1].text;
        todo1TextRuns++;
      });
      expect(todo0TextRuns).toBe(1);
      expect(todo1TextRuns).toBe(1);

      s.todos[0].text = "updated";
      await flush();
      expect(todo0TextRuns).toBe(2);
      expect(todo1TextRuns).toBe(1);
    });

    it("pushing a new object item wakes length subscribers but not existing-item subscribers", async () => {
      const s = store({
        todos: [{ id: 1, text: "a" }] as { id: number; text: string }[],
      });
      let lengthRuns = 0;
      let item0Runs = 0;
      effect(() => {
        s.todos.length;
        lengthRuns++;
      });
      effect(() => {
        s.todos[0].text;
        item0Runs++;
      });
      expect(lengthRuns).toBe(1);
      expect(item0Runs).toBe(1);

      s.todos.push({ id: 2, text: "b" });
      await flush();
      expect(lengthRuns).toBe(2);
      expect(item0Runs).toBe(1);
    });
  });

  describe("explicit batch() still works around store mutations", () => {
    it("manual batch coalesces multiple store writes", async () => {
      const s = store({ arr: [1, 2, 3] });
      let runs = 0;
      effect(() => {
        s.arr[0];
        s.arr[1];
        s.arr[2];
        runs++;
      });
      expect(runs).toBe(1);

      batch(() => {
        s.arr[0] = 10;
        s.arr[1] = 20;
        s.arr[2] = 30;
      });

      await flush();
      expect(runs).toBe(2);
    });
  });

  describe("array identity is stable", () => {
    it("s.arr === s.arr across reads", () => {
      const s = store({ arr: [1, 2, 3] });
      expect(s.arr).toBe(s.arr);
    });

    it("array methods receive the proxy as this", () => {
      // If `this` inside push were the raw array (not the proxy), nested
      // mutations would bypass reactivity. Verify by side-effect.
      const s = store({ arr: [{ x: 1 }] });
      let runs = 0;
      effect(() => {
        s.arr.length;
        runs++;
      });
      expect(runs).toBe(1);

      s.arr.push({ x: 2 });
      return flush().then(() => {
        expect(runs).toBe(2);
        // And the new item is reactive too:
        let xRuns = 0;
        effect(() => {
          s.arr[1].x;
          xRuns++;
        });
        expect(xRuns).toBe(1);
        s.arr[1].x = 99;
        return flush().then(() => {
          expect(xRuns).toBe(2);
        });
      });
    });
  });
});
