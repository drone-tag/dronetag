/**
 * Load PDF bytes for in-app preview (bypasses cross-origin iframe limits).
 */

import { adminFetch } from '@/lib/client/adminApi';
import { configurePdfWorker } from '@/lib/pdf/pdfWorker';
import { isAllowedFileUrl } from '@/lib/utils/urlAllowlist';

/**
 * Whether the storage bucket answers cross-origin reads for this origin.
 * Unknown until the first attempt; a CORS failure is remembered for the
 * session so later previews go straight to the same-origin proxy.
 */
let directFetchWorks: boolean | null = null;

async function fetchDirect(url: string): Promise<ArrayBuffer | null> {
  if (directFetchWorks === false) return null;
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return null;
    directFetchWorks = true;
    return await res.arrayBuffer();
  } catch {
    // A TypeError here is the browser refusing the response (no CORS
    // headers on the bucket); the proxy below serves the same bytes.
    directFetchWorks = false;
    return null;
  }
}

const CACHE_LIMIT = 4;
const cache = new Map<string, Promise<ArrayBuffer>>();

/**
 * Cached per URL so re-renders (expanding all pages, reopening a modal) do
 * not download the file again. pdf.js transfers the buffer it is given to
 * its worker, which detaches it, so every caller receives its own copy.
 */
export async function loadPdfBytes(sourceUrl: string): Promise<ArrayBuffer> {
  const url = sourceUrl.trim();
  let pending = cache.get(url);
  if (!pending) {
    pending = fetchPdfBytes(url);
    cache.set(url, pending);
    pending.catch(() => cache.delete(url));
    while (cache.size > CACHE_LIMIT) {
      const oldest = cache.keys().next().value;
      if (oldest === undefined) break;
      cache.delete(oldest);
    }
  }
  const bytes = await pending;
  return bytes.slice(0);
}

async function fetchPdfBytes(url: string): Promise<ArrayBuffer> {
  if (!url) throw new Error('missing pdf url');

  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('local pdf fetch failed');
    return res.arrayBuffer();
  }

  if (!isAllowedFileUrl(url)) {
    throw new Error('pdf url host not allowed');
  }

  const direct = await fetchDirect(url);
  if (direct) return direct;

  const proxyUrl = `/api/files/proxy?url=${encodeURIComponent(url)}`;
  const res = await adminFetch(proxyUrl);
  if (!res.ok) {
    throw new Error(`pdf proxy failed (${res.status})`);
  }
  return res.arrayBuffer();
}

export async function getPdfjs() {
  const pdfjs = await import('pdfjs-dist');
  configurePdfWorker(pdfjs);
  return pdfjs;
}
