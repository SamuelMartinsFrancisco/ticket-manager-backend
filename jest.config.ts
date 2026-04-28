import type { Config } from 'jest';

const sharedIgnoredPaths = [
  "<rootDir>/build/",
  "<rootDir>/node_modules/",
  "<rootDir>/src/main.ts",
  "<rootDir>/src/utils/test/",
  ".*\\.module\\.ts$",
  ".*\\.decorator\\.ts$",
  ".*\\.schema\\.ts$",
  ".*\\.dto\\.ts$",
  "schema\\.ts$",
  "index\\.ts$",
  "<rootDir>/src/infrastructure/database/seeds/seed.ts",
  "<rootDir>/src/infrastructure/database/shared-columns.ts",
];

const config: Config = {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  maxWorkers: 2,
  testPathIgnorePatterns: [...sharedIgnoredPaths],
  coveragePathIgnorePatterns: [...sharedIgnoredPaths],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    }
  }
}

export default config;