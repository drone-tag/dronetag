import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Compiled Cloud Functions output is a separate workspace and ships
    // CommonJS — don't lint it from the Next.js project. The functions/
    // workspace has its own lint script.
    "functions/lib/**",
    "functions/node_modules/**",
    // Third-party bundles copied out of node_modules at install time by
    // scripts/stage-vendor-assets.mjs (pdf.js worker, Tesseract core + worker).
    // They are minified vendor output, not project source.
    "public/vendor/**",
    // Netlify build artefacts. Untracked, but present in a local worktree
    // after a build and otherwise linted as if they were source.
    ".netlify/**",
  ]),
]);

export default eslintConfig;
