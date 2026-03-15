import { html, useViewModel } from "../../src";
import { getByTestId } from "@testing-library/dom";

const TEST_ID = "performance-test";

// Helper to wait for microtask queue to flush (for batched updates)
const flushMicrotasks = () => new Promise<void>(resolve => queueMicrotask(() => resolve()));

/**
 * Performance tests focused on behavioral correctness and relative performance:
 * 1. Always test functional correctness (most important)
 * 2. Use baseline comparison for relative performance (environment-agnostic)
 * 3. Multiple iterations for statistical reliability
 * 4. Adaptive thresholds based on environment characteristics
 * 5. Never skip tests - adjust expectations instead
 */

// Detect environment characteristics
const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
const isDebugMode = process.env.NODE_ENV !== "production";

// Performance test configuration - always run tests, adjust thresholds
const PERF_CONFIG = {
  // More lenient ratios for CI/debug (but still test performance)
  maxRatio: isCI ? 50 : isDebugMode ? 30 : 15,
  // Fewer iterations on CI to reduce noise, but still test
  iterations: isCI ? 5 : 10,
  // Minimum iterations to ensure statistical validity
  minIterations: 3,
};

describe("Performance & Memory Edge Cases", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // Helper function for performance testing with statistical rigor
  const performanceBenchmark = async (
    name: string,
    testFn: () => number | Promise<number>,
    baselineFn?: () => number,
    maxRatio = PERF_CONFIG.maxRatio
  ) => {
    const iterations = Math.max(
      PERF_CONFIG.iterations,
      PERF_CONFIG.minIterations
    );
    const testTimes: number[] = [];
    const baselineTimes: number[] = [];

    // Warmup run to reduce JIT compilation effects
    await testFn();
    if (baselineFn) baselineFn();

    // Run test multiple times for statistical validity
    for (let i = 0; i < iterations; i++) {
      testTimes.push(await testFn());
      if (baselineFn) {
        baselineTimes.push(baselineFn());
      }
    }

    // Calculate statistics
    const avgTestTime = testTimes.reduce((a, b) => a + b) / iterations;
    const medianTestTime = testTimes.sort((a, b) => a - b)[
      Math.floor(iterations / 2)
    ];

    if (baselineFn) {
      const avgBaselineTime =
        baselineTimes.reduce((a, b) => a + b) / iterations;
      const medianBaselineTime = baselineTimes.sort((a, b) => a - b)[
        Math.floor(iterations / 2)
      ];
      const ratio = medianTestTime / medianBaselineTime; // Use median for stability

      // Always log results for visibility (not just CI)
      // eslint-disable-next-line no-console
      console.log(
        `${name}: Test=${medianTestTime.toFixed(2)}ms, Baseline=${medianBaselineTime.toFixed(2)}ms, Ratio=${ratio.toFixed(2)} (max: ${maxRatio})`
      );

      // Return comprehensive results
      return {
        passed: ratio <= maxRatio,
        testTime: avgTestTime,
        medianTestTime,
        baselineTime: avgBaselineTime,
        medianBaselineTime,
        ratio,
        maxRatio,
      };
    }

    // eslint-disable-next-line no-console
    console.log(
      `${name}: Test=${medianTestTime.toFixed(2)}ms (avg: ${avgTestTime.toFixed(2)}ms)`
    );
    return { passed: true, testTime: avgTestTime, medianTestTime };
  };

  describe("Rapid Updates", () => {
    test("should handle rapid successive updates efficiently", async () => {
      const viewModel = useViewModel({ count: 0 });
      const view = html`<div data-testid="${TEST_ID}">
        ${viewModel.$count}
      </div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe("\n        0\n      ");

      // Test function
      const testRapidUpdates = async () => {
        const start = performance.now();
        for (let i = 0; i < 100; i++) {
          viewModel.count = i;
        }
        await flushMicrotasks();
        return performance.now() - start;
      };

      // Baseline: just variable assignments without DOM updates
      const baselineAssignments = () => {
        let testVar = 0;
        const start = performance.now();
        for (let i = 0; i < 100; i++) {
          testVar = i;
        }
        // Prevent optimization by using the variable
        expect(typeof testVar).toBe("number");
        return performance.now() - start;
      };

      // Run performance test - focus on relative performance, not absolute
      const result = await performanceBenchmark(
        "Rapid Updates",
        testRapidUpdates,
        baselineAssignments
      );

      // Should be reasonably fast relative to baseline (adapted for environment)
      expect(result.passed).toBe(true);

      // Ensure final update is complete
      await flushMicrotasks();

      // Most importantly: functional correctness must always work
      expect(element.textContent).toBe("\n        99\n      ");
    });

    test("should handle rapid updates to multiple properties", async () => {
      const viewModel = useViewModel({
        count: 0,
        text: "initial",
        flag: false,
      });

      const view = html`
        <div data-testid="${TEST_ID}">
          ${viewModel.$count} - ${viewModel.$text} - ${viewModel.$flag}
        </div>
      `;
      document.body.append(view);

      // Update all properties rapidly
      for (let i = 0; i < 50; i++) {
        viewModel.count = i;
        viewModel.text = `text-${i}`;
        viewModel.flag = i % 2 === 0;
      }
      await flushMicrotasks();

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toContain("49");
      expect(element.textContent).toContain("text-49");
      expect(element.textContent).toContain("false");
    });
  });

  describe("Updates to Non-Rendered Properties", () => {
    test("should handle updates to properties not in template", () => {
      const viewModel = useViewModel({
        visible: "rendered",
        hidden: "not rendered",
      });

      const view = html`<div data-testid="${TEST_ID}">
        ${viewModel.$visible}
      </div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe("\n        rendered\n      ");

      // Update non-rendered property multiple times
      for (let i = 0; i < 100; i++) {
        viewModel.hidden = `hidden-${i}`;
      }

      // Should not affect rendered content
      expect(element.textContent).toBe("\n        rendered\n      ");
      expect(viewModel.hidden).toBe("hidden-99");
    });

    test("should handle adding new properties that are not rendered", () => {
      const viewModel = useViewModel({ name: "John" });
      const view = html`<div data-testid="${TEST_ID}">${viewModel.$name}</div>`;
      document.body.append(view);

      // Add new properties
      for (let i = 0; i < 50; i++) {
        (viewModel as Record<string, unknown>)[`newProp${i}`] = `value${i}`;
      }

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe("John");
      expect((viewModel as Record<string, unknown>).newProp49).toBe("value49");
    });
  });

  describe("Large Number of Observers", () => {
    test("should handle many views observing the same property", async () => {
      const viewModel = useViewModel({ sharedValue: 0 });
      const views: DocumentFragment[] = [];

      // Create many views observing the same property
      for (let i = 0; i < 100; i++) {
        const view = html`<div data-testid="observer-${i}">
          ${viewModel.$sharedValue}
        </div>`;
        document.body.append(view);
        views.push(view);
      }

      // Update the shared property
      viewModel.sharedValue = 42;
      await flushMicrotasks();

      // All views should be updated
      for (let i = 0; i < 100; i++) {
        const element = getByTestId(document.body, `observer-${i}`);
        expect(element.textContent).toBe("\n          42\n        ");
      }
    });

    test("should handle cleanup when elements are removed", async () => {
      const viewModel = useViewModel({ count: 0 });
      const views: DocumentFragment[] = [];

      // Create views
      for (let i = 0; i < 10; i++) {
        const view = html`<div data-testid="cleanup-${i}">
          ${viewModel.$count}
        </div>`;
        document.body.append(view);
        views.push(view);
      }

      // Remove half the views
      for (let i = 0; i < 5; i++) {
        const element = getByTestId(document.body, `cleanup-${i}`);
        element.remove();
      }

      // Update should still work for remaining views
      viewModel.count = 100;
      await flushMicrotasks();

      for (let i = 5; i < 10; i++) {
        const element = getByTestId(document.body, `cleanup-${i}`);
        expect(element.textContent).toBe("\n          100\n        ");
      }
    });
  });

  describe("Computed Property Performance", () => {
    test("should handle expensive computed properties efficiently", async () => {
      const viewModel = useViewModel({ input: 0 });

      const computed = viewModel.$input.compute((value: number) => {
        let result = 0;
        for (let i = 0; i < value * 1000; i++) {
          result += i;
        }
        return result;
      });

      const view = html`<div data-testid="${TEST_ID}">${computed}</div>`;
      document.body.append(view);

      // Test with performance comparison
      const testComputedUpdate = async () => {
        const start = performance.now();
        viewModel.input = 5; // Should trigger recomputation
        await flushMicrotasks();
        return performance.now() - start;
      };

      const baselineComputation = () => {
        let result = 0;
        const start = performance.now();
        for (let i = 0; i < 5 * 1000; i++) {
          result += i;
        }
        // Prevent optimization
        expect(typeof result).toBe("number");
        return performance.now() - start;
      };

      const result = await performanceBenchmark(
        "Computed Property",
        testComputedUpdate,
        baselineComputation
      );

      // Performance should be reasonable relative to baseline
      expect(result.passed).toBe(true);

      // Most importantly: computed value should be correct
      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe("12497500"); // Sum of 0 to 4999
    });

    test("should handle multiple computed properties", async () => {
      const viewModel = useViewModel({ base: 10 });

      const doubled = viewModel.$base.compute((x: number) => x * 2);
      const tripled = viewModel.$base.compute((x: number) => x * 3);
      const squared = viewModel.$base.compute((x: number) => x * x);

      const view = html`
        <div data-testid="${TEST_ID}">
          ${doubled} | ${tripled} | ${squared}
        </div>
      `;
      document.body.append(view);

      viewModel.base = 5;
      await flushMicrotasks();

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toContain("10"); // doubled
      expect(element.textContent).toContain("15"); // tripled
      expect(element.textContent).toContain("25"); // squared
    });
  });
});
