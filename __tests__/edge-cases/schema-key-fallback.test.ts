import { useSchema } from "../../src/schema";

describe("Schema Key Fallback", () => {
  test("should generate fallback keys when none provided", () => {
    const schema = useSchema();

    // Define property without key (like in compute or interleaving)
    const prop1 = schema.defineProperty("test value");
    const prop2 = schema.defineProperty(42);

    // Keys should be auto-generated and different
    expect(prop1.key).toBeDefined();
    expect(prop2.key).toBeDefined();
    expect(prop1.key).not.toBe(prop2.key);
    expect(typeof prop1.key).toBe("string");
    expect(typeof prop2.key).toBe("string");

    // Auto-generated keys should start with _auto_
    expect(prop1.key).toMatch(/^_auto_/);
    expect(prop2.key).toMatch(/^_auto_/);
  });

  test("should still work with explicit keys", () => {
    const schema = useSchema();

    // Define property with explicit key
    const prop = schema.defineProperty("test value", "myKey");

    expect(prop.key).toBe("myKey");
  });

  test("should handle undefined key parameter explicitly", () => {
    const schema = useSchema();

    // Explicitly pass undefined (common in template interpolation)
    const prop = schema.defineProperty("test value", undefined);

    expect(prop.key).toBeDefined();
    expect(typeof prop.key).toBe("string");
    expect(prop.key).toMatch(/^_auto_/);
  });

  test("should handle null key parameter", () => {
    const schema = useSchema();

    // Pass null as key
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prop = schema.defineProperty("test value", null as any);

    expect(prop.key).toBeDefined();
    expect(typeof prop.key).toBe("string");
    expect(prop.key).toMatch(/^_auto_/);
  });

  test("should safely return undefined for non-existent properties", () => {
    const schema = useSchema();

    // Add a property
    const prop = schema.defineProperty("test value", "existing");

    // Try to get non-existent properties - should return undefined instead of throwing
    expect(schema.getPropertyByKey("nonexistent")).toBeUndefined();
    expect(schema.getPropertyById("nonexistent")).toBeUndefined();
    expect(schema.getPropertyByValue("nonexistent")).toBeUndefined();

    // Existing property should still work
    expect(schema.getPropertyByKey("existing")).toBe(prop);
    expect(schema.getPropertyById(prop.id)).toBe(prop);
    expect(schema.getPropertyByValue("test value")).toBe(prop);
  });
});
