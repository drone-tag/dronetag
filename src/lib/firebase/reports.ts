/**
 * Reports collection — "Report found drone" submissions.
 *
 * Path: `reports/{reportId}`.
 * Create: anyone (anonymous public). The data layer denormalises ownerUserId
 * + droneSlug onto the report so rules can authorise read by owner only.
 * Read: owner of `ownerUserId` + admin.
 * Update: owner can mark as `read = true` (no other field).
 */

import {
  collection, doc, getDocs, query, updateDoc, where,
} from 'firebase/firestore';

import { awaitFirebaseAuthReady } from '@/lib/firebase/auth';
import { DEMO_MODE, getFirebaseDb } from '@/lib/firebase/config';
import * as demo from '@/lib/demo/entitiesStore';
import { readJsonOrThrow } from '@/lib/client/apiError';
import type { Report, ReportLocation } from '@/lib/types/entities';

const REPORTS = 'reports';

function reportFromRaw(id: string, raw: Record<string, unknown>): Report {
  const str = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : '');
  const bool = (k: string) => raw[k] === true;
  const loc = raw['location'];
  let location: ReportLocation | null = null;
  if (loc && typeof loc === 'object') {
    const l = loc as Record<string, unknown>;
    if (typeof l.lat === 'number' && typeof l.lng === 'number') {
      location = {
        lat: l.lat as number,
        lng: l.lng as number,
        accuracy: typeof l.accuracy === 'number' ? (l.accuracy as number) : 0,
      };
    }
  }
  return {
    id,
    droneId: str('droneId'),
    droneSlug: str('droneSlug'),
    ownerUserId: str('ownerUserId'),
    finderName: str('finderName'),
    message: str('message'),
    location,
    locationText: str('locationText'),
    contactEmail: str('contactEmail'),
    read: bool('read'),
    adminReadAt: str('adminReadAt'),
    emailNotified: bool('emailNotified'),
    pushNotified: bool('pushNotified'),
    notificationAttemptedAt: str('notificationAttemptedAt'),
    notificationError: str('notificationError'),
    createdAt: str('createdAt'),
  };
}

/** Reports addressed to a specific owner (the dashboard inbox query). */
export async function listReportsForOwner(ownerUserId: string): Promise<Report[]> {
  if (DEMO_MODE) return demo.listReports(ownerUserId);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, REPORTS), where('ownerUserId', '==', ownerUserId)),
  );
  return snap.docs
    .map((d) => reportFromRaw(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function listReportsForDrone(droneId: string): Promise<Report[]> {
  if (DEMO_MODE) return demo.listReportsForDrone(droneId);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, REPORTS), where('droneId', '==', droneId)),
  );
  return snap.docs
    .map((d) => reportFromRaw(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

/**
 * Anonymous public path — goes through `POST /api/reports`. The route
 * looks up the drone server-side, derives the trustworthy `ownerUserId`
 * from it, applies an IP-keyed rate limit, and forces audit fields.
 *
 * PR-SEC-4 V-017 closure: callers no longer pass `ownerUserId` (the
 * `dronesPublic` snapshot doesn't carry it anymore). In DEMO_MODE
 * the helper looks up the drone in the in-memory store and derives
 * the owner uid the same way the route does in production.
 */
export interface CreateReportInput {
  droneId: string;
  droneSlug: string;
  finderName: string;
  message: string;
  locationText: string;
  contactEmail: string;
  location: { lat: number; lng: number; accuracy: number } | null;
}

export async function createReport(data: CreateReportInput): Promise<string> {
  if (DEMO_MODE) {
    const drone = await demo.getDrone(data.droneId);
    if (!drone) throw new Error('Drone not found.');
    if (drone.status !== 'active' || drone.visibility !== 'public') {
      throw new Error('Drone is not publicly available.');
    }
    return demo.createReport({
      droneId: data.droneId,
      droneSlug: data.droneSlug,
      ownerUserId: drone.userId,
      finderName: data.finderName,
      message: data.message,
      locationText: data.locationText,
      contactEmail: data.contactEmail,
      location: data.location,
      emailNotified: false,
      pushNotified: false,
    } as Omit<Report, 'id' | 'createdAt' | 'read'>);
  }
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      droneId: data.droneId,
      droneSlug: data.droneSlug,
      finderName: data.finderName,
      message: data.message,
      locationText: data.locationText,
      contactEmail: data.contactEmail,
      location: data.location,
    }),
  });
  const { id } = await readJsonOrThrow<{ id: string }>(res, 'submit report');
  return id;
}

export async function markReportRead(id: string): Promise<void> {
  if (DEMO_MODE) return demo.markReportRead(id);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  await updateDoc(doc(db, REPORTS, id), { read: true });
}

/** Admin-only: mark handled without touching the owner's read state. */
export async function markReportReadByAdmin(id: string): Promise<string> {
  const at = new Date().toISOString();
  if (DEMO_MODE) {
    await demo.markReportAdminRead(id, at);
    return at;
  }
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  await updateDoc(doc(db, REPORTS, id), { adminReadAt: at });
  return at;
}

/** Admin-only: list every report across users (newest first). */
export async function listAllReports(): Promise<Report[]> {
  if (DEMO_MODE) return demo.listAllReports();
  await awaitFirebaseAuthReady({ refresh: true });
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, REPORTS));
  const reports = snap.docs.map((d) =>
    reportFromRaw(d.id, d.data() as Record<string, unknown>),
  );
  return reports.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}
