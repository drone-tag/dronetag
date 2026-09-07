/**
 * Single place where the pdf.js worker location is decided.
 *
 * This used to be duplicated across three modules, each hardcoding a
 * jsdelivr CDN URL. That violated `worker-src 'self'` in the CSP defined in
 * next.config.ts, so enabling CSP_ENFORCE would have silently broken PDF
 * preview, insurance text extraction and certificate OCR. It also meant the
 * component that parses untrusted user uploads was fetched from a third
 * party at runtime.
 *
 * The worker is now served from our own origin.
 * `scripts/stage-vendor-assets.mjs` copies it out of node_modules into
 * public/vendor/pdfjs on install and before every build, so it always
 * matches the installed pdfjs-dist version.
 */

/** Path served by Next from `public/`. Must match stage-vendor-assets.mjs. */
export const PDF_WORKER_SRC = '/vendor/pdfjs/pdf.worker.min.mjs';

interface PdfWorkerConfigurable {
  GlobalWorkerOptions: { workerSrc: string };
}

/**
 * Point pdf.js at the self-hosted worker. Safe to call repeatedly and safe
 * on the server, where there is no worker to configure.
 */
export function configurePdfWorker(pdfjs: PdfWorkerConfigurable): void {
  if (typeof window === 'undefined') return;
  if (pdfjs.GlobalWorkerOptions.workerSrc) return;
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
}
