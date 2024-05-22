// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.{test,spec}.ts"],
    environment: "node",
    testTimeout: 300_000,
    hookTimeout: 300_000,
    threads: false, // With this option, Vite will not run tests in parallel, avoiding "SIGSEGV" errors
  },
});
