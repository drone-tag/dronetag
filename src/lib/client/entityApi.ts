/**
 * Server-side entity operations shared by the data-layer modules.
 */

import { adminFetch } from '@/lib/client/adminApi';
import { readJsonOrThrow } from '@/lib/client/apiError';
import { awaitFirebaseAuthReady } from '@/lib/firebase/auth';

export type EntityKind =
  | 'drones'
  | 'insurances'
  | 'certificates'
  | 'documents'
  | 'authorizations'
  | 'operators';

/**
 * Delete an entity on the server, which also removes what depends on it
 * (links, stored files, public pages). Deleting a missing entity succeeds.
 */
export async function deleteEntityOnServer(kind: EntityKind, id: string): Promise<void> {
  await awaitFirebaseAuthReady();
  const res = await adminFetch(`/api/entities/${kind}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  await readJsonOrThrow(res, `delete ${kind}`);
}

/**
 * Rebuild the public drone pages of `uid` (the caller, or any user for an
 * admin) after a change they display.
 */
export async function syncPublicPagesOnServer(uid: string): Promise<void> {
  const res = await adminFetch('/api/account/public-sync', {
    method: 'POST',
    body: JSON.stringify({ uid }),
  });
  await readJsonOrThrow(res, 'public sync');
}
