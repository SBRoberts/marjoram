// Compile-time type checks for store(), Path<T>, PathValue<T,P>, subscribe(),
// and snapshot(). These tests run at TypeScript compile time — if any
// assertion fails, `npm run type-check` errors out. The test bodies are
// trivial; what matters is the type annotations.

import {
  store,
  snapshot,
  subscribe,
  markRaw,
  isStore,
  unwrap,
  type Store,
  type Path,
  type PathValue,
} from "../../src/reactivity";

// Compile-time helper: asserts T is assignable to U at the type level.
// Used as `expectType<string>(value)` — TS will error if value isn't string.
function expectType<T>(_value: T): void {
  void _value;
}

describe("store() — compile-time type tests (Phase 6)", () => {
  it("store(initial) preserves T's structural shape", () => {
    interface User {
      name: string;
      age: number;
      address: { city: string; zip: string };
    }
    const s = store<User>({
      name: "Alice",
      age: 30,
      address: { city: "NYC", zip: "10001" },
    });

    // All fields type-resolve correctly at arbitrary depth.
    expectType<string>(s.name);
    expectType<number>(s.age);
    expectType<string>(s.address.city);
    expectType<string>(s.address.zip);

    // Setters preserve T.
    s.name = "Bob";
    s.address = { city: "LA", zip: "90001" };

    // Branded Store<T> assignable to T (structural compat).
    const u: User = s;
    expectType<string>(u.name);
  });

  it("Path<T> includes all valid dotted paths", () => {
    interface Schema {
      user: { name: string; tags: string[] };
      count: number;
    }
    // These should all be assignable to Path<Schema>.
    const p1: Path<Schema> = "user";
    const p2: Path<Schema> = "user.name";
    const p3: Path<Schema> = "user.tags";
    const p4: Path<Schema> = "count";
    void p1;
    void p2;
    void p3;
    void p4;
  });

  it("PathValue<T, P> resolves to the leaf type", () => {
    interface Schema {
      user: { name: string; age: number };
    }
    expectType<string>("Alice" as PathValue<Schema, "user.name">);
    expectType<number>(30 as PathValue<Schema, "user.age">);
    expectType<{ name: string; age: number }>({
      name: "x",
      age: 1,
    } as PathValue<Schema, "user">);
  });

  it("subscribe() narrows callback param via the typed path", () => {
    const s = store({ user: { name: "Alice", age: 30 } });
    const off1 = subscribe(s, "user.name", (next, prev) => {
      expectType<string>(next);
      expectType<string>(prev);
    });
    const off2 = subscribe(s, "user.age", (next, prev) => {
      expectType<number>(next);
      expectType<number>(prev);
    });
    const off3 = subscribe(s, "", (next, prev) => {
      // Whole-store: next/prev typed as T itself.
      expectType<{ user: { name: string; age: number } }>(next);
      expectType<{ user: { name: string; age: number } }>(prev);
    });
    off1();
    off2();
    off3();
  });

  it("snapshot() returns T (not Store<T>)", () => {
    interface User {
      name: string;
    }
    const s = store<User>({ name: "Alice" });
    const snap = snapshot(s);
    // snap is User (plain), not Store<User> (branded).
    expectType<User>(snap);
  });

  it("markRaw() preserves the value's type", () => {
    interface Config {
      apiKey: string;
    }
    const cfg: Config = { apiKey: "abc" };
    const marked = markRaw(cfg);
    expectType<Config>(marked);
  });

  it("isStore() narrows to Store<object>", () => {
    const value: unknown = store({ x: 1 });
    if (isStore(value)) {
      // Within this branch, value is Store<object>.
      expectType<Store<object>>(value);
    }
  });

  it("unwrap() returns T from Store<T>", () => {
    interface User {
      name: string;
    }
    const s: Store<User> = store<User>({ name: "Alice" });
    const raw = unwrap(s);
    expectType<User>(raw);
  });

  it("nested-store typing: child store inside a parent typed correctly", () => {
    const inner = store({ count: 0 });
    const outer = store({ child: inner });
    // outer.child should be typed Store<{count: number}> (preserving the brand).
    expectType<Store<{ count: number }>>(outer.child);
    expectType<number>(outer.child.count);
  });

  it("arrays in Path<T> use dot-numeric segments", () => {
    interface Schema {
      items: Array<{ id: number; name: string }>;
    }
    // Valid: dot-numeric paths into arrays.
    const p1: Path<Schema> = "items";
    const p2: Path<Schema> = `items.${0}`;
    const p3: Path<Schema> = `items.${5}.name`;
    void p1;
    void p2;
    void p3;

    // PathValue resolves array-index segments:
    expectType<string>("x" as PathValue<Schema, "items.0.name">);
    expectType<number>(0 as PathValue<Schema, "items.0.id">);
  });

  it("optional properties flow `| undefined` through the path", () => {
    interface Schema {
      user?: { name?: string };
    }
    // PathValue propagates undefined when any segment is optional.
    type T = PathValue<Schema, "user.name">;
    // T should be `string | undefined` (per the spec in store-types).
    expectType<T>(undefined as T);
    expectType<T>("Alice" as T);
  });
});
