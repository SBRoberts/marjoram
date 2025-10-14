import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import { readFileSync } from "fs";

// Read package.json using Node.js fs module to avoid mixed module syntax
const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

const external = ["tslib"];
const globals = {
  tslib: "tslib",
};

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
