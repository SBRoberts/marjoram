# Marjoram 🌿

**A lightweight JavaScript library to create and manipulate DOM elements and to manage their state**

✨ *0 dependencies* ✨  
✨ *Safe from XSS attacks* ✨  
✨ *TypeScript Support* ✨  

---
## Table of Contents
- [Marjoram 🌿](#marjoram-)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Implementation](#implementation)
  - [API](#api)
    - [View](#view)
      - [How to create a View](#how-to-create-a-view)
      - [How to use refs](#how-to-use-refs)
    - [ViewModel](#viewmodel)
      - [How to create a ViewModel](#how-to-create-a-viewmodel)
      - [How to use a ViewModel](#how-to-use-a-viewmodel)
    - [SchemaProp](#schemaprop)
      - [Computed Values](#computed-values)
      - [Observe Values](#observe-values)
  - [Examples](#examples)
    - [Stateless View](#stateless-view)
    - [Stateful View](#stateful-view)
    - [Nested Views](#nested-views)
    - [Arrays](#arrays)
    - [More](#more)
  - [Glossary](#glossary)
    - [View](#view-1)
    - [Model](#model)
    - [ViewModel](#viewmodel-1)
    - [SchemaProp](#schemaprop-1)

---
## Getting Started

### Installation
```bash
npm i marjoram
```
### Implementation
Views can be stateless or stateful when used in conjunction with `useViewModel`.

**Example:**
```javascript
import { html, useViewModel } from 'marjoram'

const Greeting = () => {
  // Create the view's state
  const viewModel = useViewModel({ name: 'world 🌎 '})
  
  // Create the view
  const view = html`
      <div>
          <h1>Hello, ${viewModel.$name}</h1>
      </div>
  `

  // Expose the viewModel
  view.viewModel = viewModel

  return view
}

const greeting = Greeting()

// Appends h1 that reads "Hello, world 🌎" to DOM
document.body.appendChild(greeting)

// Changes h1 text to "Hello, hotdog 🌭"
greeting.viewModel.name = "hotdog 🌭"

```
---
## API

### View
#### How to create a View

Use the `html` tagged template literal to create a `View`.

**Returns:**
A View, which is an extention of the DocumentFragment object.


**Example:**
```javascript
import { html } from 'marjoram'

const view = html`<h1>Hello, world!</h1>`
```


#### How to use refs

Create a ref adding a `ref` attribute to any element in your view.

Collect refs using `View.prototype.collect()`

The `collect()` method can be called from any `View` instance and enables us to collect elements within our view with a `ref` attribute. This is useful for a variety of reasons including to attach event listeners.

**Returns**
An object containing every HTML Element with a unique `ref` attribute.

**Example:**
```javascript
const view = html`
  <div>
    <h1 ref="heading">Welcome Back!</h1>
    <h2 ref="subheading">You have 3 notifications</h2>
  </div>
`;

const elements = view.collect();
/*
elements = {
  heading: h1 Node,
  subheading: h2 Node
}
*/
```
---
### ViewModel
A ViewModel is a stateful representation of the model provided when creating it.

Getting and setting view model properties works the same way it would for any other object in JavaScript. 

When a `ViewModel` is created, a `SchemaProp` will be made for each property and can be accessed by prefixing the property name with `$`. Avoid reassigning this value.
#### How to create a ViewModel
The `useViewModel({})` function creates a stateful "view model" object, given an object as an argument.

It is tightly coupled to a `html`, such that when a view model property is modified, your view is also modified.


**Example:**
```javascript
import { useViewModel } from 'marjoram'

const viewModel = useViewModel({ name: 'Patrick Stewart' })
```
#### How to use a ViewModel

**❗️ IMPORTANT**  
Prefix your view model properties with `$` when we are accessing them within a view. This convention allows us to use a view model property more than once within a view.

[Learn more about SchemaProps the `$` prefix here](#schemaprop)


**Example**
```javascript
import { html, useViewModel } from 'marjoram'

const viewModel = useViewModel({ firstName: 'Patrick', lastName: 'Stewart' })

const view = html`<h1>Hello, ${viewModel.$firstName} ${viewModel.$lastName}!</h1>`
// h1 text: Hello, Patrick Stewart!

viewModel.lastName = "Star"
// h1 text: Hello, Patrick Star!
```
---
### SchemaProp
When a `ViewModel` is created, a `SchemaProp` will be made for each property and can be accessed by prefixing the property name with `$`

Excluding the `$` prefix will return the property value as expected rather than the schemaProp. 

It is necessary to add the `$` prefix to your property name if that property is being used accessed by a `View`.

**❗️ IMPORTANT**  
Avoid reassigning this value if we want to avoid breaking things.

#### Computed Values

When we call the `SchemaProp.prototype.compute(callback)` method on a schemaProp, we can perform some logic on the value that we want to render every time the schemaProp value changes.


**Example**
```javascript
const viewModel = useViewModel({ number: 4 });
const { $number } = viewModel
// Create a computed property
const doubledNumber = $number.compute((val) => val * 2)

const view = html`
  <p>
    ${$number} x 2 = ${doubledNumber}
  </p>
`;
/* 4 x 2 = 8 */

// Updating the value also updates all related computed properties 
viewModel.number = 99
/* 99 x 2 = 198 */
```

#### Observe Values
TODO

---
## Examples

### Stateless View
```javascript
const view = html`
  <div>
    <h1 ref="heading">Welcome Back!</h1>
    <h2 ref="subheading">You have 3 notifications</h2>
  </div>
`;

const elements = view.collect();

elements.subheading.addEventListener('click', () => {
  // Do something
})
```
### Stateful View 
```javascript
const viewModel = useViewModel({text:'Confirm'})
const view = html`
  <button ref="btn">${viewModel.$text}</button>
`;

const elements = view.collect();

elements.btn.addEventListener('click', () => {
  // Do something
  viewModel.text = 'Cancel'
})
```
### Nested Views
```javascript
const numbers = [1, 2, 3, 4];
const viewModel = useViewModel({numbers});

const listItems = viewModel.numbers.map(
  (num, i) =>
    html`
    <li ref="listItem${i}">
      List Item: ${num} +
      <span>${num.compute((val) => val + 1)}</span> =
      <span>${num.compute((val) => val * 2 + 1)}</span> 
    </li>
    `
)

const view = html`
  <ul ref="listEl">
    ${listItems}
  </ul>
`;

/*
List Item: 1 + 2 = 3
List Item: 2 + 3 = 5
List Item: 3 + 4 = 7
List Item: 4 + 5 = 9
*/

```

### Arrays
TODO

### More
- #### [JumpLink](demo/src/components/JumpLink.ts)
- #### [Form](demo/src/components/ContactForm.ts)
- #### [Modal](demo/src/components/Modal.ts.ts)
- #### [SVG Icons](demo/src/components/Icons.ts)

---
## Glossary

### View
A DOM node, specifically a DocumentFragment, that is returned by the `html` tagged template literal

**Example**
```javascript
const view = html`<h1>Hello ✌️</h1>`
```

### Model 
An object with arbitrary values used to populate a `ViewModel` 

**Example**
```javascript
const model = { firstName: 'Patrick', lastName: 'Stewart' }
```
### ViewModel 
A stateful representation of the model provided and whose properties and are bound to the `View` they populate. 

**Example**
```javascript
const model = { firstName: 'Patrick', lastName: 'Stewart' }
const viewModel = useViewModel(model)
```

### SchemaProp
An individual property within a `ViewModel`  whose accessor is prefixed with a `$` and is bound to the `View` it populates.

**Example**
```javascript
const model = { firstName: 'Patrick', lastName: 'Stewart' }
const viewModel = useViewModel(model)

// Bind schemaProps to the view with the `$` syntax
const view = html`<h1>Hello, ${viewModel.$firstName} ${viewModel.$lastName}!</h1>`
// Rendered text: Hello, Patrick Stewart!

viewModel.lastName = "Star"
// Rendered text: Hello, Patrick Star!
```
---