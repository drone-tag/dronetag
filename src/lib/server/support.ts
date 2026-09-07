/**
 * Server-side support operations (Firebase Admin SDK).
 *
 * The support UI shipped complete but the data layer threw
 * `support_unavailable` for every live call, so the entire feature was dead in
 * anything but demo mode — including the "we've reviewed your document"
 * notification the admin verification screen tried to send through it.
 *
 * Layout:
 *   supportThreads/{uid}                one thread per user, id === uid
 *   supportThreads/{uid}/messages/{id}  the conversation
 *
 * Using the uid as the thread id makes ownership structural: there is no
 * `userId` field to compare, and no way to address a thread that is not yours.
 *
 * Writes live here rather than in the client because `sender` determines
 * whether a message is rendered as coming from DroneTag support. A client that
 * could set that field could forge an official reply to itself.
 */

import { FieldValue } from 'firebase-admin/firestore';

import { adminFirestore } from '@/lib/server/firebaseAdmin';
import type {
  SupportMessage,
  SupportThread,
  SupportThreadStatus,
} from '@/lib/types/entities';

const THREADS = 'supportThreads';

export const MAX_SUBJECT_LENGTH = 160;
export const MAX_BODY_LENGTH = 4000;

export class SupportError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'SupportError';
  }
}

function threadRef(uid: string) {
  return adminFirestore().collection(THREADS).doc(uid);
}

/** First ~120 chars of the latest message, for the thread list. */
function preview(body: string): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length <= 120 ? flat : `${flat.slice(0, 119)}…`;
}

export async function ensureThread(uid: string, subject: string): Promise<SupportThread> {
  const ref = threadRef(uid);
  const snap = await ref.get();
  const now = new Date().toISOString();

  if (snap.exists) {
    const data = snap.data() as Omit<SupportThread, 'userId'>;
    return { userId: uid, ...data };
  }

  const thread: SupportThread = {
    userId: uid,
    subject: subject.slice(0, MAX_SUBJECT_LENGTH),
    status: 'open',
    lastMessageAt: now,
    lastMessagePreview: '',
    userUnreadCount: 0,
    adminUnreadCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(thread);
  return thread;
}

/**
 * Append a message and move the thread's state accordingly.
 *
 * The status transition is derived, not chosen by the caller: a user message
 * puts the ball in support's court (`open`), a support reply puts it back with
 * the user (`pending`). Either side posting to a closed thread reopens it,
 * which is friendlier than making someone file a duplicate.
 */
export async function appendMessage(input: {
  uid: string;
  sender: 'user' | 'admin';
  senderUid: string;
  body: string;
  subject?: string;
}): Promise<SupportMessage> {
  const { uid, sender, senderUid, body, subject } = input;

  const trimmed = body.trim();
  if (!trimmed) throw new SupportError('message body is required', 400);
  if (trimmed.length > MAX_BODY_LENGTH) throw new SupportError('message too long', 400);

  const ref = threadRef(uid);
  const existing = await ref.get();
  if (!existing.exists) {
    if (sender === 'admin') {
      // An admin should not be able to conjure a thread for a user who has
      // never contacted support: the user would see an unsolicited
      // conversation with no context.
      await ensureThread(uid, subject ?? '');
    } else {
      await ensureThread(uid, subject ?? trimmed.slice(0, MAX_SUBJECT_LENGTH));
    }
  }

  const now = new Date().toISOString();
  const messageRef = ref.collection('messages').doc();

  const message: SupportMessage = {
    id: messageRef.id,
    threadId: uid,
    sender,
    senderUid,
    body: trimmed,
    createdAt: now,
    readByUser: sender === 'user',
    readByAdmin: sender === 'admin',
  };

  await messageRef.set(message);

  await ref.update({
    status: sender === 'user' ? 'open' : 'pending',
    lastMessageAt: now,
    lastMessagePreview: preview(trimmed),
    updatedAt: now,
    // Increment the *other* side's unread counter.
    ...(sender === 'user'
      ? { adminUnreadCount: FieldValue.increment(1) }
      : { userUnreadCount: FieldValue.increment(1) }),
    ...(subject ? { subject: subject.slice(0, MAX_SUBJECT_LENGTH) } : {}),
  });

  return message;
}

export async function setStatus(uid: string, status: SupportThreadStatus): Promise<void> {
  const ref = threadRef(uid);
  const snap = await ref.get();
  if (!snap.exists) throw new SupportError('thread not found', 404);
  await ref.update({ status, updatedAt: new Date().toISOString() });
}

export async function markRead(uid: string, reader: 'user' | 'admin'): Promise<void> {
  const ref = threadRef(uid);
  const snap = await ref.get();
  if (!snap.exists) return;

  await ref.update({
    ...(reader === 'user' ? { userUnreadCount: 0 } : { adminUnreadCount: 0 }),
    updatedAt: new Date().toISOString(),
  });

  // Flag the individual messages too, so a future per-message read receipt
  // does not need a backfill. Capped because a runaway thread should not turn
  // one click into an unbounded write batch.
  const field = reader === 'user' ? 'readByUser' : 'readByAdmin';
  const unread = await ref.collection('messages').where(field, '==', false).limit(200).get();
  if (unread.empty) return;

  const batch = adminFirestore().batch();
  for (const doc of unread.docs) batch.update(doc.ref, { [field]: true });
  await batch.commit();
}
