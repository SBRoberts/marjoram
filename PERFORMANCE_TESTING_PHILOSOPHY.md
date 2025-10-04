# Performance Testing Philosophy

## The Problem with Conditional Test Skipping

**Original Issue**: Performance tests were conditionally skipped in CI environments using `test.skip`, which undermined their core value.

**Why This Was Wrong**:
- **CI is where you need performance tests most** - to catch regressions before deployment
- **Creates false confidence** - tests pass locally but provide no production guarantees  
- **Inconsistent coverage** - different environments run different test suites
- **Defeats the purpose** - performance tests that don't run in critical environments are essentially useless

## Improved Approach: Never Skip, Always Adapt

### 1. **Functional Correctness First**
```typescript
// Always test that the feature works correctly
expect(element.textContent).toBe("expected value");
```
This is the most important test - performance is secondary to correctness.

### 2. **Relative Performance Testing**
```typescript
// Compare against baseline, not absolute timing
const ratio = testTime / baselineTime;
expect(ratio <= maxRatio).toBe(true);
```
Environment-agnostic approach that works on any hardware.

### 3. **Adaptive Thresholds**
```typescript
// Adjust expectations, don't skip tests
maxRatio: isCI ? 50 : (isDebugMode ? 30 : 15)
```
More lenient in CI, but still catches major regressions.

### 4. **Statistical Rigor**
```typescript
// Multiple iterations + warmup + median for stability
const iterations = Math.max(PERF_CONFIG.iterations, PERF_CONFIG.minIterations);
// Warmup run to reduce JIT effects
testFn(); 
// Use median instead of average for outlier resistance
const medianTime = times.sort()[Math.floor(times.length / 2)];
```

### 5. **Comprehensive Logging**
```typescript
console.log(`Test=${medianTime.toFixed(2)}ms, Baseline=${baselineTime.toFixed(2)}ms, Ratio=${ratio.toFixed(2)} (max: ${maxRatio})`);
```
Always visible results for debugging performance issues.

## What We Test For

### ✅ **Always Validate**:
- **Functional correctness** (most critical)
- **Relative performance** vs baseline 
- **Memory cleanup** (no leaks)
- **Scalability characteristics** (O(n) behavior)

### ❌ **Never Test**:
- Absolute timing thresholds
- Hardware-specific performance
- JIT compilation artifacts
- Network-dependent timing

## Benefits of This Approach

1. **Consistent Coverage**: Same tests run everywhere
2. **Catches Real Regressions**: 10x slower than baseline is concerning regardless of environment
3. **Actionable Results**: Clear ratio comparisons help debug issues
4. **CI-Friendly**: Works reliably in automated environments
5. **Developer-Friendly**: Provides useful feedback during development

## Example Output

```
Local Development:
Rapid Updates: Test=0.22ms, Baseline=0.04ms, Ratio=5.17 (max: 30) ✓

CI Environment:  
Rapid Updates: Test=0.21ms, Baseline=0.04ms, Ratio=5.17 (max: 50) ✓
```

Same performance, different thresholds, consistent coverage.

## Key Principle

> **Performance tests should never be skipped. If the environment is unreliable for timing, adjust expectations, not coverage.**

This ensures you catch real performance regressions while maintaining reliable CI/CD pipelines.
