/**
 * Shared intake for user file uploads on entity routes.
 *
 * Two request shapes are accepted:
 *
 *   • JSON `{ storagePath, fileName?, ...fields }` — the browser already put
 *     the object in Storage under the user's own namespace (the normal path:
 *     no size ceiling from the hosting platform, real upload progress). The
 *     server checks the object's location, type and size, makes sure it has
 *     a download token, and returns its URL.
 *
 *   • multipart `file` (+ fields) — the server stores the bytes itself. Kept
 *     as a fallback for environments where client uploads are not allowed by
 *     the Storage rules. Request bodies are capped by the hosting platform
 *     (a few MB), which is why it is no longer the primary path.
 */

import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  adminStorageBucket,
  adminUploadImage,
  adminUploadPdf,
  storageDownloadUrl,
} from '@/lib/server/storage';
import { storageErrorResponse } from '@/lib/server/storageErrors';

export const PDF_TYPE = 'application/pdf';
export const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Mirrors the private-namespace cap in storage.rules. */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export type ReceivedUpload = {
  url: string;
  storagePath: string;
  contentType: string;
  size: number;
  fileName: string;
  /** File bytes, present when `needBytes` was requested (or relayed). */
  bytes: Buffer | null;
  fields: Record<string, string>;
};

type ReceiveOptions = {
  /** Every accepted object lives under this prefix, e.g. `users/{uid}/documents/{id}/`. */
  prefix: string;
  /**
   * Object name (without prefix) used when the server stores relayed bytes;
   * `null` rejects the request (e.g. an invalid field it depends on).
   */
  relayName: (contentType: string, fields: Record<string, string>) => string | null;
  allowedTypes: ReadonlySet<string>;
  maxBytes?: number;
  needBytes?: boolean;
  context: string;
};

export function extForContentType(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/jpeg') return 'jpg';
  return 'pdf';
}

function cleanFileName(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback;
  const name = raw.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 255);
  return name || fallback;
}

function badRequest(error: string, status = 400): NextResponse {
  return NextResponse.json({ error }, { status });
}

function typeError(allowed: ReadonlySet<string>): NextResponse {
  return badRequest(`only ${[...allowed].join(', ')} allowed`, 415);
}

function sizeError(maxBytes: number): NextResponse {
  return badRequest(`file exceeds ${Math.round(maxBytes / (1024 * 1024))} MB limit`, 413);
}

async function receiveStoredObject(
  body: Record<string, unknown>,
  opts: ReceiveOptions,
  maxBytes: number,
): Promise<ReceivedUpload | NextResponse> {
  const storagePath = typeof body.storagePath === 'string' ? body.storagePath.trim() : '';
  const rest = storagePath.startsWith(opts.prefix) ? storagePath.slice(opts.prefix.length) : '';
  if (!rest || rest.includes('/') || rest.includes('..')) {
    return badRequest('storagePath outside the allowed location', 403);
  }

  try {
    const bucket = adminStorageBucket();
    const file = bucket.file(storagePath);
    const [exists] = await file.exists();
    if (!exists) return badRequest('uploaded object not found', 404);

    const [meta] = await file.getMetadata();
    const contentType = String(meta.contentType ?? '');
    const size = Number(meta.size ?? 0);
    if (!opts.allowedTypes.has(contentType)) {
      await file.delete().catch(() => undefined);
      return typeError(opts.allowedTypes);
    }
    if (!Number.isFinite(size) || size <= 0 || size > maxBytes) {
      await file.delete().catch(() => undefined);
      return sizeError(maxBytes);
    }

    // A fresh token per upload gives every version its own URL, so the long
    // browser cache on these objects can never serve a replaced file.
    const token = randomUUID();
    await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });

    let bytes: Buffer | null = null;
    if (opts.needBytes) {
      [bytes] = await file.download();
    }

    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(body)) {
      if (k === 'storagePath' || k === 'fileName') continue;
      if (typeof v === 'string') fields[k] = v;
      else if (typeof v === 'boolean') fields[k] = v ? '1' : '0';
    }

    return {
      url: storageDownloadUrl(bucket.name, storagePath, token),
      storagePath,
      contentType,
      size,
      fileName: cleanFileName(body.fileName, rest),
      bytes,
      fields,
    };
  } catch (err) {
    return storageErrorResponse(err, `${opts.context} finalize`);
  }
}

async function receiveRelayedBytes(
  request: Request,
  opts: ReceiveOptions,
  maxBytes: number,
): Promise<ReceivedUpload | NextResponse> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest('invalid form data');
  }

  const raw = form.get('file');
  if (!(raw instanceof Blob)) return badRequest('file is required');

  const contentType = raw.type || 'application/octet-stream';
  if (!opts.allowedTypes.has(contentType)) return typeError(opts.allowedTypes);
  if (raw.size > maxBytes) return sizeError(maxBytes);

  const fields: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (k !== 'file' && typeof v === 'string') fields[k] = v;
  }

  const name = opts.relayName(contentType, fields);
  if (!name || name.includes('/') || name.includes('..')) return badRequest('invalid upload target');
  const storagePath = `${opts.prefix}${name}`;
  const bytes = Buffer.from(await raw.arrayBuffer());

  let url: string;
  try {
    url =
      contentType === PDF_TYPE
        ? await adminUploadPdf(storagePath, bytes)
        : await adminUploadImage(storagePath, bytes, contentType);
  } catch (err) {
    return storageErrorResponse(err, `${opts.context} upload`);
  }

  return {
    url,
    storagePath,
    contentType,
    size: raw.size,
    fileName: cleanFileName(raw instanceof File ? raw.name : '', name),
    bytes,
    fields,
  };
}

export async function receiveUpload(
  request: Request,
  opts: ReceiveOptions,
): Promise<ReceivedUpload | NextResponse> {
  const maxBytes = opts.maxBytes ?? MAX_UPLOAD_BYTES;
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('invalid json');
    }
    if (!body || typeof body !== 'object') return badRequest('invalid json');
    return receiveStoredObject(body as Record<string, unknown>, opts, maxBytes);
  }
  return receiveRelayedBytes(request, opts, maxBytes);
}

/**
 * Best-effort removal of a superseded object, e.g. `file.pdf` after the
 * user replaced it with `file.jpg`. Only objects under `prefix` are ever
 * touched: the previous URL is stored on a user-editable document, so it
 * cannot be trusted to point at the caller's own files. Never throws.
 */
export async function deleteSupersededObject(
  previousUrl: unknown,
  prefix: string,
  keepPath: string,
): Promise<void> {
  if (typeof previousUrl !== 'string' || !previousUrl) return;
  try {
    const match = new URL(previousUrl).pathname.match(/\/o\/(.+)$/);
    const path = match?.[1] ? decodeURIComponent(match[1]) : '';
    if (!path || path === keepPath || !path.startsWith(prefix) || path.includes('..')) return;
    await adminStorageBucket().file(path).delete({ ignoreNotFound: true });
  } catch {
    /* ignore */
  }
}
