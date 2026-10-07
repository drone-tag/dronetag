/**
 * POST /api/account/branding — set the profile photo, logo or banner.
 *
 * Accepts either a Storage path the browser already uploaded to, or the raw
 * file as multipart (see src/lib/server/uploadedFile.ts). The `kind` field
 * selects which image is being replaced.
 */

import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { requireUserFromRequest } from '@/lib/server/requestAuth';
import { sanitizeAllowedUrl } from '@/lib/server/urls';
import { storageErrorResponse } from '@/lib/server/storageErrors';
import {
  IMAGE_TYPES,
  deleteSupersededObject,
  extForContentType,
  receiveUpload,
} from '@/lib/server/uploadedFile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Branding renders on the public NFC page; keep it image-sized. */
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

const BRANDING_FIELD = {
  photo: 'profilePhotoUrl',
  logo: 'logoUrl',
  banner: 'bannerUrl',
} as const;

type BrandingKind = keyof typeof BRANDING_FIELD;

function isBrandingKind(v: string): v is BrandingKind {
  return Object.hasOwn(BRANDING_FIELD, v);
}

export async function POST(request: Request) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const queryKind = new URL(request.url).searchParams.get('kind')?.trim() ?? '';
  const prefix = `users/${auth.uid}/profiles/account/`;
  const pickKind = (fields: Record<string, string>) => queryKind || fields.kind?.trim() || '';

  const upload = await receiveUpload(request, {
    prefix,
    relayName: (type, fields) => {
      const kind = pickKind(fields);
      return isBrandingKind(kind) ? `${kind}.${extForContentType(type)}` : null;
    },
    allowedTypes: IMAGE_TYPES,
    maxBytes: MAX_IMAGE_SIZE,
    context: 'branding',
  });
  if (upload instanceof NextResponse) return upload;

  const kind = pickKind(upload.fields);
  if (!isBrandingKind(kind)) {
    return NextResponse.json({ error: 'invalid branding kind' }, { status: 400 });
  }
  const objectName = upload.storagePath.slice(prefix.length);
  if (!objectName.startsWith(`${kind}.`)) {
    return NextResponse.json({ error: 'storagePath does not match kind' }, { status: 400 });
  }

  const userRef = adminFirestore().collection('users').doc(auth.uid);
  let previousUrl: string | undefined;
  try {
    sanitizeAllowedUrl(upload.url, `${kind}Url`);
    const before = await userRef.get();
    const prev = before.get(BRANDING_FIELD[kind]);
    previousUrl = typeof prev === 'string' ? prev : undefined;
    await userRef.update({
      [BRANDING_FIELD[kind]]: upload.url,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return storageErrorResponse(err, 'branding firestore update');
  }
  await deleteSupersededObject(previousUrl, prefix, upload.storagePath);

  return NextResponse.json({ kind, url: upload.url });
}
