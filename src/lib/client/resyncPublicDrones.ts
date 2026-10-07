/**
 * Request a server-side rebuild of public drone snapshots for a user.
 * Never throws — callers should not block UX on failure.
 */

import { resyncUserPublicDrones } from '@/lib/firebase/dronesPublic';

export async function requestPublicDroneResync(uid: string): Promise<void> {
  await resyncUserPublicDrones(uid);
}
