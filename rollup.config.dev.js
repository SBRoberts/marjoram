import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import injectProcessEnv from "rollup-plugin-inject-process-env";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

import baseConfig from "./rollup.config";

const isProduction = process.env.NODE_ENV === "prod";

const devConfig = {
  input: "demo/src/app.ts",
  plugins: [
    resolve(), // so Rollup can find `ms`
    commonjs(), // so Rollup can convert `ms` to an ES module
    injectProcessEnv({
      NODE_ENV: process.env.NODE_ENV,
    }),
    typescript(), // so Rollup can convert TypeScript to JavaScript
  ],
  watch: {
    include: ["demo/src/**/*", "src/**/*"],
  },
  output: [
    {
      compact: false,
      file: `demo/dist/index.js`,
      format: "umd",
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

export default [...baseConfig, devConfig];
