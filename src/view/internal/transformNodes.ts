import { SchemaProp } from "../../schema";
import { Schema, SchemaPropValue } from "../../schema/types";
import { View } from "../types";

const deriveArgType = (value: any) => {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value instanceof DocumentFragment || value instanceof Element) {
    return "element";
  }
  return typeof value;
};

// Replace the current text node's containing id w/ its intended value
const transformTextNode = (schemaProp: SchemaProp) => {
  const { id, value } = schemaProp;
  return (node: Node) => {
    const valueType = deriveArgType(value);

    // If the current text node contains the current id, do stuff
    if (node.textContent?.includes(id)) {
      schemaProp.observe(node, schemaProp);
      if (Array.isArray(value)) {
        value.forEach(transformTextNode(schemaProp));
        node.textContent = node.textContent.replace(id, "");
      } else if (typeof value !== "object") {
        node.textContent = node.textContent.replace(id, value.toString());
      }
    }
  };
};

// Loop through every text node replacing any ids w/ their intended value
const transformTextNodes = (textNodes: Node[], schemaProp: SchemaProp) =>
  textNodes.forEach(transformTextNode(schemaProp));

// Replace the current attribute node's containing id w/ its intended value
const transformAttribute = (schemaProp: SchemaProp) => {
  const { id, value } = schemaProp;
  return (node: Attr) => {
    /* Exit early if the attribute does not contain a schema id,
    if the attribute denotes a placeholder, or if the value is not a string */
    if (
      (!node.value.includes(id) || node.name === "data-id") &&
      (typeof value !== "string" || typeof value !== "number")
    ) {
      return;
    }

    schemaProp.observe(node, schemaProp);
    node.value = node.value.replace(id, value);
  };
};

// Loop through every attribute replacing any ids w/ their intended value
const transformAttributes = (attributes: Attr[], schemaProp: SchemaProp) =>
  attributes.forEach(transformAttribute(schemaProp));

// Given an ID, replace any occurence of that id in the DOM Node's attributes or text w/ its inteded value
const transformContent = (element: Element) => {
  const { attributes, childNodes } = element;

  // Get all attribute nodes in current node as an array
  const attrs = Array.from(attributes);

  // Get all text nodes in current node as an array
  const textNodes = Array.from(childNodes).filter(
    ({ nodeType, textContent }) =>
      nodeType === Node.TEXT_NODE && textContent.trim()
  );

  // Loop through all of the current node's attributs/text and replace the given id w/ the intended value
  return (schemaProp: SchemaProp) => {
    transformTextNodes(textNodes, schemaProp);
    transformAttributes(attrs, schemaProp);
  };
};

// Given a DOM Node, iterate through schema ids replacing each textNode and attribute w/ schema val
const transformChildNode = (schemaProps: SchemaProp[]) => (element: Element) =>
  schemaProps.forEach(transformContent(element));

const appendChildren =
  (schema: Schema, view: DocumentFragment) => (schemaProp: SchemaProp) => {
    const { id, value } = schemaProp;
    const placeholder = view.querySelector(`del[${id}]`);
    const isElement = (value: SchemaPropValue) => value instanceof Node;
    const isArrayOfElements = Array.isArray(value) && value.every(isElement);

    if (placeholder && (isElement || isArrayOfElements)) {
      schemaProp.observe(placeholder, schemaProp);
      const arrayifiedVal = Array.isArray(value)
        ? <Node[]>value
        : [<Node>value];

      placeholder.replaceWith(...arrayifiedVal);
    }
  };

export const transformNodes = (
  schema: Schema,
  view: DocumentFragment
): DocumentFragment => {
  const schemaProps = schema.props;
  schemaProps.forEach(appendChildren(schema, view));

  const elements = Array.from(view.querySelectorAll("*"));
  elements.forEach(transformChildNode(schemaProps));
  return view;
};
