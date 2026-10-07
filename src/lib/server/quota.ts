/**
 * Server-side slot quota checks (mirrors functions/src/util.ts).
 *
 * For `permit` and `certificate`, only non-expired documents count toward
 * the cap — matches the account UI (expired items live in Archive).
 */

import { ENFORCE_SLOT_QUOTAS } from '@/lib/config/features';
import { adminFirestore } from '@/lib/server/firebaseAdmin';

export const MAX_OPERATORS_PER_USER = 3;

export type QuotaSlot = 'drone' | 'operator' | 'certificate' | 'pdf' | 'permit';

const QUOTA_COLLECTIONS: Record<QuotaSlot, string> = {
  drone: 'drones',
  operator: 'operators',
  certificate: 'certificates',
  pdf: 'documents',
  permit: 'authorizations',
};

const SLOT_DEFAULTS: Record<QuotaSlot, number> = {
  drone: 1,
  operator: 1,
  certificate: 1,
  pdf: 1,
  permit: 3,
};

export class QuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaError';
  }
}

/** Empty / invalid date = still active (open-ended). */
export function isExpiryInPast(iso: unknown): boolean {
  if (typeof iso !== 'string' || !iso.trim()) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d < new Date();
}

function countUsed(
  kind: QuotaSlot,
  docs: Array<{ data: () => Record<string, unknown> }>,
): number {
  if (kind === 'permit') {
    return docs.filter((d) => !isExpiryInPast(d.data().validTo)).length;
  }
  if (kind === 'certificate') {
    return docs.filter((d) => !isExpiryInPast(d.data().expiresAt)).length;
  }
  return docs.length;
}

export async function enforceQuota(uid: string, kind: QuotaSlot): Promise<void> {
  if (!ENFORCE_SLOT_QUOTAS) return;
  const db = adminFirestore();
  const slotsSnap = await db.collection('slots').doc(uid).get();
  const slotsData = slotsSnap.exists ? (slotsSnap.data() as Record<string, unknown>) : {};
  const granted =
    typeof slotsData[kind] === 'number' ? (slotsData[kind] as number) : SLOT_DEFAULTS[kind];
  const cap = kind === 'operator' ? Math.min(granted, MAX_OPERATORS_PER_USER) : granted;

  const usageSnap = await db.collection(QUOTA_COLLECTIONS[kind]).where('userId', '==', uid).get();
  const used = countUsed(kind, usageSnap.docs);

  if (used >= cap) {
    throw new QuotaError(`Quota reached for ${kind}: ${used}/${cap}.`);
  }
}
