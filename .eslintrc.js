module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/ban-ts-comment": "warn",

    // General rules
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
    "no-prototype-builtins": "warn",
    eqeqeq: ["error", "always"],
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
  },
  ignorePatterns: [
    "dist/**/*",
    "node_modules/**/*",
    "coverage/**/*",
    "*.config.js",
    "setupTests.js",
  ],
};
