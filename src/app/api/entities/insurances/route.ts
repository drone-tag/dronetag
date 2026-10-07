/**
 * POST /api/entities/insurances - create insurance via Admin SDK.
 * One policy may cover many drones (`droneIds`); each listed drone gets
 * `insuranceId` set to the new policy.
 */

import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { requireUserFromRequest } from '@/lib/server/requestAuth';
import { cleanString } from '@/lib/server/strings';
import { sanitizeAllowedUrl, UrlValidationError } from '@/lib/server/urls';
import { normalizeInsuranceDroneIds } from '@/lib/utils/insurance';
import { resyncUserPublicDronesAdmin } from '@/lib/server/syncPublicDrones';
import { logger } from '@/lib/server/logger';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  link?: unknown;
  droneId?: unknown;
  droneIds?: unknown;
  operatorId?: unknown;
  provider?: unknown;
  policyNumber?: unknown;
  holderName?: unknown;
  issueDate?: unknown;
  expiryDate?: unknown;
  notes?: unknown;
  pdfUrl?: unknown;
};

function nowIso(): string {
  return new Date().toISOString();
}

export async function POST(request: Request) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const link = cleanString(body.link, 16);
  if (link !== 'drone' && link !== 'operator') {
    return NextResponse.json({ error: 'link must be drone or operator' }, { status: 400 });
  }

  const provider = cleanString(body.provider, 200);
  const policyNumber = cleanString(body.policyNumber, 128);
  if (!provider || !policyNumber) {
    return NextResponse.json({ error: 'provider and policyNumber are required' }, { status: 400 });
  }

  const issueDate = cleanString(body.issueDate, 32);
  const expiryDate = cleanString(body.expiryDate, 32);
  if (issueDate && expiryDate && expiryDate < issueDate) {
    return NextResponse.json({ error: 'expiryDate must be on or after issueDate' }, { status: 400 });
  }

  const legacyDroneId =
    typeof body.droneId === 'string' && body.droneId.trim() ? body.droneId.trim() : null;
  const droneIds = normalizeInsuranceDroneIds(body.droneIds, legacyDroneId);
  const droneId = droneIds[0] ?? null;

  const operatorId =
    link === 'operator' && typeof body.operatorId === 'string' && body.operatorId.trim()
      ? body.operatorId.trim()
      : null;

  const db = adminFirestore();
  const [droneDocs, opDoc] = await Promise.all([
    droneIds.length > 0
      ? db.getAll(...droneIds.map((id) => db.collection('drones').doc(id)))
      : Promise.resolve([]),
    operatorId ? db.collection('operators').doc(operatorId).get() : Promise.resolve(null),
  ]);
  if (droneDocs.some((d) => !d.exists || d.get('userId') !== auth.uid)) {
    return NextResponse.json({ error: 'linked drone does not belong to user' }, { status: 400 });
  }
  if (opDoc && (!opDoc.exists || opDoc.get('userId') !== auth.uid)) {
    return NextResponse.json({ error: 'linked operator does not belong to user' }, { status: 400 });
  }

  let pdfUrl = '';
  try {
    pdfUrl = sanitizeAllowedUrl(body.pdfUrl, 'pdfUrl');
  } catch (err) {
    if (err instanceof UrlValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const batch = db.batch();
  const ref = db.collection('insurances').doc();
  batch.set(ref, {
    userId: auth.uid,
    link,
    droneId,
    droneIds,
    operatorId,
    provider,
    policyNumber,
    holderName: cleanString(body.holderName, 200),
    issueDate,
    expiryDate,
    notes: cleanString(body.notes, 4000),
    pdfUrl,
    verificationStatus: 'unverified',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    dataLockedAt: nowIso(),
  });

  // Linking is not an edit of the drone's own data, so `updatedAt` stays:
  // bumping it would freeze drones still checked by the legacy lock rule.
  const previousIds = [
    ...new Set(
      droneDocs
        .map((d) => d.get('insuranceId'))
        .filter((v): v is string => typeof v === 'string' && v.length > 0),
    ),
  ];
  const previousDocs =
    previousIds.length > 0
      ? await db.getAll(...previousIds.map((id) => db.collection('insurances').doc(id)))
      : [];
  for (const prev of previousDocs) {
    if (!prev.exists || prev.get('userId') !== auth.uid) continue;
    const moved = droneDocs.filter((d) => d.get('insuranceId') === prev.id).map((d) => d.id);
    batch.update(prev.ref, { droneIds: FieldValue.arrayRemove(...moved) });
  }
  for (const d of droneDocs) {
    batch.update(d.ref, { insuranceId: ref.id });
  }

  try {
    await batch.commit();
  } catch (err) {
    logger.error('insurances.create.failed', { droneCount: droneIds.length }, err);
    return NextResponse.json({ error: 'create insurance failed' }, { status: 500 });
  }

  if (droneIds.length > 0) {
    await resyncUserPublicDronesAdmin(auth.uid).catch((err) =>
      logger.warn('insurances.create.resync_failed', {}, err),
    );
  }

  return NextResponse.json({ id: ref.id });
}
