import { defineConfig } from 'vitest/config';

export const defaultConfig = {
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
}

export default defineConfig(defaultConfig);
