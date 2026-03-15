/** Prefix used for all markers injected into template HTML. */
export const MARKER_PREFIX = "marjoram-";

/**
 * Pattern that matches a bare `marjoram-N` sentinel in an attribute value or
 * comment body. Only used for child and regular-attribute positions — sigil
 * attrs are encoded as self-contained data attributes (see buildMarkerHTML).
 */
export const MARKER_REGEX = /marjoram-(\d+)/g;

/**
 * Builds HTML from a tagged-template `strings` array, inserting:
 *   - `<!--marjoram-N-->` comment markers at child interpolation points
 *   - `marjoram-N` text sentinels at regular attribute value interpolation points
 *   - Self-contained data attributes for sigil-prefixed attribute bindings:
 *       @click=${fn}      → `data-marjoram-e-N="click"`   (addEventListener)
 *       .value=${val}     → `data-marjoram-p-N="value"`   (DOM property)
 *       ?disabled=${bool} → `data-marjoram-b-N="disabled"` (toggleAttribute)
 *
 * Sigil bindings must be unquoted and must have no whitespace around `=`.
 * Regular `onclick=${fn}` (legacy event syntax) is also supported and detected
 * at bind time by the `on` name prefix.
 *
 * Context tracking (tag-open state, quote state, attribute-name accumulation)
 * determines which form to use at each interpolation point.
 */
export const buildMarkerHTML = (strings: TemplateStringsArray): string => {
  let result = "";
  let inTag = false;
  let inQuote: false | '"' | "'" = false;
  // Accumulates the current attribute name (no '=' character included)
  let attrName = "";

  for (let i = 0; i < strings.length; i++) {
    const s = strings[i];

    for (let j = 0; j < s.length; j++) {
      const ch = s[j];
      if (inQuote) {
        if (ch === inQuote) {
          inQuote = false;
          attrName = "";
        }
      } else if (inTag) {
        if (ch === ">") {
          inTag = false;
          attrName = "";
        } else if (ch === '"' || ch === "'") {
          inQuote = ch;
        } else if (ch === "=") {
          // do not include '=' in attrName; just acknowledge end of name
        } else if (ch === " " || ch === "\n" || ch === "\r" || ch === "\t") {
          // whitespace between attributes — reset (unless we already saw '=')
          if (!attrName.includes("=")) attrName = "";
        } else {
          attrName += ch;
        }
      } else {
        if (ch === "<") {
          inTag = true;
          attrName = "";
        }
      }
    }

    result += s;

    if (i < strings.length - 1) {
      if (!inTag) {
        // Child position — comment marker
        result += `<!--${MARKER_PREFIX}${i}-->`;
      } else if (inQuote) {
        // Inside a quoted attribute value — bare sentinel only, no sigil rewriting
        result += `${MARKER_PREFIX}${i}`;
      } else {
        // Unquoted attribute position — check for sigil prefixes
        const sigil = attrName[0];
        const targetName = attrName.slice(1); // strip sigil char

        if (sigil === "@" || sigil === "." || sigil === "?") {
          // Strip `sigilName=` from the end of result (length = attrName.length + 1 for '=')
          const base = result.slice(0, result.length - attrName.length - 1);
          const typeCode = sigil === "@" ? "e" : sigil === "." ? "p" : "b";
          // Emit a self-contained data attribute: no sentinel needed in the value
          result = base + `data-marjoram-${typeCode}-${i}="${targetName}"`;
        } else {
          // Regular attribute — bare sentinel in value
          result += `${MARKER_PREFIX}${i}`;
        }

        attrName = "";
      }
    }
  }

  return result;
};
