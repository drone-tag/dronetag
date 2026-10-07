/**
 * `dronesPublic/{slug}` document → typed card payload. Shared by the
 * browser reader and the server-rendered public page.
 */

import type { PolicyStatus, VerificationStatus } from '@/lib/types';
import type { DronePublicSnapshot } from '@/lib/types/entities';

const HOLDER_KINDS = ['pilot', 'operator-private', 'operator-company'] as const;
const POLICY_STATUSES = ['valid', 'expiring', 'expired', 'missing'] as const;
const VERIFICATION_STATUSES = ['verified', 'pending', 'unverified', 'rejected'] as const;

export function snapshotFromRaw(slug: string, raw: Record<string, unknown>): DronePublicSnapshot {
  const str = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : '');
  const holderKind = str('holderKind') as DronePublicSnapshot['holderKind'];
  const insuranceStatus = str('insuranceStatus') as PolicyStatus;
  const verificationStatus = str('verificationStatus') as VerificationStatus;
  return {
    slug,
    droneId: str('droneId'),
    verificationStatus: VERIFICATION_STATUSES.includes(verificationStatus)
      ? verificationStatus
      : 'unverified',
    lastVerifiedAt: str('lastVerifiedAt'),
    publishedAt: str('publishedAt'),
    holderKind: HOLDER_KINDS.includes(holderKind) ? holderKind : 'pilot',
    holderDisplayName: str('holderDisplayName'),
    manufacturer: str('manufacturer'),
    model: str('model'),
    classMarking: (str('classMarking') || 'unknown') as DronePublicSnapshot['classMarking'],
    droneSerialNumber: str('droneSerialNumber'),
    insuranceStatus: POLICY_STATUSES.includes(insuranceStatus) ? insuranceStatus : 'missing',
    insuranceProvider: str('insuranceProvider'),
    insuranceValidUntil: str('insuranceValidUntil'),
    insuranceMaskedPolicyNumber: str('insuranceMaskedPolicyNumber'),
    // `insurancePdfUrl` is deliberately not read back even if a legacy
    // document still carries it — see DronePublicSnapshot for why.
    profilePhotoUrl: str('profilePhotoUrl'),
    logoUrl: str('logoUrl'),
    bannerUrl: str('bannerUrl'),
    updatedAt: str('updatedAt'),
  };
}
