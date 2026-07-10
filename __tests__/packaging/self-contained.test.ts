import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

/**
 * Guards the zero-runtime-dependency contract at the *bundle boundary*.
 *
 * Regression test for the tslib bug (fixed in 1.2.1): `importHelpers: true`
 * made tsc emit `import { __classPrivateFieldGet } from "tslib"` for the
 * private fields in `SchemaProp`, and rollup left `tslib` external — so every
 * shipped bundle referenced a package that consumers never install (tslib is a
 * devDependency). Editor types resolved fine; the runtime import threw
 * `Cannot find package 'tslib'` on first import.
 *
 * The invariant: each published bundle must be fully self-contained — no bare
 * (non-relative) imports and no reference to `tslib`. This runs in the CI
 * `test` job (all supported Node versions) and via `prepublishOnly`, so a
 * regression blocks both merge and publish.
 */
const repoRoot = resolve(__dirname, "..", "..");
const bundleNames = ["marjoram.esm.js", "marjoram.cjs.js", "marjoram.umd.js"];
const bundlePath = (name: string) => resolve(repoRoot, "dist", name);

describe("published bundle is self-contained", () => {
  beforeAll(() => {
    // Build from current source so assertions run against what would actually
    // ship, never a stale dist/. Throws (failing the suite) if the build fails.
    execSync("npm run build:rollup", { cwd: repoRoot, stdio: "pipe" });
  }, 180_000);

  it.each(bundleNames)("%s is emitted", name => {
    expect(existsSync(bundlePath(name))).toBe(true);
  });

  it.each(bundleNames)("%s does not reference tslib", name => {
    expect(readFileSync(bundlePath(name), "utf8")).not.toMatch(/tslib/);
  });

  it("the ESM bundle has no bare (external) imports", () => {
    const esm = readFileSync(bundlePath("marjoram.esm.js"), "utf8");
    // `from "x"` where x does not start with `.` or `/` is a bare package
    // specifier — something the consumer would have to resolve/install. A
    // self-contained bundle inlines everything, so there should be none.
    const bareImports = [
      ...esm.matchAll(/\bfrom\s*["']([^."'/][^"']*)["']/g),
    ].map(m => m[1]);
    expect(bareImports).toEqual([]);
  });
});
