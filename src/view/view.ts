// Modules
import { useSchema } from "../schema";
import { transformNodes, interleaveTemplateLiteral } from "./internal";
import { useCollect } from "./external";

// Types
import { View } from "./types";
import { Schema } from "../schema/types";

export const html = function (
  strings: TemplateStringsArray,
  ...args: any[]
): View {
  // Create a private schema. Defines relationship between our data and view
  const schema: Schema = useSchema();

  // Assemble strings and ids together as a new string. Store argument in schema
  const interleaved = interleaveTemplateLiteral(strings, args, schema);

  // Create a template that allows us to assemble content and query for elements
  const template = document.createElement("template");
  template.innerHTML = interleaved;

  // Before returning the view, transform any ids to their intended value
  const view = transformNodes(schema, template.content);

  (<View>view).collect = useCollect(view);

  return <View>view;
};
