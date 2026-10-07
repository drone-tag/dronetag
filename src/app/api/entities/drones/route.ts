/**
 * POST /api/entities/drones - create drone via Admin SDK.
 * Fallback when Cloud Functions are not deployed.
 */

import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { enforceQuota, QuotaError } from '@/lib/server/quota';
import { requireUserFromRequest } from '@/lib/server/requestAuth';
import { cleanString } from '@/lib/server/strings';
import { droneFromRaw, syncLoadedDrone } from '@/lib/server/syncPublicDrones';
import { logger } from '@/lib/server/logger';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SLUG_ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz';
const SLUG_RETRIES = 8;
const DRONE_CLASSES = new Set(['C0', 'C1', 'C2', 'C3', 'C4', 'unknown']);
// Suspension and archiving are admin decisions, not something an owner picks.
const STATUSES = new Set(['draft', 'active']);
const VISIBILITIES = new Set(['private', 'public']);

type Body = {
  manufacturer?: unknown;
  model?: unknown;
  classMarking?: unknown;
  droneSerialNumber?: unknown;
  controllerSerialNumber?: unknown;
  defaultOperatorId?: unknown;
  insuranceId?: unknown;
  status?: unknown;
  visibility?: unknown;
  /** The owner confirmed the identity fields; lock them on creation. */
  dataLocked?: unknown;
};

function nowIso(): string {
  return new Date().toISOString();
}

function randomSlug(length = 8): string {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += SLUG_ALPHABET[buf[i]! % SLUG_ALPHABET.length];
  }
  return out;
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

  const manufacturer = cleanString(body.manufacturer, 200);
  const model = cleanString(body.model, 200);
  const classMarking = cleanString(body.classMarking, 16) || 'unknown';
  const droneSerialNumber = cleanString(body.droneSerialNumber, 200);
  const controllerSerialNumber = cleanString(body.controllerSerialNumber, 200);
  const defaultOperatorId = cleanString(body.defaultOperatorId, 128);
  const insuranceIdRaw = body.insuranceId;
  const insuranceId =
    typeof insuranceIdRaw === 'string' && insuranceIdRaw.trim() ? insuranceIdRaw.trim() : null;
  const status = STATUSES.has(cleanString(body.status, 16))
    ? cleanString(body.status, 16)
    : 'draft';
  const visibility = VISIBILITIES.has(cleanString(body.visibility, 16))
    ? cleanString(body.visibility, 16)
    : 'private';

  if (!manufacturer || !model) {
    return NextResponse.json({ error: 'manufacturer and model are required' }, { status: 400 });
  }
  if (!DRONE_CLASSES.has(classMarking)) {
    return NextResponse.json({ error: 'invalid classMarking' }, { status: 400 });
  }
  if (!defaultOperatorId) {
    return NextResponse.json({ error: 'defaultOperatorId is required' }, { status: 400 });
  }

  const db = adminFirestore();

  const [opSnap, insSnap] = await Promise.all([
    db.collection('operators').doc(defaultOperatorId).get(),
    insuranceId ? db.collection('insurances').doc(insuranceId).get() : Promise.resolve(null),
  ]);
  if (!opSnap.exists || (opSnap.data() as { userId?: string }).userId !== auth.uid) {
    return NextResponse.json({ error: 'operator does not belong to user' }, { status: 400 });
  }
  if (insSnap && (!insSnap.exists || (insSnap.data() as { userId?: string }).userId !== auth.uid)) {
    return NextResponse.json({ error: 'insurance does not belong to user' }, { status: 400 });
  }

  try {
    await enforceQuota(auth.uid, 'drone');
  } catch (err) {
    if (err instanceof QuotaError) {
      return NextResponse.json({ error: err.message, code: 'quota' }, { status: 429 });
    }
    throw err;
  }

  let slug = '';
  for (let i = 0; i < SLUG_RETRIES; i += 1) {
    const candidate = randomSlug();
    const collision = await db
      .collection('drones')
      .where('slug', '==', candidate)
      .limit(1)
      .get();
    if (collision.empty) {
      slug = candidate;
      break;
    }
  }
  if (!slug) {
    return NextResponse.json({ error: 'could not allocate slug' }, { status: 500 });
  }

  const ref = db.collection('drones').doc();
  const now = nowIso();
  const record = {
    userId: auth.uid,
    slug,
    status,
    visibility,
    verificationStatus: 'unverified',
    manufacturer,
    model,
    classMarking,
    droneSerialNumber,
    controllerSerialNumber,
    linkedPilotId: auth.uid,
    defaultOperatorId,
    activeOperatorId: null,
    activeOperatorUntil: null,
    activeOperatorSetAt: '',
    activeOperatorSetBy: '',
    activeOperatorReason: '',
    insuranceId,
    createdAt: now,
    updatedAt: now,
    publishedAt: status === 'active' && visibility === 'public' ? now : '',
    lastVerifiedAt: '',
    dataLockedAt: body.dataLocked === true ? now : '',
  };
  const batch = db.batch();
  batch.set(ref, record);
  if (insuranceId) {
    batch.update(db.collection('insurances').doc(insuranceId), {
      droneIds: FieldValue.arrayUnion(ref.id),
    });
  }
  await batch.commit();

  let published = false;
  try {
    published = await syncLoadedDrone(droneFromRaw(ref.id, record));
  } catch (err) {
    // The drone exists; the owner can publish again from its page.
    logger.warn('drones.create.publish_failed', { droneId: ref.id }, err);
  }

  return NextResponse.json({ id: ref.id, slug, published });
}
