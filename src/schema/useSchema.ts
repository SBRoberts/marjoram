import { Schema, SchemaPropValue, TypedSchemaProp } from "./types";
import { SchemaProp } from "./schemaPropFactory";

/**
 * @description Create a new schema or use an exisiting one. This schema is a private data structure that is used to establish/define the relationship between our view's data
 * @param instance An object to create the schema with. Defaults to empty object. Can be used to couple several schema's together
 */
export const useSchema = function (instance?: Schema): Schema {
  if (instance) {
    return instance;
  }
  const schema = {
    ids: [],
    props: [],
    keyMap: new Map<string, SchemaProp>(),
    idMap: new Map<string, SchemaProp>(),
    defineProperty<T extends SchemaPropValue>(
      value: T,
      key?: string
    ): TypedSchemaProp<T> {
      // Handle schemaProps provided as values
      if (value instanceof SchemaProp) {
        const schemaProp = value;
        const { id } = schemaProp;

        // Does the schema prop exist in this schema already?
        if (!this.idMap.has(id)) {
          this.props.push(schemaProp);
          this.ids.push(id);
          this.idMap.set(id, schemaProp);
          if (schemaProp.key) this.keyMap.set(schemaProp.key, schemaProp);
        }

        // Type assertion is required here because TypedSchemaProp<T> is a conditional type
        // that depends on whether T extends readonly unknown[]. The SchemaProp class
        // implements array methods via getters, making this cast safe at runtime.
        return schemaProp as unknown as TypedSchemaProp<T>;
      }

      // Generate a fallback key if none provided to ensure type safety
      const safeKey = key ?? `_auto_${this.props.length}_${Date.now()}`;
      const schemaProp = new SchemaProp(this, safeKey, value);

      this.props.push(schemaProp);
      this.ids.push(schemaProp.id);
      this.idMap.set(schemaProp.id, schemaProp);
      this.keyMap.set(safeKey, schemaProp);

      // Type assertion is necessary because:
      // 1. TypedSchemaProp<T> is a conditional type resolved at compile time
      // 2. SchemaProp instances have array methods added via dynamic getters
      // 3. The runtime behavior matches the type definition exactly
      return schemaProp as unknown as TypedSchemaProp<T>;
    },
    getPropertyByKey(key) {
      return this.keyMap.get(key);
    },
    getPropertyByValue(value) {
      return this.props.find(({ value: propValue }) => propValue === value);
    },
    getPropertyById(id) {
      return this.idMap.get(id);
    },
    hasProperty(key) {
      return this.keyMap.has(key);
    },
    hasId(id) {
      return this.idMap.has(id);
    },
    dispose() {
      this.props.forEach(prop => prop.dispose());
      this.ids = [];
      this.props = [];
      this.keyMap.clear();
      this.idMap.clear();
    },
  } satisfies Schema;

  return schema;
};
