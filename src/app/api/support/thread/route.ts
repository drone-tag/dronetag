/**
 * Support thread for the calling user.
 *
 *   GET   — the caller's thread + messages (creates nothing).
 *   POST  — open the thread and/or post a message as the user.
 *   PATCH — mark read, or close/reopen.
 *
 * The thread is always the caller's own: its id is the uid from the verified
 * token, so there is no thread id in the request to tamper with. Admin access
 * to arbitrary threads lives under /api/admin/support.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { logger } from '@/lib/server/logger';
import { requireUserFromRequest } from '@/lib/server/requestAuth';
import {
  MAX_BODY_LENGTH,
  MAX_SUBJECT_LENGTH,
  SupportError,
  appendMessage,
  ensureThread,
  markRead,
  setStatus,
} from '@/lib/server/support';
import { parseJsonBody } from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const postSchema = z.object({
  subject: z.string().trim().max(MAX_SUBJECT_LENGTH).optional(),
  body: z.string().trim().min(1).max(MAX_BODY_LENGTH),
});

const patchSchema = z.object({
  markRead: z.boolean().optional(),
  status: z.enum(['open', 'closed']).optional(),
});

export async function GET(request: Request) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const ref = adminFirestore().collection('supportThreads').doc(auth.uid);
  const [threadSnap, messagesSnap] = await Promise.all([
    ref.get(),
    ref.collection('messages').orderBy('createdAt', 'asc').limit(500).get(),
  ]);

  if (!threadSnap.exists) return NextResponse.json({ thread: null, messages: [] });

  return NextResponse.json({
    thread: { userId: auth.uid, ...threadSnap.data() },
    messages: messagesSnap.docs.map((d) => d.data()),
  });
}

export async function POST(request: Request) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = await parseJsonBody(request, postSchema);
  if ('response' in parsed) return parsed.response;
  const { subject, body } = parsed.data;

  try {
    const message = await appendMessage({
      uid: auth.uid,
      sender: 'user',
      senderUid: auth.uid,
      body,
      subject,
    });
    logger.info('support.message.user', { uid: auth.uid });
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    if (err instanceof SupportError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    logger.error('support.message.failed', { uid: auth.uid }, err);
    return NextResponse.json({ error: 'support_write_failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = await parseJsonBody(request, patchSchema);
  if ('response' in parsed) return parsed.response;
  const { markRead: shouldMarkRead, status } = parsed.data;

  try {
    if (shouldMarkRead) await markRead(auth.uid, 'user');
    // A user may close their own thread or reopen it, but cannot set
    // `pending` — that state means "support has replied" and is the server's
    // to assign.
    if (status) await setStatus(auth.uid, status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SupportError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    logger.error('support.patch.failed', { uid: auth.uid }, err);
    return NextResponse.json({ error: 'support_write_failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Opening an empty thread (no first message) — used by the admin
  // verification notifier before it posts on the user's behalf.
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const thread = await ensureThread(auth.uid, '');
  return NextResponse.json({ ok: true, thread });
}
