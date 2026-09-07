/**
 * Stage the client-side parsing assets into public/ so the app serves them
 * from its own origin instead of a third-party CDN.
 *
 * Why this exists
 * ---------------
 * pdf.js and tesseract.js both default to fetching their worker, wasm core
 * and language data from https://cdn.jsdelivr.net at runtime. That caused
 * two problems:
 *
 *   1. Content-Security-Policy. next.config.ts declares `worker-src 'self'`
 *      and does not allowlist jsdelivr, so setting CSP_ENFORCE=true would
 *      have broken PDF preview, insurance text extraction and certificate
 *      OCR in production — silently, with no server-side error.
 *
 *   2. Supply chain. Both packages are already local dependencies. Pulling
 *      the components that actually parse untrusted user uploads from a
 *      third party at runtime added a trust dependency for no benefit.
 *
 * Everything written here is generated, not committed: public/vendor/ is in
 * .gitignore. The script runs from `postinstall`, `predev` and `prebuild`
 * so the staged copies always match the installed package versions.
 *
 * Missing sources are warnings, not errors — a lint-only or --omit=dev CI
 * job should not fail the build over an optional preview asset.
 */

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const vendorRoot = join(projectRoot, 'public', 'vendor');

let copied = 0;
let skipped = 0;

function stage(sourcePath, targetDir, targetName) {
  if (!existsSync(sourcePath)) {
    console.warn(`[stage-vendor] missing, skipping: ${sourcePath}`);
    skipped += 1;
    return;
  }
  mkdirSync(targetDir, { recursive: true });
  copyFileSync(sourcePath, join(targetDir, targetName));
  copied += 1;
}

// ─── pdf.js worker ─────────────────────────────────────────────────────────
// Consumed via PDF_WORKER_SRC in src/lib/pdf/pdfWorker.ts.
stage(
  join(projectRoot, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs'),
  join(vendorRoot, 'pdfjs'),
  'pdf.worker.min.mjs',
);

// ─── tesseract.js ──────────────────────────────────────────────────────────
// Consumed via TESSERACT_OPTIONS in src/lib/certificate/tesseractAssets.ts.
//
// Three separate downloads have to be redirected: the worker script, the
// wasm core, and the trained language data. `tesseract.js-core` ships several
// builds; we stage the plain and SIMD variants because the library picks
// between them at runtime based on what the browser supports.
const tesseractDir = join(vendorRoot, 'tesseract');

stage(
  join(projectRoot, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js'),
  tesseractDir,
  'worker.min.js',
);

for (const core of [
  'tesseract-core.wasm.js',
  'tesseract-core-simd.wasm.js',
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm.js',
]) {
  stage(join(projectRoot, 'node_modules', 'tesseract.js-core', core), tesseractDir, core);
}

// The English trained data is vendored at the repo root rather than pulled
// from @tesseract.js-data. It is ~5 MB and is the one asset here that is
// genuinely committed — consider moving it out of git if the repo size
// becomes a problem (P2).
stage(join(projectRoot, 'eng.traineddata'), tesseractDir, 'eng.traineddata');

console.log(`[stage-vendor] ${copied} asset(s) staged into public/vendor${skipped ? `, ${skipped} skipped` : ''}`);
