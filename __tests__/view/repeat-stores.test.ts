import { getByTestId } from "@testing-library/dom";
import { html, useViewModel, store, repeat } from "../../src";

const TEST_ID = "repeat-store-test";
const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));
// Two flushes: signal-effect microtask + SchemaProp.update observer microtask
const flushTwice = async () => {
  await flush();
  await flush();
};

describe("repeat() + store arrays (Phase 4c)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("basic rendering", () => {
    it("renders initial items from a store-backed array", () => {
      const vm = useViewModel({
        todos: store([
          { id: 1, text: "Buy milk" },
          { id: 2, text: "Walk dog" },
        ]),
      });

      const view = html`
        <ul data-testid="${TEST_ID}">
          ${repeat(
            vm.$todos,
            t => t.id,
            t => html`<li>${t.text}</li>`
          )}
        </ul>
      `;
      view.mount(document.body);

      const el = getByTestId(document.body, TEST_ID);
      const items = el.querySelectorAll("li");
      expect(items.length).toBe(2);
      expect(items[0].textContent).toContain("Buy milk");
      expect(items[1].textContent).toContain("Walk dog");
    });
  });

  describe("reactive add / remove via store mutations", () => {
    it("push() adds a new <li> without re-creating existing nodes", async () => {
      interface Todo {
        id: number;
        text: string;
      }
      const vm = useViewModel({
        todos: store<Todo[]>([{ id: 1, text: "a" }]),
      });

      const view = html`
        <ul data-testid="${TEST_ID}">
          ${repeat(
            vm.$todos,
            t => t.id,
            t => html`<li>${t.text}</li>`
          )}
        </ul>
      `;
      view.mount(document.body);

      const el = getByTestId(document.body, TEST_ID);
      const initialLi = el.querySelector("li")!;
      expect(initialLi.textContent).toContain("a");

      vm.todos.push({ id: 2, text: "b" });
      await flushTwice();

      const items = el.querySelectorAll("li");
      expect(items.length).toBe(2);
      expect(items[0].textContent).toContain("a");
      expect(items[1].textContent).toContain("b");
      // Key-stable: existing <li> is the same DOM node.
      expect(items[0]).toBe(initialLi);
    });

    it("pop() removes the trailing <li>", async () => {
      interface Todo {
        id: number;
        text: string;
      }
      const vm = useViewModel({
        todos: store<Todo[]>([
          { id: 1, text: "a" },
          { id: 2, text: "b" },
          { id: 3, text: "c" },
        ]),
      });

      const view = html`
        <ul data-testid="${TEST_ID}">
          ${repeat(
            vm.$todos,
            t => t.id,
            t => html`<li>${t.text}</li>`
          )}
        </ul>
      `;
      view.mount(document.body);

      vm.todos.pop();
      await flushTwice();

      const el = getByTestId(document.body, TEST_ID);
      expect(el.querySelectorAll("li").length).toBe(2);
      expect(el.textContent).not.toContain("c");
    });

    it("splice() reorders and changes contents", async () => {
      interface Todo {
        id: number;
        text: string;
      }
      const vm = useViewModel({
        todos: store<Todo[]>([
          { id: 1, text: "a" },
          { id: 2, text: "b" },
          { id: 3, text: "c" },
        ]),
      });

      const view = html`
        <ul data-testid="${TEST_ID}">
          ${repeat(
            vm.$todos,
            t => t.id,
            t => html`<li>${t.text}</li>`
          )}
        </ul>
      `;
      view.mount(document.body);

      vm.todos.splice(1, 1, { id: 99, text: "x" });
      await flushTwice();

      const el = getByTestId(document.body, TEST_ID);
      const items = el.querySelectorAll("li");
      expect(items.length).toBe(3);
      expect(items[0].textContent).toContain("a");
      expect(items[1].textContent).toContain("x");
      expect(items[2].textContent).toContain("c");
    });
  });

  describe("in-place item-field edits (documented limitation)", () => {
    // The templateFn captures item-field reads as static snapshots, not
    // reactive bindings — `html`<li>${t.text}</li>`` interpolates the
    // string value of `t.text` at render time. For per-field reactivity
    // inside an item, users must opt in by interpolating a reactive
    // SchemaProp (e.g., via a separate path-binding or .compute()).
    //
    // Phase 4c covers add / remove / reorder reactively, which is the
    // primary use case. Per-field item reactivity is a candidate for a
    // future enhancement (passing path-bound proxies to templateFn).
    it("edits to existing item fields do NOT auto-rerender the <li>", async () => {
      interface Todo {
        id: number;
        text: string;
      }
      const vm = useViewModel({
        todos: store<Todo[]>([
          { id: 1, text: "buy milk" },
          { id: 2, text: "walk dog" },
        ]),
      });

      const view = html`
        <ul data-testid="${TEST_ID}">
          ${repeat(
            vm.$todos,
            t => t.id,
            t => html`<li>${t.text}</li>`
          )}
        </ul>
      `;
      view.mount(document.body);

      vm.todos[0].text = "BUY MILK";
      await flushTwice();

      const el = getByTestId(document.body, TEST_ID);
      const items = el.querySelectorAll("li");
      // Documented behavior: <li> still shows the original text.
      // Underlying store IS updated.
      expect(vm.todos[0].text).toBe("BUY MILK");
      expect(items[0].textContent).toContain("buy milk");
    });
  });

  describe("deeply nested store arrays", () => {
    it("vm.$data.todos works in templates", async () => {
      interface Todo {
        id: number;
        text: string;
      }
      const vm = useViewModel({
        data: store<{ todos: Todo[] }>({
          todos: [{ id: 1, text: "a" }],
        }),
      });

      const view = html`
        <ul data-testid="${TEST_ID}">
          ${repeat<Todo>(
            vm.$data.todos,
            t => t.id,
            t => html`<li>${t.text}</li>`
          )}
        </ul>
      `;
      view.mount(document.body);

      vm.data.todos.push({ id: 2, text: "b" });
      await flushTwice();

      const el = getByTestId(document.body, TEST_ID);
      expect(el.querySelectorAll("li").length).toBe(2);
    });
  });

  describe("existing non-store usage is unchanged", () => {
    it("repeat() with a static array still works", () => {
      const items = [
        { id: 1, text: "one" },
        { id: 2, text: "two" },
      ];
      const view = html`
        <ul data-testid="${TEST_ID}">
          ${repeat(
            items,
            i => i.id,
            i => html`<li>${i.text}</li>`
          )}
        </ul>
      `;
      view.mount(document.body);

      const el = getByTestId(document.body, TEST_ID);
      expect(el.querySelectorAll("li").length).toBe(2);
    });
  });
});
