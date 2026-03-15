import { html } from "../view";
import { useViewModel } from "../useViewModel";
import { Model, ViewModel } from "../useViewModel/types";
import { View, MountOptions } from "../view/types";

export interface WidgetOptions<TModel extends Model> {
  /** The DOM element or CSS selector string to mount the widget into */
  target: Element | string;
  /** Attach a Shadow DOM to the target for style isolation. Use 'closed' for production widgets. */
  shadow?: "open" | "closed";
  /** CSS string to inject alongside the view. Scoped automatically when using shadow DOM. */
  styles?: string;
  /** The initial reactive state for the widget */
  model: TModel;
  /** Returns the widget's view, given the reactive view model */
  render: (vm: ViewModel<TModel>) => View;
  /**
   * Called after the widget is mounted into the DOM.
   * Use this to wire event listeners via collect().
   */
  onMount?: (vm: ViewModel<TModel>, refs: ReturnType<View["collect"]>) => void;
  /**
   * Called before the widget is destroyed.
   * Use this to clean up external subscriptions or timers.
   */
  onDestroy?: (vm: ViewModel<TModel>) => void;
}

export interface Widget<TModel extends Model> {
  /** Mount the widget into its target element */
  mount: () => void;
  /** Remove the widget from the DOM and dispose all reactive state */
  destroy: () => void;
  /** The reactive view model instance */
  vm: ViewModel<TModel>;
}

/**
 * Creates a self-contained, mountable widget with full lifecycle management.
 * Ideal for third-party embeds, chat widgets, banners, and any interactive
 * component that must run safely inside a page it does not control.
 *
 * @param options - Widget configuration
 * @returns A widget object with `mount`, `destroy`, and `vm`
 *
 * @example
 * ```typescript
 * const widget = createWidget({
 *   target: '#chat-root',
 *   shadow: 'closed',
 *   styles: `
 *     .chat { position: fixed; bottom: 1rem; right: 1rem; }
 *     .chat button { padding: 0.5rem 1rem; }
 *   `,
 *   model: { open: false, unread: 0 },
 *   render: (vm) => html`
 *     <div class="chat">
 *       <button onclick=${() => (vm.open = true)}>
 *         Chat ${vm.$unread.compute(n => (n > 0 ? `(${n})` : ''))}
 *       </button>
 *     </div>
 *   `,
 *   onMount: (vm, refs) => {
 *     // wire up external events here
 *   },
 *   onDestroy: (vm) => {
 *     // clean up external subscriptions here
 *   },
 * });
 *
 * widget.mount();
 *
 * // Later, when the host page removes the widget:
 * widget.destroy();
 * ```
 */
export function createWidget<TModel extends Model>(
  options: WidgetOptions<TModel>
): Widget<TModel> {
  const { target, shadow, styles, model, render, onMount, onDestroy } = options;

  const vm = useViewModel(model);
  const view = render(vm);

  const mountOptions: MountOptions = {
    ...(shadow && { shadow }),
    ...(styles && { styles }),
  };

  return {
    vm,
    mount() {
      view.mount(target, mountOptions);
      if (onMount) onMount(vm, view.collect());
    },
    destroy() {
      if (onDestroy) onDestroy(vm);
      view.unmount();
      vm.$destroy();
    },
  };
}
