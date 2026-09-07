/**
 * POST   /api/entities/drones/[id]/publish — rebuild the public snapshot.
 * DELETE /api/entities/drones/[id]/publish — remove the public snapshot.
 *
 * The client asks for a drone to be published; it does not get to say what
 * "published" contains. The server reads the private drone, operator, pilot,
 * insurance and certificate records and derives every public field itself.
 *
 * Why this route exists
 * ---------------------
 * `dronesPublic/{slug}` used to be written straight from the browser. The
 * Firestore rules verified that the caller owned the referenced drone and
 * that the slug matched, but never inspected the payload — so an owner could
 * publish `verificationStatus: 'verified'` for a drone no admin had reviewed.
 * The trust badge shown to an anonymous visitor was writable by the subject
 * it describes (SEC-004). Client writes to the collection are now denied at
 * the rules level and this is the only write path.
 */

import { NextResponse } from 'next/server';

import { requireUserFromRequest } from '@/lib/server/requestAuth';
import { PublicSyncError, syncDronePublicSnapshotAdmin } from '@/lib/server/syncPublicDrones';
import { logger } from '@/lib/server/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

async function sync(request: Request, context: RouteContext) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: 'missing drone id' }, { status: 400 });
  }

  try {
    // Ownership is enforced inside the sync helper against the uid from the
    // verified token, never from the request body.
    const result = await syncDronePublicSnapshotAdmin(id.trim(), auth.uid);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof PublicSyncError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    logger.error('drones.publish.failed', { droneId: id }, err);
    return NextResponse.json({ error: 'publish failed' }, { status: 500 });
  }
}

/**
 * Both verbs run the same reconciliation. DELETE is a convenience for the
 * unpublish button: the snapshot is removed because the drone's visibility
 * has already been set to private, not because the verb says so. Keeping one
 * code path means publish and unpublish can never disagree about what the
 * public state should be.
 */
export const POST = sync;
export const DELETE = sync;
