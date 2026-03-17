import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
};

export default config;
