/**
 * POST /api/account/public-sync — reconcile the caller's public drone pages.
 *
 * Called after the owner changes something a public card shows (operator,
 * pilot, branding, certificate, policy). Admins can target another user with
 * `{ uid }`.
 */

import { NextResponse } from 'next/server';
import { requireUserFromRequest } from '@/lib/server/requestAuth';
import { resyncUserPublicDronesAdmin } from '@/lib/server/syncPublicDrones';
import { logger } from '@/lib/server/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json().catch(() => ({}))) as { uid?: unknown };
  const requested = typeof body.uid === 'string' ? body.uid.trim() : '';
  const uid = requested && auth.admin ? requested : auth.uid;
  if (requested && requested !== auth.uid && !auth.admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const published = await resyncUserPublicDronesAdmin(uid);
    return NextResponse.json({ ok: true, published });
  } catch (err) {
    logger.error('account.public_sync.failed', { uid }, err);
    return NextResponse.json({ error: 'sync failed' }, { status: 500 });
  }
}
