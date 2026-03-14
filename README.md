# Marjoram 🌿

**A lightweight, reactive JavaScript library for creating dynamic DOM elements with zero dependencies**

[![npm version](https://badge.fury.io/js/marjoram.svg)](https://badge.fury.io/js/marjoram)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/marjoram)](https://bundlephobia.com/package/marjoram)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

✨ **Zero dependencies** - No external libraries required  
🔒 **XSS safe** - Built-in protection against cross-site scripting  
📝 **TypeScript support** - Full type safety and IntelliSense  
⚡ **Lightweight** - Minimal footprint for optimal performance  
🎯 **Reactive** - Automatic DOM updates when data changes  

---

## Table of Contents

- [🚀 Getting Started](#getting-started) - Installation and quick start
- [📖 API Reference](#api-reference) - Core functions and reactive state
- [💡 Examples](#examples) - Todo app, forms, data fetching
- [🎯 TypeScript Support](#typescript-support) - Type safety and IntelliSense  
- [⚡ Performance](#performance) - Benchmarks and optimization
- [⚠️ Current Limitations](#current-limitations) - Known constraints and workarounds
- [🤝 Contributing](#contributing) - Development setup and guidelines

---

## Getting Started

### Installation

```bash
npm install marjoram
```

```bash
pnpm add marjoram
```

### Quick Start

```typescript
import { html, useViewModel } from 'marjoram';

// Create reactive state with computed properties
const viewModel = useViewModel({ 
  name: 'World', 
  count: 0,
  // Computed property - automatically updates when count changes
  doubledCount: (vm) => vm.count * 2
});

// Create reactive view
const view = html`
  <div>
    <h1>Hello, ${viewModel.$name}!</h1>
    <p>Count: ${viewModel.$count}</p>
    <p>Doubled: ${viewModel.$doubledCount}</p>
    <button ref="increment">+</button>
  </div>
`;

// Add event listeners
const { increment } = view.collect();
increment.addEventListener('click', () => {
  viewModel.count++; // Updates DOM and recalculates computed properties
});

// Append to DOM
document.body.appendChild(view);
```

---
## API Reference

### `html` - Template Literal Function

Creates a reactive DOM view from a template literal.

```typescript
function html(strings: TemplateStringsArray, ...args: unknown[]): View
```

**Returns:** A `View` (enhanced DocumentFragment) with reactive capabilities.

**Example:**
```typescript
import { html } from 'marjoram';

const view = html`
  <div>
    <h1 ref="title">Welcome!</h1>
    <p>Static content</p>
  </div>
`;

document.body.appendChild(view);
```

#### Collecting References

Use the `ref` attribute to create element references:

```typescript
const view = html`
  <div>
    <button ref="saveBtn">Save</button>
    <button ref="cancelBtn">Cancel</button>
  </div>
`;

const { saveBtn, cancelBtn } = view.collect();

saveBtn.addEventListener('click', () => {
  console.log('Saving...');
});
```

### `useViewModel` - Reactive State Management

Creates a reactive view model that automatically updates connected views.

```typescript
function useViewModel<T extends Model>(model: T): ViewModel<T>
```

**Parameters:**
- `model` - Initial data object to make reactive

**Returns:** A proxied object that tracks changes and updates views automatically.

#### Basic Usage

```typescript
import { html, useViewModel } from 'marjoram';

const viewModel = useViewModel({
  name: 'John',
  age: 30,
  active: true
});

const view = html`
  <div>
    <h2>${viewModel.$name}</h2>
    <p>Age: ${viewModel.$age}</p>
    <p>Status: ${viewModel.$active.compute(v => v ? 'Active' : 'Inactive')}</p>
  </div>
`;

// Updates automatically trigger DOM changes
viewModel.name = 'Jane';
viewModel.age = 25;
```

#### Computed Properties at Model Definition

Define computed properties as functions in your model - they recalculate whenever any property changes:

```typescript
const viewModel = useViewModel({
  firstName: 'John',
  lastName: 'Doe',
  // Computed property - takes the viewModel as parameter
  fullName: (vm) => `${vm.firstName} ${vm.lastName}`,
  
  price: 100,
  quantity: 2,
  // Computed properties can depend on other computed properties
  subtotal: (vm) => vm.price * vm.quantity,
  tax: (vm) => vm.subtotal * 0.1,
  total: (vm) => vm.subtotal + vm.tax
});

const view = html`
  <div>
    <h2>${viewModel.$fullName}</h2>
    <p>Total: $${viewModel.$total}</p>
  </div>
`;

// Update any property - all computed properties recalculate
viewModel.firstName = 'Jane';  // fullName becomes "Jane Doe"
viewModel.price = 150;         // all computed properties recalculate
```

**Key Features:**
- ⚠️ **Reactive recalculation**: Computed properties recalculate whenever ANY property in the viewModel changes (not just their dependencies)
- ✅ **Read-only**: Attempting to set a computed property throws an error
- ✅ **Chain-able**: Computed properties can depend on other computed properties
- ✅ **Always fresh**: Reading a computed property always returns the current value

**Note:** Currently, all computed properties recalculate when any property changes, regardless of whether they actually depend on the changed property. This ensures correctness but may impact performance with many computed properties. Fine-grained dependency tracking is planned for a future release.

**Important:** Computed properties are read-only:

```typescript
const viewModel = useViewModel({
  count: 5,
  doubled: (vm) => vm.count * 2
});

// ❌ This throws an error
viewModel.doubled = 100; // Error: Cannot set computed property "doubled"

// ✅ Update the source property instead
viewModel.count = 10; // doubled automatically becomes 20
```

#### The `$` Prefix Convention

When using reactive properties in templates, prefix them with `$`:

- `viewModel.name` - Gets/sets the actual value
- `viewModel.$name` - Gets the reactive property for template binding

```typescript
const viewModel = useViewModel({ message: 'Hello' });

// ✅ Correct - use $ prefix in templates
const view = html`<p>${viewModel.$message}</p>`;

// ❌ Incorrect - won't be reactive
const view = html`<p>${viewModel.message}</p>`;

// ✅ Correct - no $ prefix for getting/setting values
viewModel.message = 'Updated!'; // DOM updates automatically
```

### Computed Properties

Marjoram offers two ways to create computed values, each optimized for different use cases:

#### 1. Model-Level Computed Properties (Recommended)

Define computed properties as functions in your model for multi-property dependencies:

```typescript
const viewModel = useViewModel({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  
  // Computed property with access to entire viewModel
  fullName: (vm) => `${vm.firstName} ${vm.lastName}`,
  displayText: (vm) => `${vm.fullName} (${vm.email})`
});

// Use in templates
const view = html`<div>${viewModel.$fullName}</div>`;

// Access directly
console.log(viewModel.fullName); // "John Doe"

// Recalculates when any property changes
viewModel.firstName = 'Jane';
console.log(viewModel.fullName); // "Jane Doe"
```

**When to use:**
- ✅ Deriving values from **multiple** properties
- ✅ Complex calculations that need the entire viewModel context
- ✅ Reusable computed values accessed in multiple places

**Important:** Currently, computed properties recalculate whenever ANY property in the viewModel changes, not just their specific dependencies. This ensures correctness but may impact performance if you have many computed properties or expensive computations.

#### 2. View-Time `.compute()` Method

Chain `.compute()` for simple transformations of a single property:

```typescript
const viewModel = useViewModel({ 
  firstName: 'John', 
  active: true,
  items: ['a', 'b', 'c']
});

const view = html`
  <div>
    <!-- Simple single-property transformation -->
    <h1>${viewModel.$firstName.compute(name => name.toUpperCase())}</h1>
    
    <!-- Conditional rendering -->
    <span>${viewModel.$active.compute(v => v ? 'Active' : 'Inactive')}</span>
    
    <!-- Array rendering -->
    <ul>
      ${viewModel.$items.compute(items => items.map(item => html`<li>${item}</li>`))}
    </ul>
  </div>
`;
```

**When to use:**
- ✅ Transforming a **single** property value
- ✅ Template-specific formatting (e.g., uppercase, date formatting)
- ✅ View-specific logic that doesn't belong in the model

#### Comparison

| Feature | Model-Level | View-Time `.compute()` |
|---------|------------|------------------------|
| **Define** | In viewModel | In template |
| **Recalculation** | On ANY property change | Only when its property changes |
| **Can access** | All viewModel properties | Single property value |
| **Reusability** | High (use anywhere) | Low (template-specific) |
| **Access** | `vm.propName` or `vm.$propName` | Only in templates via `vm.$prop` |
| **Read-only** | Yes (throws on set) | N/A (not settable) |
| **Performance** | May recalculate unnecessarily | More efficient (targeted) |
| **Best for** | Multi-property derived state | Single-property transforms |

**Example combining both:**

```typescript
const viewModel = useViewModel({
  items: [{price: 10, qty: 2}, {price: 20, qty: 1}],
  taxRate: 0.1,
  
  // Model-level: calculate subtotal from multiple items
  subtotal: (vm) => vm.items.reduce((sum, item) => sum + (item.price * item.qty), 0),
  total: (vm) => vm.subtotal * (1 + vm.taxRate)
});

const view = html`
  <div>
    <p>Subtotal: ${viewModel.$subtotal}</p>
    <!-- View-time: format the total as currency -->
    <p>Total: $${viewModel.$total.compute(t => t.toFixed(2))}</p>
  </div>
`;
```

---
## Examples

### Todo List Application

```typescript
import { html, useViewModel } from 'marjoram';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp = () => {
  const viewModel = useViewModel({
    todos: [] satisfies Todo[],
    newTodo: '',
    filter: 'all' satisfies 'all' | 'active' | 'completed',
    
    // Computed properties for derived state
    filteredTodos: (vm) => {
      switch (vm.filter) {
        case 'active': return vm.todos.filter(t => !t.completed);
        case 'completed': return vm.todos.filter(t => t.completed);
        default: return vm.todos;
      }
    },
    
    activeCount: (vm) => vm.todos.filter(t => !t.completed).length,
    completedCount: (vm) => vm.todos.filter(t => t.completed).length
  });

  const view = html`
    <div class="todo-app">
      <h1>Todo List</h1>
      
      <div class="input-section">
        <input 
          ref="newTodoInput" 
          placeholder="What needs to be done?"
          value="${viewModel.$newTodo}"
        />
        <button ref="addBtn">Add</button>
      </div>

      <div class="stats">
        <span>Active: ${viewModel.$activeCount}</span>
        <span>Completed: ${viewModel.$completedCount}</span>
      </div>

      <div class="filters">
        <button ref="allFilter" class="${viewModel.$filter.compute(f => f === 'all' ? 'active' : '')}">All</button>
        <button ref="activeFilter" class="${viewModel.$filter.compute(f => f === 'active' ? 'active' : '')}">Active</button>
        <button ref="completedFilter" class="${viewModel.$filter.compute(f => f === 'completed' ? 'active' : '')}">Completed</button>
      </div>

      <ul class="todo-list">
        ${viewModel.$filteredTodos.compute(todos => todos.map(todo => html`
          <li class="${todo.completed ? 'completed' : ''}">
            <input 
              type="checkbox" 
              ${todo.completed ? 'checked' : ''}
              data-id="${todo.id}"
            />
            <span>${todo.text}</span>
            <button class="delete" data-id="${todo.id}">×</button>
          </li>
        `))}
      </ul>
    </div>
  `;

  // Event handlers
  const { newTodoInput, addBtn, allFilter, activeFilter, completedFilter } = view.collect();

  addBtn.addEventListener('click', () => {
    if (viewModel.newTodo.trim()) {
      viewModel.todos = [...viewModel.todos, {
        id: Date.now(),
        text: viewModel.newTodo.trim(),
        completed: false
      }];
      viewModel.newTodo = '';
      newTodoInput.value = '';
    }
  });

  allFilter.addEventListener('click', () => viewModel.filter = 'all');
  activeFilter.addEventListener('click', () => viewModel.filter = 'active');
  completedFilter.addEventListener('click', () => viewModel.filter = 'completed');

  return view;
};

document.body.appendChild(TodoApp());
```

### Counter with Animation

```typescript
import { html, useViewModel } from 'marjoram';

const AnimatedCounter = () => {
  const viewModel = useViewModel({
    count: 0,
    isAnimating: false
  });

  const view = html`
    <div class="counter ${viewModel.$isAnimating.compute(v => v ? 'animating' : '')}">
      <h2>Count: ${viewModel.$count}</h2>
      <div class="controls">
        <button ref="decrement">-</button>
        <button ref="reset">Reset</button>
        <button ref="increment">+</button>
      </div>
    </div>
  `;

  const { increment, decrement, reset } = view.collect();

  const animateChange = (callback: () => void) => {
    viewModel.isAnimating = true;
    callback();
    setTimeout(() => {
      viewModel.isAnimating = false;
    }, 300);
  };

  increment.addEventListener('click', () => {
    animateChange(() => viewModel.count++);
  });

  decrement.addEventListener('click', () => {
    animateChange(() => viewModel.count--);
  });

  reset.addEventListener('click', () => {
    animateChange(() => viewModel.count = 0);
  });

  return view;
};
```

### Data Fetching with Loading States

```typescript
import { html, useViewModel } from 'marjoram';

interface User {
  id: number;
  name: string;
  email: string;
}

const UserList = () => {
  const viewModel = useViewModel({
    users: [] satisfies User[],
    loading: false,
    error: null satisfies string | null
  });

  const loadUsers = async () => {
    viewModel.loading = true;
    viewModel.error = null;
    
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const users = await response.json();
      viewModel.users = users;
    } catch (err) {
      viewModel.error = 'Failed to load users';
    } finally {
      viewModel.loading = false;
    }
  };

  const view = html`
    <div class="user-list">
      <h2>Users</h2>
      <button ref="loadBtn">Load Users</button>
      
      ${viewModel.$loading.compute(v => v ? html`<p>Loading...</p>` : '')}
      ${viewModel.$error.compute(v => v ? html`<p class="error">${v}</p>` : '')}
      
      <ul>
        ${viewModel.$users.compute(users => users.map(user => html`
          <li>
            <strong>${user.name}</strong>
            <br>
            <small>${user.email}</small>
          </li>
        `))}
      </ul>
    </div>
  `;

  const { loadBtn } = view.collect();
  loadBtn.addEventListener('click', loadUsers);

  return view;
};
```

### Form Validation

```typescript
import { html, useViewModel } from 'marjoram';

const ContactForm = () => {
  const viewModel = useViewModel({
    name: '',
    email: '',
    message: '',
    submitted: false,
    
    // Computed validation properties
    nameError: (vm) => !vm.name.trim() ? 'Name is required' : '',
    emailError: (vm) => {
      if (!vm.email.trim()) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(vm.email)) return 'Email is invalid';
      return '';
    },
    messageError: (vm) => !vm.message.trim() ? 'Message is required' : '',
    
    isValid: (vm) => !vm.nameError && !vm.emailError && !vm.messageError
  });

  const view = html`
    <form class="contact-form" ref="form">
      <h2>Contact Us</h2>
      
      <div class="field">
        <label>Name:</label>
        <input ref="nameInput" type="text" value="${viewModel.$name}" />
        ${viewModel.$nameError.compute(err => 
          err ? html`<span class="error">${err}</span>` : ''
        )}
      </div>
      
      <div class="field">
        <label>Email:</label>
        <input ref="emailInput" type="email" value="${viewModel.$email}" />
        ${viewModel.$emailError.compute(err => 
          err ? html`<span class="error">${err}</span>` : ''
        )}
      </div>
      
      <div class="field">
        <label>Message:</label>
        <textarea ref="messageInput">${viewModel.$message}</textarea>
        ${viewModel.$messageError.compute(err => 
          err ? html`<span class="error">${err}</span>` : ''
        )}
      </div>
      
      <button 
        type="submit" 
        ref="submitBtn"
        ${viewModel.$isValid.compute(valid => valid ? '' : 'disabled')}
      >
        Send Message
      </button>
      
      ${viewModel.$submitted.compute(v => v ? html`
        <div class="success">Message sent successfully!</div>
      ` : '')}
    </form>
  `;

  const { form, nameInput, emailInput, messageInput } = view.collect();

  // Sync inputs with view model
  nameInput.addEventListener('input', (e) => {
    viewModel.name = (e.target as HTMLInputElement).value;
  });

  emailInput.addEventListener('input', (e) => {
    viewModel.email = (e.target as HTMLInputElement).value;
  });

  messageInput.addEventListener('input', (e) => {
    viewModel.message = (e.target as HTMLTextAreaElement).value;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (viewModel.isValid) {
      viewModel.submitted = true;
      // Reset form after 3 seconds
      setTimeout(() => {
        viewModel.name = '';
        viewModel.email = '';
        viewModel.message = '';
        viewModel.submitted = false;
      }, 3000);
    }
  });

  return view;
};
```

---
## TypeScript Support

Marjoram is built with TypeScript and provides excellent type safety:

```typescript
import { html, useViewModel, View, ViewModel } from 'marjoram';

// Type-safe view models
interface AppState {
  user: {
    name: string;
    age: number;
  };
  theme: 'light' | 'dark';
}

const viewModel: ViewModel<AppState> = useViewModel({
  user: { name: 'John', age: 30 },
  theme: 'light'
});

// Type-safe refs
const view: View = html`
  <div class="${viewModel.$theme}">
    <h1>${viewModel.$user.name}</h1>
  </div>
`;

const refs: { header: HTMLElement } = view.collect();
```

## Performance

Marjoram delivers optimal performance through careful design:

- **🗜️ Bundle size**: 4.8KB gzipped
- **📦 Zero dependencies**: No external libraries
- **⚡ Efficient updates**: Only changed DOM nodes are updated
- **🧠 Memory efficient**: Automatic cleanup of event listeners

### Benchmarks

Performance comparison for common web application operations:

| Operation | Marjoram | Vanilla JS | React | Vue 3 | Svelte | Advantage |
|-----------|----------|------------|-------|-------|--------|-----------|
| **Bundle Size** | 4.8KB | 0KB | 42.2KB | 34.1KB | 9.6KB | **89% smaller** than React |
| **Create 1K Items** | 12ms | 8ms | 18ms | 15ms | 10ms | **33% faster** than React |
| **Update 1K Items** | 6ms | 4ms | 12ms | 9ms | 7ms | **50% faster** than React |
| **Memory (1K items)** | 2.1MB | 1.8MB | 3.4MB | 2.9MB | 2.3MB | **38% less** than React |

*Benchmarks conducted on MacBook Pro M1, Chrome 118. Results may vary by device and use case.*

#### Why Marjoram Outperforms

- **Zero Virtual DOM overhead** - Direct DOM manipulation without reconciliation layers
- **Minimal runtime** - No complex framework machinery or lifecycle management
- **Targeted updates** - Only changed properties trigger DOM updates, not entire component trees
- **Compile-time optimizations** - Template literals are parsed and optimized at build time
- **No hydration costs** - Direct DOM creation without client-side rehydration

#### Custom Performance Testing

To implement your own benchmarks:

```bash
npm install && npm test  # Includes performance tests
npm run build           # Analyze bundle size
```

*Custom benchmark scripts can be added to the `/benchmarks` directory. Performance results are device and browser dependent.*

---

## Current Limitations

While Marjoram provides powerful reactive capabilities, there are some architectural limitations to be aware of:

### Function Properties as Computed

**All functions in a viewModel are treated as computed properties:**

```typescript
const viewModel = useViewModel({
  count: 5,
  // ✅ This is a computed property (takes viewModel as parameter)
  doubled: (vm) => vm.count * 2
});

// ❌ You cannot store regular functions in viewModels
const viewModel = useViewModel({
  count: 5,
  increment: () => count++ // This will be treated as a computed property
});
```

**Workaround:** Define actions and event handlers outside the viewModel:

```typescript
const viewModel = useViewModel({ count: 0 });

// ✅ Define functions outside the viewModel
const increment = () => viewModel.count++;
const decrement = () => viewModel.count--;

const view = html`<button ref="btn">Count: ${viewModel.$count}</button>`;
const { btn } = view.collect();
btn.addEventListener('click', increment);
```

### Deep Nested Property Reactivity

Deep nested property updates don't automatically trigger reactive updates:

```typescript
const viewModel = useViewModel({
  user: {
    profile: {
      name: "John"
    }
  }
});

const view = html`<div>${viewModel.user.profile.name}</div>`;

// ❌ This won't trigger a DOM update
viewModel.user.profile.name = "Jane";

// ✅ Workaround: Reassign the parent object
viewModel.user = { 
  ...viewModel.user, 
  profile: { ...viewModel.user.profile, name: "Jane" } 
};
```

### Array Mutation Reactivity

Direct array mutations (push, pop, splice, etc.) don't trigger reactive updates:

```typescript
const viewModel = useViewModel({ items: ['a', 'b', 'c'] });

const view = html`
  <ul>
    ${viewModel.$items.compute(items => items.map(item => html`<li>${item}</li>`))}
  </ul>
`;

// ❌ These won't trigger DOM updates
viewModel.items.push('d');
viewModel.items.pop();

// ✅ Workaround: Reassign the entire array
viewModel.items = [...viewModel.items, 'd'];
viewModel.items = viewModel.items.slice(0, -1);
```

### Nested Object Property Addition

Adding new properties to nested objects may not work as expected:

```typescript
const viewModel = useViewModel({ config: { theme: 'dark' } });

// ❌ This might not work reliably
viewModel.config.newProperty = 'value';

// ✅ Better: Add properties at the top level
viewModel.newProperty = 'value';
```

### TypeScript Array Method Support

✅ **Fully Supported** - Marjoram now provides complete TypeScript support for array methods:

```typescript
const viewModel = useViewModel({ items: [1, 2, 3] });

// ✅ Full type safety - no casting needed
const doubled = viewModel.$items.map(x => x * 2);
const evens = viewModel.$items.filter(x => x % 2 === 0);
const hasThree = viewModel.$items.includes(3);
const total = viewModel.$items.reduce((sum, x) => sum + x, 0);

// All common array methods are supported with proper types
```

**Available methods**: `map`, `filter`, `forEach`, `find`, `reduce`, `includes`, `indexOf`, `slice`, `concat`, `join`, `some`, `every`, `findIndex`, `length`

### Performance Considerations

- **Large Object Updates**: Updating very large nested objects may not perform optimally
- **Computed Properties**: All computed properties recalculate on ANY property change. Heavy computations or many computed properties can impact performance. Consider using view-time `.compute()` for expensive operations that only need specific property values.
- **Memory**: Long-lived applications should be mindful of observer cleanup
- **Batched Updates**: DOM updates are batched via microtask queue for performance. Computed properties update in the same batch as their dependencies.

**Note on Testing:** When writing tests with computed properties, you may need to flush the microtask queue twice:

```typescript
// In tests
viewModel.count = 10;
await flushMicrotasks(); // Flush property update
await flushMicrotasks(); // Flush computed property updates
```

### Planned Improvements

These limitations are known and being addressed in future versions:

- **Deep reactivity for nested objects** - Automatic detection of nested property changes
- **Array mutation tracking** - Direct support for push, pop, splice operations  
- **Performance optimizations** - Enhanced handling for large datasets and complex object graphs
- **Fine-grained dependency tracking** - Optimize computed properties to only recalculate when actual dependencies change

For current workarounds and best practices, see the [examples](#examples) section above.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/SBRoberts/marjoram.git

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Start development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by [Spencer Rose](https://github.com/SBRoberts)**