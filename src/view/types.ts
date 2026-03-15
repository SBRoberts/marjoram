export type elementCollection = Record<string, HTMLElement>;

export type collectFn = () => elementCollection;
export type useCollectFn = (view: DocumentFragment) => collectFn;
export type MountOptions = {
  /** Attach a Shadow DOM to the target for style isolation. Use 'closed' for production widgets. */
  shadow?: "open" | "closed";
  /** CSS string to inject as a <style> tag alongside the view. Scoped automatically when using shadow DOM. */
  styles?: string;
};

export interface View extends DocumentFragment {
  collect: collectFn;
  /** Escape hatch to attach a viewModel reference to a view. Untyped intentionally — use createWidget for lifecycle management. */
  viewModel?: unknown;
  refs?: elementCollection;
  /**
   * Mount the view into a target element.
   * @param target - A DOM element or CSS selector string
   * @param options - Optional mount configuration (e.g. shadow DOM)
   */
  mount: (target: Element | string, options?: MountOptions) => void;
  /**
   * Remove the view from the DOM and dispose all reactive schema state.
   */
  unmount: () => void;
}
