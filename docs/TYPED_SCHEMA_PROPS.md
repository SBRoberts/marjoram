# Typed Schema Properties

Marjoram now provides full TypeScript support for array methods on schema properties, eliminating the need to cast to `any` when using array helper methods.

## Array Schema Properties

When you create a view model with array properties, you get full IntelliSense and type safety for array methods:

```typescript
import { useViewModel } from 'marjoram';

const viewModel = useViewModel({
  items: ['apple', 'banana', 'cherry'],
  numbers: [1, 2, 3, 4, 5],
  todos: [
    { id: 1, text: 'Learn TypeScript', done: false },
    { id: 2, text: 'Build awesome app', done: true }
  ]
});

// ✅ Full type safety - no casting needed!
const uppercaseItems = viewModel.$items.map(item => item.toUpperCase());
const evenNumbers = viewModel.$numbers.filter(num => num % 2 === 0);
const foundItem = viewModel.$items.find(item => item.includes('ban'));
const totalCount = viewModel.$items.length;

// ✅ Additional array methods now available
const hasApple = viewModel.$items.includes('apple');
const appleIndex = viewModel.$items.indexOf('apple');
const itemList = viewModel.$items.join(', ');
const firstTwo = viewModel.$items.slice(0, 2);
const hasAnyLongNames = viewModel.$items.some(item => item.length > 5);
const allValidItems = viewModel.$items.every(item => item.length > 0);

// ✅ Works in templates too
const view = html`
  <ul>
    ${viewModel.$todos.map(todo => html`
      <li class="${todo.done ? 'completed' : ''}">
        ${todo.text}
      </li>
    `)}
  </ul>
`;
```

## Available Array Methods

Schema array properties provide the following methods with full type support:

### Core Array Methods
- `map<U>(callback: (value: T, index: number, array: T[]) => U): U[]`
- `filter(predicate: (value: T, index: number, array: T[]) => boolean): T[]`
- `forEach(callback: (value: T, index: number, array: T[]) => void): void`
- `find(predicate: (value: T, index: number, array: T[]) => boolean): T | undefined`
- `reduce<U>(callback: (prev: U, current: T, index: number, array: T[]) => U, initialValue: U): U`

### Search & Test Methods
- `includes(searchElement: T, fromIndex?: number): boolean`
- `indexOf(searchElement: T, fromIndex?: number): number`
- `findIndex(predicate: (value: T, index: number, array: T[]) => boolean): number`
- `some(predicate: (value: T, index: number, array: T[]) => boolean): boolean`
- `every(predicate: (value: T, index: number, array: T[]) => boolean): boolean`

### Utility Methods
- `slice(start?: number, end?: number): T[]`
- `concat(...items: ConcatArray<T>[]): T[]`
- `join(separator?: string): string`
- `length: number | undefined`

## Type System

The library automatically detects array properties and provides the appropriate typing:

```typescript
import { TypedSchemaProp, SchemaArrayProp } from 'marjoram';

// For arrays: SchemaArrayProp<T>
type StringArrayProp = TypedSchemaProp<string[]>; // SchemaArrayProp<string>

// For non-arrays: SchemaProp  
type StringProp = TypedSchemaProp<string>; // SchemaProp
```

## Before vs After

**Before** (required casting):
```typescript
// ❌ Had to cast to any
const mapped = (viewModel.$items as any).map(item => item.toUpperCase());
const length = (viewModel.$items as any).length;
```

**After** (full type safety):
```typescript
// ✅ Full IntelliSense and type checking
const mapped = viewModel.$items.map(item => item.toUpperCase());
const length = viewModel.$items.length;
```

## Schema Direct Usage

You can also use typed properties when working directly with schemas:

```typescript
import { useSchema } from 'marjoram';

const schema = useSchema();
const arrayProp = schema.defineProperty(['x', 'y', 'z']); // SchemaArrayProp<string>
const stringProp = schema.defineProperty('hello'); // SchemaProp

// Type-safe array operations
const mapped = arrayProp.map(item => item.toUpperCase()); // string[]
const filtered = arrayProp.filter(item => item > 'x'); // string[]

// Regular schema prop operations
stringProp.update('world');
console.log(stringProp.value); // 'world'
```

This enhancement provides a much better developer experience with full IntelliSense support while maintaining backward compatibility with existing code.
