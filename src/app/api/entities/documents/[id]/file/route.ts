/**
 * POST /api/entities/documents/[id]/file — attach a PDF or image to a document.
 *
 * Accepts either a Storage path the browser already uploaded to, or the raw
 * file as multipart (see src/lib/server/uploadedFile.ts).
 */

import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { storageErrorResponse } from '@/lib/server/storageErrors';
import { requireUserFromRequest } from '@/lib/server/requestAuth';
import { sanitizeAllowedUrl } from '@/lib/server/urls';
import {
  IMAGE_TYPES,
  PDF_TYPE,
  deleteSupersededObject,
  extForContentType,
  receiveUpload,
} from '@/lib/server/uploadedFile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = new Set([PDF_TYPE, ...IMAGE_TYPES]);

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  if (!id?.trim() || id.includes('/')) {
    return NextResponse.json({ error: 'missing document id' }, { status: 400 });
  }

  const db = adminFirestore();
  const snap = await db.collection('documents').doc(id).get();
  if (!snap.exists) {
    return NextResponse.json({ error: 'document not found' }, { status: 404 });
  }
  const data = snap.data() as { userId?: string; fileUrl?: string };
  if (data.userId !== auth.uid) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const prefix = `users/${auth.uid}/documents/${id}/`;
  const upload = await receiveUpload(request, {
    prefix,
    relayName: (type) => `file.${extForContentType(type)}`,
    allowedTypes: ALLOWED_TYPES,
    context: 'document file',
  });
  if (upload instanceof NextResponse) return upload;

  try {
    sanitizeAllowedUrl(upload.url, 'fileUrl');
    await db.collection('documents').doc(id).update({
      fileUrl: upload.url,
      fileName: upload.fileName,
      fileSize: upload.size,
      mimeType: upload.contentType,
      // A new file has not been reviewed yet, whatever the old one was.
      verificationStatus: 'pending',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return storageErrorResponse(err, 'document file firestore update');
  }
  await deleteSupersededObject(data.fileUrl, prefix, upload.storagePath);

  return NextResponse.json({
    fileUrl: upload.url,
    fileName: upload.fileName,
    mimeType: upload.contentType,
    fileSize: upload.size,
  });
}
