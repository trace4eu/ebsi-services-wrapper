module.exports = {
  preset: "ts-jest",
  types: ["jest", "node"],
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: [
    "**/tests/**/*.test.(ts|tsx|js)",
    "**/?(*.)+(spec|test).(ts|tsx|js)",
  ],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
};
