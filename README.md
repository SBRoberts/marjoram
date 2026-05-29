# Marjoram 🌿

**A pure-functional, signal-based widget SDK — zero classes, zero dependencies**

[![npm version](https://badge.fury.io/js/marjoram.svg)](https://badge.fury.io/js/marjoram)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/marjoram)](https://bundlephobia.com/package/marjoram)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

⚡ **~5KB gzipped** · 📦 **Zero dependencies** · 🔒 **XSS safe** · 🎯 **Shadow DOM isolation** · 📝 **TypeScript-first** · 🧬 **Fine-grained signals**

Build self-contained widgets — chat launchers, cookie banners, feedback forms, notification bells — that mount safely into any page, regardless of what framework (or none) the host is using.

**No classes. No decorators. No build step required.** Just functions, signals, and tagged templates.

---

## Table of Contents

- [🚀 Quick Start](#quick-start) - Build and mount a widget in 30 seconds
- [📖 API Reference](#api-reference) - `createWidget`, `html`, `useViewModel`, `store`, `repeat`, `when`
- [💡 Examples](#examples) - Todo app, forms, data fetching
- [🎯 TypeScript Support](#typescript-support) - Type safety and IntelliSense
- [🧬 Reactivity](#reactivity) - Signals, computed, and effects
- [⚡ Performance](#performance) - Real benchmarks with hard numbers
- [⚠️ Current Limitations](#current-limitations) - Known constraints and workarounds
- [🤝 Contributing](#contributing) - Development setup and guidelines

---

## Quick Start

### Installation

```bash
npm install marjoram
```

### Script Tag (No Build Step)

```html
<script src="https://unpkg.com/marjoram/dist/marjoram.umd.js"></script>
<script>
  const { createWidget, html } = window.marjoram;
</script>
```

### Your First Widget

```typescript
import { createWidget, html } from "marjoram";

const widget = createWidget({
  target: "#my-widget",
  shadow: "closed", // Style-isolated from host page
  styles: `
    .counter { font-family: system-ui; padding: 1rem; }
    button { cursor: pointer; padding: 0.25rem 0.75rem; }
  `,
  model: {
    count: 0,
    doubled: vm => vm.count * 2, // Computed property
  },
  render: vm => html`
    <div class="counter">
      <p>Count: ${vm.$count} (doubled: ${vm.$doubled})</p>
      <button onclick=${() => vm.count++}>+</button>
      <button onclick=${() => vm.count--}>-</button>
    </div>
  `,
});

widget.mount();

// Full cleanup when the widget is removed from the page:
// widget.destroy();
```

---

## API Reference

### `createWidget` — Widget Factory (Recommended)

The primary entry point. Creates a self-contained, mountable widget with full lifecycle management.

```typescript
function createWidget<T>(options: WidgetOptions<T>): Widget<T>;
```

| Option      | Type                 | Description                                                                      |
| ----------- | -------------------- | -------------------------------------------------------------------------------- |
| `target`    | `Element \| string`  | DOM element or CSS selector to mount into                                        |
| `shadow`    | `'open' \| 'closed'` | Shadow DOM mode for style isolation (optional)                                   |
| `styles`    | `string`             | CSS injected alongside the view; scoped automatically with shadow DOM (optional) |
| `model`     | `object`             | Initial reactive state. Functions become computed properties.                    |
| `render`    | `(vm) => View`       | Returns the widget's view given the reactive view model                          |
| `onMount`   | `(vm, refs) => void` | Called after DOM insertion (optional)                                            |
| `onDestroy` | `(vm) => void`       | Called before teardown (optional)                                                |

**Returns:** `{ mount(), destroy(), vm }`

```typescript
const widget = createWidget({
  target: "#chat-root",
  shadow: "closed",
  styles: `
    .chat { position: fixed; bottom: 1rem; right: 1rem; }
    .chat__panel { display: none; }
    .chat__panel--open { display: block; }
  `,
  model: {
    open: false,
    messages: [] as string[],
    unreadCount: vm => vm.messages.length,
  },
  render: vm => html`
    <div class="chat">
      <button onclick=${() => (vm.open = !vm.open)}>
        💬 ${vm.$unreadCount.compute(n => (n > 0 ? `(${n})` : ""))}
      </button>
      <div
        class="chat__panel chat__panel--${vm.$open.compute(o =>
          o ? "open" : "closed"
        )}"
      >
        ${vm.$messages.compute(msgs => msgs.map(m => html`<p>${m}</p>`))}
      </div>
    </div>
  `,
  onMount: vm => {
    // Wire up external event sources
  },
  onDestroy: vm => {
    // Clean up subscriptions, timers, etc.
  },
});

widget.mount();
```

### `html` — Tagged Template for Reactive Views

Creates a reactive DOM view from a template literal. Use `$`-prefixed properties for reactive bindings.

```typescript
function html(strings: TemplateStringsArray, ...args: unknown[]): View;
```

**Returns:** A `View` (enhanced DocumentFragment) with `collect`, `mount`, and `unmount` methods.

```typescript
import { html, useViewModel } from "marjoram";

const vm = useViewModel({ name: "World" });
const view = html`
  <div>
    <h1>Hello, ${vm.$name}!</h1>
    <button ref="rename">Rename</button>
  </div>
`;

const { rename } = view.collect();
rename.addEventListener("click", () => {
  vm.name = "Marjoram";
});

view.mount("#app");
// view.unmount(); // removes from DOM + disposes observers
```

#### Element References with `collect()`

Use the `ref` attribute to create named element references:

```typescript
const view = html`
  <div>
    <button ref="saveBtn">Save</button>
    <button ref="cancelBtn">Cancel</button>
  </div>
`;

const { saveBtn, cancelBtn } = view.collect();
saveBtn.addEventListener("click", () => console.log("Saving..."));
```

When using `createWidget`, refs are passed to `onMount` automatically:

```typescript
createWidget({
  target: "#app",
  model: {},
  render: vm => html`<button ref="action">Go</button>`,
  onMount: (vm, refs) => {
    refs.action.addEventListener("click", () => {
      /* ... */
    });
  },
});
```

### `useViewModel` — Standalone Reactive State

Creates a reactive view model for use outside of `createWidget`. Prefer `createWidget` for widgets.

```typescript
function useViewModel<T extends Model>(model: T): ViewModel<T>;
```

**Parameters:**

- `model` - Initial data object to make reactive

**Returns:** A proxied object that tracks changes and updates views automatically.

#### Basic Usage

```typescript
import { html, useViewModel } from "marjoram";

const viewModel = useViewModel({
  name: "John",
  age: 30,
  active: true,
});

const view = html`
  <div>
    <h2>${viewModel.$name}</h2>
    <p>Age: ${viewModel.$age}</p>
    <p>
      Status: ${viewModel.$active.compute(v => (v ? "Active" : "Inactive"))}
    </p>
  </div>
`;

// Updates automatically trigger DOM changes
viewModel.name = "Jane";
viewModel.age = 25;
```

#### Computed Properties at Model Definition

Define computed properties as functions in your model - they recalculate whenever any property changes:

```typescript
const viewModel = useViewModel({
  firstName: "John",
  lastName: "Doe",
  // Computed property - takes the viewModel as parameter
  fullName: vm => `${vm.firstName} ${vm.lastName}`,

  price: 100,
  quantity: 2,
  // Computed properties can depend on other computed properties
  subtotal: vm => vm.price * vm.quantity,
  tax: vm => vm.subtotal * 0.1,
  total: vm => vm.subtotal + vm.tax,
});

const view = html`
  <div>
    <h2>${viewModel.$fullName}</h2>
    <p>Total: $${viewModel.$total}</p>
  </div>
`;

// Update any property - all computed properties recalculate
viewModel.firstName = "Jane"; // fullName becomes "Jane Doe"
viewModel.price = 150; // all computed properties recalculate
```

**Key Features:**

- ✅ **Fine-grained tracking**: Computed properties only recalculate when their actual dependencies change — backed by a signal graph, not brute-force invalidation
- ✅ **Read-only**: Attempting to set a computed property throws an error
- ✅ **Chain-able**: Computed properties can depend on other computed properties
- ✅ **Always fresh**: Reading a computed property always returns the current value
- ✅ **Zero wasted work**: Diamond dependencies evaluate exactly once per update

**Important:** Computed properties are read-only:

```typescript
const viewModel = useViewModel({
  count: 5,
  doubled: vm => vm.count * 2,
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
const viewModel = useViewModel({ message: "Hello" });

// ✅ Correct - use $ prefix in templates
const view = html`<p>${viewModel.$message}</p>`;

// ❌ Incorrect - won't be reactive
const view = html`<p>${viewModel.message}</p>`;

// ✅ Correct - no $ prefix for getting/setting values
viewModel.message = "Updated!"; // DOM updates automatically
```

### `repeat` — Keyed List Reconciliation

Efficiently renders a reactive list with DOM reuse. Items with the same key keep their existing DOM nodes across updates — only added, removed, or reordered items touch the DOM. Prefer `repeat` over `.compute(items => items.map(...))` whenever the list can change after initial render.

```typescript
function repeat<T>(
  items: ReactiveArrayProp<T> | T[],
  keyFn: (item: T, index: number) => unknown,
  templateFn: (item: T, index: number) => Node
): Node;
```

**Parameters:**

- `items` — a reactive array prop (e.g. `vm.$todos`) or a static array.
- `keyFn` — extracts a stable, unique key for each item. Typically an `id`. Using the array index as the key defeats reconciliation and should be avoided when items can be added, removed, or reordered.
- `templateFn` — returns a DOM node for each item, typically via `` html`...` ``.

```typescript
import { html, useViewModel, repeat } from "marjoram";

const vm = useViewModel({
  todos: [
    { id: 1, text: "Buy milk", done: false },
    { id: 2, text: "Walk the dog", done: true },
  ],
});

const view = html`
  <ul>
    ${repeat(
      vm.$todos,
      todo => todo.id,
      todo => html`<li class="${todo.done ? "done" : ""}">${todo.text}</li>`
    )}
  </ul>
`;

view.mount("#app");

// Granular updates — only the added <li> is created; existing nodes are reused.
vm.todos = [...vm.todos, { id: 3, text: "Write docs", done: false }];
```

**When to use which:**

| Use                                            | For                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `repeat(vm.$items, keyFn, tplFn)`              | Lists that change over time — reorders, additions, removals, in-place edits      |
| `vm.$items.compute(items => items.map(tplFn))` | Static lists, or lists where re-rendering every item on any change is acceptable |

### Computed Properties

Marjoram offers two ways to create computed values, each optimized for different use cases:

#### 1. Model-Level Computed Properties (Recommended)

Define computed properties as functions in your model for multi-property dependencies:

```typescript
const viewModel = useViewModel({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",

  // Computed property with access to entire viewModel
  fullName: vm => `${vm.firstName} ${vm.lastName}`,
  displayText: vm => `${vm.fullName} (${vm.email})`,
});

// Use in templates
const view = html`<div>${viewModel.$fullName}</div>`;

// Access directly
console.log(viewModel.fullName); // "John Doe"

// Recalculates when any property changes
viewModel.firstName = "Jane";
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
  firstName: "John",
  active: true,
  items: ["a", "b", "c"],
});

const view = html`
  <div>
    <!-- Simple single-property transformation -->
    <h1>${viewModel.$firstName.compute(name => name.toUpperCase())}</h1>

    <!-- Conditional rendering -->
    <span>${viewModel.$active.compute(v => (v ? "Active" : "Inactive"))}</span>

    <!-- Array rendering -->
    <ul>
      ${viewModel.$items.compute(items =>
        items.map(item => html`<li>${item}</li>`)
      )}
    </ul>
  </div>
`;
```

**When to use:**

- ✅ Transforming a **single** property value
- ✅ Template-specific formatting (e.g., uppercase, date formatting)
- ✅ View-specific logic that doesn't belong in the model

#### Comparison

| Feature           | Model-Level                     | View-Time `.compute()`           |
| ----------------- | ------------------------------- | -------------------------------- |
| **Define**        | In viewModel                    | In template                      |
| **Recalculation** | When dependencies change        | Only when its property changes   |
| **Can access**    | All viewModel properties        | Single property value            |
| **Reusability**   | High (use anywhere)             | Low (template-specific)          |
| **Access**        | `vm.propName` or `vm.$propName` | Only in templates via `vm.$prop` |
| **Read-only**     | Yes (throws on set)             | N/A (not settable)               |
| **Performance**   | Fine-grained (signal-tracked)   | Fine-grained (single prop)       |
| **Best for**      | Multi-property derived state    | Single-property transforms       |

**Example combining both:**

```typescript
const viewModel = useViewModel({
  items: [
    { price: 10, qty: 2 },
    { price: 20, qty: 1 },
  ],
  taxRate: 0.1,

  // Model-level: calculate subtotal from multiple items
  subtotal: vm =>
    vm.items.reduce((sum, item) => sum + item.price * item.qty, 0),
  total: vm => vm.subtotal * (1 + vm.taxRate),
});

const view = html`
  <div>
    <p>Subtotal: ${viewModel.$subtotal}</p>
    <!-- View-time: format the total as currency -->
    <p>Total: $${viewModel.$total.compute(t => t.toFixed(2))}</p>
  </div>
`;
```

### `store` — Deep Reactive State

`store()` is a peer to `signal()` for **deeply nested, mutable** state. Where `signal()` is shallow and reference-based, `store()` lets you mutate nested paths directly — `state.user.address.city = "x"` — and only the subscribers to that exact path re-run. No spread/replace ceremony, no whole-object invalidation.

```typescript
import { store, effect } from "marjoram";

const state = store({
  user: { name: "Alice", age: 30 },
  todos: [{ id: 1, text: "Buy milk", done: false }],
});

effect(() => console.log(state.user.name)); // logs "Alice"

state.user.age = 31; // ← effect does NOT re-run (different path)
state.user.name = "Bob"; // ← effect re-runs, logs "Bob"
state.todos.push({ id: 2, text: "Walk dog", done: false }); // granular array update
```

**`signal()` vs `store()` — pick at the import site:**

| Use         | For                                                                       |
| ----------- | ------------------------------------------------------------------------- |
| `signal(x)` | Primitives, atoms, or whole objects swapped wholesale (`s.set(newValue)`) |
| `store(x)`  | Plain objects/arrays you mutate in place (`obj.a.b = c`)                  |

#### In view models and templates

`useViewModel` accepts stores. Inside templates, `vm.$store.path.to.leaf` is a reactive binding to that specific path:

```typescript
const vm = useViewModel({
  form: store({ user: { name: "", email: "" } }),
});

const view = html`
  <input
    value="${vm.$form.user.name}"
    oninput="${e => (vm.form.user.name = e.target.value)}"
  />
  <p>Hello, ${vm.$form.user.name}!</p>
`;
```

Typing in the input mutates `vm.form.user.name` directly; only the bindings to that path update.

#### With `repeat()`

Store arrays drive `repeat()` reactively — `push`/`pop`/`splice`/`sort` reconcile the keyed list:

```typescript
const vm = useViewModel({ todos: store([{ id: 1, text: "Buy milk" }]) });

html`<ul>
  ${repeat(
    vm.$todos,
    t => t.id,
    t => html`<li>${t.text}</li>`
  )}
</ul>`;

vm.todos.push({ id: 2, text: "Walk dog" }); // only the new <li> is created
```

#### Inspect & escape hatches

```typescript
import { store, snapshot, subscribe, isStore, markRaw, unwrap } from "marjoram";

const s = store({ count: 0 });

snapshot(s); // deep plain-object copy (safe to JSON.stringify)
const off = subscribe(s, "count", (next, prev) => {
  /* typed: numbers */
});
isStore(s); // true
markRaw(bigBlob); // opt a value out of being proxied
unwrap(s); // the raw backing object (mutations bypass reactivity)
```

#### What gets proxied

Only **plain objects and arrays**. `Date`, `Map`, `Set`, `RegExp`, class instances, DOM nodes, frozen/sealed objects, and `markRaw`'d values pass through by reference, untouched. Stores are XSS-safe (values reach the DOM only through the escaping `html` template) and prototype-pollution-hardened (`__proto__`/`constructor`/`prototype` are not writable through a store). Full contract: [docs/STORES.md](docs/STORES.md).

---

## Examples

### Todo List Application

```typescript
import { html, useViewModel } from "marjoram";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp = () => {
  const viewModel = useViewModel({
    todos: [] satisfies Todo[],
    newTodo: "",
    filter: "all" satisfies "all" | "active" | "completed",

    // Computed properties for derived state
    filteredTodos: vm => {
      switch (vm.filter) {
        case "active":
          return vm.todos.filter(t => !t.completed);
        case "completed":
          return vm.todos.filter(t => t.completed);
        default:
          return vm.todos;
      }
    },

    activeCount: vm => vm.todos.filter(t => !t.completed).length,
    completedCount: vm => vm.todos.filter(t => t.completed).length,
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
        <button
          ref="allFilter"
          class="${viewModel.$filter.compute(f =>
            f === "all" ? "active" : ""
          )}"
        >
          All
        </button>
        <button
          ref="activeFilter"
          class="${viewModel.$filter.compute(f =>
            f === "active" ? "active" : ""
          )}"
        >
          Active
        </button>
        <button
          ref="completedFilter"
          class="${viewModel.$filter.compute(f =>
            f === "completed" ? "active" : ""
          )}"
        >
          Completed
        </button>
      </div>

      <ul class="todo-list">
        ${viewModel.$filteredTodos.compute(todos =>
          todos.map(
            todo => html`
              <li class="${todo.completed ? "completed" : ""}">
                <input
                  type="checkbox"
                  ${todo.completed ? "checked" : ""}
                  data-id="${todo.id}"
                />
                <span>${todo.text}</span>
                <button class="delete" data-id="${todo.id}">×</button>
              </li>
            `
          )
        )}
      </ul>
    </div>
  `;

  // Event handlers
  const { newTodoInput, addBtn, allFilter, activeFilter, completedFilter } =
    view.collect();

  addBtn.addEventListener("click", () => {
    if (viewModel.newTodo.trim()) {
      viewModel.todos = [
        ...viewModel.todos,
        {
          id: Date.now(),
          text: viewModel.newTodo.trim(),
          completed: false,
        },
      ];
      viewModel.newTodo = "";
      newTodoInput.value = "";
    }
  });

  allFilter.addEventListener("click", () => (viewModel.filter = "all"));
  activeFilter.addEventListener("click", () => (viewModel.filter = "active"));
  completedFilter.addEventListener(
    "click",
    () => (viewModel.filter = "completed")
  );

  return view;
};

document.body.appendChild(TodoApp());
```

### Counter with Animation

```typescript
import { html, useViewModel } from "marjoram";

const AnimatedCounter = () => {
  const viewModel = useViewModel({
    count: 0,
    isAnimating: false,
  });

  const view = html`
    <div
      class="counter ${viewModel.$isAnimating.compute(v =>
        v ? "animating" : ""
      )}"
    >
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

  increment.addEventListener("click", () => {
    animateChange(() => viewModel.count++);
  });

  decrement.addEventListener("click", () => {
    animateChange(() => viewModel.count--);
  });

  reset.addEventListener("click", () => {
    animateChange(() => (viewModel.count = 0));
  });

  return view;
};
```

### Data Fetching with Loading States

```typescript
import { html, useViewModel } from "marjoram";

interface User {
  id: number;
  name: string;
  email: string;
}

const UserList = () => {
  const viewModel = useViewModel({
    users: [] satisfies User[],
    loading: false,
    error: null satisfies string | null,
  });

  const loadUsers = async () => {
    viewModel.loading = true;
    viewModel.error = null;

    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      const users = await response.json();
      viewModel.users = users;
    } catch (err) {
      viewModel.error = "Failed to load users";
    } finally {
      viewModel.loading = false;
    }
  };

  const view = html`
    <div class="user-list">
      <h2>Users</h2>
      <button ref="loadBtn">Load Users</button>

      ${viewModel.$loading.compute(v => (v ? html`<p>Loading...</p>` : ""))}
      ${viewModel.$error.compute(v =>
        v ? html`<p class="error">${v}</p>` : ""
      )}

      <ul>
        ${viewModel.$users.compute(users =>
          users.map(
            user => html`
              <li>
                <strong>${user.name}</strong>
                <br />
                <small>${user.email}</small>
              </li>
            `
          )
        )}
      </ul>
    </div>
  `;

  const { loadBtn } = view.collect();
  loadBtn.addEventListener("click", loadUsers);

  return view;
};
```

### Form Validation

```typescript
import { html, useViewModel } from "marjoram";

const ContactForm = () => {
  const viewModel = useViewModel({
    name: "",
    email: "",
    message: "",
    submitted: false,

    // Computed validation properties
    nameError: vm => (!vm.name.trim() ? "Name is required" : ""),
    emailError: vm => {
      if (!vm.email.trim()) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(vm.email)) return "Email is invalid";
      return "";
    },
    messageError: vm => (!vm.message.trim() ? "Message is required" : ""),

    isValid: vm => !vm.nameError && !vm.emailError && !vm.messageError,
  });

  const view = html`
    <form class="contact-form" ref="form">
      <h2>Contact Us</h2>

      <div class="field">
        <label>Name:</label>
        <input ref="nameInput" type="text" value="${viewModel.$name}" />
        ${viewModel.$nameError.compute(err =>
          err ? html`<span class="error">${err}</span>` : ""
        )}
      </div>

      <div class="field">
        <label>Email:</label>
        <input ref="emailInput" type="email" value="${viewModel.$email}" />
        ${viewModel.$emailError.compute(err =>
          err ? html`<span class="error">${err}</span>` : ""
        )}
      </div>

      <div class="field">
        <label>Message:</label>
        <textarea ref="messageInput">${viewModel.$message}</textarea>
        ${viewModel.$messageError.compute(err =>
          err ? html`<span class="error">${err}</span>` : ""
        )}
      </div>

      <button
        type="submit"
        ref="submitBtn"
        ${viewModel.$isValid.compute(valid => (valid ? "" : "disabled"))}
      >
        Send Message
      </button>

      ${viewModel.$submitted.compute(v =>
        v ? html` <div class="success">Message sent successfully!</div> ` : ""
      )}
    </form>
  `;

  const { form, nameInput, emailInput, messageInput } = view.collect();

  // Sync inputs with view model
  nameInput.addEventListener("input", e => {
    viewModel.name = (e.target as HTMLInputElement).value;
  });

  emailInput.addEventListener("input", e => {
    viewModel.email = (e.target as HTMLInputElement).value;
  });

  messageInput.addEventListener("input", e => {
    viewModel.message = (e.target as HTMLTextAreaElement).value;
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (viewModel.isValid) {
      viewModel.submitted = true;
      // Reset form after 3 seconds
      setTimeout(() => {
        viewModel.name = "";
        viewModel.email = "";
        viewModel.message = "";
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
import { html, useViewModel, View, ViewModel } from "marjoram";

// Type-safe view models
interface AppState {
  user: {
    name: string;
    age: number;
  };
  theme: "light" | "dark";
}

const viewModel: ViewModel<AppState> = useViewModel({
  user: { name: "John", age: 30 },
  theme: "light",
});

// Type-safe refs
const view: View = html`
  <div class="${viewModel.$theme}">
    <h1>${viewModel.$user.name}</h1>
  </div>
`;

const refs: { header: HTMLElement } = view.collect();
```

## Reactivity

Marjoram's reactivity is built on a **fine-grained signal graph**. Computed properties automatically track which signals they read and only re-evaluate when those specific dependencies change — no virtual DOM diffing, no brute-force invalidation.

### Signal Primitives

The signal primitives are available for direct use when you need reactive state outside of `createWidget`:

```typescript
import { signal, computed, effect, batch } from "marjoram";

// Writable reactive value
const count = signal(0);
count(); // read: 0 (tracks caller as subscriber)
count.set(5); // write: notifies dependents
count.peek(); // read without tracking

// Derived value — auto-tracks dependencies
const doubled = computed(() => count() * 2);
doubled(); // 10 — recomputes only when count changes

// Side-effect — re-runs when dependencies change
const dispose = effect(() => {
  console.log(`Count is now: ${count()}`);
});

// Batch multiple writes into a single notification pass
batch(() => {
  count.set(10);
  // other signal writes...
});

dispose(); // stop the effect
```

### How it works under the hood

1. **`useViewModel`** wraps each model property in a `signal`
2. Computed properties (functions in the model) become `computed()` signals that auto-track their dependencies
3. **`html` templates** bind DOM nodes to signals via `SchemaProp.observe()` — updates are batched through the microtask queue
4. When you write `vm.count = 5`, only the signals that depend on `count` recompute — everything else is untouched

```typescript
const vm = useViewModel({
  firstName: "John",
  lastName: "Doe",
  age: 30,
  fullName: vm => `${vm.firstName} ${vm.lastName}`, // tracks firstName + lastName
  isAdult: vm => vm.age >= 18, // tracks age only
});

vm.age = 25; // isAdult recomputes; fullName does NOT
```

---

## Performance

Real numbers from the benchmark suite (`npm test -- --testPathPattern=benchmark`).

### Widget Creation

| Operation                             | Time   | Per Widget |
| ------------------------------------- | ------ | ---------- |
| Create + mount + destroy 1 widget     | ~560μs | —          |
| Create + mount + destroy 100 widgets  | ~9ms   | ~93μs      |
| Create + mount + destroy 1000 widgets | ~297ms | ~297μs     |

### Update Throughput

| Operation                              | Time   | Throughput    |
| -------------------------------------- | ------ | ------------- |
| 10,000 sequential property updates     | ~3.5ms | ~2,800 ops/ms |
| 5,000 multi-property updates (5 props) | ~1.8ms | ~2,800 ops/ms |
| 1,000 computed chain updates (3-deep)  | ~820μs | —             |
| 1,000 array pushes                     | ~32ms  | —             |

### Signal Primitives

| Operation                         | Time       | Throughput       |
| --------------------------------- | ---------- | ---------------- |
| 100k raw signal writes            | ~5.7ms     | ~17,500 ops/ms   |
| 10k signal→computed updates       | ~580μs     | ~17,100 ops/ms   |
| Diamond dependency (1000 updates) | 1000 evals | Zero wasted work |

_Measured in jsdom (Jest). Browser performance will differ — run `npm test -- --testPathPattern=benchmark` for your environment._

### Why it's fast

- **Signal-graph propagation** — only touched nodes recompute, no tree diffing
- **Lazy computed signals** — derived values recompute on read, not on write
- **Microtask-batched DOM** — multiple writes coalesce into a single DOM update
- **Template caching** — `html` tagged templates parse once, clone on re-use (fast C++ `cloneNode`)
- **Zero runtime framework** — no scheduler, no fiber tree, no reconciler

### Run benchmarks yourself

```bash
npm test -- --testPathPattern=benchmark --verbose
```

---

## Current Limitations

While Marjoram provides powerful reactive capabilities, there are some architectural limitations to be aware of:

### Function Properties as Computed

**All functions in a viewModel are treated as computed properties:**

```typescript
const viewModel = useViewModel({
  count: 5,
  // ✅ This is a computed property (takes viewModel as parameter)
  doubled: vm => vm.count * 2,
});

// ❌ You cannot store regular functions in viewModels
const viewModel = useViewModel({
  count: 5,
  increment: () => count++, // This will be treated as a computed property
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
btn.addEventListener("click", increment);
```

### Deep Nested Property Reactivity — use `store()`

Plain `useViewModel` values are shallow: deep nested mutations don't trigger updates. **This is what [`store()`](#store--deep-reactive-state) is for.**

```typescript
// ❌ Shallow value — deep mutation does nothing
const vm = useViewModel({ user: { profile: { name: "John" } } });
vm.user.profile.name = "Jane"; // no update

// ✅ store() — deep mutation is granularly reactive
const vm2 = useViewModel({ user: store({ profile: { name: "John" } }) });
vm2.user.profile.name = "Jane"; // updates only bindings to that path
```

(Without `store()`, the shallow workaround is to reassign the parent: `vm.user = { ...vm.user, profile: { ...vm.user.profile, name: "Jane" } }`.)

### Array Mutation Reactivity — use `store()`

Direct array mutations on a plain value don't trigger updates. **A `store()` array makes them reactive**, and pairs with `repeat()`:

```typescript
// ✅ store() array — push/pop/splice reconcile reactively
const vm = useViewModel({ items: store(["a", "b", "c"]) });
html`<ul>
  ${repeat(
    vm.$items,
    (_, i) => i,
    item => html`<li>${item}</li>`
  )}
</ul>`;
vm.items.push("d"); // the new <li> is created; existing nodes reused
```

(Without `store()`, reassign the whole array: `vm.items = [...vm.items, 'd']`.)

### Nested Object Property Addition — use `store()`

Adding new keys to a `store()`-wrapped object is reactive (iteration subscribers via `for...in`/`Object.keys` re-run):

```typescript
const vm = useViewModel({ config: store({ theme: "dark" }) });
vm.config.newProperty = "value"; // reactive: a new key was added
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

- **Computed properties** use fine-grained signal tracking — they only recompute when their actual dependencies change
- **DOM updates** are batched via microtask queue. Multiple property writes in the same tick produce a single DOM update
- **Memory**: `widget.destroy()` and `view.unmount()` dispose all signals and observers. Long-lived apps should call these on removal
- **Deep nested state**: use [`store()`](#store--deep-reactive-state) for granular nested reactivity (plain `useViewModel` values are shallow)

**Note on Testing:** When writing tests with computed properties, flush the microtask queue twice:

```typescript
viewModel.count = 10;
await flushMicrotasks(); // Flush property update
await flushMicrotasks(); // Flush computed property DOM update
```

### Planned Improvements

- ✅ **Deep reactivity for nested objects** — shipped in v1.1.0 as [`store()`](#store--deep-reactive-state)
- **Framework adapters** - First-class `<marjoram-widget>` custom element wrappers for React/Vue/Angular host pages
- **Widget distribution tooling** - Config schemas, sandbox policies, inter-widget communication

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
