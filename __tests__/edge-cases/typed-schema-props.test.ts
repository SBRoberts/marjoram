import { useViewModel } from "../../src/useViewModel";
import { useSchema } from "../../src/schema";

describe("Typed Schema Properties", () => {
  describe("Array Schema Properties", () => {
    test("should provide proper typing for array methods without casting", () => {
      const viewModel = useViewModel({
        items: ["a", "b", "c"],
        numbers: [1, 2, 3, 4, 5],
        mixed: [1, "hello", true],
      });

      // Test that $items has proper array methods with IntelliSense
      const mappedItems = viewModel.$items.map((item: string) =>
        item.toUpperCase()
      );
      expect(mappedItems).toEqual(["A", "B", "C"]);

      const filteredItems = viewModel.$items.filter(
        (item: string) => item > "a"
      );
      expect(filteredItems).toEqual(["b", "c"]);

      const foundItem = viewModel.$items.find((item: string) => item === "b");
      expect(foundItem).toBe("b");

      const reduced = viewModel.$items.reduce(
        (acc: string, item: string) => acc + item,
        ""
      );
      expect(reduced).toBe("abc");

      // Test that length property is accessible
      expect(viewModel.$items.length).toBe(3);

      // Test forEach
      let count = 0;
      viewModel.$items.forEach(() => count++);
      expect(count).toBe(3);
    });

    test("should work with number arrays", () => {
      const viewModel = useViewModel({
        numbers: [1, 2, 3, 4, 5],
      });

      const doubled = viewModel.$numbers.map((num: number) => num * 2);
      expect(doubled).toEqual([2, 4, 6, 8, 10]);

      const evens = viewModel.$numbers.filter((num: number) => num % 2 === 0);
      expect(evens).toEqual([2, 4]);

      const sum = viewModel.$numbers.reduce(
        (acc: number, num: number) => acc + num,
        0
      );
      expect(sum).toBe(15);

      // Test additional array methods
      expect(viewModel.$numbers.includes(3)).toBe(true);
      expect(viewModel.$numbers.includes(6)).toBe(false);
      expect(viewModel.$numbers.indexOf(4)).toBe(3);
      expect(viewModel.$numbers.slice(1, 3)).toEqual([2, 3]);
      expect(viewModel.$numbers.join(", ")).toBe("1, 2, 3, 4, 5");
      expect(viewModel.$numbers.some((num: number) => num > 4)).toBe(true);
      expect(viewModel.$numbers.every((num: number) => num > 0)).toBe(true);
      expect(viewModel.$numbers.findIndex((num: number) => num === 3)).toBe(2);
    });

    test("should handle empty arrays", () => {
      const viewModel = useViewModel({
        empty: [] as string[],
      });

      expect(viewModel.$empty.length).toBe(0);
      expect(viewModel.$empty.map((item: string) => item)).toEqual([]);
      expect(viewModel.$empty.filter(() => true)).toEqual([]);
      expect(viewModel.$empty.find(() => true)).toBeUndefined();
    });

    test("should work with direct schema usage", () => {
      const schema = useSchema();
      const arrayProp = schema.defineProperty(["x", "y", "z"]);

      // TypeScript should recognize this as SchemaArrayProp<string>
      const mapped = arrayProp.map((item: string) => item.toUpperCase());
      expect(mapped).toEqual(["X", "Y", "Z"]);

      const filtered = arrayProp.filter((item: string) => item > "x");
      expect(filtered).toEqual(["y", "z"]);

      expect(arrayProp.length).toBe(3);
    });
  });

  describe("Non-Array Schema Properties", () => {
    test("should not provide array methods for non-array properties", () => {
      const viewModel = useViewModel({
        name: "John",
        age: 30,
        active: true,
      });

      // These should be regular SchemaProp instances
      expect(viewModel.$name.value).toBe("John");
      expect(viewModel.$age.value).toBe(30);
      expect(viewModel.$active.value).toBe(true);

      // Array methods should return undefined for non-arrays
      expect(viewModel.$name.map).toBeUndefined();
      expect(viewModel.$name.filter).toBeUndefined();
      expect(viewModel.$name.length).toBeUndefined();
    });
  });

  describe("Type Guards", () => {
    test("should properly identify array schema props", () => {
      const schema = useSchema();
      const arrayProp = schema.defineProperty(["a", "b"]);
      const stringProp = schema.defineProperty("hello");

      // TypeScript should infer these types correctly
      expect(Array.isArray(arrayProp.value)).toBe(true);
      expect(Array.isArray(stringProp.value)).toBe(false);

      // Array methods should exist for array props
      expect(typeof arrayProp.map).toBe("function");
      expect(arrayProp.filter).toBeDefined();

      // Array methods should be undefined for non-array props
      expect(stringProp.map).toBeUndefined();
      expect(stringProp.filter).toBeUndefined();
    });
  });

  describe("Dynamic Updates", () => {
    test("should maintain array methods after updates", () => {
      const viewModel = useViewModel({
        items: ["initial"],
      });

      // Update the array
      viewModel.items = ["a", "b", "c"];

      // Array methods should still work
      const mapped = viewModel.$items.map((item: string) => item.toUpperCase());
      expect(mapped).toEqual(["A", "B", "C"]);
      expect(viewModel.$items.length).toBe(3);
    });

    test("should handle type changes gracefully", () => {
      const schema = useSchema();
      const prop = schema.defineProperty(["a", "b"]);

      // Initially it's an array
      expect(typeof prop.map).toBe("function");
      expect(prop.length).toBe(2);

      // Update to non-array value
      prop.update("string value");

      // Array methods should return undefined for non-array value
      expect(prop.map).toBeUndefined();
      expect(prop.length).toBeUndefined();
      expect(prop.value).toBe("string value");
    });
  });
});
