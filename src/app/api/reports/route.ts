/**
 * POST /api/reports — anonymous "I found this drone" submission from the
 * public profile page.
 *
 * The owner is derived from the live drone document, never from the
 * payload: the finder must not be able to address a report to anyone else,
 * and must not learn who the owner is. The drone has to be public and active,
 * and its slug has to match, so a guessed document id is not enough.
 *
 * Abuse controls: a honeypot field, and 3 reports per 10 minutes per
 * (slug + client IP) kept in `rateLimits/*` (Admin SDK only — the rules deny
 * every client access).
 *
 * The owner email goes out after the report is stored and cannot fail the
 * request: a filed report the owner sees in the dashboard matters more than
 * the email about it.
 */

import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { cleanString } from '@/lib/server/strings';
import { logger } from '@/lib/server/logger';
import { notifyFoundDrone } from '@/lib/server/email/notifications';
import { isStrictEmail } from '@/lib/utils/safeMailto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

type Body = {
  droneId?: unknown;
  droneSlug?: unknown;
  finderName?: unknown;
  message?: unknown;
  locationText?: unknown;
  contactEmail?: unknown;
  location?: unknown;
  website?: unknown;
};

function clientIp(request: Request): string {
  const direct = request.headers.get('x-nf-client-connection-ip')?.trim();
  if (direct) return direct.slice(0, 64);
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (forwarded || '0.0.0.0').slice(0, 64);
}

function parseLocation(raw: unknown): { lat: number; lng: number; accuracy: number } | null {
  if (!raw || typeof raw !== 'object') return null;
  const l = raw as Record<string, unknown>;
  const lat = Number(l.lat);
  const lng = Number(l.lng);
  const accuracy = Number(l.accuracy);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return null;
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return null;
  return { lat, lng, accuracy: Number.isFinite(accuracy) ? Math.max(0, accuracy) : 0 };
}

/** True when the caller is still under the limit; records the hit. */
async function takeRateLimitSlot(key: string): Promise<boolean> {
  const db = adminFirestore();
  // Document ids cannot contain `/`.
  const ref = db.collection('rateLimits').doc(`submitReport:${key}`.replace(/\//g, '_'));
  const now = Date.now();
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const hits = ((snap.data()?.hits as number[] | undefined) ?? []).filter(
      (h) => h > now - RATE_LIMIT_WINDOW_MS,
    );
    if (hits.length >= RATE_LIMIT_MAX) return false;
    hits.push(now);
    tx.set(ref, { hits, updatedAt: FieldValue.serverTimestamp() });
    return true;
  });
}

function droneLabelFor(drone: Record<string, unknown>): string {
  const parts = [drone.manufacturer, drone.model]
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim());
  return parts.length > 0 ? parts.join(' ') : 'drone';
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid json', code: 'invalid_json' }, { status: 400 });
  }

  const droneId = cleanString(body.droneId, 128);
  const droneSlug = cleanString(body.droneSlug, 128);
  if (!droneId || !droneSlug || droneId.includes('/')) {
    return NextResponse.json({ error: 'droneId and droneSlug are required', code: 'invalid' }, { status: 400 });
  }

  // Bots that fill the hidden field get a convincing success and no write.
  if (cleanString(body.website, 200)) {
    return NextResponse.json({ id: 'ok' });
  }

  const db = adminFirestore();
  const droneSnap = await db.collection('drones').doc(droneId).get();
  const drone = droneSnap.data() as Record<string, unknown> | undefined;
  if (
    !drone ||
    drone.slug !== droneSlug ||
    drone.visibility !== 'public' ||
    drone.status !== 'active' ||
    typeof drone.userId !== 'string' ||
    !drone.userId
  ) {
    return NextResponse.json({ error: 'drone not available', code: 'unavailable' }, { status: 404 });
  }
  const ownerUserId = drone.userId;

  // After the drone check, so made-up slugs cannot create limiter documents.
  if (!(await takeRateLimitSlot(`${droneSlug}:${clientIp(request)}`))) {
    return NextResponse.json({ error: 'too many reports', code: 'rate_limited' }, { status: 429 });
  }

  const finderName = cleanString(body.finderName, 200);
  const message = cleanString(body.message, 4000);
  const locationText = cleanString(body.locationText, 500);
  const emailRaw = cleanString(body.contactEmail, 320).toLowerCase();
  const contactEmail = isStrictEmail(emailRaw) ? emailRaw : '';

  const ref = db.collection('reports').doc();
  await ref.set({
    droneId,
    droneSlug,
    ownerUserId,
    finderName,
    message,
    locationText,
    contactEmail,
    location: parseLocation(body.location),
    read: false,
    emailNotified: false,
    pushNotified: false,
    createdAt: new Date().toISOString(),
    _serverTs: FieldValue.serverTimestamp(),
  });
  logger.info('reports.create.accepted', { reportId: ref.id, droneSlug });

  const outcome = await notifyFoundDrone({
    ownerUid: ownerUserId,
    droneLabel: droneLabelFor(drone),
    finderName,
    finderMessage: message,
    location: locationText,
  });
  await ref
    .update({
      emailNotified: outcome.status === 'sent',
      notificationAttemptedAt: new Date().toISOString(),
      notificationError: outcome.status === 'sent' ? '' : outcome.reason ?? outcome.status,
    })
    .catch((err) => logger.warn('reports.create.notify_record_failed', { reportId: ref.id }, err));

  return NextResponse.json({ id: ref.id });
}
