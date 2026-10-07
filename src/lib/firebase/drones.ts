/**
 * Drones collection — the unit of public addressing.
 *
 * Path: `drones/{droneId}` with a `userId` field and a unique `slug`.
 *
 * PR-SEC-1 changes:
 *   • Raw `drones` are now PRIVATE — only the owner and admin can read.
 *     Anonymous public visitors read sanitised snapshots from the
 *     `dronesPublic` collection (see `src/lib/firebase/dronesPublic.ts`).
 *   • Writes go through /api/entities/drones (create, PATCH, DELETE). The
 *     server applies the edit policy and reconciles the public snapshot in
 *     the same request, so the public card cannot drift from the record.
 *   • Active-operator override timestamps are stored as Firestore
 *     `Timestamp` values (V-007); the server sets them from its own clock.
 *     The data layer converts them to ISO strings at the boundary.
 */

import {
  collection, doc, getDoc, getDocs,
  limit, query, where,
} from 'firebase/firestore';

import { awaitFirebaseAuthReady } from '@/lib/firebase/auth';
import { DEMO_MODE, getFirebaseDb } from '@/lib/firebase/config';
import * as demo from '@/lib/demo/entitiesStore';
import { generateDroneSlug, lockedAtFromRaw } from '@/lib/utils/entities';
import {
  deleteDronePublicBySlug,
  syncDronePublicSnapshot,
} from '@/lib/firebase/dronesPublic';
import { adminFetch } from '@/lib/client/adminApi';
import { readJsonOrThrow } from '@/lib/client/apiError';
import type {
  Drone,
  DroneClass,
  DroneStatus,
  DroneVisibility,
} from '@/lib/types/entities';
import type { VerificationStatus } from '@/lib/types';

const DRONES = 'drones';
const SLUG_MAX_RETRIES = 8;

// ─── Wire-format conversion helpers ────────────────────────────────────────

/**
 * Read a Firestore field that may be either a Firestore `Timestamp`
 * (new wire format introduced in PR-SEC-1) or a legacy ISO string,
 * returning an ISO string so downstream code keeps using strings.
 */
function readTimestampOrString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') {
    const maybe = v as { toDate?: () => Date };
    if (typeof maybe.toDate === 'function') {
      try { return maybe.toDate().toISOString(); } catch { /* ignore */ }
    }
  }
  return '';
}
function readTimestampOrStringOrNull(v: unknown): string | null {
  const s = readTimestampOrString(v);
  return s || null;
}

function droneFromRaw(id: string, raw: Record<string, unknown>): Drone {
  const str = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : '');
  const optStr = (k: string) =>
    typeof raw[k] === 'string' ? (raw[k] as string) : null;

  return {
    id,
    userId: str('userId'),
    slug: str('slug'),
    status: (str('status') || 'draft') as DroneStatus,
    visibility: (str('visibility') || 'private') as DroneVisibility,
    verificationStatus: (str('verificationStatus') || 'unverified') as VerificationStatus,
    manufacturer: str('manufacturer'),
    model: str('model'),
    classMarking: (str('classMarking') || 'unknown') as DroneClass,
    droneSerialNumber: str('droneSerialNumber'),
    controllerSerialNumber: str('controllerSerialNumber'),
    linkedPilotId: str('linkedPilotId'),
    defaultOperatorId: str('defaultOperatorId'),
    activeOperatorId: optStr('activeOperatorId'),
    activeOperatorUntil: readTimestampOrStringOrNull(raw['activeOperatorUntil']),
    activeOperatorSetAt: readTimestampOrString(raw['activeOperatorSetAt']),
    activeOperatorSetBy: str('activeOperatorSetBy'),
    activeOperatorReason: str('activeOperatorReason'),
    insuranceId: optStr('insuranceId'),
    createdAt: str('createdAt'),
    updatedAt: str('updatedAt'),
    publishedAt: str('publishedAt'),
    lastVerifiedAt: str('lastVerifiedAt'),
    dataLockedAt: lockedAtFromRaw(raw),
  };
}

// ─── Reads ──────────────────────────────────────────────────────────────────

export async function listDronesByUser(userId: string): Promise<Drone[]> {
  if (DEMO_MODE) return demo.listDronesByUser(userId);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, DRONES), where('userId', '==', userId)),
  );
  return snap.docs
    .map((d) => droneFromRaw(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export async function getDrone(id: string): Promise<Drone | null> {
  if (DEMO_MODE) return demo.getDrone(id);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, DRONES, id));
  if (!snap.exists()) return null;
  return droneFromRaw(snap.id, snap.data() as Record<string, unknown>);
}

/**
 * Resolve a drone by slug. Owner and admin only — anonymous visitors must
 * use `getDronePublicBySlug()` from `dronesPublic.ts` (PR-SEC-1).
 */
export async function getDroneBySlug(slug: string): Promise<Drone | null> {
  if (DEMO_MODE) return demo.getDroneBySlug(slug);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const q = query(collection(db, DRONES), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) return null;
  return droneFromRaw(first.id, first.data() as Record<string, unknown>);
}

async function slugExists(slug: string): Promise<boolean> {
  if (DEMO_MODE) return (await demo.getDroneBySlug(slug)) !== null;
  const db = getFirebaseDb();
  const q = query(collection(db, DRONES), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

async function findFreeSlug(preferred?: string): Promise<string> {
  let candidate = preferred?.trim() || generateDroneSlug();
  for (let i = 0; i < SLUG_MAX_RETRIES; i += 1) {
    if (!(await slugExists(candidate))) return candidate;
    candidate = generateDroneSlug();
  }
  throw new Error('drones: failed to mint a unique slug after retries');
}

// ─── Writes ─────────────────────────────────────────────────────────────────

/**
 * Server-side create via `/api/entities/drones` (Admin SDK).
 * Mints a unique slug, validates operator ownership, enforces quota.
 */
export async function createDrone(
  data: Omit<Drone, 'id' | 'slug' | 'createdAt' | 'updatedAt'> & { slug?: string },
): Promise<{ id: string; slug: string }> {
  if (DEMO_MODE) {
    const slug = await findFreeSlug(data.slug);
    const id = await demo.createDrone({ ...data, slug });
    const fresh = await demo.getDrone(id);
    if (fresh) await syncDronePublicSnapshot(fresh);
    return { id, slug };
  }
  await awaitFirebaseAuthReady();
  const res = await adminFetch('/api/entities/drones', {
    method: 'POST',
    body: JSON.stringify({
      manufacturer: data.manufacturer,
      model: data.model,
      classMarking: data.classMarking,
      droneSerialNumber: data.droneSerialNumber,
      controllerSerialNumber: data.controllerSerialNumber,
      defaultOperatorId: data.defaultOperatorId,
      insuranceId: data.insuranceId,
      status: data.status,
      visibility: data.visibility,
      dataLocked: Boolean(data.dataLockedAt),
    }),
  });
  // The route also publishes the drone when it was created public.
  const body = await readJsonOrThrow<{ id?: string; slug?: string }>(res, 'create drone');
  if (!body.id || !body.slug) {
    throw new Error('create drone failed: missing id or slug');
  }
  return { id: body.id, slug: body.slug };
}

/** Body accepted by PATCH /api/entities/drones/[id]. */
type DronePatchBody = Partial<Drone> & {
  activeOperator?: { operatorId: string; reason?: string } | null;
};

/**
 * Update a drone and bring its public page in line, in one request. The
 * server applies the edit policy (locking, suspension, 24h switch) and
 * reports whether the drone is public afterwards.
 */
async function patchDrone(id: string, body: DronePatchBody): Promise<{ published: boolean }> {
  const res = await adminFetch(`/api/entities/drones/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return readJsonOrThrow<{ published: boolean }>(res, 'update drone');
}

export async function updateDrone(
  id: string,
  patch: Partial<Drone>,
): Promise<{ published: boolean }> {
  if (DEMO_MODE) {
    await demo.updateDrone(id, patch);
    const fresh = await demo.getDrone(id);
    if (fresh) await syncDronePublicSnapshot(fresh);
    return { published: Boolean(fresh && fresh.status === 'active' && fresh.visibility === 'public') };
  }
  await awaitFirebaseAuthReady();
  const body = Object.fromEntries(
    Object.entries(patch).filter(([k, v]) => k !== 'id' && v !== undefined),
  );
  return patchDrone(id, body);
}

export async function deleteDrone(id: string): Promise<void> {
  if (DEMO_MODE) {
    const before = await demo.getDrone(id);
    await demo.deleteDrone(id);
    if (before?.slug) await deleteDronePublicBySlug(before.slug);
    return;
  }
  // The server removes the public page and the policy links with the drone.
  await awaitFirebaseAuthReady();
  const res = await adminFetch(`/api/entities/drones/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  await readJsonOrThrow(res, 'delete drone');
}

// ─── Active-operator switch (PRD §5, PR-SEC-1 hardened) ────────────────────

export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export interface SetActiveOperatorOptions {
  /**
   * Uid of the user activating the switch. Recorded as-is in demo mode; the
   * server records the verified caller instead.
   */
  setBy: string;
  /** Optional free-text reason supplied by the user. */
  reason?: string;
}

/**
 * Set a temporary active operator. Auto-expires after 24h via the lazy
 * `effectiveOperatorId()` helper at read time.
 */
export async function setActiveOperator(
  droneId: string,
  operatorId: string,
  options: SetActiveOperatorOptions,
): Promise<void> {
  if (DEMO_MODE) {
    const nowIso = new Date().toISOString();
    const untilIso = new Date(Date.now() + TWENTY_FOUR_HOURS_MS).toISOString();
    await demo.updateDrone(droneId, {
      activeOperatorId: operatorId,
      activeOperatorUntil: untilIso,
      activeOperatorSetAt: nowIso,
      activeOperatorSetBy: options.setBy,
      activeOperatorReason: options.reason ?? '',
    });
    const fresh = await demo.getDrone(droneId);
    if (fresh) await syncDronePublicSnapshot(fresh);
    return;
  }
  // The server sets the 24h window from its own clock, so a phone whose
  // clock runs fast is not refused.
  await awaitFirebaseAuthReady();
  await patchDrone(droneId, {
    activeOperator: { operatorId, reason: options.reason ?? '' },
  });
}

/** Clear any active-operator override and revert to the default. */
export async function clearActiveOperator(droneId: string): Promise<void> {
  if (DEMO_MODE) {
    await demo.updateDrone(droneId, {
      activeOperatorId: null,
      activeOperatorUntil: null,
      activeOperatorSetAt: '',
      activeOperatorSetBy: '',
      activeOperatorReason: '',
    });
    const fresh = await demo.getDrone(droneId);
    if (fresh) await syncDronePublicSnapshot(fresh);
    return;
  }
  await awaitFirebaseAuthReady();
  await patchDrone(droneId, { activeOperator: null });
}

/** Admin-only: list every drone across users (newest first). */
export async function listAllDrones(): Promise<Drone[]> {
  if (DEMO_MODE) return demo.listAllDrones();
  await awaitFirebaseAuthReady({ refresh: true });
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, DRONES));
  const drones = snap.docs.map((d) =>
    droneFromRaw(d.id, d.data() as Record<string, unknown>),
  );
  return drones.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}
