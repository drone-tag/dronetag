/**
 * /api/entities/authorizations/[id]
 *
 *   PATCH  — edit a permit. Changing what was reviewed (kind, issuer, area,
 *            validity, or removing the file) sends it back to review, so an
 *            approved permit can never be stretched after approval.
 *   DELETE — delete a permit owned by the caller (or any, for admins),
 *            cleaning up what references it. See
 *            src/lib/server/entityMutations.ts.
 */

import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { adminStorageBucket } from '@/lib/server/storage';
import { deleteRoute } from '@/lib/server/entityMutations';
import { requireUserFromRequest } from '@/lib/server/requestAuth';
import { cleanString } from '@/lib/server/strings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KINDS = new Set(['daily', 'nullaosta', 'hourly_nullaosta', 'temporary', 'other']);
const DATE_RX = /^\d{4}-\d{2}-\d{2}/;
const REVIEWED_FIELDS = ['kind', 'issuedBy', 'area', 'validFrom', 'validTo'] as const;

type RouteContext = { params: Promise<{ id: string }> };

export const DELETE = deleteRoute('authorizations');

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  if (!id?.trim() || id.includes('/')) {
    return NextResponse.json({ error: 'missing authorization id' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed = (await request.json()) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const db = adminFirestore();
  const ref = db.collection('authorizations').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: 'authorization not found' }, { status: 404 });
  const current = snap.data() as Record<string, unknown>;
  if (current.userId !== auth.uid && !auth.admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const next: Record<string, string> = {};
  if ('kind' in body) {
    const kind = cleanString(body.kind, 32);
    if (!KINDS.has(kind)) return NextResponse.json({ error: 'invalid authorization kind' }, { status: 400 });
    next.kind = kind;
  }
  if ('label' in body) next.label = cleanString(body.label, 200);
  if ('issuedBy' in body) next.issuedBy = cleanString(body.issuedBy, 200);
  if ('area' in body) next.area = cleanString(body.area, 300);
  if ('notes' in body) next.notes = cleanString(body.notes, 2000);
  for (const key of ['validFrom', 'validTo'] as const) {
    if (!(key in body)) continue;
    const value = cleanString(body[key], 32);
    if (value && !DATE_RX.test(value)) {
      return NextResponse.json({ error: `invalid ${key}` }, { status: 400 });
    }
    next[key] = value;
  }

  const str = (k: string) => (typeof current[k] === 'string' ? (current[k] as string) : '');
  const validFrom = next.validFrom ?? str('validFrom');
  const validTo = next.validTo ?? str('validTo');
  if (validFrom && validTo && validTo.slice(0, 10) < validFrom.slice(0, 10)) {
    return NextResponse.json({ error: 'validTo must be on or after validFrom' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(next)) {
    if (value !== str(key)) update[key] = value;
  }

  const removeFile = body.removeFile === true && Boolean(str('fileUrl'));
  if (removeFile) {
    Object.assign(update, { fileUrl: '', fileName: '', fileSize: 0, mimeType: '' });
  }

  const reviewedChanged = removeFile || REVIEWED_FIELDS.some((k) => k in update);
  if (reviewedChanged && !auth.admin && str('verificationStatus') !== 'pending') {
    update.verificationStatus = 'pending';
  }

  if (Object.keys(update).length === 0) return NextResponse.json({ ok: true, changed: false });

  update.updatedAt = new Date().toISOString();
  await ref.update(update);

  if (removeFile) {
    const owner = typeof current.userId === 'string' ? current.userId : auth.uid;
    await adminStorageBucket()
      .deleteFiles({ prefix: `users/${owner}/authorizations/${id}/`, force: true })
      .catch((err: unknown) => console.warn('[authorizations] file cleanup failed', err));
  }

  return NextResponse.json({ ok: true, changed: true });
}
