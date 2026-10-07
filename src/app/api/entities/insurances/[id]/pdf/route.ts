/**
 * POST /api/entities/insurances/[id]/pdf — attach the policy PDF.
 *
 * Accepts either a Storage path the browser already uploaded to, or the raw
 * file as multipart (see src/lib/server/uploadedFile.ts).
 */

import { NextResponse } from 'next/server';
import type { VerificationStatus } from '@/lib/types';
import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { resyncUserPublicDronesAdmin } from '@/lib/server/syncPublicDrones';
import { requireUserFromRequest } from '@/lib/server/requestAuth';
import { sanitizeAllowedUrl } from '@/lib/server/urls';
import { storageErrorResponse } from '@/lib/server/storageErrors';
import { PDF_TYPE, receiveUpload } from '@/lib/server/uploadedFile';
import {
  insuranceFromFirestore,
  resolveInsuranceVerificationAfterPdfUpload,
} from '@/lib/server/parserAutoVerify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = new Set([PDF_TYPE]);

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  if (!id?.trim() || id.includes('/')) {
    return NextResponse.json({ error: 'missing insurance id' }, { status: 400 });
  }

  const db = adminFirestore();
  const snap = await db.collection('insurances').doc(id).get();
  if (!snap.exists) {
    return NextResponse.json({ error: 'insurance not found' }, { status: 404 });
  }
  const ownerId = (snap.data() as { userId?: string }).userId;
  if (ownerId !== auth.uid) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const upload = await receiveUpload(request, {
    prefix: `users/${auth.uid}/insurances/${id}/`,
    relayName: () => 'policy.pdf',
    allowedTypes: ALLOWED_TYPES,
    needBytes: true,
    context: 'insurance pdf',
  });
  if (upload instanceof NextResponse) return upload;
  const pdfUrl = upload.url;

  const insurance = insuranceFromFirestore(id, snap.data() as Record<string, unknown>);
  // A new document always goes back to review unless the parser vouches for it.
  let verificationStatus: VerificationStatus = 'pending';
  if (upload.bytes) {
    try {
      verificationStatus = await resolveInsuranceVerificationAfterPdfUpload({
        pdfBuffer: upload.bytes,
        insurance,
        parserTrustedByUser: upload.fields.parserTrusted === '1',
      });
    } catch (err) {
      console.warn('[insurance/pdf] parser auto-verify skipped', err);
    }
  }

  try {
    sanitizeAllowedUrl(pdfUrl, 'pdfUrl');
    await db.collection('insurances').doc(id).update({
      pdfUrl,
      verificationStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return storageErrorResponse(err, 'insurance pdf firestore update');
  }

  try {
    await resyncUserPublicDronesAdmin(auth.uid);
  } catch (err) {
    console.warn('[insurance pdf] public resync failed', err);
  }

  return NextResponse.json({ pdfUrl, verificationStatus });
}
