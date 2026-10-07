/**
 * Server read of `dronesPublic/{slug}` for the NFC/QR landing page, so the
 * card arrives with the HTML instead of after the Firebase SDK boots.
 *
 * Any failure (no Admin credentials, demo mode, slow Firestore) degrades
 * to `unknown`, and the page falls back to the browser read.
 */

import { cache } from 'react';
import { adminFirestore, isFirebaseAdminConfigured } from '@/lib/server/firebaseAdmin';
import { snapshotFromRaw } from '@/lib/utils/publicSnapshot';
import type { DronePublicSnapshot } from '@/lib/types/entities';

export type InitialPublicSnapshot =
  | { kind: 'snapshot'; snapshot: DronePublicSnapshot }
  | { kind: 'notFound' }
  | { kind: 'unknown' };

const SERVER_READ_TIMEOUT_MS = 2500;

const DEMO_MODE =
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

async function read(slug: string): Promise<InitialPublicSnapshot> {
  if (!slug || slug.length > 300 || slug.includes('/') || slug === '.' || slug === '..') {
    return { kind: 'notFound' };
  }
  if (DEMO_MODE || !isFirebaseAdminConfigured()) return { kind: 'unknown' };

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<InitialPublicSnapshot>((resolve) => {
    timer = setTimeout(() => resolve({ kind: 'unknown' }), SERVER_READ_TIMEOUT_MS);
  });
  const lookup = adminFirestore()
    .collection('dronesPublic')
    .doc(slug)
    .get()
    .then((snap): InitialPublicSnapshot =>
      snap.exists
        ? { kind: 'snapshot', snapshot: snapshotFromRaw(slug, snap.data() ?? {}) }
        : { kind: 'notFound' },
    );

  try {
    return await Promise.race([lookup, timeout]);
  } catch (err) {
    console.error('[publicSnapshot] server read failed', {
      slug,
      message: err instanceof Error ? err.message : String(err),
    });
    return { kind: 'unknown' };
  } finally {
    clearTimeout(timer);
  }
}

/** Deduped per request so `generateMetadata` and the page share one read. */
export const loadPublicSnapshot = cache(read);
