import { SchemaProp } from "../../schema";
import { SchemaPropValue } from "../../schema/types";
import { MARKER_PREFIX, MARKER_REGEX } from "./interleaveTemplateLiteral";

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function emptyText(): Text {
  return document.createTextNode("");
}

function replaceNodes(
  marker: Comment,
  current: Node[],
  newNodes: Node[]
): Node[] {
  const parent = marker.parentNode;
  if (!parent) return current;

  for (const node of current) {
    parent.removeChild(node);
  }

  const insertionPoint = marker.nextSibling;
  for (const node of newNodes) {
    parent.insertBefore(node, insertionPoint);
  }

  return [...newNodes];
}

// ---------------------------------------------------------------------------
// Reactive binding functions — each closes over its DOM coordinates and
// subscribes directly to a SchemaProp. No intermediate Part objects.
// ---------------------------------------------------------------------------

function bindChild(marker: Comment, prop: SchemaProp): void {
  let current: Node[] = [];

  const commit = (value: unknown): void => {
    if (value instanceof DocumentFragment) {
      const nodes = Array.from(value.childNodes);
      current = replaceNodes(
        marker,
        current,
        nodes.length > 0 ? nodes : [emptyText()]
      );
    } else if (value instanceof Node) {
      current = replaceNodes(marker, current, [value]);
    } else if (Array.isArray(value)) {
      const nodes = value.flatMap(v => {
        if (v instanceof DocumentFragment) return Array.from(v.childNodes);
        if (v instanceof Node) return [v];
        return [document.createTextNode(String(v ?? ""))];
      });
      current = replaceNodes(
        marker,
        current,
        nodes.length > 0 ? nodes : [emptyText()]
      );
    } else {
      // eslint-disable-next-line eqeqeq
      const text = value == null ? "" : String(value);
      if (
        current.length === 1 &&
        current[0].nodeType === Node.TEXT_NODE
      ) {
        (current[0] as Text).data = text;
      } else {
        current = replaceNodes(marker, current, [
          document.createTextNode(text),
        ]);
      }
    }
  };

  commit(prop.value);
  prop.observe((v: SchemaPropValue) => commit(v));
}

function bindEvent(
  element: Element,
  eventName: string,
  prop: SchemaProp
): void {
  let current: EventListener | null = null;

  const commit = (value: unknown): void => {
    if (current) {
      element.removeEventListener(eventName, current);
      current = null;
    }
    if (typeof value === "function") {
      current = value as EventListener;
      element.addEventListener(eventName, current);
    }
  };

  commit(prop.value);
  prop.observe((v: SchemaPropValue) => commit(v));
}

function bindProperty(
  element: Element,
  propName: string,
  prop: SchemaProp
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commit = (value: unknown): void => {
    (element as any)[propName] = value; // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  commit(prop.value);
  prop.observe((v: SchemaPropValue) => commit(v));
}

function bindBooleanAttr(
  element: Element,
  attrName: string,
  prop: SchemaProp
): void {
  const commit = (value: unknown): void => {
    element.toggleAttribute(attrName, Boolean(value));
  };

  commit(prop.value);
  prop.observe((v: SchemaPropValue) => commit(v));
}

function bindDynamicName(element: Element, prop: SchemaProp): void {
  let currentAttrName: string | null = null;

  const commit = (value: unknown): void => {
    if (currentAttrName) {
      element.removeAttribute(currentAttrName);
      currentAttrName = null;
    }
    // eslint-disable-next-line eqeqeq
    const str = value == null ? "" : String(value);
    if (str) {
      element.setAttribute(str, "");
      currentAttrName = str;
    }
  };

  commit(prop.value);
  prop.observe((v: SchemaPropValue) => commit(v));
}

function bindAttribute(
  element: Element,
  name: string,
  statics: string[],
  markerIndices: number[],
  schemaProps: SchemaProp[]
): void {
  const values: unknown[] = markerIndices.map(i => schemaProps[i].value);

  const commit = (): void => {
    let result = statics[0];
    for (let i = 0; i < values.length; i++) {
      result += String(values[i] ?? "") + statics[i + 1];
    }
    element.setAttribute(name, result);
  };

  commit();

  markerIndices.forEach((propIndex, slotIndex) => {
    const prop = schemaProps[propIndex];
    if (!prop) return;
    prop.observe((newValue: SchemaPropValue) => {
      values[slotIndex] = newValue;
      commit();
    });
  });
}

// ---------------------------------------------------------------------------
// Marker parsing — splits an attribute value on marker sentinels and returns
// the static segments and the SchemaProp indices they surround.
// ---------------------------------------------------------------------------

interface ParsedMarkers {
  statics: string[];
  indices: number[];
}

function parseMarkers(value: string): ParsedMarkers | null {
  const statics: string[] = [];
  const indices: number[] = [];
  let lastIdx = 0;

  // Use a local RegExp so we don't share lastIndex across calls
  const re = new RegExp(MARKER_REGEX.source, "g");
  let match;
  while ((match = re.exec(value)) !== null) {
    statics.push(value.slice(lastIdx, match.index));
    indices.push(parseInt(match[1], 10));
    lastIdx = match.index + match[0].length;
  }

  if (indices.length === 0) return null;
  statics.push(value.slice(lastIdx));
  return { statics, indices };
}

// ---------------------------------------------------------------------------
// Hoisted regex patterns — avoid re-creation inside hot loops.
// ---------------------------------------------------------------------------

const SIGIL_ATTR_RE = /^data-marjoram-([epb])-(\d+)$/;
const BARE_MARKER_NAME_RE = new RegExp(`^${MARKER_PREFIX}(\\d+)$`);
const RAW_MARKER_RE = /<!--marjoram-(\d+)-->/g;

// ---------------------------------------------------------------------------
// Phase 1 — child parts from comment-node markers.
// ---------------------------------------------------------------------------

function bindChildMarkers(
  view: DocumentFragment,
  schemaProps: SchemaProp[]
): void {
  const walker = document.createTreeWalker(view, NodeFilter.SHOW_COMMENT);

  // Collect markers before mutating the tree (insertions shift the walker)
  const markers: { comment: Comment; index: number }[] = [];
  while (walker.nextNode()) {
    const comment = walker.currentNode as Comment;
    if (comment.data.startsWith(MARKER_PREFIX)) {
      markers.push({
        comment,
        index: parseInt(comment.data.slice(MARKER_PREFIX.length), 10),
      });
    }
  }

  for (const { comment, index } of markers) {
    const prop = schemaProps[index];
    if (prop) {
      bindChild(comment, prop);
    }
  }
}

// ---------------------------------------------------------------------------
// Phase 1b — child parts in raw-text elements (textarea, title, etc.).
// Browsers parse comment markers as literal text inside these elements,
// so we scan text nodes for the marker pattern and split them into proper
// comment-anchored child parts.
// ---------------------------------------------------------------------------

function bindRawTextMarkers(
  view: DocumentFragment,
  schemaProps: SchemaProp[]
): void {
  const textWalker = document.createTreeWalker(view, NodeFilter.SHOW_TEXT);
  const textNodesToProcess: Text[] = [];

  while (textWalker.nextNode()) {
    const t = textWalker.currentNode as Text;
    RAW_MARKER_RE.lastIndex = 0;
    if (RAW_MARKER_RE.test(t.data)) textNodesToProcess.push(t);
  }

  for (const textNode of textNodesToProcess) {
    const parent = textNode.parentNode!;
    const text = textNode.data;
    RAW_MARKER_RE.lastIndex = 0;

    const fragments: (string | { index: number })[] = [];
    let lastIdx = 0;
    let match;
    while ((match = RAW_MARKER_RE.exec(text)) !== null) {
      if (match.index > lastIdx)
        fragments.push(text.slice(lastIdx, match.index));
      fragments.push({ index: parseInt(match[1], 10) });
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < text.length) fragments.push(text.slice(lastIdx));

    for (const frag of fragments) {
      if (typeof frag === "string") {
        parent.insertBefore(document.createTextNode(frag), textNode);
      } else {
        const comment = document.createComment(`${MARKER_PREFIX}${frag.index}`);
        parent.insertBefore(comment, textNode);
        const prop = schemaProps[frag.index];
        if (prop) {
          bindChild(comment, prop);
        }
      }
    }
    parent.removeChild(textNode);
  }
}

// ---------------------------------------------------------------------------
// Phase 2 — attribute, event, property, boolean, and ref bindings.
// Processes a single element's attributes, creates Parts, and collects refs.
// ---------------------------------------------------------------------------

function bindElementAttributes(
  element: Element,
  schemaProps: SchemaProp[],
  refs: Record<string, HTMLElement>
): void {
  // Snapshot the attribute list — we may remove entries during iteration
  const attrs = Array.from(element.attributes);

  for (const attr of attrs) {
    // A: sigil data attribute (@event, .prop, ?bool)
    const sigilMatch = attr.name.match(SIGIL_ATTR_RE);
    if (sigilMatch) {
      const typeCode = sigilMatch[1]; // 'e' | 'p' | 'b'
      const index = parseInt(sigilMatch[2], 10);
      const targetName = attr.value;
      element.removeAttribute(attr.name);
      const prop = schemaProps[index];
      if (!prop) continue;

      if (typeCode === "e") {
        bindEvent(element, targetName, prop);
      } else if (typeCode === "p") {
        bindProperty(element, targetName, prop);
      } else {
        bindBooleanAttr(element, targetName, prop);
      }
      continue;
    }

    // B: bare marker as the attribute *name* (e.g. ${val} spread between attrs)
    const nameMatch = attr.name.match(BARE_MARKER_NAME_RE);
    if (nameMatch) {
      const index = parseInt(nameMatch[1], 10);
      element.removeAttribute(attr.name);
      const prop = schemaProps[index];
      if (!prop) continue;

      bindDynamicName(element, prop);
      continue;
    }

    // C: marker(s) inside the attribute *value*
    const parsed = parseMarkers(attr.value);
    if (!parsed) continue;

    const { statics, indices: markerIndices } = parsed;

    // C-1: legacy onclick=${fn} event handler
    const isEventAttr =
      markerIndices.length === 1 &&
      statics.every(s => s === "") &&
      attr.name.startsWith("on");
    if (isEventAttr) {
      const eventName = attr.name.slice(2);
      element.removeAttribute(attr.name);
      const prop = schemaProps[markerIndices[0]];
      if (prop) {
        bindEvent(element, eventName, prop);
      }
      continue;
    }

    // C-2: regular attribute (single- or multi-expression interpolation).
    bindAttribute(element, attr.name, statics, markerIndices, schemaProps);
  }

  // Collect ref after all bindings are committed (handles dynamic refs).
  // The attribute is left on the element so parent views can also discover it
  // when child fragments are committed into a parent template.
  const refValue = element.getAttribute("ref");
  if (refValue) {
    refs[refValue] = element as HTMLElement;
  }
}

// ---------------------------------------------------------------------------
// bindTemplate — main entry point.
//
// Walks the cloned template DOM to discover markers, create typed Parts,
// commit initial values, subscribe to reactive updates, and collect refs.
// Returns a TemplateBinding with the collected refs.
// ---------------------------------------------------------------------------

export interface TemplateBinding {
  refs: Record<string, HTMLElement>;
}

export const bindTemplate = (
  view: DocumentFragment,
  schemaProps: SchemaProp[]
): TemplateBinding => {
  const refs: Record<string, HTMLElement> = {};

  bindChildMarkers(view, schemaProps);
  bindRawTextMarkers(view, schemaProps);

  for (const element of view.querySelectorAll("*")) {
    bindElementAttributes(element, schemaProps, refs);
  }

  return { refs };
};
