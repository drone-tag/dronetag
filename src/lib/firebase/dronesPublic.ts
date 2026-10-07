/**
 * Public drone snapshot collection — `dronesPublic/{slug}`.
 *
 * Closes V-001 / V-002 / V-015 / V-016: anonymous users can ONLY read
 * this collection. Raw `drones/*` is private to owner+admin via the
 * Firestore rules introduced in PR-SEC-1.
 *
 * The snapshot is denormalised at WRITE time (not read time) so that:
 *   1. Firestore rules can stay simple — anonymous reads on a single
 *      doc-by-id path with no joins.
 *   2. The public response carries ONLY the projected card payload; raw
 *      drone fields (controllerSerial, audit metadata, defaultOperatorId,
 *      etc.) never reach the network.
 *   3. Reads are cheap — no fan-out across pilots/operators/insurances on
 *      every QR scan.
 *
 * WRITES ARE SERVER-SIDE ONLY (pre-beta hardening, SEC-004).
 *
 * This module used to assemble the snapshot in the browser and write it
 * straight to Firestore. The rules checked drone ownership and slug
 * consistency but never the payload, so an owner could publish
 * `verificationStatus: 'verified'` for a drone no admin had reviewed.
 *
 * In live mode `syncDronePublicSnapshot` now POSTs to
 * /api/entities/drones/[id]/publish and the server re-derives every public
 * field from the private records. `projectSnapshot` below is still the single
 * definition of the projection — it is imported and executed by the server
 * (src/lib/server/syncPublicDrones.ts) so the two paths cannot drift — but in
 * live mode the client never calls it.
 *
 * Demo mode keeps the in-browser path, since there is no server there.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';

import { adminFetch } from '@/lib/client/adminApi';
import { syncPublicPagesOnServer } from '@/lib/client/entityApi';
import { awaitFirebaseAuthReady } from '@/lib/firebase/auth';
import { DEMO_MODE, getFirebaseDb } from '@/lib/firebase/config';
import * as demo from '@/lib/demo/entitiesStore';
import { getAccount } from '@/lib/firebase/account';
import { getInsurance } from '@/lib/firebase/insurances';
import { getOperator } from '@/lib/firebase/operators';
import { getPilot } from '@/lib/firebase/pilots';
import { listDronesByUser } from '@/lib/firebase/drones';
import type {
  Certificate,
  Drone,
  DronePublicSnapshot,
  Insurance,
  Operator,
  Pilot,
} from '@/lib/types/entities';
import type { AccountBranding } from '@/lib/types/account';
import type { PolicyStatus } from '@/lib/types';
import {
  deriveCertificateVerification,
  effectiveOperatorId,
  operatorDisplayName,
  pilotDisplayName,
} from '@/lib/utils/entities';
import { computePolicyStatus } from '@/lib/utils';
import { maskPolicyNumber } from '@/lib/utils/publicProjection';
import { snapshotFromRaw } from '@/lib/utils/publicSnapshot';

const DRONES_PUBLIC = 'dronesPublic';

// ─── Reads ─────────────────────────────────────────────────────────────────

/**
 * Anonymous-friendly read — does NOT call `awaitFirebaseAuthReady` so
 * a public visitor doesn't pay for an auth round-trip on a QR scan.
 */
export async function getDronePublicBySlug(slug: string): Promise<DronePublicSnapshot | null> {
  if (DEMO_MODE) {
    // Always re-project from live entities so admin verify/renew shows up
    // even if the denormalised snapshot was stale (or from another tab's seed).
    const drone = await demo.getDroneBySlug(slug);
    if (drone && drone.status === 'active' && drone.visibility === 'public') {
      await syncDronePublicSnapshot(drone);
    } else if (drone) {
      await deleteSnapshot(slug);
      return null;
    }
    return demo.getDronePublicBySlug(slug);
  }
  if (!slug) return null;
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, DRONES_PUBLIC, slug));
  if (!snap.exists()) return null;
  return snapshotFromRaw(slug, snap.data() as Record<string, unknown>);
}

/** Admin-only: enumerate every public snapshot (used by backfill diagnostics). */
export async function listAllDronesPublic(): Promise<DronePublicSnapshot[]> {
  if (DEMO_MODE) return demo.listAllDronesPublic();
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, DRONES_PUBLIC));
  return snap.docs.map((d) => snapshotFromRaw(d.id, d.data() as Record<string, unknown>));
}

// ─── Writes (owner / admin only) ───────────────────────────────────────────

async function setSnapshot(snapshot: DronePublicSnapshot): Promise<void> {
  if (DEMO_MODE) return demo.setDronePublic(snapshot);
  // Live mode never reaches here: syncDronePublicSnapshot delegates to the
  // server route, which is the only writer. Kept for the demo store only.
  throw new Error('dronesPublic writes are server-side only');
}

async function deleteSnapshot(slug: string): Promise<void> {
  if (DEMO_MODE) return demo.deleteDronePublicBySlug(slug);
  throw new Error('dronesPublic writes are server-side only');
}

// ─── Projection helper ─────────────────────────────────────────────────────

/**
 * Build the public snapshot for a drone by joining its effective operator
 * (lazy 24h TTL), linked pilot, and optional insurance. Pure function:
 * the caller decides whether to write or delete based on the drone's
 * status / visibility.
 */
export function projectSnapshot(
  drone: Drone,
  effectiveOperator: Operator | null,
  pilot: Pilot | null,
  insurance: Insurance | null,
  branding: AccountBranding = { profilePhotoUrl: '', logoUrl: '', bannerUrl: '' },
  certificates: Certificate[] = [],
): DronePublicSnapshot {
  let holderKind: DronePublicSnapshot['holderKind'] = 'pilot';
  let holderDisplayName = '—';
  if (effectiveOperator) {
    holderKind = effectiveOperator.kind === 'company' ? 'operator-company' : 'operator-private';
    holderDisplayName = operatorDisplayName(effectiveOperator);
  } else if (pilot) {
    holderKind = 'pilot';
    holderDisplayName = pilotDisplayName(pilot);
  }

  const insuranceStatus: PolicyStatus = insurance ? computePolicyStatus(insurance) : 'missing';
  const certVerification = deriveCertificateVerification(certificates);

  return {
    slug: drone.slug,
    droneId: drone.id,
    verificationStatus: certVerification.status,
    lastVerifiedAt: certVerification.lastVerifiedAt,
    publishedAt: drone.publishedAt,
    holderKind,
    holderDisplayName,
    manufacturer: drone.manufacturer,
    model: drone.model,
    classMarking: drone.classMarking,
    droneSerialNumber: drone.droneSerialNumber,
    insuranceStatus,
    insuranceProvider: insurance?.provider ?? '',
    insuranceValidUntil: insurance?.expiryDate ?? '',
    insuranceMaskedPolicyNumber: insurance?.policyNumber
      ? maskPolicyNumber(insurance.policyNumber)
      : '',
    profilePhotoUrl: branding.profilePhotoUrl,
    logoUrl: branding.logoUrl,
    bannerUrl: branding.bannerUrl,
    updatedAt: new Date().toISOString(),
  };
}

// ─── Sync API ──────────────────────────────────────────────────────────────

/**
 * Bring `dronesPublic/{slug}` in line with the current state of `drone`.
 *
 * - If the drone is `status === 'active' && visibility === 'public'`, fetch
 *   the linked entities, project, and upsert the snapshot.
 * - Otherwise, delete the snapshot (no-op if absent).
 *
 * Failures are swallowed and logged — a sync error must NEVER block the
 * primary write that triggered it; the worst case is a stale snapshot
 * which the next backfill or owner save can correct.
 */
export async function syncDronePublicSnapshot(drone: Drone): Promise<void> {
  try {
    if (DEMO_MODE) {
      if (drone.status !== 'active' || drone.visibility !== 'public') {
        await deleteSnapshot(drone.slug);
        return;
      }
      const effId = effectiveOperatorId(drone);
      const { listCertificates } = await import('@/lib/firebase/certificates');
      const [op, pilot, insurance, account, certificates] = await Promise.all([
        effId ? getOperator(effId) : Promise.resolve<Operator | null>(null),
        drone.linkedPilotId ? getPilot(drone.linkedPilotId) : Promise.resolve<Pilot | null>(null),
        drone.insuranceId
          ? getInsurance(drone.insuranceId)
          : Promise.resolve<Insurance | null>(null),
        getAccount(drone.userId),
        listCertificates(drone.userId),
      ]);
      const branding = account
        ? {
            profilePhotoUrl: account.profilePhotoUrl,
            logoUrl: account.logoUrl,
            bannerUrl: account.bannerUrl,
          }
        : { profilePhotoUrl: '', logoUrl: '', bannerUrl: '' };
      const snapshot = projectSnapshot(drone, op, pilot, insurance, branding, certificates);
      await setSnapshot(snapshot);
      return;
    }

    // Live mode: ask the server to reconcile. It re-reads the private records
    // and derives the public fields itself, so nothing the browser computed
    // can influence the published snapshot (SEC-004).
    await requestPublicSync(drone.id);
  } catch (err) {
    console.warn('[dronesPublic] sync failed', { slug: drone.slug, droneId: drone.id, err });
  }
}

/**
 * Ask the server to rebuild (or drop) the public snapshot for a drone.
 *
 * Unlike `syncDronePublicSnapshot`, this surfaces failures instead of
 * swallowing them: it backs the explicit "publish profile" action, where the
 * user needs to know the request did not take effect.
 */
export async function requestPublicSync(droneId: string): Promise<{ published: boolean }> {
  if (DEMO_MODE) {
    const drone = await demo.getDrone(droneId);
    if (drone) await syncDronePublicSnapshot(drone);
    return { published: Boolean(drone && drone.visibility === 'public' && drone.status === 'active') };
  }

  const res = await adminFetch(`/api/entities/drones/${encodeURIComponent(droneId)}/publish`, {
    method: 'POST',
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      typeof detail === 'object' && detail !== null && 'error' in detail
        ? String((detail as { error: unknown }).error)
        : `publish failed (${res.status})`,
    );
  }
  return (await res.json()) as { published: boolean };
}

/**
 * Re-sync every drone owned by `uid`. Called from the update paths for
 * pilot, operators, insurances, certificates and branding so a change in
 * those entities propagates to all of the user's public drone cards
 * without each callsite knowing which drones to touch.
 */
export async function resyncUserPublicDrones(uid: string): Promise<void> {
  if (!uid) return;
  try {
    if (!DEMO_MODE) {
      // One request: the server reconciles every drone of the user.
      await syncPublicPagesOnServer(uid);
      return;
    }
    const drones = await listDronesByUser(uid);
    await Promise.all(drones.map((d) => syncDronePublicSnapshot(d)));
  } catch (err) {
    console.warn('[dronesPublic] resyncUserPublicDrones failed', { uid, err });
  }
}

/**
 * Public delete — exposed so the data-layer's deleteDrone path can drop
 * the snapshot atomically with the underlying drone removal.
 */
export async function deleteDronePublicBySlug(slug: string): Promise<void> {
  await deleteSnapshot(slug);
}
