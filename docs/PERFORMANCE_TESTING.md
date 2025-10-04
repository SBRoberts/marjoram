# Performance Testing Guidelines

## Overview

Performance tests can be notoriously brittle and unreliable across different hardware, operating systems, and CI environments. This document outlines the strategies implemented in Marjoram to create robust performance tests.

## Challenges with Performance Testing

### Common Issues
- **Hardware Variations**: Different CPU speeds, memory, and storage types
- **CI/CD Environments**: Shared resources, virtualization overhead, inconsistent performance
- **System Load**: Other processes affecting timing measurements
- **JavaScript Engine Differences**: V8 optimizations, garbage collection timing
- **Network Conditions**: For tests involving external resources

## Solutions Implemented

### 1. Baseline Comparison Instead of Absolute Timing

**Before (Brittle):**
```javascript
const start = performance.now();
performOperation();
const duration = performance.now() - start;
expect(duration).toBeLessThan(100); // Fixed threshold - fails on slow systems
```

**After (Robust):**
```javascript
const testOperation = () => {
  const start = performance.now();
  performOperation();
  return performance.now() - start;
};

const baselineOperation = () => {
  const start = performance.now();
  simpleEquivalentOperation();
  return performance.now() - start;
};

const ratio = testOperation() / baselineOperation();
expect(ratio).toBeLessThan(10); // Relative performance - more reliable
```

### 2. Multiple Iterations and Averaging

```javascript
const performanceBenchmark = (testFn, baselineFn, iterations = 3) => {
  const testTimes = [];
  const baselineTimes = [];
  
  for (let i = 0; i < iterations; i++) {
    testTimes.push(testFn());
    baselineTimes.push(baselineFn());
  }
  
  const avgTest = testTimes.reduce((a, b) => a + b) / iterations;
  const avgBaseline = baselineTimes.reduce((a, b) => a + b) / iterations;
  
  return avgTest / avgBaseline;
};
```

### 3. Environment Detection and Adaptive Thresholds

```javascript
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

const PERF_CONFIG = {
  skipTimingTests: isCI || isSlow,
  maxRatio: isCI ? 20 : 10, // More lenient in CI
  iterations: isCI ? 1 : 3   // Fewer iterations in CI
};
```

### 4. Conditional Test Skipping

```javascript
// Skip timing-sensitive tests in unreliable environments
const testFn = PERF_CONFIG.skipTimingTests ? test.skip : test;

testFn("should handle rapid updates efficiently", () => {
  // Test only runs in reliable environments
});
```

### 5. Debugging and Observability

```javascript
// Log performance metrics for debugging CI issues
console.log(`Test=${testTime.toFixed(2)}ms, Baseline=${baselineTime.toFixed(2)}ms, Ratio=${ratio.toFixed(2)}`);
```

## Test Categories

### Always Run (High Reliability)
- **Functional correctness** - Tests that verify behavior works correctly
- **Memory tests** - Tests that check for memory leaks or excessive allocation
- **Scale tests** - Tests with large datasets that verify functionality

### Conditionally Run (Timing Sensitive)
- **Performance benchmarks** - Tests that measure execution speed
- **Rapid update tests** - Tests that verify performance under high frequency changes
- **Computed property performance** - Tests measuring reactive computation speed

## Best Practices

### ✅ Do
- Use relative performance comparisons (ratios) instead of absolute timing
- Run multiple iterations and average the results
- Detect CI environments and adjust expectations
- Skip timing-sensitive tests in unreliable environments
- Log performance metrics for debugging
- Test functionality first, performance second
- Use realistic workloads in performance tests

### ❌ Don't
- Use fixed time thresholds (`expect(time).toBeLessThan(100)`)
- Run performance tests only once
- Assume consistent performance across environments
- Make performance tests critical for CI/CD pipeline success
- Test unrealistic edge cases that don't reflect real usage
- Mix functional and performance assertions in the same test

## Configuration

The performance test configuration can be customized via environment variables:

```bash
# Skip all timing-sensitive tests
CI=true npm test

# Force run all tests (use with caution in CI)
FORCE_PERF_TESTS=true npm test

# Adjust performance ratio tolerance
PERF_RATIO_TOLERANCE=15 npm test
```

## Monitoring Performance Over Time

For continuous performance monitoring, consider:

1. **Separate performance test suite** - Run as a separate job that can fail without blocking releases
2. **Performance budgets** - Track performance over time with tools like bundlesize
3. **Benchmark tracking** - Store performance metrics in a time series database
4. **Regression detection** - Alert when performance degrades significantly

## Example Implementation

See `__tests__/edge-cases/performance.test.ts` for a complete implementation of these patterns.

## CI Integration

In GitHub Actions, performance tests are automatically adjusted:

```yaml
- name: Run Tests
  run: npm test
  env:
    CI: true  # Automatically set by GitHub Actions
```

The tests will automatically:
- Skip timing-sensitive tests
- Use more lenient performance thresholds
- Run fewer iterations to speed up CI
- Log performance metrics for debugging
