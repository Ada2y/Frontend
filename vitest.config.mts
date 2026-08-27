import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  resolve: {
    // Mirrors the "@/*" path alias in tsconfig.json.
    alias: {'@': fileURLToPath(new URL('./', import.meta.url))}
  },
  test: {
    // Node, not jsdom: what's under test here is geometry, not the DOM. The
    // canvas context is stubbed with a recorder so the drawing calls
    // themselves can be asserted.
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules/**', '.next/**']
  }
});
