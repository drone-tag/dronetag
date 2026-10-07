/**
 * Server-side Firebase Storage uploads (Admin SDK — bypasses client rules).
 */

import { randomUUID } from 'node:crypto';
import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdmin } from '@/lib/server/firebaseAdmin';

function storageBucketName(): string | undefined {
  return process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || undefined;
}

export function adminStorageBucket() {
  const storage = getStorage(getFirebaseAdmin());
  const name = storageBucketName();
  return name ? storage.bucket(name) : storage.bucket();
}

/** Upload a PDF and return a persistent Firebase download URL. */
export async function adminUploadPdf(path: string, data: Buffer): Promise<string> {
  return adminUploadFile(path, data, 'application/pdf');
}

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function isAllowedImageContentType(contentType: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(contentType);
}

/** Upload an image and return a persistent Firebase download URL. */
export async function adminUploadImage(path: string, data: Buffer, contentType: string): Promise<string> {
  if (!isAllowedImageContentType(contentType)) {
    throw new Error(`unsupported image type: ${contentType}`);
  }
  return adminUploadFile(path, data, contentType);
}

async function adminUploadFile(path: string, data: Buffer, contentType: string): Promise<string> {
  const bucket = adminStorageBucket();
  const token = randomUUID();
  const file = bucket.file(path);
  await file.save(data, {
    resumable: false,
    metadata: {
      contentType,
      // Safe to cache for long: each upload gets a new token, hence a new URL.
      cacheControl: 'private, max-age=31536000',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  return storageDownloadUrl(bucket.name, path, token);
}

/** Persistent Firebase download URL for an object carrying `token`. */
export function storageDownloadUrl(bucketName: string, path: string, token: string): string {
  const encoded = encodeURIComponent(path);
  const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST?.trim();
  const origin = emulatorHost ? `http://${emulatorHost}` : 'https://firebasestorage.googleapis.com';
  return `${origin}/v0/b/${bucketName}/o/${encoded}?alt=media&token=${token}`;
}
