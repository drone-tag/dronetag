/**
 * Client entry point for server-side account provisioning.
 *
 * Firestore rules declare `allow create: if false` on `users/{uid}` and
 * `pilots/{uid}`, so the browser cannot create these documents — the
 * pre-existing client-side `setDoc` calls always failed against real rules,
 * which is what left signup broken. This helper asks the server to do it
 * instead; see src/app/api/account/provision/route.ts.
 */

import { adminFetch } from '@/lib/client/adminApi';

export interface ProvisionSeed {
  accountType?: 'private' | 'company';
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: {
    line1: string;
    line2: string;
    city: string;
    postalCode: string;
    country: string;
  };
  companyName?: string;
  companyContactPerson?: string;
  companyVat?: string;
  companyUniqueNumber?: string;
  nationality?: string;
  acceptedTerms?: boolean;
}

export interface ProvisionResult {
  account: boolean;
  pilot: boolean;
  slots: boolean;
}

export class ProvisionError extends Error {
  constructor(message: string, readonly created?: Partial<ProvisionResult>) {
    super(message);
    this.name = 'ProvisionError';
  }
}

/**
 * Create any missing account records for the currently signed-in user.
 *
 * Idempotent on the server, so callers may invoke it defensively — on signup,
 * on first login, or when a page notices records are missing.
 */
export async function provisionAccount(seed: ProvisionSeed = {}): Promise<ProvisionResult> {
  const res = await adminFetch('/api/account/provision', {
    method: 'POST',
    body: JSON.stringify(seed),
  });

  const payload = (await res.json().catch(() => ({}))) as {
    error?: string;
    created?: ProvisionResult;
  };

  if (!res.ok) {
    throw new ProvisionError(payload.error ?? `provisioning failed (${res.status})`, payload.created);
  }

  return payload.created ?? { account: false, pilot: false, slots: false };
}
