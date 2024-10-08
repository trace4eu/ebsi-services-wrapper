// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.ts'],
    environment: 'node',
    testTimeout: 300000,
    hookTimeout: 300000,
    slowTestThreshold: 300000,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
