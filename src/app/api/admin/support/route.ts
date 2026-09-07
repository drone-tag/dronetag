/**
 * Admin view of support.
 *
 *   GET  ?userId=…  — one thread + its messages. Without `userId`, all threads.
 *   POST            — reply to a user's thread as DroneTag support.
 *   PATCH           — mark read / set status on a user's thread.
 *
 * Admin identity is re-checked here on every call. The server-side gate on
 * /admin stops a non-admin from loading the console UI, but it is not an
 * authorisation boundary for the data: these endpoints are reachable directly.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { logger } from '@/lib/server/logger';
import {
  MAX_BODY_LENGTH,
  MAX_SUBJECT_LENGTH,
  SupportError,
  appendMessage,
  markRead,
  setStatus,
} from '@/lib/server/support';
import { parseJsonBody } from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const uid = z.string().trim().min(1).max(128);

const postSchema = z.object({
  userId: uid,
  body: z.string().trim().min(1).max(MAX_BODY_LENGTH),
  subject: z.string().trim().max(MAX_SUBJECT_LENGTH).optional(),
  /** Also email the user that support replied. Off by default. */
  notify: z.boolean().default(false),
});

const patchSchema = z.object({
  userId: uid,
  markRead: z.boolean().optional(),
  status: z.enum(['open', 'pending', 'closed']).optional(),
});

export async function GET(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const userId = new URL(request.url).searchParams.get('userId');
  const db = adminFirestore();

  if (!userId) {
    const snap = await db
      .collection('supportThreads')
      .orderBy('lastMessageAt', 'desc')
      .limit(200)
      .get();
    return NextResponse.json({
      threads: snap.docs.map((d) => ({ userId: d.id, ...d.data() })),
    });
  }

  const ref = db.collection('supportThreads').doc(userId);
  const [threadSnap, messagesSnap] = await Promise.all([
    ref.get(),
    ref.collection('messages').orderBy('createdAt', 'asc').limit(500).get(),
  ]);

  if (!threadSnap.exists) return NextResponse.json({ thread: null, messages: [] });

  return NextResponse.json({
    thread: { userId, ...threadSnap.data() },
    messages: messagesSnap.docs.map((d) => d.data()),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = await parseJsonBody(request, postSchema);
  if ('response' in parsed) return parsed.response;
  const { userId, body, subject, notify } = parsed.data;

  try {
    const message = await appendMessage({
      uid: userId,
      sender: 'admin',
      senderUid: auth.uid,
      body,
      subject,
    });

    let email: { status: string } | undefined;
    if (notify) {
      // Imported lazily: the reply must succeed even if the mail module or
      // its configuration is unavailable.
      const { notifySupportReply } = await import('@/lib/server/email/notifications');
      email = await notifySupportReply(userId, subject ?? '');
    }

    logger.info('support.message.admin', { targetUid: userId, notified: notify });
    return NextResponse.json({ ok: true, message, email });
  } catch (err) {
    if (err instanceof SupportError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    logger.error('support.admin.reply.failed', { targetUid: userId }, err);
    return NextResponse.json({ error: 'support_write_failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = await parseJsonBody(request, patchSchema);
  if ('response' in parsed) return parsed.response;
  const { userId, markRead: shouldMarkRead, status } = parsed.data;

  try {
    if (shouldMarkRead) await markRead(userId, 'admin');
    if (status) await setStatus(userId, status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SupportError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    logger.error('support.admin.patch.failed', { targetUid: userId }, err);
    return NextResponse.json({ error: 'support_write_failed' }, { status: 500 });
  }
}
