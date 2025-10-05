import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import { readFileSync } from "fs";

// Read package.json using Node.js fs module
const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

const isProduction = process.env.NODE_ENV === "prod";

const devConfig = {
  input: "demo/src/app.ts",
  plugins: [
    typescript({
      tsconfig: false,
      target: "es2018",
      module: "esnext",
      lib: ["es2018", "dom"],
      sourceMap: true,
      inlineSources: true,
      include: ["demo/src/**/*", "src/**/*"],
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    !isProduction &&
      terser({
        format: {
          comments: false,
        },
      }),
  ].filter(Boolean),
  watch: {
    include: ["demo/src/**/*", "src/**/*"],
  },
  output: [
    {
      compact: false,
      file: `demo/dist/index.js`,
      format: "umd",
      name: "marjoramDemo",
      sourcemap: true,
    },
  ],
};

if (!isProduction) {
  devConfig.plugins.push(
    serve({
      port: 3030,
      open: false,
      contentBase: "demo/dist",
      // TO TEST ON MOBILE COMMENT THIS IN AND REPLACE WITH YOUR COMPUTER'S IP
      // host: '192.168.0.160'
    })
  );
  devConfig.plugins.push(livereload());
}

export default devConfig;
