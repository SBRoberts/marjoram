# Computed Properties Feature - Documentation Changes

## Summary
Implemented convention-based computed properties at model definition level. All functions in a viewModel are now automatically treated as computed properties.

## Documentation Updates Made

### 1. **Quick Start Section**
- ✅ Added computed property example
- ✅ Shows `doubledCount` computed from `count`
- ✅ Demonstrates auto-update behavior

### 2. **API Reference - useViewModel**
- ✅ Added "Computed Properties at Model Definition" subsection
- ✅ Comprehensive examples showing:
  - Single dependency computed (`fullName`)
  - Chained computed properties (`subtotal` → `tax` → `total`)
  - Read-only behavior and error handling
- ✅ Key features list with checkmarks

### 3. **New Computed Properties Section**
- ✅ Complete comparison table between model-level and view-time `.compute()`
- ✅ Clear guidance on when to use each approach
- ✅ Examples demonstrating both patterns
- ✅ Best practices for combining both approaches

### 4. **Examples Updates**
- ✅ **Todo App**: Added computed properties for `filteredTodos`, `activeCount`, `completedCount`
- ✅ **Form Validation**: Refactored to use computed validation (`nameError`, `emailError`, `isValid`)
- ✅ Both examples now showcase the new pattern effectively

### 5. **Current Limitations**
- ✅ Added "Function Properties as Computed" section
- ✅ Explains that ALL functions are computed properties
- ✅ Shows workaround for event handlers (define outside viewModel)
- ✅ Added note about batched updates and testing
- ✅ Updated "Performance Considerations" with microtask queue details

### 6. **Planned Improvements**
- ✅ Added "Fine-grained dependency tracking" to roadmap

## Key Messaging

### What Changed
- Functions in viewModels are now **computed properties** (not regular functions)
- Computed properties take the viewModel as a parameter: `(vm) => vm.prop1 + vm.prop2`
- Computed properties are **read-only** and **auto-update**

### Benefits Highlighted
1. **Convention over configuration** - No need to import `computed()`
2. **Automatic updates** - Recalculate when ANY property changes
3. **Always fresh** - Reading returns current value
4. **Reusable** - Define once, use anywhere
5. **Type-safe** - Full TypeScript support

### Distinction from .compute()
| Aspect | Model-Level | View-Time `.compute()` |
|--------|-------------|------------------------|
| Where | In viewModel | In template |
| Dependencies | Multiple properties | Single property |
| Reusability | High | Low |
| Best for | Complex logic | Simple transforms |

## Code Examples Added

### Basic Pattern
```typescript
const vm = useViewModel({
  firstName: 'John',
  lastName: 'Doe',
  fullName: (vm) => `${vm.firstName} ${vm.lastName}`
});
```

### Chained Computed
```typescript
const vm = useViewModel({
  price: 100,
  quantity: 2,
  subtotal: (vm) => vm.price * vm.quantity,
  tax: (vm) => vm.subtotal * 0.1,
  total: (vm) => vm.subtotal + vm.tax
});
```

### Read-Only Behavior
```typescript
vm.doubled = 100; // ❌ Error: Cannot set computed property
vm.count = 10;    // ✅ Updates count and recomputes doubled
```

## Removed/Deprecated

### ❌ Removed Examples
- Old standalone computed property pattern (defining outside viewModel)

### ⚠️ Changed Behavior
- Functions in viewModels are NO LONGER regular functions
- They MUST take the viewModel as first parameter
- They return computed values, not function references

## Testing Guidance Added

Added note about double microtask flush in tests:
```typescript
viewModel.count = 10;
await flushMicrotasks(); // Property update
await flushMicrotasks(); // Computed update
```

## Files Modified
- ✅ README.md (comprehensive updates)
- ✅ All code examples updated
- ✅ New sections added
- ✅ Clear migration guidance provided

## Next Steps

### Documentation (Optional Enhancements)
- [ ] Add "Migration Guide" for users upgrading from pre-computed versions
- [ ] Create separate "Advanced Patterns" doc for complex use cases
- [ ] Add performance benchmarks comparing model-level vs view-time computed

### Code (Future Improvements)
- [ ] Fine-grained dependency tracking (only recalculate when actual deps change)
- [ ] Better TypeScript inference for computed properties
- [ ] Dev-mode warnings for common mistakes (e.g., side effects in computed)

## Breaking Changes Notice

⚠️ **BREAKING CHANGE**: Functions in viewModels are now treated as computed properties.

**Before (v0.0.x):**
```typescript
const vm = useViewModel({
  onClick: () => console.log('clicked') // Regular function
});
vm.onClick(); // Works
```

**After (v0.1.0+):**
```typescript
const vm = useViewModel({
  onClick: () => console.log('clicked') // Treated as computed!
});
vm.onClick; // Returns the result of executing the function
```

**Migration:**
```typescript
// Define functions outside the viewModel
const onClick = () => console.log('clicked');
const vm = useViewModel({ /* only state */ });
```
