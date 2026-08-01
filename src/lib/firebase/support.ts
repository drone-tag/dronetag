/**
 * Support chat — one thread per user (user ↔ admin).
 *
 * DEMO_MODE: in-memory + localStorage via entitiesStore.
 * Live: not wired yet — callers get empty / no-op until Firestore rules land.
 */

import { DEMO_MODE } from '@/lib/firebase/config';
import * as demo from '@/lib/demo/entitiesStore';
import type {
  SupportMessage,
  SupportThread,
  SupportThreadStatus,
} from '@/lib/types/entities';

export async function getSupportThread(userId: string): Promise<SupportThread | null> {
  if (DEMO_MODE) return demo.getSupportThread(userId);
  return null;
}

export async function listSupportThreads(): Promise<SupportThread[]> {
  if (DEMO_MODE) return demo.listSupportThreads();
  return [];
}

export async function listSupportMessages(threadId: string): Promise<SupportMessage[]> {
  if (DEMO_MODE) return demo.listSupportMessages(threadId);
  return [];
}

export async function ensureSupportThread(
  userId: string,
  subject = '',
): Promise<SupportThread> {
  if (DEMO_MODE) return demo.ensureSupportThread(userId, subject);
  throw new Error('support_unavailable');
}

export async function sendSupportMessage(input: {
  threadId: string;
  sender: 'user' | 'admin';
  senderUid: string;
  body: string;
  subject?: string;
}): Promise<SupportMessage> {
  if (DEMO_MODE) return demo.sendSupportMessage(input);
  throw new Error('support_unavailable');
}

export async function markSupportThreadRead(
  threadId: string,
  reader: 'user' | 'admin',
): Promise<void> {
  if (DEMO_MODE) return demo.markSupportThreadRead(threadId, reader);
}

export async function setSupportThreadStatus(
  threadId: string,
  status: SupportThreadStatus,
): Promise<void> {
  if (DEMO_MODE) return demo.setSupportThreadStatus(threadId, status);
}

export async function countSupportUnreadForUser(userId: string): Promise<number> {
  if (DEMO_MODE) return demo.countSupportUnreadForUser(userId);
  return 0;
}

export async function countSupportUnreadForAdmin(): Promise<number> {
  if (DEMO_MODE) return demo.countSupportUnreadForAdmin();
  return 0;
}
