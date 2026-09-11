import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'client/src'),
      '@shared': path.resolve(process.cwd(), 'shared'),
      '@assets': path.resolve(process.cwd(), 'attached_assets'),
    },
  },
});
