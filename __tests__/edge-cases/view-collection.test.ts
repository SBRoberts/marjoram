import { html } from "../../src";

const TEST_ID = "collection-test";

describe("View Collection Edge Cases", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Duplicate Ref Names", () => {
    test("should handle duplicate ref names (last one wins)", () => {
      const view = html`
        <div>
          <div ref="same" data-testid="first">First</div>
          <div ref="same" data-testid="second">Second</div>
        </div>
      `;
      document.body.append(view);

      const collection = view.collect();

      // Should collect the last element with the duplicate ref
      expect(collection.same).toBeInstanceOf(HTMLDivElement);
      expect(collection.same.textContent).toBe("Second");
    });

    test("should handle multiple duplicate refs", () => {
      const view = html`
        <div>
          <span ref="dup">A</span>
          <span ref="dup">B</span>
          <span ref="dup">C</span>
          <span ref="unique">Unique</span>
        </div>
      `;
      document.body.append(view);

      const collection = view.collect();

      expect(collection.dup.textContent).toBe("C");
      expect(collection.unique.textContent).toBe("Unique");
    });
  });

  describe("Refs on Nested Views", () => {
    test("should collect refs from nested views", () => {
      const nested = html`<span ref="inner" data-testid="inner-span"
        >Nested</span
      >`;
      const view = html`
        <div ref="outer" data-testid="${TEST_ID}">Outer content ${nested}</div>
      `;
      document.body.append(view);

      const collection = view.collect();

      expect(collection.outer).toBeInstanceOf(HTMLDivElement);
      expect(collection.inner).toBeInstanceOf(HTMLSpanElement);
      expect(collection.outer.textContent).toContain("Outer content");
      expect(collection.inner.textContent).toBe("Nested");
    });

    test("should handle deeply nested refs", () => {
      const deepest = html`<em ref="deepest">Deep</em>`;
      const middle = html`<strong ref="middle">${deepest}</strong>`;
      const view = html`
        <div ref="root" data-testid="${TEST_ID}">${middle}</div>
      `;
      document.body.append(view);

      const collection = view.collect();

      expect(collection.root).toBeInstanceOf(HTMLDivElement);
      expect(collection.middle).toBeInstanceOf(HTMLElement);
      expect(collection.deepest).toBeInstanceOf(HTMLElement);
    });
  });

  describe("Dynamic Ref Names", () => {
    test("should handle computed ref names", () => {
      const refName = "dynamic-ref-123";
      const view = html`
        <div ref="${refName}" data-testid="${TEST_ID}">Dynamic ref content</div>
      `;
      document.body.append(view);

      const collection = view.collect();

      expect(collection[refName]).toBeInstanceOf(HTMLDivElement);
      expect(collection[refName].textContent).toContain("Dynamic ref content");
    });

    test("should handle refs with template expressions", () => {
      const prefix = "item";
      const id = 42;
      const refName = `${prefix}-${id}`;

      const view = html`
        <div ref="${refName}" data-testid="${TEST_ID}">Item ${id}</div>
      `;
      document.body.append(view);

      const collection = view.collect();

      expect(collection[refName]).toBeInstanceOf(HTMLDivElement);
      expect(collection["item-42"].textContent).toContain("Item 42");
    });

    test("should handle refs generated in loops", () => {
      const items = ["apple", "banana", "cherry"];
      const itemViews = items.map(
        (item, index) =>
          html`<li ref="item-${index}" data-testid="item-${index}">${item}</li>`
      );

      const view = html`
        <ul data-testid="${TEST_ID}">
          ${itemViews}
        </ul>
      `;
      document.body.append(view);

      const collection = view.collect();

      expect(collection["item-0"].textContent).toBe("apple");
      expect(collection["item-1"].textContent).toBe("banana");
      expect(collection["item-2"].textContent).toBe("cherry");
    });
  });

  describe("Special Character Refs", () => {
    test("should handle refs with special characters", () => {
      const specialRefs = [
        "ref-with-dashes",
        "ref_with_underscores",
        "ref.with.dots",
        "ref:with:colons",
        "ref[with]brackets",
        "ref with spaces",
      ];

      const views = specialRefs.map(
        ref => html`<div ref="${ref}" data-testid="special-${ref}">${ref}</div>`
      );

      const view = html` <div data-testid="${TEST_ID}">${views}</div> `;
      document.body.append(view);

      const collection = view.collect();

      specialRefs.forEach(ref => {
        expect(collection[ref]).toBeInstanceOf(HTMLDivElement);
        expect(collection[ref].textContent).toBe(ref);
      });
    });

    test("should handle unicode refs", () => {
      const unicodeRefs = ["ref-🌟", "ref-中文", "ref-العربية", "ref-русский"];

      const views = unicodeRefs.map(
        ref => html`<div ref="${ref}">${ref}</div>`
      );

      const view = html` <div data-testid="${TEST_ID}">${views}</div> `;
      document.body.append(view);

      const collection = view.collect();

      unicodeRefs.forEach(ref => {
        expect(collection[ref]).toBeInstanceOf(HTMLDivElement);
        expect(collection[ref].textContent).toBe(ref);
      });
    });
  });

  describe("Ref Collection Caching", () => {
    test("should cache collection results", () => {
      const view = html`
        <div ref="cached" data-testid="${TEST_ID}">Cached content</div>
      `;
      document.body.append(view);

      const collection1 = view.collect();
      const collection2 = view.collect();

      // Should return the same object reference (cached)
      expect(collection1).toBe(collection2);
      expect(collection1.cached).toBe(collection2.cached);
    });

    test("should handle collection after DOM modifications", () => {
      const view = html`
        <div ref="original" data-testid="${TEST_ID}">Original</div>
      `;
      document.body.append(view);

      const originalCollection = view.collect();
      expect(originalCollection.original).toBeInstanceOf(HTMLDivElement);

      // Add a new element with ref to the view
      const newElement = document.createElement("span");
      newElement.setAttribute("ref", "added");
      newElement.textContent = "Added";
      view.appendChild(newElement);

      // Collection should still work but might not include new element
      // depending on implementation
      const updatedCollection = view.collect();
      expect(updatedCollection.original).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("Empty and Null Refs", () => {
    test("should handle elements without refs", () => {
      const view = html`
        <div data-testid="${TEST_ID}">
          <p>No ref here</p>
          <span ref="hasRef">Has ref</span>
          <em>Also no ref</em>
        </div>
      `;
      document.body.append(view);

      const collection = view.collect();

      expect(Object.keys(collection)).toHaveLength(1);
      expect(collection.hasRef).toBeInstanceOf(HTMLSpanElement);
    });

    test("should handle views with no refs at all", () => {
      const view = html`
        <div data-testid="${TEST_ID}">
          <p>No refs anywhere</p>
          <span>Still no refs</span>
        </div>
      `;
      document.body.append(view);

      const collection = view.collect();

      expect(Object.keys(collection)).toHaveLength(0);
      expect(collection).toEqual({});
    });
  });

  describe("Different Element Types", () => {
    test("should collect refs from various HTML elements", () => {
      const view = html`
        <div data-testid="${TEST_ID}">
          <div ref="div">Div</div>
          <span ref="span">Span</span>
          <p ref="paragraph">Paragraph</p>
          <img
            ref="image"
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt="test"
          />
          <input ref="input" type="text" value="Input" />
          <button ref="button">Button</button>
          <a ref="link" href="#test">Link</a>
        </div>
      `;
      document.body.append(view);

      const collection = view.collect();

      expect(collection.div).toBeInstanceOf(HTMLDivElement);
      expect(collection.span).toBeInstanceOf(HTMLSpanElement);
      expect(collection.paragraph).toBeInstanceOf(HTMLParagraphElement);
      expect(collection.image).toBeInstanceOf(HTMLImageElement);
      expect(collection.input).toBeInstanceOf(HTMLInputElement);
      expect(collection.button).toBeInstanceOf(HTMLButtonElement);
      expect(collection.link).toBeInstanceOf(HTMLAnchorElement);
    });

    test("should handle custom elements with refs", () => {
      const view = html`
        <div data-testid="${TEST_ID}">
          <custom-element ref="custom">Custom</custom-element>
          <my-component ref="component">Component</my-component>
        </div>
      `;
      document.body.append(view);

      const collection = view.collect();

      expect(collection.custom).toBeInstanceOf(HTMLElement);
      expect(collection.component).toBeInstanceOf(HTMLElement);
      expect(collection.custom.tagName.toLowerCase()).toBe("custom-element");
      expect(collection.component.tagName.toLowerCase()).toBe("my-component");
    });
  });
});
