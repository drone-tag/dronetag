/**
 * /api/health — public readiness probe.
 *
 * Intentionally small. A previous version advertised App Check and CSP
 * enforcement flags, which is useful reconnaissance for an attacker and
 * useless to an uptime monitor. Those toggles stay server-side.
 */

import { NextResponse } from 'next/server';
import { getBuildInfo } from '@/lib/server/buildInfo';
import { isFirebaseAdminConfigured } from '@/lib/server/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const build = getBuildInfo();
  const firebaseConfigured = isFirebaseAdminConfigured();
  const status = firebaseConfigured ? 'ok' : 'degraded';

  return NextResponse.json(
    {
      status,
      version: build.version,
      commit: build.commit,
      now: new Date().toISOString(),
    },
    { status: status === 'ok' ? 200 : 503 },
  );
}
