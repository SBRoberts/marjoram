# Marjoram — AI Coding Instructions

Use these instructions when generating code with marjoram, a pure-functional, signal-based widget SDK for building embeddable interactive components. Zero classes, zero dependencies.

## Core API

### `createWidget` — Primary entry point for widgets

```typescript
import { createWidget, html } from "marjoram";

const widget = createWidget({
  target: "#my-widget", // CSS selector or Element
  shadow: "closed", // 'open' | 'closed' — style-isolated from host page
  styles: `
    .container { padding: 1rem; }
    button { cursor: pointer; }
  `,
  model: {
    // Reactive state
    count: 0,
    label: "Click me",
  },
  render: vm => html`
    <div class="container">
      <p>${vm.$count}</p>
      <button onclick=${() => vm.count++}>${vm.$label}</button>
    </div>
  `,
  onMount: (vm, refs) => {}, // Fires after DOM insertion
  onDestroy: vm => {}, // Fires before teardown
});

widget.mount();
widget.destroy(); // Full cleanup: DOM removal + observer disposal
```

### `html` — Tagged template for reactive views

```typescript
const view = html`<div>${vm.$name}</div>`;
```

### `useViewModel` — Standalone reactive state (when not using createWidget)

```typescript
const vm = useViewModel({
  firstName: "Jane",
  lastName: "Doe",
  fullName: vm => `${vm.firstName} ${vm.lastName}`, // Computed property
});
```

## Critical Conventions

### The `$` prefix rule

- **`vm.$prop`** — Returns the reactive SchemaProp for template binding. Use inside `html` templates.
- **`vm.prop`** — Returns the plain value. Use for reads/writes in event handlers and logic.

```typescript
// CORRECT — reactive binding in template
html`<p>${vm.$name}</p>`;

// WRONG — renders statically, will NOT update
html`<p>${vm.name}</p>`;

// CORRECT — value access in logic
vm.name = "Updated";
console.log(vm.name);
```

### `.compute()` — Single-property transforms in templates

```typescript
html`<span>${vm.$active.compute(v => (v ? "Active" : "Inactive"))}</span>`;
html`<ul>
  ${vm.$items.compute(items => items.map(i => html`<li>${i}</li>`))}
</ul>`;
```

### `when()` — Conditional rendering

```typescript
import { when } from "marjoram";
html`<div>
  ${when(
    vm.$isLoggedIn,
    () => html`<p>Welcome</p>`,
    () => html`<p>Log in</p>`
  )}
</div>`;
```

### `ref` + `collect()` — Element references

```typescript
const view = html`<button ref="myBtn">Click</button>`;
const { myBtn } = view.collect();
myBtn.addEventListener("click", handler);
```

## Common Anti-Patterns

| Wrong                             | Right                                     | Why                                |
| --------------------------------- | ----------------------------------------- | ---------------------------------- |
| `html\`${vm.name}\``              | `html\`${vm.$name}\``                     | Missing `$` = static, non-reactive |
| `vm.doubled = 10`                 | Update source: `vm.count = 5`             | Computed props are read-only       |
| No cleanup on remove              | `widget.destroy()`                        | Prevents memory leaks              |
| `document.body.appendChild(view)` | `view.mount('#target')` or `createWidget` | Use managed mounting               |
