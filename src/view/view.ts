// Modules
import { useSchema } from "../schema";
import { SchemaProp } from "../schema/schemaPropFactory";
import { buildMarkerHTML, bindTemplate } from "./internal";

// Types
import { View } from "./types";
import { SchemaPropValue } from "../schema/types";

/**
 * Per-call-site template cache. The `strings` array of a tagged template
 * literal is a frozen, referentially stable object — the same object is
 * returned on every evaluation of the same call site. This lets us parse
 * the static HTML structure once and clone it on every subsequent call.
 */
const templateCache = new WeakMap<TemplateStringsArray, HTMLTemplateElement>();

/**
 * Creates a reactive DOM view from a template literal.
 * Interpolated reactive properties (accessed via the `$` prefix) are bound to the DOM
 * and update automatically when the underlying value changes.
 *
 * @param strings - The template strings array
 * @param args - The interpolated values
 * @returns A reactive View (DocumentFragment) with `collect`, `mount`, and `unmount` methods
 *
 * @example
 * ```typescript
 * import { html, useViewModel } from 'marjoram';
 *
 * const vm = useViewModel({ count: 0 });
 * const view = html`
 *   <div>
 *     <p>Count: ${vm.$count}</p>
 *     <button ref="inc" onclick=${() => vm.count++}>+</button>
 *   </div>
 * `;
 *
 * view.mount('#app');
 * ```
 */
export const html = function (
  strings: TemplateStringsArray,
  ...args: unknown[]
): View {
  // Create a private schema to track reactive bindings for this view
  const schema = useSchema();

  // Register every interpolated value as a SchemaProp in the schema.
  // If the arg is already a SchemaProp (e.g. from vm.$count or .compute()),
  // defineProperty returns the existing instance; otherwise it wraps the value.
  const schemaProps: SchemaProp[] = args.map(arg => {
    // eslint-disable-next-line eqeqeq
    const safeArg = arg == null ? "" : arg;
    return schema.defineProperty(
      safeArg as SchemaPropValue,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (safeArg as any)?.key
    ) as unknown as SchemaProp;
  });

  // Retrieve or build the cached <template> for this call site.
  // The cached template is read-only — only clones are bound and mutated.
  let cachedTemplate = templateCache.get(strings);
  if (!cachedTemplate) {
    cachedTemplate = document.createElement("template");
    cachedTemplate.innerHTML = buildMarkerHTML(strings);
    templateCache.set(strings, cachedTemplate);
  }

  // Clone the cached template — this is a fast C++ operation (no HTML parsing)
  const view = cachedTemplate.content.cloneNode(true) as View;

  // Walk the parsed DOM to discover markers, create Parts, commit initial
  // values, subscribe each Part to its SchemaProp, and collect refs
  const binding = bindTemplate(view, schemaProps);

  view.collect = () => {
    if (!view.refs) view.refs = binding.refs;
    return view.refs;
  };

  // Track mounted nodes so we can remove them precisely on unmount
  let mountedNodes: ChildNode[] = [];

  view.mount = (target, options = {}) => {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!el) {
      throw new Error(`[marjoram] mount target not found: "${target}"`);
    }

    // Inject styles as a <style> tag if provided
    if (options.styles) {
      const style = document.createElement("style");
      style.textContent = options.styles;
      view.prepend(style);
    }

    // Capture node references before appending — the fragment empties after appendChild
    mountedNodes = Array.from(view.childNodes);

    if (options.shadow) {
      const shadowRoot = el.attachShadow({ mode: options.shadow });
      shadowRoot.appendChild(view);
    } else {
      el.appendChild(view);
    }
  };

  view.unmount = () => {
    schema.dispose();
    mountedNodes.forEach(node => node.parentNode?.removeChild(node));
    mountedNodes = [];
  };

  return view;
};
