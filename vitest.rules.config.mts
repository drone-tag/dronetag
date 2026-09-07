import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Security-rules tests. Separate from vitest.config.mts because these need
 * the Firebase emulator running and are far slower than the unit suite.
 *
 * Run with: npm run test:rules
 * (which wraps this in `firebase emulators:exec`)
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    globals: false,
    // Emulator round-trips plus rule compilation are slow on a cold start.
    testTimeout: 20_000,
    hookTimeout: 60_000,
    // The emulator is shared mutable state; parallel files would race on it.
    fileParallelism: false,
  },
});
