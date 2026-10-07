/**
 * Helpers for the multi-entity model (drones / operators / pilots / etc.).
 *
 * Kept separate from src/lib/utils/index.ts so the legacy Profile helpers
 * are not affected and the new code path stays explicit.
 */

import type { Certificate, Drone, Insurance, Operator, Pilot } from '@/lib/types/entities';
import type { UserAccount } from '@/lib/types/account';
import type { VerificationStatus } from '@/lib/types';
import { computeCertificateStatus } from '@/lib/utils/expiry';

// ─── Drone slug generation ─────────────────────────────────────────────────

/**
 * Crockford-base32 alphabet (no I/L/O/U) → 32 unambiguous symbols.
 * 8 chars  → 32^8 ≈ 1.1 × 10^12 combinations; collision probability with
 * say 10⁶ drones is roughly 10⁶ × 10⁶ / 10¹² = 1 → we still verify on insert.
 */
const SLUG_ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz';

function randomSlug(length = 8): string {
  let out = '';
  // Prefer crypto.getRandomValues; fall back to Math.random in pure-Node contexts.
  const cryptoObj: Crypto | undefined =
    typeof globalThis !== 'undefined'
      ? (globalThis as { crypto?: Crypto }).crypto
      : undefined;
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const buf = new Uint8Array(length);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < length; i += 1) {
      out += SLUG_ALPHABET[buf[i]! % SLUG_ALPHABET.length];
    }
    return out;
  }
  for (let i = 0; i < length; i += 1) {
    out += SLUG_ALPHABET[Math.floor(Math.random() * SLUG_ALPHABET.length)];
  }
  return out;
}

/**
 * Generate a fresh drone slug. The data layer is expected to retry against
 * its uniqueness check (Firestore query on `slug`) if a collision occurs.
 */
export function isDroneDataLocked(d: Drone): boolean {
  return isEntityDataLocked(d);
}

/** True when the owner may no longer edit certificate identity fields. */
export function isCertificateDataLocked(c: Certificate): boolean {
  return isEntityDataLocked(c);
}

/** True when the owner may no longer edit insurance identity fields. */
export function isInsuranceDataLocked(i: Insurance): boolean {
  return isEntityDataLocked(i);
}

/**
 * Readers fill `dataLockedAt` for legacy documents too (see
 * `lockedAtFromRaw`), so the field alone decides.
 */
function isEntityDataLocked(entity: { dataLockedAt?: string }): boolean {
  return Boolean(entity.dataLockedAt);
}

/**
 * `dataLockedAt` as the UI should see it. Documents written before the
 * field existed count as locked once they were saved after creation — the
 * same fallback the server and the Firestore rules apply.
 */
export function lockedAtFromRaw(raw: Record<string, unknown>): string {
  if (typeof raw.dataLockedAt === 'string') return raw.dataLockedAt;
  const created = typeof raw.createdAt === 'string' ? raw.createdAt : '';
  const updated = typeof raw.updatedAt === 'string' ? raw.updatedAt : '';
  return created && updated && created !== updated ? updated : '';
}

export function generateDroneSlug(): string {
  return randomSlug(8);
}

const SLUG_RE = /^[0-9a-z]{4,32}$/;

/**
 * Returns true when `value` looks like a slug we generated:
 * lowercase Crockford-style alphanumerics, 4–32 chars. Used by NFC
 * tooling and by anything that consumes a public URL path segment as
 * a slug. We deliberately accept 4–32 (instead of exactly 8) so older
 * test fixtures and future slug expansions continue to work.
 */
export function isValidSlug(value: string): boolean {
  return SLUG_RE.test(value);
}

// ─── Active-operator TTL (lazy / read-time) ─────────────────────────────────

/**
 * Returns the operator id that should currently be considered "in charge"
 * for the given drone. If a temporary switch has been set and is still
 * within its 24h window, the active operator wins; otherwise the default
 * applies. Pure function — no writes.
 */
export function effectiveOperatorId(
  drone: Pick<Drone, 'defaultOperatorId' | 'activeOperatorId' | 'activeOperatorUntil'>,
  now: Date = new Date(),
): string {
  if (drone.activeOperatorId && drone.activeOperatorUntil) {
    const until = new Date(drone.activeOperatorUntil).getTime();
    if (Number.isFinite(until) && until > now.getTime()) {
      return drone.activeOperatorId;
    }
  }
  return drone.defaultOperatorId;
}

/** True when a temporary operator switch is active and still inside its 24h window. */
export function isActiveOperatorOverride(
  drone: Pick<Drone, 'activeOperatorId' | 'activeOperatorUntil'>,
  now: Date = new Date(),
): boolean {
  if (!drone.activeOperatorId || !drone.activeOperatorUntil) return false;
  const until = new Date(drone.activeOperatorUntil).getTime();
  return Number.isFinite(until) && until > now.getTime();
}

// ─── Display-name helpers (for public projection) ──────────────────────────

/** Human-readable name for an operator, regardless of kind. */
export function operatorDisplayName(op: Operator): string {
  if (op.kind === 'company') {
    return op.company.companyName.trim() || op.label.trim() || '—';
  }
  const full = `${op.private.firstName} ${op.private.lastName}`.trim();
  return full || op.label.trim() || '—';
}

/** Human-readable pilot name. */
export function pilotDisplayName(p: Pilot | null | undefined): string {
  if (!p) return '—';
  return `${p.firstName} ${p.lastName}`.trim() || '—';
}

/** Human-readable account holder name (used in admin tables). */
export function accountDisplayName(a: UserAccount): string {
  if (a.accountType === 'company') {
    return a.companyName.trim() || a.email || '—';
  }
  return `${a.firstName} ${a.lastName}`.trim() || a.email || '—';
}

// ─── Certificate verification (public badge) ───────────────────────────────

/**
 * Aggregate admin verification state from a user's uploaded certificates
 * (attestati). The public drone badge reflects this — not the manual
 * `drone.verificationStatus` field nor insurance coverage.
 */
export function deriveCertificateVerification(
  all: Certificate[],
): { status: VerificationStatus; lastVerifiedAt: string } {
  // An expired certificate no longer vouches for the pilot, whatever its
  // review outcome was.
  const certificates = all.filter((c) => computeCertificateStatus(c) !== 'expired');
  if (certificates.length === 0) {
    return { status: 'unverified', lastVerifiedAt: '' };
  }

  const statuses = certificates.map((c) => c.verificationStatus);
  if (statuses.some((s) => s === 'verified')) {
    const lastVerifiedAt = certificates
      .filter((c) => c.verificationStatus === 'verified')
      .map((c) => c.updatedAt)
      .sort()
      .reverse()[0] ?? '';
    return { status: 'verified', lastVerifiedAt };
  }
  if (statuses.some((s) => s === 'pending')) {
    return { status: 'pending', lastVerifiedAt: '' };
  }
  if (statuses.every((s) => s === 'rejected')) {
    return { status: 'rejected', lastVerifiedAt: '' };
  }
  return { status: 'unverified', lastVerifiedAt: '' };
}
