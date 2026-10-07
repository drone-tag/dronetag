/**
 * Tell an owner about an admin verification decision, by email and in the
 * in-app support thread.
 *
 * The decision is already saved when this runs, so it never throws: it
 * resolves to a translated warning when the email did not go out, or `null`.
 */

import { adminFetch } from '@/lib/client/adminApi';
import { DEMO_MODE } from '@/lib/firebase/config';
import { ensureSupportThread, sendSupportMessage } from '@/lib/firebase/support';
import type { VerificationStatus } from '@/lib/types';

export type VerifiableKind = 'certificate' | 'insurance' | 'document' | 'drone' | 'authorization';

type Translate = (key: string, params?: Record<string, string | number>) => string;

/** Readable reason for the admin, falling back to the raw code. */
function reasonText(code: string, t: Translate): string {
  const key = `admin.notify.reason.${code}`;
  const text = t(key);
  return text === key ? code : text;
}

export async function notifyUserVerification(input: {
  userId: string;
  kind: VerifiableKind;
  label: string;
  status: VerificationStatus;
  reason?: string;
  adminUid?: string;
  t: Translate;
}): Promise<string | null> {
  const { userId, kind, label, status, t } = input;
  if (status !== 'verified' && status !== 'rejected') return null;
  const reason = status === 'rejected' ? input.reason?.trim() || undefined : undefined;

  const kindLabel = t(`account.verification.kind.${kind}`);
  const headline =
    status === 'verified'
      ? t('account.verification.notifyVerified', { kind: kindLabel, label })
      : t('account.verification.notifyRejected', { kind: kindLabel, label });
  const body = reason
    ? `${headline}\n\n${t('account.verification.reasonLine', { reason })}`
    : headline;
  const subject = t('account.verification.threadSubject');

  if (DEMO_MODE) {
    try {
      await ensureSupportThread(userId, subject);
      await sendSupportMessage({
        threadId: userId,
        sender: 'admin',
        senderUid: input.adminUid ?? 'demo-admin',
        body,
        subject,
      });
    } catch (err) {
      console.warn('[verification] demo notify failed', err);
    }
    return null;
  }

  try {
    const res = await adminFetch('/api/admin/notify-verification', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        entity: kind,
        outcome: status === 'verified' ? 'approved' : 'rejected',
        itemLabel: label.slice(0, 200),
        reason,
        threadMessage: body,
        threadSubject: subject,
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as {
      email?: { status: string; reason?: string };
    };
    if (!res.ok) return t('admin.verify.notifyWarning', { reason: `HTTP ${res.status}` });
    if (payload.email && payload.email.status !== 'sent') {
      return t('admin.verify.notifyWarning', {
        reason: reasonText(payload.email.reason ?? payload.email.status, t),
      });
    }
    return null;
  } catch (err) {
    console.warn('[verification] notify failed', err);
    return t('admin.verify.notifyWarning', { reason: reasonText('network', t) });
  }
}
