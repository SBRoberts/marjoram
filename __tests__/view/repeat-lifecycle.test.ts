import { getByTestId } from "@testing-library/dom";
import { html, useViewModel, store, repeat } from "../../src";

const TEST_ID = "lifecycle-test";
const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));
const flushTwice = async () => {
  await flush();
  await flush();
};

describe("repeat() lifecycle cleanup (Phase 5c)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // Documented limitation: the items SchemaProp lives on the vm's schema, not
  // on the html template's local schema. view.unmount() only disposes the
  // template schema, so the repeat() effect (registered on the items
  // SchemaProp via addDisposer) survives unmount. This matches the existing
  // observer-based path: observers registered on items also survive
  // view.unmount(). True per-mount cleanup would require either Node-level
  // disposer markers or an API change to repeat() — out of scope for v1.1.
  //
  // The vm.$destroy() test below covers the user-facing teardown lifecycle.
  it("after view.unmount(), the effect still survives (parity with existing observer path; documented)", async () => {
    interface Todo {
      id: number;
      text: string;
    }
    const vm = useViewModel({
      todos: store<Todo[]>([{ id: 1, text: "a" }]),
    });
    let templateFnCalls = 0;
    const view = html`
      <ul data-testid="${TEST_ID}">
        ${repeat(
          vm.$todos,
          t => t.id,
          t => {
            templateFnCalls++;
            return html`<li>${t.text}</li>`;
          }
        )}
      </ul>
    `;
    view.mount(document.body);
    const initial = templateFnCalls;

    view.unmount();
    // Mutate AFTER unmount. The effect is still alive, so templateFn re-runs.
    // (This is the documented limitation.) The test pins the current behavior
    // so a future improvement that DOES cut the effect at view.unmount can
    // intentionally update this expectation.
    vm.todos.push({ id: 2, text: "b" });
    await flushTwice();
    expect(templateFnCalls).toBeGreaterThan(initial);

    // But vm.$destroy() DOES tear it down.
    vm.$destroy();
    const afterDestroy = templateFnCalls;
    vm.todos.push({ id: 3, text: "c" });
    await flushTwice();
    expect(templateFnCalls).toBe(afterDestroy);
  });

  it("vm.$destroy() also tears down repeat()'s store-array effect", async () => {
    interface Todo {
      id: number;
      text: string;
    }
    const vm = useViewModel({
      todos: store<Todo[]>([{ id: 1, text: "a" }]),
    });

    let templateFnCalls = 0;
    const view = html`
      <ul data-testid="${TEST_ID}">
        ${repeat(
          vm.$todos,
          t => t.id,
          t => {
            templateFnCalls++;
            return html`<li>${t.text}</li>`;
          }
        )}
      </ul>
    `;
    view.mount(document.body);

    const initial = templateFnCalls;
    expect(initial).toBeGreaterThan(0);

    vm.$destroy();

    const beforeMutate = templateFnCalls;
    vm.todos.push({ id: 99, text: "ignored" });
    await flushTwice();
    expect(templateFnCalls).toBe(beforeMutate);
  });

  it("the lifecycle fix does not regress normal in-mount reactivity", async () => {
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

    vm.todos.push({ id: 2, text: "b" });
    await flushTwice();

    const el = getByTestId(document.body, TEST_ID);
    expect(el.querySelectorAll("li").length).toBe(2);
  });
});
