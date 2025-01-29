import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env
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
