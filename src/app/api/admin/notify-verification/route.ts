/**
 * POST /api/admin/notify-verification — tell a user their document was
 * approved or rejected.
 *
 * The admin console changed `verificationStatus` and then tried to inform the
 * user by posting into the support thread, which threw `support_unavailable`
 * in every non-demo environment. The catch swallowed it, so approvals looked
 * successful while the user was never told anything.
 *
 * This endpoint delivers both channels: an email, and a message in the
 * support thread so there is a record inside the product. Neither is allowed
 * to fail the request — the verification decision is already persisted by the
 * time this is called, and returning an error would suggest otherwise. The
 * response reports each channel's outcome so the console can show what
 * actually went out.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { notifyVerificationOutcome } from '@/lib/server/email/notifications';
import { logger } from '@/lib/server/logger';
import { appendMessage } from '@/lib/server/support';
import { parseJsonBody } from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  userId: z.string().trim().min(1).max(128),
  entity: z.enum(['certificate', 'insurance', 'document', 'authorization']),
  outcome: z.enum(['approved', 'rejected']),
  /** e.g. "EASA A1/A3" — shown to the user so they know which item. */
  itemLabel: z.string().trim().max(200).optional(),
  /** Rejection reason written by the admin. */
  reason: z.string().trim().max(1000).optional(),
  /** Message to mirror into the in-app support thread. */
  threadMessage: z.string().trim().max(4000).optional(),
  threadSubject: z.string().trim().max(160).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = await parseJsonBody(request, schema);
  if ('response' in parsed) return parsed.response;
  const { userId, entity, outcome, itemLabel, reason, threadMessage, threadSubject } = parsed.data;

  const email = await notifyVerificationOutcome({
    uid: userId,
    entity,
    outcome,
    itemLabel,
    reason,
  });

  let thread: { status: 'written' | 'failed' } = { status: 'written' };
  if (threadMessage) {
    try {
      await appendMessage({
        uid: userId,
        sender: 'admin',
        senderUid: auth.uid,
        body: threadMessage,
        subject: threadSubject,
      });
    } catch (err) {
      logger.warn('verification.notify.thread_failed', { targetUid: userId }, err);
      thread = { status: 'failed' };
    }
  }

  logger.info('verification.notified', {
    targetUid: userId,
    entity,
    outcome,
    email: email.status,
    thread: thread.status,
  });

  return NextResponse.json({ ok: true, email, thread });
}
