/**
 * Self-hosted asset paths for tesseract.js.
 *
 * By default tesseract.js fetches three things from https://cdn.jsdelivr.net
 * at recognition time: the worker script, the wasm core, and the trained
 * language data. That breaks `worker-src 'self'` / `script-src` in the CSP
 * declared in next.config.ts, so certificate OCR would have stopped working
 * the moment CSP_ENFORCE was turned on — with no server-side signal.
 *
 * `scripts/stage-vendor-assets.mjs` copies the assets into
 * public/vendor/tesseract on install and before every build, so these paths
 * always match the installed tesseract.js version.
 */

const BASE = '/vendor/tesseract';

/**
 * Options for `createWorker`. `gzip: false` matters: the staged
 * `eng.traineddata` is uncompressed, whereas tesseract.js expects a `.gz`
 * suffix unless told otherwise.
 */
export const TESSERACT_OPTIONS = {
  workerPath: `${BASE}/worker.min.js`,
  corePath: BASE,
  langPath: BASE,
  gzip: false,
  // Load the worker from its own URL: a blob: worker is blocked by `worker-src 'self'`.
  workerBlobURL: false,
} as const;
