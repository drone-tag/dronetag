/**
 * Expiry-date handling shared by policies, certificates and permits.
 */

import type { Insurance, PolicyStatus } from '@/lib/types';

const EXPIRING_THRESHOLD_DAYS = 30;
const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Moment a stored expiry date stops being valid. Date-only values
 * (`YYYY-MM-DD`, what the forms store) cover the whole local day: parsing
 * them with `new Date()` would mean UTC midnight, flagging a policy as
 * expired on the morning of its last valid day in European time zones.
 */
export function expiryInstant(value: string): Date | null {
  if (!value) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 23, 59, 59, 999)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function statusFromExpiry(expiry: Date, now = new Date()): PolicyStatus {
  if (expiry < now) return 'expired';
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / DAY_MS);
  return daysLeft <= EXPIRING_THRESHOLD_DAYS ? 'expiring' : 'valid';
}

/** Validity from a bare expiry date: `missing` when absent or unreadable. */
export function statusFromExpiryDate(value: string): PolicyStatus {
  const expiry = expiryInstant(value);
  return expiry ? statusFromExpiry(expiry) : 'missing';
}

/**
 * Determines the policy status from raw insurance data.
 *
 * Rules (evaluated in order):
 *  1. missing  — no provider AND no policy number, OR no expiry date
 *  2. expired  — expiry date is in the past
 *  3. expiring — expiry date is within 30 days from now
 *  4. valid    — expiry date is more than 30 days away
 */
export function computePolicyStatus(ins: Insurance): PolicyStatus {
  if (!ins.policyNumber && !ins.provider) return 'missing';
  return statusFromExpiryDate(ins.expiryDate);
}

/** Certificate validity from expiry date (no expiry = valid if issued). */
export function computeCertificateStatus(cert: {
  issuedAt: string;
  expiresAt: string;
}): PolicyStatus {
  if (!cert.issuedAt && !cert.expiresAt) return 'missing';
  if (!cert.expiresAt) return 'valid';
  const expiry = expiryInstant(cert.expiresAt);
  return expiry ? statusFromExpiry(expiry) : 'valid';
}

/** Authorization / permit validity from validTo (empty = open-ended / valid). */
export function computeAuthorizationStatus(auth: {
  validFrom: string;
  validTo: string;
}): PolicyStatus {
  if (!auth.validFrom && !auth.validTo) return 'missing';
  if (!auth.validTo) return 'valid';
  return statusFromExpiryDate(auth.validTo);
}

export function daysUntilExpiry(dateIso: string): number | null {
  const target = expiryInstant(dateIso);
  if (!target) return null;
  return Math.ceil((target.getTime() - Date.now()) / DAY_MS);
}
