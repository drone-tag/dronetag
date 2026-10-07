/**
 * Server-side public drone snapshot sync (Firebase Admin SDK).
 *
 * This is the ONLY path that writes `dronesPublic/{slug}`. Firestore rules
 * deny the collection to clients entirely.
 *
 * Before the pre-beta hardening pass the browser assembled the snapshot and
 * wrote it directly. The rules checked that the caller owned the referenced
 * drone and that the slug matched, but nothing validated the *contents*, so
 * an owner could publish `verificationStatus: 'verified'` for a drone no
 * admin had ever reviewed — the badge an anonymous visitor is asked to trust
 * was writable by the party it describes (SEC-004). The server now reads the
 * private records itself and derives every public field.
 *
 * Every entry point reconciles: a drone that should be public gets a fresh
 * snapshot, any other drone loses its snapshot. Callers never need to know
 * which of the two applies.
 */

import type {
  DocumentData,
  DocumentSnapshot,
  Firestore,
  WriteBatch,
} from 'firebase-admin/firestore';
import { projectSnapshot } from '@/lib/firebase/dronesPublic';
import { effectiveOperatorId, lockedAtFromRaw } from '@/lib/utils/entities';
import { adminFirestore } from '@/lib/server/firebaseAdmin';
import type {
  Certificate,
  CertificateKind,
  Drone,
  DroneClass,
  DronePublicSnapshot,
  DroneStatus,
  DroneVisibility,
  Insurance,
  Operator,
  Pilot,
} from '@/lib/types/entities';
import type { AccountBranding } from '@/lib/types/account';
import type { VerificationStatus } from '@/lib/types';

/** Strings as-is; Firestore Timestamps / Dates as ISO strings. */
function str(raw: Record<string, unknown>, k: string): string {
  const v = raw[k];
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  if (v && typeof v === 'object' && typeof (v as { toDate?: unknown }).toDate === 'function') {
    try {
      return (v as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return '';
    }
  }
  return '';
}

function optStr(raw: Record<string, unknown>, k: string): string | null {
  return str(raw, k) || null;
}

/** Identity fields are frozen once the document is locked. */
export function isLockedRaw(raw: Record<string, unknown>): boolean {
  return Boolean(lockedAtFromRaw(raw));
}

export function droneFromRaw(id: string, raw: Record<string, unknown>): Drone {
  return {
    id,
    userId: str(raw, 'userId'),
    slug: str(raw, 'slug'),
    status: (str(raw, 'status') || 'draft') as DroneStatus,
    visibility: (str(raw, 'visibility') || 'private') as DroneVisibility,
    verificationStatus: (str(raw, 'verificationStatus') || 'unverified') as VerificationStatus,
    manufacturer: str(raw, 'manufacturer'),
    model: str(raw, 'model'),
    classMarking: (str(raw, 'classMarking') || 'unknown') as DroneClass,
    droneSerialNumber: str(raw, 'droneSerialNumber'),
    controllerSerialNumber: str(raw, 'controllerSerialNumber'),
    linkedPilotId: str(raw, 'linkedPilotId'),
    defaultOperatorId: str(raw, 'defaultOperatorId'),
    activeOperatorId: optStr(raw, 'activeOperatorId'),
    activeOperatorUntil: optStr(raw, 'activeOperatorUntil'),
    activeOperatorSetAt: str(raw, 'activeOperatorSetAt'),
    activeOperatorSetBy: str(raw, 'activeOperatorSetBy'),
    activeOperatorReason: str(raw, 'activeOperatorReason'),
    insuranceId: optStr(raw, 'insuranceId'),
    createdAt: str(raw, 'createdAt'),
    updatedAt: str(raw, 'updatedAt'),
    publishedAt: str(raw, 'publishedAt'),
    lastVerifiedAt: str(raw, 'lastVerifiedAt'),
    dataLockedAt: lockedAtFromRaw(raw),
  };
}

function operatorFromRaw(id: string, raw: Record<string, unknown>): Operator {
  const priv = (raw['private'] ?? {}) as Record<string, unknown>;
  const comp = (raw['company'] ?? {}) as Record<string, unknown>;
  const addrFrom = (a: Record<string, unknown>) => ({
    line1: str(a, 'line1'),
    line2: str(a, 'line2'),
    city: str(a, 'city'),
    postalCode: str(a, 'postalCode'),
    country: str(a, 'country'),
  });
  return {
    id,
    userId: str(raw, 'userId'),
    kind: (str(raw, 'kind') || 'private') as Operator['kind'],
    label: str(raw, 'label'),
    isDefault: raw['isDefault'] === true,
    private: {
      firstName: str(priv, 'firstName'),
      lastName: str(priv, 'lastName'),
      dateOfBirth: str(priv, 'dateOfBirth'),
      email: str(priv, 'email'),
      phone: str(priv, 'phone'),
      address: addrFrom((priv['address'] ?? {}) as Record<string, unknown>),
    },
    company: {
      companyName: str(comp, 'companyName'),
      contactPerson: str(comp, 'contactPerson'),
      vatNumber: str(comp, 'vatNumber'),
      uniqueCompanyNumber: str(comp, 'uniqueCompanyNumber'),
      email: str(comp, 'email'),
      address: addrFrom((comp['address'] ?? {}) as Record<string, unknown>),
    },
    createdAt: str(raw, 'createdAt'),
    updatedAt: str(raw, 'updatedAt'),
  };
}

function pilotFromRaw(uid: string, raw: Record<string, unknown>): Pilot {
  const addr = (raw['address'] ?? {}) as Record<string, unknown>;
  return {
    userId: uid,
    firstName: str(raw, 'firstName'),
    lastName: str(raw, 'lastName'),
    dateOfBirth: str(raw, 'dateOfBirth'),
    nationality: str(raw, 'nationality'),
    email: str(raw, 'email'),
    phone: str(raw, 'phone'),
    address: {
      line1: str(addr, 'line1'),
      line2: str(addr, 'line2'),
      city: str(addr, 'city'),
      postalCode: str(addr, 'postalCode'),
      country: str(addr, 'country'),
    },
    operatorCode: str(raw, 'operatorCode'),
    operatorLicense: str(raw, 'operatorLicense'),
    emergencyContact: str(raw, 'emergencyContact'),
    createdAt: str(raw, 'createdAt'),
    updatedAt: str(raw, 'updatedAt'),
  };
}

function insuranceFromRaw(id: string, raw: Record<string, unknown>): Insurance {
  const droneId = optStr(raw, 'droneId');
  const droneIds = Array.isArray(raw.droneIds)
    ? raw.droneIds.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    : droneId
      ? [droneId]
      : [];
  return {
    id,
    userId: str(raw, 'userId'),
    link: (str(raw, 'link') || 'drone') as Insurance['link'],
    droneId: droneIds[0] ?? droneId,
    operatorId: optStr(raw, 'operatorId'),
    droneIds,
    provider: str(raw, 'provider'),
    policyNumber: str(raw, 'policyNumber'),
    holderName: str(raw, 'holderName'),
    issueDate: str(raw, 'issueDate'),
    expiryDate: str(raw, 'expiryDate'),
    notes: str(raw, 'notes'),
    pdfUrl: str(raw, 'pdfUrl'),
    verificationStatus: (str(raw, 'verificationStatus') || 'unverified') as VerificationStatus,
    createdAt: str(raw, 'createdAt'),
    updatedAt: str(raw, 'updatedAt'),
    dataLockedAt: lockedAtFromRaw(raw),
  };
}

function certificateFromRaw(id: string, raw: Record<string, unknown>): Certificate {
  return {
    id,
    userId: str(raw, 'userId'),
    kind: (str(raw, 'kind') || 'custom') as CertificateKind,
    label: str(raw, 'label'),
    registrationNumber: str(raw, 'registrationNumber'),
    issuedBy: str(raw, 'issuedBy'),
    issuedAt: str(raw, 'issuedAt'),
    expiresAt: str(raw, 'expiresAt'),
    fileUrl: str(raw, 'fileUrl'),
    verificationStatus: (str(raw, 'verificationStatus') || 'unverified') as VerificationStatus,
    notes: str(raw, 'notes'),
    createdAt: str(raw, 'createdAt'),
    updatedAt: str(raw, 'updatedAt'),
    dataLockedAt: lockedAtFromRaw(raw),
  };
}

/** Error carrying the HTTP status a route handler should return. */
export class PublicSyncError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'PublicSyncError';
  }
}

export function isPublicDrone(d: Pick<Drone, 'status' | 'visibility' | 'slug'>): boolean {
  return Boolean(d.slug) && d.status === 'active' && d.visibility === 'public';
}

type OwnerContext = {
  certificates: Certificate[];
  branding: AccountBranding;
  operators: Map<string, Operator>;
  insurances: Map<string, Insurance>;
  pilots: Map<string, Pilot>;
};

function docsById<T>(
  docs: DocumentSnapshot<DocumentData>[],
  from: (id: string, raw: Record<string, unknown>) => T,
): Map<string, T> {
  const out = new Map<string, T>();
  for (const d of docs) {
    if (d.exists) out.set(d.id, from(d.id, d.data() as Record<string, unknown>));
  }
  return out;
}

/** Everything a snapshot can reference, loaded once per owner. */
async function loadOwnerContext(db: Firestore, uid: string, drones: Drone[]): Promise<OwnerContext> {
  const pilotIds = [...new Set(drones.map((d) => d.linkedPilotId).filter(Boolean))];
  const [certSnap, userSnap, opSnap, insSnap, pilotDocs] = await Promise.all([
    db.collection('certificates').where('userId', '==', uid).get(),
    db.doc(`users/${uid}`).get(),
    db.collection('operators').where('userId', '==', uid).get(),
    db.collection('insurances').where('userId', '==', uid).get(),
    pilotIds.length > 0
      ? db.getAll(...pilotIds.map((id) => db.doc(`pilots/${id}`)))
      : Promise.resolve([] as DocumentSnapshot<DocumentData>[]),
  ]);

  const userRaw = userSnap.exists ? (userSnap.data() as Record<string, unknown>) : {};
  // A pilot document belongs to the owner when it is theirs by id or field;
  // anything else would put a stranger's name on the public card.
  const ownPilots = pilotDocs.filter((d) => {
    if (!d.exists) return false;
    const owner = (d.data() as Record<string, unknown>).userId;
    return d.id === uid || owner === uid;
  });

  return {
    certificates: certSnap.docs.map((d) =>
      certificateFromRaw(d.id, d.data() as Record<string, unknown>),
    ),
    branding: {
      profilePhotoUrl: str(userRaw, 'profilePhotoUrl'),
      logoUrl: str(userRaw, 'logoUrl'),
      bannerUrl: str(userRaw, 'bannerUrl'),
    },
    operators: docsById(opSnap.docs, operatorFromRaw),
    insurances: docsById(insSnap.docs, insuranceFromRaw),
    pilots: docsById(ownPilots, pilotFromRaw),
  };
}

function buildSnapshot(drone: Drone, ctx: OwnerContext): DronePublicSnapshot {
  const effId = effectiveOperatorId(drone);
  return projectSnapshot(
    drone,
    (effId && ctx.operators.get(effId)) || null,
    (drone.linkedPilotId && ctx.pilots.get(drone.linkedPilotId)) || null,
    (drone.insuranceId && ctx.insurances.get(drone.insuranceId)) || null,
    ctx.branding,
    ctx.certificates,
  );
}

/**
 * Bring the snapshots of `drones` (all owned by `uid`) in line with their
 * current state. Returns the slugs that are public afterwards.
 */
async function reconcileDrones(db: Firestore, uid: string, drones: Drone[]): Promise<string[]> {
  const withSlug = drones.filter((d) => d.slug);
  const toPublish = withSlug.filter(isPublicDrone);
  const toHide = withSlug.filter((d) => !isPublicDrone(d));

  const writes: Array<(batch: WriteBatch) => void> = [];

  if (toPublish.length > 0) {
    const ctx = await loadOwnerContext(db, uid, toPublish);
    for (const drone of toPublish) {
      const snapshot = buildSnapshot(drone, ctx);
      writes.push((b) => b.set(db.doc(`dronesPublic/${snapshot.slug}`), snapshot));
    }
  }

  if (toHide.length > 0) {
    const existing = await db.getAll(...toHide.map((d) => db.doc(`dronesPublic/${d.slug}`)));
    existing.forEach((snap, i) => {
      if (!snap.exists) return;
      // Never remove a snapshot that some other drone owns.
      const owner = snap.get('droneId');
      if (typeof owner === 'string' && owner && owner !== toHide[i]!.id) return;
      writes.push((b) => b.delete(snap.ref));
    });
  }

  for (let i = 0; i < writes.length; i += 400) {
    const batch = db.batch();
    writes.slice(i, i + 400).forEach((w) => w(batch));
    await batch.commit();
  }

  return toPublish.map((d) => d.slug);
}

/**
 * Rebuild — or remove — the public snapshot for a single drone.
 *
 * @param droneId  Drone to sync.
 * @param callerUid Uid that must own the drone. Pass null for admin callers.
 * @returns whether a snapshot now exists for the drone.
 */
export async function syncDronePublicSnapshotAdmin(
  droneId: string,
  callerUid: string | null,
): Promise<{ published: boolean; slug: string }> {
  const db = adminFirestore();
  const droneDoc = await db.collection('drones').doc(droneId).get();
  if (!droneDoc.exists) {
    throw new PublicSyncError('drone not found', 404);
  }

  const drone = droneFromRaw(droneDoc.id, droneDoc.data() as Record<string, unknown>);
  if (callerUid !== null && drone.userId !== callerUid) {
    throw new PublicSyncError('forbidden', 403);
  }
  if (!drone.slug) {
    throw new PublicSyncError('drone has no slug', 409);
  }

  await reconcileDrones(db, drone.userId, [drone]);
  return { published: isPublicDrone(drone), slug: drone.slug };
}

/** Reconcile an already-loaded drone (e.g. right after the server wrote it). */
export async function syncLoadedDrone(drone: Drone): Promise<boolean> {
  if (!drone.slug) return false;
  await reconcileDrones(adminFirestore(), drone.userId, [drone]);
  return isPublicDrone(drone);
}

/**
 * Reconcile every drone owned by `uid`: refresh public ones, drop the
 * snapshot of any that are no longer public. Returns the public count.
 */
export async function resyncUserPublicDronesAdmin(uid: string): Promise<number> {
  if (!uid) return 0;
  const db = adminFirestore();
  const droneSnap = await db.collection('drones').where('userId', '==', uid).get();
  const drones = droneSnap.docs.map((d) =>
    droneFromRaw(d.id, d.data() as Record<string, unknown>),
  );
  if (drones.length === 0) return 0;
  const published = await reconcileDrones(db, uid, drones);
  return published.length;
}
