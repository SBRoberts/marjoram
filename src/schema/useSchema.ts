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
    defineProperty<T extends SchemaPropValue>(
      value: T,
      key?: string
    ): TypedSchemaProp<T> {
      // Handle schemaProps provided as values
      if (value instanceof SchemaProp) {
        const schemaProp = value;
        const { id } = schemaProp;

        // Does the schema prop exist in this schema already?
        if (!this.hasId(id)) {
          this.props.push(schemaProp);
          this.ids.push(id);
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

      // Type assertion is necessary because:
      // 1. TypedSchemaProp<T> is a conditional type resolved at compile time
      // 2. SchemaProp instances have array methods added via dynamic getters
      // 3. The runtime behavior matches the type definition exactly
      return schemaProp as unknown as TypedSchemaProp<T>;
    },
    getPropertyByKey(key) {
      return this.props.find(({ key: propKey }) => propKey === key);
    },
    getPropertyByValue(value) {
      return this.props.find(({ value: propValue }) => propValue === value);
    },
    getPropertyById(id) {
      return this.props.find(({ id: _id }) => _id === id);
    },
    hasProperty(key) {
      return this.props.some(item => item.key === key);
    },
    hasId(id) {
      return this.ids.some(_id => _id === id);
    },
  } satisfies Schema;

  return schema;
};
