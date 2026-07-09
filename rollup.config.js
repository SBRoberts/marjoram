import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import { readFileSync } from "fs";

// Read package.json using Node.js fs module to avoid mixed module syntax
const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

// Bundle everything — including TypeScript's emit helpers (tslib) — into the
// output so the published artifact has ZERO external imports. tslib is a
// devDependency only; marking it external emitted a bare `import ... from
// "tslib"` that threw at runtime for any consumer who (correctly) doesn't have
// tslib installed. Keeping these empty enforces the zero-runtime-dependency
// contract at the bundle boundary. See __tests__/packaging/self-contained.test.ts.
const external = [];
const globals = {};

export default [
  // UMD build for browsers
  {
    input: "./src/index.ts",
    output: {
      name: "marjoram",
      file: pkg.browser,
      format: "umd",
      globals,
      sourcemap: true,
    },
    external,
    plugins: [
      // Substitute build-time constants BEFORE compilation so Terser can
      // dead-code-eliminate dev-only branches (devtools formatter,
      // dev-mode warnings, etc.) from the production bundle.
      replace({
        preventAssignment: true,
        values: {
          "process.env.NODE_ENV": JSON.stringify("production"),
        },
      }),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.build.json",
        sourceMap: true,
        inlineSources: true,
      }),
      terser({
        format: {
          comments: false,
        },
      }),
    ],
  },

  // ESM and CJS builds
  {
    input: "./src/index.ts",
    external,
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          "process.env.NODE_ENV": JSON.stringify("production"),
        },
      }),
      resolve(),
      typescript({
        tsconfig: "./tsconfig.build.json",
        sourceMap: true,
        inlineSources: true,
      }),
      terser({
        format: {
          comments: false,
        },
      }),
    ],
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
      {
        file: pkg.module,
        format: "es",
        sourcemap: true,
      },
    ],
  },
];
