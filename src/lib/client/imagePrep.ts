/**
 * Client-side image preparation before upload.
 *
 * Phone photos are routinely 4–12 MB and 4000+ px wide, while every place
 * the app shows them (avatar, logo, banner, document thumbnails) needs a
 * fraction of that. Downscaling here makes uploads and the public NFC page
 * load several times faster. It also converts HEIC/HEIF (the iPhone default)
 * to JPEG in browsers able to decode it, since storage only accepts
 * JPEG/PNG/WebP.
 */

export type ImagePreset = 'avatar' | 'logo' | 'banner' | 'document';

const PRESETS: Record<ImagePreset, { maxEdge: number; quality: number; keepAlpha: boolean }> = {
  avatar: { maxEdge: 1024, quality: 0.86, keepAlpha: false },
  logo: { maxEdge: 1024, quality: 0.9, keepAlpha: true },
  banner: { maxEdge: 2400, quality: 0.85, keepAlpha: false },
  // Scans must stay legible: generous size, high quality.
  document: { maxEdge: 3200, quality: 0.9, keepAlpha: false },
};

const STORABLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const HEIC_TYPES = new Set(['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']);
/** Files this small and already storable are uploaded untouched. */
const PASSTHROUGH_BYTES = 600 * 1024;

export class UnsupportedImageError extends Error {
  constructor() {
    super('unsupported_image_format');
    this.name = 'UnsupportedImageError';
  }
}

export function isHeic(file: File): boolean {
  if (HEIC_TYPES.has(file.type.toLowerCase())) return true;
  return /\.(heic|heif)$/i.test(file.name);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || isHeic(file);
}

async function decode(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // The decoded bitmap stays usable after the object URL is released.
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function renamed(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'image';
  return `${base}.${ext}`;
}

/**
 * Returns a JPEG/PNG/WebP file no larger than the preset needs. Throws
 * `UnsupportedImageError` when the browser cannot decode the input (e.g.
 * HEIC outside Safari).
 */
export async function prepareImage(file: File, preset: ImagePreset): Promise<File> {
  const heic = isHeic(file);
  if (!heic && !STORABLE_TYPES.has(file.type)) throw new UnsupportedImageError();
  if (!heic && file.size <= PASSTHROUGH_BYTES) return file;

  const { maxEdge, quality, keepAlpha } = PRESETS[preset];

  let img: HTMLImageElement;
  try {
    img = await decode(file);
  } catch {
    if (heic) throw new UnsupportedImageError();
    return file;
  }

  const width = img.naturalWidth;
  const height = img.naturalHeight;
  if (!width || !height) {
    if (heic) throw new UnsupportedImageError();
    return file;
  }

  const scale = Math.min(1, maxEdge / Math.max(width, height));
  if (!heic && scale === 1 && file.size <= 2 * 1024 * 1024) return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (heic) throw new UnsupportedImageError();
    return file;
  }
  ctx.imageSmoothingQuality = 'high';

  const alpha = keepAlpha && (file.type === 'image/png' || file.type === 'image/webp');
  if (!alpha) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const outType = alpha ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, outType, quality);
  canvas.width = 0;
  canvas.height = 0;
  if (!blob || blob.type !== outType) {
    if (heic) throw new UnsupportedImageError();
    return file;
  }
  // Never trade a small original for a bigger re-encode.
  if (!heic && blob.size >= file.size) return file;

  return new File([blob], renamed(file.name, outType === 'image/png' ? 'png' : 'jpg'), {
    type: outType,
    lastModified: Date.now(),
  });
}
