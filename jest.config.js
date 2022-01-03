module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testEnvironment: "jsdom",
  testRegex: "__tests__/.*\\.test?\\.ts$",
  moduleFileExtensions: ["ts", "js"],
  testEnvironmentOptions: { resources: "usable" },
  setupFiles: ["./setupTests.js"],
};
