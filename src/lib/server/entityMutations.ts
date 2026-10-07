/**
 * Server-side drone updates and entity deletion (Admin SDK).
 *
 * These used to be client Firestore writes followed by a separate publish
 * request. That had three problems: the public page could end up out of
 * step with the private record (the second request failing silently), some
 * transitions were rejected by the deployed rules (publishing a locked
 * drone, detaching a policy), and deleting a drone left its public snapshot
 * online. Doing the write and the reconciliation in one request removes all
 * three, and saves the browser two round trips.
 *
 * The policy the Firestore rules express for owners is re-implemented here:
 * identity fields freeze once a record is locked, verification is
 * admin-only, an owner cannot lift an admin suspension, and the temporary
 * operator switch lasts at most 24 hours (measured by the server clock).
 */

import { FieldValue, Timestamp, type Firestore, type WriteBatch } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { adminStorageBucket } from '@/lib/server/storage';
import { cleanString } from '@/lib/server/strings';
import { requireUserFromRequest, type VerifiedUser } from '@/lib/server/requestAuth';
import { logger } from '@/lib/server/logger';
import {
  PublicSyncError,
  droneFromRaw,
  isLockedRaw,
  resyncUserPublicDronesAdmin,
  syncLoadedDrone,
} from '@/lib/server/syncPublicDrones';

export class EntityMutationError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'EntityMutationError';
  }
}

/** JSON response for a failed mutation; unexpected errors are logged. */
export function mutationErrorResponse(err: unknown, event: string, ctx: Record<string, unknown>) {
  if (err instanceof EntityMutationError || err instanceof PublicSyncError) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
  }
  logger.error(event, ctx, err);
  return NextResponse.json({ error: 'request failed' }, { status: 500 });
}

type IdContext = { params: Promise<{ id: string }> };

/** `DELETE /api/entities/{kind}/[id]` handler. */
export function deleteRoute(kind: DeletableKind) {
  return async function DELETE(request: Request, context: IdContext) {
    const auth = await requireUserFromRequest(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await context.params;
    try {
      const result = await deleteEntityServer(kind, id?.trim() ?? '', auth);
      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      return mutationErrorResponse(err, `${kind}.delete.failed`, { id });
    }
  };
}

const DRONE_CLASSES = new Set(['C0', 'C1', 'C2', 'C3', 'C4', 'unknown']);
const ADMIN_STATUSES = new Set(['draft', 'active', 'suspended', 'archived']);
const OWNER_STATUSES = new Set(['draft', 'active']);
const VISIBILITIES = new Set(['private', 'public']);
const VERIFICATION = new Set(['unverified', 'pending', 'verified', 'rejected']);
const OVERRIDE_MS = 24 * 60 * 60 * 1000;

const IDENTITY_FIELDS = [
  'manufacturer',
  'model',
  'classMarking',
  'droneSerialNumber',
  'controllerSerialNumber',
  'defaultOperatorId',
] as const;

function nowIso(): string {
  return new Date().toISOString();
}

async function assertOwnedBy(
  db: Firestore,
  collection: string,
  id: string,
  uid: string,
  what: string,
): Promise<void> {
  const snap = await db.collection(collection).doc(id).get();
  if (!snap.exists || snap.get('userId') !== uid) {
    throw new EntityMutationError(`${what} does not belong to the drone owner`, 400, 'invalid_link');
  }
}

async function loadOwned(db: Firestore, collection: string, id: string, caller: VerifiedUser) {
  if (!id || id.includes('/')) throw new EntityMutationError('invalid id', 400);
  const ref = db.collection(collection).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const raw = snap.data() as Record<string, unknown>;
  const ownerUid = typeof raw.userId === 'string' ? raw.userId : '';
  if (ownerUid !== caller.uid && !caller.admin) {
    throw new EntityMutationError('forbidden', 403);
  }
  return { ref, raw, ownerUid };
}

// ─── Drone update ──────────────────────────────────────────────────────────

export type DroneUpdateResult = { published: boolean; slug: string };

/**
 * Apply `body` to `drones/{id}` and reconcile its public snapshot.
 *
 * Recognised keys: the identity fields, `insuranceId`, `status`,
 * `visibility`, `dataLockedAt` (any truthy value locks), `activeOperator`
 * (`{ operatorId, reason? }` or `null`), and for admins `verificationStatus`.
 * Unknown keys are ignored.
 */
export async function updateDroneServer(
  id: string,
  body: Record<string, unknown>,
  caller: VerifiedUser,
): Promise<DroneUpdateResult> {
  const db = adminFirestore();
  const found = await loadOwned(db, 'drones', id, caller);
  if (!found) throw new EntityMutationError('drone not found', 404);
  const { ref, raw, ownerUid } = found;
  const asAdmin = caller.admin;
  const current = droneFromRaw(id, raw);
  const locked = isLockedRaw(raw);
  const update: Record<string, unknown> = {};

  for (const key of IDENTITY_FIELDS) {
    if (!(key in body)) continue;
    const value = cleanString(body[key], key === 'defaultOperatorId' ? 128 : 200);
    if (value === current[key]) continue;
    if (locked && !asAdmin) {
      throw new EntityMutationError('drone data is locked', 409, 'locked');
    }
    if ((key === 'manufacturer' || key === 'model') && !value) {
      throw new EntityMutationError(`${key} is required`, 400);
    }
    if (key === 'classMarking' && !DRONE_CLASSES.has(value)) {
      throw new EntityMutationError('invalid classMarking', 400);
    }
    if (key === 'defaultOperatorId') {
      if (!value) throw new EntityMutationError('defaultOperatorId is required', 400);
      await assertOwnedBy(db, 'operators', value, ownerUid, 'operator');
    }
    update[key] = value;
  }

  let insuranceChange: { prev: string | null; next: string | null } | null = null;
  if ('insuranceId' in body) {
    const next = cleanString(body.insuranceId, 128) || null;
    if (next !== current.insuranceId) {
      if (next) await assertOwnedBy(db, 'insurances', next, ownerUid, 'insurance');
      update.insuranceId = next;
      insuranceChange = { prev: current.insuranceId, next };
    }
  }

  const wantsStatus = 'status' in body ? cleanString(body.status, 16) : current.status;
  const wantsVisibility =
    'visibility' in body ? cleanString(body.visibility, 16) : current.visibility;
  if (wantsStatus !== current.status || wantsVisibility !== current.visibility) {
    if (!asAdmin && !OWNER_STATUSES.has(current.status)) {
      throw new EntityMutationError('drone suspended by an administrator', 403, 'suspended');
    }
    const statuses = asAdmin ? ADMIN_STATUSES : OWNER_STATUSES;
    if (!statuses.has(wantsStatus)) throw new EntityMutationError('invalid status', 400);
    if (!VISIBILITIES.has(wantsVisibility)) throw new EntityMutationError('invalid visibility', 400);
    update.status = wantsStatus;
    update.visibility = wantsVisibility;
    const wasPublic = current.status === 'active' && current.visibility === 'public';
    if (!wasPublic && wantsStatus === 'active' && wantsVisibility === 'public') {
      update.publishedAt = nowIso();
    }
  }

  if (body.dataLockedAt && !locked) update.dataLockedAt = nowIso();

  if ('activeOperator' in body) {
    const req = body.activeOperator as { operatorId?: unknown; reason?: unknown } | null;
    if (req === null) {
      Object.assign(update, {
        activeOperatorId: null,
        activeOperatorUntil: null,
        activeOperatorSetAt: '',
        activeOperatorSetBy: '',
        activeOperatorReason: '',
      });
    } else {
      const operatorId = cleanString(req?.operatorId, 128);
      if (!operatorId) throw new EntityMutationError('operatorId is required', 400);
      await assertOwnedBy(db, 'operators', operatorId, ownerUid, 'operator');
      Object.assign(update, {
        activeOperatorId: operatorId,
        activeOperatorUntil: Timestamp.fromMillis(Date.now() + OVERRIDE_MS),
        activeOperatorSetAt: FieldValue.serverTimestamp(),
        activeOperatorSetBy: caller.uid,
        activeOperatorReason: cleanString(req?.reason, 500),
      });
    }
  }

  if (asAdmin && 'verificationStatus' in body) {
    const v = cleanString(body.verificationStatus, 16);
    if (!VERIFICATION.has(v)) throw new EntityMutationError('invalid verificationStatus', 400);
    if (v !== current.verificationStatus) {
      update.verificationStatus = v;
      if (v === 'verified') update.lastVerifiedAt = nowIso();
    }
  }

  if (Object.keys(update).length > 0) {
    update.updatedAt = nowIso();
    const batch = db.batch();
    batch.update(ref, update);
    // Keep the policies' coverage lists in step with the drone's link.
    if (insuranceChange?.prev) {
      const prevRef = db.collection('insurances').doc(insuranceChange.prev);
      const prevSnap = await prevRef.get();
      if (prevSnap.exists && prevSnap.get('userId') === ownerUid) {
        batch.update(prevRef, { droneIds: FieldValue.arrayRemove(id) });
      }
    }
    if (insuranceChange?.next) {
      batch.update(db.collection('insurances').doc(insuranceChange.next), {
        droneIds: FieldValue.arrayUnion(id),
      });
    }
    await batch.commit();
  }

  const fresh = await ref.get();
  const drone = droneFromRaw(id, fresh.data() as Record<string, unknown>);
  const published = await syncLoadedDrone(drone);
  return { published, slug: drone.slug };
}

// ─── Deletion ──────────────────────────────────────────────────────────────

export type DeletableKind =
  | 'drones'
  | 'insurances'
  | 'certificates'
  | 'documents'
  | 'authorizations'
  | 'operators';

const STORAGE_FOLDER: Partial<Record<DeletableKind, string>> = {
  insurances: 'insurances',
  certificates: 'certificates',
  documents: 'documents',
  authorizations: 'authorizations',
};

/** Remove every stored file of an entity. Best effort: never throws. */
async function deleteEntityFiles(uid: string, kind: DeletableKind, id: string): Promise<void> {
  const folder = STORAGE_FOLDER[kind];
  if (!folder || !uid) return;
  try {
    await adminStorageBucket().deleteFiles({ prefix: `users/${uid}/${folder}/${id}/`, force: true });
  } catch (err) {
    logger.warn('entity.files.delete_failed', { kind, id }, err);
  }
}

async function ownedWhere(db: Firestore, collection: string, field: string, value: string, uid: string) {
  const snap = await db.collection(collection).where(field, '==', value).get();
  return snap.docs.filter((d) => d.get('userId') === uid);
}

async function commitInChunks(db: Firestore, ops: Array<(b: WriteBatch) => void>) {
  for (let i = 0; i < ops.length; i += 400) {
    const batch = db.batch();
    ops.slice(i, i + 400).forEach((op) => op(batch));
    await batch.commit();
  }
}

/**
 * Delete an entity owned by the caller (or any entity, for admins), along
 * with what points at it: drone↔policy links, operator references, the
 * drone's public snapshot and stored files. Missing documents are a no-op.
 */
export async function deleteEntityServer(
  kind: DeletableKind,
  id: string,
  caller: VerifiedUser,
): Promise<{ deleted: boolean }> {
  const db = adminFirestore();
  const found = await loadOwned(db, kind, id, caller);
  if (!found) return { deleted: false };
  const { ref, raw, ownerUid } = found;
  const ops: Array<(b: WriteBatch) => void> = [(b) => b.delete(ref)];
  let resync = false;

  if (kind === 'drones') {
    const slug = typeof raw.slug === 'string' ? raw.slug : '';
    if (slug) {
      const pub = await db.doc(`dronesPublic/${slug}`).get();
      const owner = pub.exists ? pub.get('droneId') : null;
      if (pub.exists && (!owner || owner === id)) ops.push((b) => b.delete(pub.ref));
    }
    const policies = await db.collection('insurances').where('droneIds', 'array-contains', id).get();
    for (const p of policies.docs) {
      if (p.get('userId') !== ownerUid) continue;
      const rest = ((p.get('droneIds') as unknown[]) ?? []).filter(
        (x): x is string => typeof x === 'string' && x !== id,
      );
      ops.push((b) => b.update(p.ref, { droneIds: rest, droneId: rest[0] ?? null }));
    }
  }

  if (kind === 'insurances') {
    for (const d of await ownedWhere(db, 'drones', 'insuranceId', id, ownerUid)) {
      ops.push((b) => b.update(d.ref, { insuranceId: null }));
    }
    resync = true;
  }

  if (kind === 'certificates') resync = true;

  if (kind === 'operators') {
    const others = (await db.collection('operators').where('userId', '==', ownerUid).get()).docs.filter(
      (d) => d.id !== id,
    );
    const fallback = others.find((d) => d.get('isDefault') === true) ?? others[0] ?? null;
    if (fallback && raw.isDefault === true && fallback.get('isDefault') !== true) {
      ops.push((b) => b.update(fallback.ref, { isDefault: true, updatedAt: nowIso() }));
    }
    for (const d of await ownedWhere(db, 'drones', 'defaultOperatorId', id, ownerUid)) {
      ops.push((b) => b.update(d.ref, { defaultOperatorId: fallback?.id ?? '' }));
    }
    for (const d of await ownedWhere(db, 'drones', 'activeOperatorId', id, ownerUid)) {
      ops.push((b) =>
        b.update(d.ref, {
          activeOperatorId: null,
          activeOperatorUntil: null,
          activeOperatorSetAt: '',
          activeOperatorSetBy: '',
          activeOperatorReason: '',
        }),
      );
    }
    for (const p of await ownedWhere(db, 'insurances', 'operatorId', id, ownerUid)) {
      ops.push((b) => b.update(p.ref, { operatorId: null }));
    }
    resync = true;
  }

  await commitInChunks(db, ops);
  await deleteEntityFiles(ownerUid, kind, id);
  if (resync) {
    await resyncUserPublicDronesAdmin(ownerUid).catch((err) =>
      logger.warn('entity.delete.resync_failed', { kind, id }, err),
    );
  }
  return { deleted: true };
}
