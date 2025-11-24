import { defineConfig } from 'vitest/config';
import {defaultConfig} from './vitest.config.js';

export default defineConfig({
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    setupFiles: ['tests/integration/setup.ts'],
  },
});
