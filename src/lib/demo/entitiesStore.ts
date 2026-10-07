/**
 * In-memory store for the multi-entity model used in DEMO_MODE.
 * Mirrors the Firestore data-access modules under src/lib/firebase/ so the
 * UI is unaware of which backend is active.
 *
 * Concurrency: DEMO_MODE runs single-threaded in the browser; no locking needed.
 */

import { generateDroneSlug } from '@/lib/utils/entities';
import type {
  Authorization,
  Certificate,
  DocumentRef,
  Drone,
  DronePublicSnapshot,
  Insurance,
  Operator,
  Pilot,
  Plan,
  Report,
  Slots,
  SlotKind,
  SupportMessage,
  SupportThread,
  SupportThreadStatus,
} from '@/lib/types/entities';
import { BASE_SLOTS } from '@/lib/types/entities';
import { resetDemoAccounts } from '@/lib/demo/accountStore';

// ─── Tiny utilities ─────────────────────────────────────────────────────────

let nextNumericId = 1000;
function makeId(prefix: string): string {
  nextNumericId += 1;
  return `${prefix}-${nextNumericId.toString(36)}`;
}

function delay(ms = 100): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function nowIso(): string {
  return new Date().toISOString();
}

// ─── Storage ────────────────────────────────────────────────────────────────

const pilots = new Map<string, Pilot>();           // key = userId
const operators = new Map<string, Operator>();     // key = operator id
const drones = new Map<string, Drone>();           // key = drone id
const insurances = new Map<string, Insurance>();   // key = insurance id
const certificates = new Map<string, Certificate>(); // key = certificate id
const documents = new Map<string, DocumentRef>();  // key = document id
const authorizations = new Map<string, Authorization>(); // key = authorization id
const slots = new Map<string, Slots>();            // key = userId
const plans = new Map<string, Plan>();             // key = plan id
const reports = new Map<string, Report>();         // key = report id
const dronesPublic = new Map<string, DronePublicSnapshot>(); // key = slug
const supportThreads = new Map<string, SupportThread>(); // key = userId
const supportMessages = new Map<string, SupportMessage>(); // key = message id

// ─── Pilot ──────────────────────────────────────────────────────────────────

export async function getPilot(userId: string): Promise<Pilot | null> {
  await delay();
  return pilots.get(userId) ?? null;
}

export async function upsertPilot(p: Pilot): Promise<void> {
  await delay();
  const existing = pilots.get(p.userId);
  pilots.set(p.userId, {
    ...p,
    createdAt: existing?.createdAt ?? p.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  });
}

// ─── Operator ───────────────────────────────────────────────────────────────

export async function listOperators(userId: string): Promise<Operator[]> {
  await delay();
  return [...operators.values()]
    .filter((o) => o.userId === userId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getOperator(id: string): Promise<Operator | null> {
  await delay();
  return operators.get(id) ?? null;
}

export async function createOperator(op: Omit<Operator, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  await delay();
  const id = makeId('op');
  operators.set(id, { ...op, id, createdAt: nowIso(), updatedAt: nowIso() });
  return id;
}

export async function updateOperator(id: string, patch: Partial<Operator>): Promise<void> {
  await delay();
  const cur = operators.get(id);
  if (!cur) return;
  operators.set(id, { ...cur, ...patch, id, updatedAt: nowIso() });
}

export async function deleteOperator(id: string): Promise<void> {
  await delay();
  operators.delete(id);
}

// ─── Drone ──────────────────────────────────────────────────────────────────

export async function listDronesByUser(userId: string): Promise<Drone[]> {
  await delay();
  return [...drones.values()]
    .filter((d) => d.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDrone(id: string): Promise<Drone | null> {
  await delay();
  return drones.get(id) ?? null;
}

export async function getDroneBySlug(slug: string): Promise<Drone | null> {
  await delay();
  return [...drones.values()].find((d) => d.slug === slug) ?? null;
}

export async function createDrone(d: Omit<Drone, 'id' | 'slug' | 'createdAt' | 'updatedAt'> & { slug?: string }): Promise<string> {
  await delay();
  const id = makeId('drn');
  let slug = d.slug?.trim() || generateDroneSlug();
  // Avoid collisions in the in-memory map.
  while ([...drones.values()].some((x) => x.slug === slug)) {
    slug = generateDroneSlug();
  }
  drones.set(id, { ...d, id, slug, createdAt: nowIso(), updatedAt: nowIso() });
  persistDemoEntities();
  return id;
}

export async function updateDrone(id: string, patch: Partial<Drone>): Promise<void> {
  await delay();
  const cur = drones.get(id);
  if (!cur) return;
  drones.set(id, { ...cur, ...patch, id, updatedAt: nowIso() });
  persistDemoEntities();
}

export async function deleteDrone(id: string): Promise<void> {
  await delay();
  drones.delete(id);
  persistDemoEntities();
}

// ─── Insurance ──────────────────────────────────────────────────────────────

export async function listInsurances(userId: string): Promise<Insurance[]> {
  await delay();
  return [...insurances.values()]
    .filter((i) => i.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getInsurance(id: string): Promise<Insurance | null> {
  await delay();
  return insurances.get(id) ?? null;
}

export async function createInsurance(
  i: Omit<Insurance, 'id' | 'createdAt' | 'updatedAt' | 'dataLockedAt'>,
): Promise<string> {
  await delay();
  const id = makeId('ins');
  const now = nowIso();
  const droneIds = i.droneIds?.length
    ? [...new Set(i.droneIds)]
    : i.droneId
      ? [i.droneId]
      : [];
  insurances.set(id, {
    ...i,
    id,
    droneIds,
    droneId: droneIds[0] ?? null,
    createdAt: now,
    updatedAt: now,
    dataLockedAt: now,
  });
  for (const droneId of droneIds) {
    const d = drones.get(droneId);
    if (d) drones.set(droneId, { ...d, insuranceId: id, updatedAt: now });
  }
  persistDemoEntities();
  return id;
}

export async function updateInsurance(id: string, patch: Partial<Insurance>): Promise<void> {
  await delay();
  const cur = insurances.get(id);
  if (!cur) return;
  insurances.set(id, { ...cur, ...patch, id, updatedAt: nowIso() });
  persistDemoEntities();
}

export async function deleteInsurance(id: string): Promise<void> {
  await delay();
  insurances.delete(id);
  persistDemoEntities();
}

// ─── Certificate ────────────────────────────────────────────────────────────

export async function listCertificates(userId: string): Promise<Certificate[]> {
  await delay();
  return [...certificates.values()]
    .filter((c) => c.userId === userId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getCertificate(id: string): Promise<Certificate | null> {
  await delay();
  return certificates.get(id) ?? null;
}

export async function createCertificate(
  c: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt' | 'dataLockedAt'>,
): Promise<string> {
  await delay();
  const id = makeId('cert');
  const now = nowIso();
  certificates.set(id, { ...c, id, createdAt: now, updatedAt: now, dataLockedAt: now });
  persistDemoEntities();
  return id;
}

export async function updateCertificate(id: string, patch: Partial<Certificate>): Promise<void> {
  await delay();
  const cur = certificates.get(id);
  if (!cur) return;
  certificates.set(id, { ...cur, ...patch, id, updatedAt: nowIso() });
  persistDemoEntities();
}

export async function deleteCertificate(id: string): Promise<void> {
  await delay();
  certificates.delete(id);
  persistDemoEntities();
}

// ─── Document ───────────────────────────────────────────────────────────────

export async function listDocuments(userId: string): Promise<DocumentRef[]> {
  await delay();
  return [...documents.values()]
    .filter((d) => d.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDocument(id: string): Promise<DocumentRef | null> {
  await delay();
  return documents.get(id) ?? null;
}

export async function createDocument(d: Omit<DocumentRef, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  await delay();
  const id = makeId('doc');
  documents.set(id, { ...d, id, createdAt: nowIso(), updatedAt: nowIso() });
  persistDemoEntities();
  return id;
}

export async function updateDocument(id: string, patch: Partial<DocumentRef>): Promise<void> {
  await delay();
  const cur = documents.get(id);
  if (!cur) return;
  documents.set(id, { ...cur, ...patch, id, updatedAt: nowIso() });
  persistDemoEntities();
}

export async function deleteDocument(id: string): Promise<void> {
  await delay();
  documents.delete(id);
  persistDemoEntities();
}

// ─── Authorizations / permits ───────────────────────────────────────────────

export async function listAuthorizations(userId: string): Promise<Authorization[]> {
  await delay();
  return [...authorizations.values()]
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getAuthorization(id: string): Promise<Authorization | null> {
  await delay();
  return authorizations.get(id) ?? null;
}

export async function createAuthorization(
  a: Omit<Authorization, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  await delay();
  const id = makeId('authz');
  authorizations.set(id, { ...a, id, createdAt: nowIso(), updatedAt: nowIso() });
  persistDemoEntities();
  return id;
}

export async function updateAuthorization(
  id: string,
  patch: Partial<Authorization>,
): Promise<void> {
  await delay();
  const cur = authorizations.get(id);
  if (!cur) throw new Error(`authorization ${id} not found`);
  authorizations.set(id, { ...cur, ...patch, id, updatedAt: nowIso() });
  persistDemoEntities();
}

export async function deleteAuthorization(id: string): Promise<void> {
  await delay();
  authorizations.delete(id);
  persistDemoEntities();
}

export async function listAllAuthorizations(): Promise<Authorization[]> {
  await delay();
  return [...authorizations.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// ─── Slots ──────────────────────────────────────────────────────────────────

export async function getSlots(userId: string): Promise<Slots | null> {
  await delay();
  return slots.get(userId) ?? null;
}

export async function ensureSlots(userId: string): Promise<Slots> {
  await delay();
  const existing = slots.get(userId);
  if (existing) return existing;
  const fresh: Slots = {
    userId,
    ...BASE_SLOTS,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  slots.set(userId, fresh);
  return fresh;
}

export async function grantSlot(userId: string, kind: SlotKind, count = 1): Promise<void> {
  await delay();
  const cur = await ensureSlots(userId);
  slots.set(userId, { ...cur, [kind]: cur[kind] + count, updatedAt: nowIso() });
}

export async function setSlots(userId: string, next: Slots): Promise<void> {
  await delay();
  slots.set(userId, { ...next, userId, updatedAt: nowIso() });
}

// ─── Plan ───────────────────────────────────────────────────────────────────

export async function listPlans(): Promise<Plan[]> {
  await delay();
  return [...plans.values()].sort((a, b) => a.slotKind.localeCompare(b.slotKind));
}

export async function upsertPlan(p: Plan): Promise<string> {
  await delay();
  plans.set(p.id, { ...p, updatedAt: nowIso() });
  return p.id;
}

// ─── Report ─────────────────────────────────────────────────────────────────

export async function listReports(ownerUserId: string): Promise<Report[]> {
  await delay();
  return [...reports.values()]
    .filter((r) => r.ownerUserId === ownerUserId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listReportsForDrone(droneId: string): Promise<Report[]> {
  await delay();
  return [...reports.values()]
    .filter((r) => r.droneId === droneId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createReport(r: Omit<Report, 'id' | 'createdAt' | 'read'>): Promise<string> {
  await delay();
  const id = makeId('rep');
  reports.set(id, { ...r, id, createdAt: nowIso(), read: false });
  return id;
}

export async function markReportRead(id: string): Promise<void> {
  await delay();
  const cur = reports.get(id);
  if (!cur) return;
  reports.set(id, { ...cur, read: true });
}

export async function markReportAdminRead(id: string, at: string): Promise<void> {
  await delay();
  const cur = reports.get(id);
  if (!cur) return;
  reports.set(id, { ...cur, adminReadAt: at });
}

// ─── DronePublic (PR-SEC-1: sanitised public snapshot) ─────────────────────

export async function getDronePublicBySlug(slug: string): Promise<DronePublicSnapshot | null> {
  await delay();
  return dronesPublic.get(slug) ?? null;
}

export async function setDronePublic(snapshot: DronePublicSnapshot): Promise<void> {
  await delay();
  dronesPublic.set(snapshot.slug, snapshot);
  persistDemoEntities();
}

export async function deleteDronePublicBySlug(slug: string): Promise<void> {
  await delay();
  dronesPublic.delete(slug);
  persistDemoEntities();
}

export async function listAllDronesPublic(): Promise<DronePublicSnapshot[]> {
  await delay();
  return [...dronesPublic.values()];
}

// ─── Admin-listing helpers (cross-user) ────────────────────────────────────

export async function listAllOperators(): Promise<Operator[]> {
  await delay();
  return [...operators.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listAllDrones(): Promise<Drone[]> {
  await delay();
  return [...drones.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listAllInsurances(): Promise<Insurance[]> {
  await delay();
  return [...insurances.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listAllCertificates(): Promise<Certificate[]> {
  await delay();
  return [...certificates.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listAllDocuments(): Promise<DocumentRef[]> {
  await delay();
  return [...documents.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listAllReports(): Promise<Report[]> {
  await delay();
  return [...reports.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAllSlots(): Promise<Slots[]> {
  await delay();
  return [...slots.values()];
}

// ─── Support chat ───────────────────────────────────────────────────────────

function previewOf(body: string): string {
  const trimmed = body.trim().replace(/\s+/g, ' ');
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}…` : trimmed;
}

export async function getSupportThread(userId: string): Promise<SupportThread | null> {
  await delay();
  return supportThreads.get(userId) ?? null;
}

export async function listSupportThreads(): Promise<SupportThread[]> {
  await delay();
  return [...supportThreads.values()].sort((a, b) =>
    (b.lastMessageAt || b.updatedAt).localeCompare(a.lastMessageAt || a.updatedAt),
  );
}

export async function listSupportMessages(threadId: string): Promise<SupportMessage[]> {
  await delay();
  return [...supportMessages.values()]
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function ensureSupportThread(
  userId: string,
  subject = '',
): Promise<SupportThread> {
  await delay();
  const existing = supportThreads.get(userId);
  if (existing) {
    if (subject && !existing.subject) {
      const updated = { ...existing, subject, updatedAt: nowIso() };
      supportThreads.set(userId, updated);
      persistDemoEntities();
      return updated;
    }
    return existing;
  }
  const now = nowIso();
  const thread: SupportThread = {
    userId,
    subject: subject.trim(),
    status: 'open',
    lastMessageAt: '',
    lastMessagePreview: '',
    userUnreadCount: 0,
    adminUnreadCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  supportThreads.set(userId, thread);
  persistDemoEntities();
  return thread;
}

export async function sendSupportMessage(input: {
  threadId: string;
  sender: 'user' | 'admin';
  senderUid: string;
  body: string;
  subject?: string;
}): Promise<SupportMessage> {
  await delay();
  const body = input.body.trim();
  if (!body) throw new Error('empty_message');

  let thread = supportThreads.get(input.threadId);
  if (!thread) {
    thread = await ensureSupportThread(input.threadId, input.subject ?? '');
  }

  const now = nowIso();
  const id = makeId('smsg');
  const msg: SupportMessage = {
    id,
    threadId: input.threadId,
    sender: input.sender,
    senderUid: input.senderUid,
    body,
    createdAt: now,
    readByUser: input.sender === 'user',
    readByAdmin: input.sender === 'admin',
  };
  supportMessages.set(id, msg);

  const nextSubject =
    thread.subject ||
    (input.subject?.trim() ? input.subject.trim() : previewOf(body).slice(0, 80));

  supportThreads.set(input.threadId, {
    ...thread,
    subject: nextSubject,
    status: 'open',
    lastMessageAt: now,
    lastMessagePreview: previewOf(body),
    userUnreadCount:
      input.sender === 'admin' ? thread.userUnreadCount + 1 : thread.userUnreadCount,
    adminUnreadCount:
      input.sender === 'user' ? thread.adminUnreadCount + 1 : thread.adminUnreadCount,
    updatedAt: now,
  });
  persistDemoEntities();
  return msg;
}

export async function markSupportThreadRead(
  threadId: string,
  reader: 'user' | 'admin',
): Promise<void> {
  await delay();
  const thread = supportThreads.get(threadId);
  if (!thread) return;

  for (const [id, m] of supportMessages) {
    if (m.threadId !== threadId) continue;
    if (reader === 'user' && !m.readByUser) {
      supportMessages.set(id, { ...m, readByUser: true });
    }
    if (reader === 'admin' && !m.readByAdmin) {
      supportMessages.set(id, { ...m, readByAdmin: true });
    }
  }

  supportThreads.set(threadId, {
    ...thread,
    userUnreadCount: reader === 'user' ? 0 : thread.userUnreadCount,
    adminUnreadCount: reader === 'admin' ? 0 : thread.adminUnreadCount,
    updatedAt: nowIso(),
  });
  persistDemoEntities();
}

export async function setSupportThreadStatus(
  threadId: string,
  status: SupportThreadStatus,
): Promise<void> {
  await delay();
  const thread = supportThreads.get(threadId);
  if (!thread) return;
  supportThreads.set(threadId, { ...thread, status, updatedAt: nowIso() });
  persistDemoEntities();
}

export async function countSupportUnreadForUser(userId: string): Promise<number> {
  await delay();
  return supportThreads.get(userId)?.userUnreadCount ?? 0;
}

export async function countSupportUnreadForAdmin(): Promise<number> {
  await delay();
  return [...supportThreads.values()].reduce((n, t) => n + (t.adminUnreadCount || 0), 0);
}

// ─── Test/seed helpers + localStorage persistence ───────────────────────────
//
// DEMO_MODE keeps data in memory. Without persistence, a full page reload
// (or a second browser tab) re-seeds and admin verifications appear to
// "not work" on the public profile. Persist across reloads/tabs.

/** Bump when seed scenarios change so stale localStorage cannot hide Anna/Carlos badges. */
export const DEMO_SEED_REVISION = 10;
const DEMO_STORAGE_KEY = 'dronetag-demo-entities-v3';

type DemoDump = {
  v: 3;
  seedRevision: number;
  nextNumericId: number;
  pilots: Pilot[];
  operators: Operator[];
  drones: Drone[];
  insurances: Insurance[];
  certificates: Certificate[];
  documents: DocumentRef[];
  authorizations: Authorization[];
  slots: Slots[];
  plans: Plan[];
  reports: Report[];
  dronesPublic: DronePublicSnapshot[];
  supportThreads: SupportThread[];
  supportMessages: SupportMessage[];
};

function dumpState(): DemoDump {
  return {
    v: 3,
    seedRevision: DEMO_SEED_REVISION,
    nextNumericId,
    pilots: [...pilots.values()],
    operators: [...operators.values()],
    drones: [...drones.values()],
    insurances: [...insurances.values()],
    certificates: [...certificates.values()],
    documents: [...documents.values()],
    authorizations: [...authorizations.values()],
    slots: [...slots.values()],
    plans: [...plans.values()],
    reports: [...reports.values()],
    dronesPublic: [...dronesPublic.values()],
    supportThreads: [...supportThreads.values()],
    supportMessages: [...supportMessages.values()],
  };
}

function loadState(dump: DemoDump): void {
  _seedClear();
  nextNumericId = typeof dump.nextNumericId === 'number' ? dump.nextNumericId : 1000;
  for (const p of dump.pilots ?? []) pilots.set(p.userId, p);
  for (const o of dump.operators ?? []) operators.set(o.id, o);
  for (const d of dump.drones ?? []) drones.set(d.id, d);
  for (const i of dump.insurances ?? []) {
    const droneIds = Array.isArray(i.droneIds)
      ? i.droneIds
      : i.droneId
        ? [i.droneId]
        : [];
    insurances.set(i.id, { ...i, droneIds, droneId: droneIds[0] ?? i.droneId ?? null });
  }
  for (const c of dump.certificates ?? []) certificates.set(c.id, c);
  for (const d of dump.documents ?? []) documents.set(d.id, d);
  for (const a of dump.authorizations ?? []) authorizations.set(a.id, a);
  for (const s of dump.slots ?? []) slots.set(s.userId, s);
  for (const p of dump.plans ?? []) plans.set(p.id, p);
  for (const r of dump.reports ?? []) reports.set(r.id, r);
  for (const snap of dump.dronesPublic ?? []) dronesPublic.set(snap.slug, snap);
  for (const t of dump.supportThreads ?? []) supportThreads.set(t.userId, t);
  for (const m of dump.supportMessages ?? []) supportMessages.set(m.id, m);
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist(): void {
  if (typeof window === 'undefined') return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(dumpState()));
    } catch {
      // quota / private mode — demo still works in-memory for this tab
    }
  }, 40);
}

/** Call after every mutation so reloads and other tabs see admin demo edits. */
export function persistDemoEntities(): void {
  schedulePersist();
}

/** Direct insertion bypassing IDs — used only by demo seed data wiring. */
export function _seedInsert(
  kind:
    | 'pilot'
    | 'operator'
    | 'drone'
    | 'insurance'
    | 'certificate'
    | 'document'
    | 'authorization'
    | 'slots'
    | 'plan'
    | 'report'
    | 'supportThread'
    | 'supportMessage',
  value: unknown,
): void {
  switch (kind) {
    case 'pilot': { const p = value as Pilot; pilots.set(p.userId, p); return; }
    case 'operator': { const o = value as Operator; operators.set(o.id, o); return; }
    case 'drone': { const d = value as Drone; drones.set(d.id, d); return; }
    case 'insurance': { const i = value as Insurance; insurances.set(i.id, i); return; }
    case 'certificate': { const c = value as Certificate; certificates.set(c.id, c); return; }
    case 'document': { const x = value as DocumentRef; documents.set(x.id, x); return; }
    case 'authorization': { const a = value as Authorization; authorizations.set(a.id, a); return; }
    case 'slots': { const s = value as Slots; slots.set(s.userId, s); return; }
    case 'plan': { const pl = value as Plan; plans.set(pl.id, pl); return; }
    case 'report': { const r = value as Report; reports.set(r.id, r); return; }
    case 'supportThread': { const t = value as SupportThread; supportThreads.set(t.userId, t); return; }
    case 'supportMessage': { const m = value as SupportMessage; supportMessages.set(m.id, m); return; }
  }
}

export function _seedClear(): void {
  pilots.clear();
  operators.clear();
  drones.clear();
  insurances.clear();
  certificates.clear();
  documents.clear();
  authorizations.clear();
  slots.clear();
  plans.clear();
  reports.clear();
  dronesPublic.clear();
  supportThreads.clear();
  supportMessages.clear();
}

import { buildDemoSeedPayload } from '@/lib/demo/seedEntities';

let demoSeeded = false;

function applyFreshSeed(): void {
  const seed = buildDemoSeedPayload();
  for (const p of seed.pilots) _seedInsert('pilot', p);
  for (const o of seed.operators) _seedInsert('operator', o);
  for (const i of seed.insurances) _seedInsert('insurance', i);
  for (const c of seed.certificates) _seedInsert('certificate', c);
  for (const d of seed.documents) _seedInsert('document', d);
  for (const a of seed.authorizations) _seedInsert('authorization', a);
  for (const d of seed.drones) _seedInsert('drone', d);
  for (const s of seed.slots) _seedInsert('slots', s);
  for (const p of seed.plans) _seedInsert('plan', p);
  for (const r of seed.reports) _seedInsert('report', r);
  for (const t of seed.supportThreads) _seedInsert('supportThread', t);
  for (const m of seed.supportMessages) _seedInsert('supportMessage', m);
  for (const snap of seed.publics) dronesPublic.set(snap.slug, snap);
}

export function ensureDemoEntitiesSeeded(): void {
  if (demoSeeded) return;
  demoSeeded = true;

  if (typeof window !== 'undefined') {
    try {
      // Drop legacy keys so old renewed Anna policies cannot stick around.
      localStorage.removeItem('dronetag-demo-entities-v2');
      const raw = localStorage.getItem(DEMO_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoDump;
        if (
          parsed?.v === 3 &&
          parsed.seedRevision === DEMO_SEED_REVISION &&
          Array.isArray(parsed.drones)
        ) {
          loadState(parsed);
          return;
        }
      }
    } catch {
      // fall through to fresh seed
    }
  }

  applyFreshSeed();
  schedulePersist();
}

/**
 * Re-apply a persona's seed entities (relative expiry dates, pending verify).
 * Called when switching demo persona so Anna/Carlos scenarios stay accurate
 * even after an admin verify+renew was persisted in localStorage.
 */
export function restorePersonaScenario(userId: string): void {
  ensureDemoEntitiesSeeded();
  const seed = buildDemoSeedPayload();

  for (const [id, o] of [...operators.entries()]) {
    if (o.userId === userId) operators.delete(id);
  }
  for (const [id, d] of [...drones.entries()]) {
    if (d.userId === userId) {
      dronesPublic.delete(d.slug);
      drones.delete(id);
    }
  }
  for (const [id, i] of [...insurances.entries()]) {
    if (i.userId === userId) insurances.delete(id);
  }
  for (const [id, c] of [...certificates.entries()]) {
    if (c.userId === userId) certificates.delete(id);
  }
  for (const [id, d] of [...documents.entries()]) {
    if (d.userId === userId) documents.delete(id);
  }
  for (const [id, a] of [...authorizations.entries()]) {
    if (a.userId === userId) authorizations.delete(id);
  }
  for (const [id, r] of [...reports.entries()]) {
    if (r.ownerUserId === userId) reports.delete(id);
  }
  slots.delete(userId);
  pilots.delete(userId);

  const seedPilot = seed.pilots.find((p) => p.userId === userId);
  if (seedPilot) pilots.set(userId, seedPilot);

  for (const o of seed.operators.filter((x) => x.userId === userId)) {
    operators.set(o.id, o);
  }
  for (const i of seed.insurances.filter((x) => x.userId === userId)) {
    insurances.set(i.id, i);
  }
  for (const c of seed.certificates.filter((x) => x.userId === userId)) {
    certificates.set(c.id, c);
  }
  for (const d of seed.documents.filter((x) => x.userId === userId)) {
    documents.set(d.id, d);
  }
  for (const a of seed.authorizations.filter((x) => x.userId === userId)) {
    authorizations.set(a.id, a);
  }
  for (const d of seed.drones.filter((x) => x.userId === userId)) {
    drones.set(d.id, d);
  }
  const seedSlots = seed.slots.find((s) => s.userId === userId);
  if (seedSlots) slots.set(userId, seedSlots);
  for (const r of seed.reports.filter((x) => x.ownerUserId === userId)) {
    reports.set(r.id, r);
  }

  // Restore support thread + messages for this persona (Anna name-change request, etc.)
  for (const [id, m] of [...supportMessages.entries()]) {
    if (m.threadId === userId) supportMessages.delete(id);
  }
  supportThreads.delete(userId);
  const seedThread = seed.supportThreads.find((t) => t.userId === userId);
  if (seedThread) supportThreads.set(userId, seedThread);
  for (const m of seed.supportMessages.filter((x) => x.threadId === userId)) {
    supportMessages.set(m.id, m);
  }

  const userDroneIds = new Set(
    seed.drones.filter((d) => d.userId === userId).map((d) => d.id),
  );
  for (const snap of seed.publics.filter((s) => userDroneIds.has(s.droneId))) {
    dronesPublic.set(snap.slug, snap);
  }

  schedulePersist();
}

/** Wipe persisted demo data and re-seed (settings / after broken state). */
export function resetDemoEntities(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      localStorage.removeItem('dronetag-demo-entities-v2');
    } catch {
      // ignore
    }
  }
  resetDemoAccounts();
  _seedClear();
  demoSeeded = false;
  ensureDemoEntitiesSeeded();
  schedulePersist();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== DEMO_STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as DemoDump;
      if (parsed?.v === 3 && parsed.seedRevision === DEMO_SEED_REVISION) {
        loadState(parsed);
      }
    } catch {
      // ignore corrupt payloads
    }
  });
}

ensureDemoEntitiesSeeded();

