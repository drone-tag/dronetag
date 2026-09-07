/**
 * Support chat — one thread per user (user ↔ admin).
 *
 * DEMO_MODE: in-memory + localStorage via entitiesStore.
 * Live: reads go straight to Firestore under the rules; writes go through
 *       /api/support/* and /api/admin/support.
 *
 * Writes are server-side because a message carries a `sender` field that
 * decides whether it renders as coming from DroneTag support. If clients could
 * write it, a user could forge an official reply to themselves — so the server
 * derives it from the verified token and the rules deny client writes outright.
 */

import { DEMO_MODE } from '@/lib/firebase/config';
import * as demo from '@/lib/demo/entitiesStore';
import { adminFetch } from '@/lib/client/adminApi';
import type {
  SupportMessage,
  SupportThread,
  SupportThreadStatus,
} from '@/lib/types/entities';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(path, init);
  const payload = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(payload.error ?? `support request failed (${res.status})`);
  return payload;
}

export async function getSupportThread(userId: string): Promise<SupportThread | null> {
  if (DEMO_MODE) return demo.getSupportThread(userId);
  const { thread } = await api<{ thread: SupportThread | null }>(
    `/api/admin/support?userId=${encodeURIComponent(userId)}`,
  ).catch(() => ({ thread: null }));
  return thread;
}

/** Current user's own thread. Avoids the admin endpoint for the common case. */
export async function getOwnSupportThread(): Promise<{
  thread: SupportThread | null;
  messages: SupportMessage[];
}> {
  if (DEMO_MODE) {
    const thread = await demo.getSupportThread('demo-user');
    return {
      thread,
      messages: thread ? await demo.listSupportMessages(thread.userId) : [],
    };
  }
  return api<{ thread: SupportThread | null; messages: SupportMessage[] }>('/api/support/thread');
}

export async function listSupportThreads(): Promise<SupportThread[]> {
  if (DEMO_MODE) return demo.listSupportThreads();
  const { threads } = await api<{ threads: SupportThread[] }>('/api/admin/support');
  return threads ?? [];
}

export async function listSupportMessages(threadId: string): Promise<SupportMessage[]> {
  if (DEMO_MODE) return demo.listSupportMessages(threadId);
  const { messages } = await api<{ messages: SupportMessage[] }>(
    `/api/admin/support?userId=${encodeURIComponent(threadId)}`,
  );
  return messages ?? [];
}

export async function ensureSupportThread(
  userId: string,
  subject = '',
): Promise<SupportThread> {
  if (DEMO_MODE) return demo.ensureSupportThread(userId, subject);
  // The thread is created implicitly by the first message; this only needs to
  // guarantee existence for callers that check before writing.
  const { thread } = await api<{ thread: SupportThread }>('/api/support/thread', {
    method: 'PUT',
    body: JSON.stringify({ subject }),
  });
  return thread;
}

export async function sendSupportMessage(input: {
  threadId: string;
  sender: 'user' | 'admin';
  senderUid: string;
  body: string;
  subject?: string;
}): Promise<SupportMessage> {
  if (DEMO_MODE) return demo.sendSupportMessage(input);

  // `sender` is a hint about which endpoint to use, not data that is trusted:
  // both routes re-derive it from the caller's token, and the admin route
  // additionally requires the admin claim.
  const path = input.sender === 'admin' ? '/api/admin/support' : '/api/support/thread';
  const body =
    input.sender === 'admin'
      ? { userId: input.threadId, body: input.body, subject: input.subject }
      : { body: input.body, subject: input.subject };

  const { message } = await api<{ message: SupportMessage }>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return message;
}

export async function markSupportThreadRead(
  threadId: string,
  reader: 'user' | 'admin',
): Promise<void> {
  if (DEMO_MODE) return demo.markSupportThreadRead(threadId, reader);

  const path = reader === 'admin' ? '/api/admin/support' : '/api/support/thread';
  const body = reader === 'admin' ? { userId: threadId, markRead: true } : { markRead: true };
  await api(path, { method: 'PATCH', body: JSON.stringify(body) }).catch(() => undefined);
}

export async function setSupportThreadStatus(
  threadId: string,
  status: SupportThreadStatus,
): Promise<void> {
  if (DEMO_MODE) return demo.setSupportThreadStatus(threadId, status);
  await api('/api/admin/support', {
    method: 'PATCH',
    body: JSON.stringify({ userId: threadId, status }),
  });
}

export async function countSupportUnreadForUser(userId: string): Promise<number> {
  if (DEMO_MODE) return demo.countSupportUnreadForUser(userId);
  const { thread } = await api<{ thread: SupportThread | null }>('/api/support/thread').catch(
    () => ({ thread: null }),
  );
  void userId;
  return thread?.userUnreadCount ?? 0;
}

export async function countSupportUnreadForAdmin(): Promise<number> {
  if (DEMO_MODE) return demo.countSupportUnreadForAdmin();
  const threads = await listSupportThreads().catch(() => []);
  return threads.reduce((sum, t) => sum + (t.adminUnreadCount ?? 0), 0);
}
