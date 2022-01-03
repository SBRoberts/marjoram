import { Schema, SchemaPropValue } from "./types";
import { SchemaProp } from "./schemaPropFactory";

/**
 * @description Create a new schema or use an exisiting one. This schema is a private data structure that is used to establish/define the relationship between our view's data
 * @param instance An object to create the schema with. Defaults to empty object. Can be used to couple several schema's together
 */
export const useSchema = function (instance?: Schema): Schema {
  if (instance) {
    return instance;
  }
  const schema: Schema = {
    ids: [],
    props: [],
    defineProperty(value, key?) {
      // Handle schemaProps provided as values
      if (SchemaProp.prototype.isPrototypeOf(value)) {
        const schemaProp = <SchemaProp>value;
        const { id } = schemaProp;

        // Does the schema prop exist in this schema already?
        if (!this.hasId(id)) {
          this.props.push(schemaProp);
          this.ids.push(id);
        }

        return schemaProp;
      }

      const schemaProp = new SchemaProp(this, key, value);

      this.props.push(schemaProp);
      this.ids.push(schemaProp.id);

      return schemaProp;
    },
    getPropertyByKey(key) {
      return this.props.find(({ key: propKey }) => propKey === key);
    },
    getPropertyByValue(value): SchemaProp {
      return this.props.find(({ value: propValue }) => propValue === value);
    },
    getPropertyById(id): SchemaProp {
      return this.props.find(({ id: _id }) => _id === id);
    },
    hasProperty(key) {
      return this.props.some((item) => item.key === key);
    },
    hasId(id) {
      return this.ids.some((_id) => _id === id);
    },
  };

  return schema;
};
