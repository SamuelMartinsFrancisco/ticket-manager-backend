module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  maxWorkers: 2,
  testPathIgnorePatterns: [
    "<rootDir>/build/",
    "<rootDir>/node_modules"
  ],
};