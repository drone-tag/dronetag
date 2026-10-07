/**
 * Attach a user file to an entity through its API route.
 *
 * The bytes go straight from the browser to Firebase Storage (under the
 * user's own `users/{uid}/…` namespace, which the Storage rules let the owner
 * write) and the route only receives the object path. That keeps large PDFs
 * and photos off the hosting platform's function payload limit, which sits
 * around 6 MB, and gives real upload progress.
 *
 * If the Storage rules refuse a direct write (for instance before they have
 * been deployed), the file is relayed through the route as multipart
 * instead — the way uploads used to work — provided it fits that limit.
 */

import { ref, uploadBytesResumable, type UploadTask } from 'firebase/storage';
import { adminFetch } from '@/lib/client/adminApi';
import { readJsonOrThrow } from '@/lib/client/apiError';
import { isImageFile, prepareImage, type ImagePreset } from '@/lib/client/imagePrep';
import { getCurrentUser } from '@/lib/firebase/auth';
import { getFirebaseStorage } from '@/lib/firebase/config';

/** Largest body worth relaying through a route handler. */
export const RELAY_MAX_BYTES = 4 * 1024 * 1024;
/** Mirrors the private-namespace cap in storage.rules. */
export const DIRECT_MAX_BYTES = 50 * 1024 * 1024;

let directUploadsRefused = false;

export class FileTooLargeError extends Error {
  constructor(readonly limitBytes: number) {
    super('file_too_large');
    this.name = 'FileTooLargeError';
  }
}

export class UnsupportedFileError extends Error {
  constructor() {
    super('unsupported_file_type');
    this.name = 'UnsupportedFileError';
  }
}

export type PreparedFile = { file: File; contentType: string; ext: string };

const EXT_BY_TYPE: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || (!file.type && /\.pdf$/i.test(file.name));
}

/**
 * Normalise a picked file into something storage accepts: PDFs pass through
 * (some systems report them with an empty MIME type), images are downscaled
 * and HEIC is converted. `accept` limits which of the two families is valid.
 */
export async function prepareFile(
  file: File,
  accept: 'pdf' | 'image' | 'pdf-or-image',
  imagePreset: ImagePreset = 'document',
): Promise<PreparedFile> {
  if (accept !== 'image' && isPdfFile(file)) {
    return { file, contentType: 'application/pdf', ext: 'pdf' };
  }
  if (accept !== 'pdf' && isImageFile(file)) {
    const prepared = await prepareImage(file, imagePreset);
    const ext = EXT_BY_TYPE[prepared.type];
    if (!ext) throw new UnsupportedFileError();
    return { file: prepared, contentType: prepared.type, ext };
  }
  throw new UnsupportedFileError();
}

export type AttachOptions = {
  /** API route that records the file on its entity. */
  route: string;
  /** Path relative to `users/{uid}/`, e.g. `documents/{id}/file.pdf`. */
  objectPath: string;
  file: Blob;
  contentType: string;
  fileName: string;
  fields?: Record<string, string>;
  onProgress?: (fraction: number) => void;
};

function errorCode(err: unknown): string {
  return err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
}

function runTask(task: UploadTask, onProgress?: (fraction: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        if (onProgress && snap.totalBytes > 0) onProgress(snap.bytesTransferred / snap.totalBytes);
      },
      reject,
      () => resolve(),
    );
  });
}

async function uploadDirect(opts: AttachOptions, uid: string): Promise<string | null> {
  if (directUploadsRefused) return null;
  const storagePath = `users/${uid}/${opts.objectPath}`;
  try {
    const task = uploadBytesResumable(ref(getFirebaseStorage(), storagePath), opts.file, {
      contentType: opts.contentType,
      cacheControl: 'private, max-age=31536000',
    });
    await runTask(task, opts.onProgress);
    return storagePath;
  } catch (err) {
    const code = errorCode(err);
    if (code === 'storage/unauthorized' || code === 'storage/unauthenticated') {
      directUploadsRefused = true;
      return null;
    }
    throw err;
  }
}

/** Upload `file` and record it on the entity; resolves with the route's JSON. */
export async function attachFile<T>(opts: AttachOptions): Promise<T> {
  const user = getCurrentUser();
  if (!user) throw new Error('not signed in');
  if (opts.file.size > DIRECT_MAX_BYTES) throw new FileTooLargeError(DIRECT_MAX_BYTES);

  const storagePath = await uploadDirect(opts, user.uid);

  let res: Response;
  if (storagePath) {
    res = await adminFetch(opts.route, {
      method: 'POST',
      body: JSON.stringify({ storagePath, fileName: opts.fileName, ...opts.fields }),
    });
  } else {
    if (opts.file.size > RELAY_MAX_BYTES) throw new FileTooLargeError(RELAY_MAX_BYTES);
    const form = new FormData();
    form.append('file', opts.file, opts.fileName);
    for (const [k, v] of Object.entries(opts.fields ?? {})) form.append(k, v);
    res = await adminFetch(opts.route, { method: 'POST', body: form });
    opts.onProgress?.(1);
  }

  if (res.status === 413) {
    throw new FileTooLargeError(storagePath ? DIRECT_MAX_BYTES : RELAY_MAX_BYTES);
  }
  return readJsonOrThrow<T>(res, 'upload');
}
