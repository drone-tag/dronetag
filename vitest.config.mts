import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Unit / integration test configuration.
 *
 * Scope is deliberately narrow: pure logic, server-side helpers and route
 * handlers. There is no jsdom or React Testing Library here — component
 * rendering is not covered by this suite and is exercised through the
 * manual QA checklist (DRONETAG_MANUAL_QA.md) instead. Keeping the
 * dependency surface small was an explicit constraint of the pre-beta pass.
 *
 * Security-rules tests live in tests/rules/ and are NOT run by this config:
 * they need the Firebase emulator. See `npm run test:rules`.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**', 'functions/**', 'tests/rules/**'],
    globals: false,
    restoreMocks: true,
  },
});
