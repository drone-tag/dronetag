/**
 * OCR fallback for ENAC/EASA certificates whose category badges (A1/A3, A2)
 * are embedded as graphics without a text layer.
 * Browser-only — dynamically loads tesseract.js on demand.
 */

import { TESSERACT_OPTIONS } from '@/lib/certificate/tesseractAssets';
import { configurePdfWorker } from '@/lib/pdf/pdfWorker';

export async function ocrCertificatePdf(file: File): Promise<string> {
  if (typeof window === 'undefined') return '';

  const pdfjs = await import('pdfjs-dist');
  configurePdfWorker(pdfjs);

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 2, rotation: page.rotate });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', 1, {
    logger: () => {},
    ...TESSERACT_OPTIONS,
  });
  try {
    const { data } = await worker.recognize(canvas);
    return data.text ?? '';
  } finally {
    await worker.terminate();
  }
}
