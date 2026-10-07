/**
 * Outbound notifications: resolve a recipient, render, send.
 *
 * Every function here is failure-tolerant by construction. Notifications are a
 * side effect of an action that has already succeeded — a document has been
 * approved, a report has been filed — so a mail problem must never surface as
 * a failure of that action. Callers get a result object describing what
 * happened; nothing throws.
 *
 * Recipient addresses are looked up server-side from the uid. They are never
 * accepted from a request body, which is what keeps these endpoints from
 * becoming an open relay: an authenticated caller can trigger a notification,
 * but only to the address DroneTag already holds for that account.
 */

import { adminAuth, adminFirestore } from '@/lib/server/firebaseAdmin';
import { sendEmail } from '@/lib/server/email/client';
import {
  type EmailLocale,
  type VerifiableEntity,
  type VerificationOutcome,
  foundDroneEmail,
  resolveEmailLocale,
  supportReplyEmail,
  verificationEmail,
} from '@/lib/server/email/templates';
import { logger } from '@/lib/server/logger';

export type NotifyResult = { status: 'sent' | 'skipped' | 'failed'; reason?: string };

function appUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') || 'https://drone-tag.com';
  return `${base}${path}`;
}

/**
 * Email + preferred language for a uid.
 *
 * Auth is the authority for the address (it is what the user actually signed
 * in with); Firestore carries the language preference. A missing address is
 * not an error — some accounts are phone-only — so it resolves to null and the
 * caller records a skip.
 */
async function recipient(uid: string): Promise<{ email: string; locale: EmailLocale } | null> {
  try {
    const [user, profile] = await Promise.all([
      adminAuth().getUser(uid),
      adminFirestore().doc(`users/${uid}`).get(),
    ]);
    const email = user.email?.trim();
    if (!email) return null;
    const language = (profile.data()?.language as string | undefined) ?? undefined;
    return { email, locale: resolveEmailLocale(language) };
  } catch (err) {
    logger.warn('email.recipient.lookup_failed', { uid }, err);
    return null;
  }
}

const ENTITY_PATH: Record<VerifiableEntity, string> = {
  certificate: '/account/certificates',
  insurance: '/account/insurances',
  document: '/account/documents',
  authorization: '/account/permits',
  drone: '/account/drones',
};

export async function notifyVerificationOutcome(input: {
  uid: string;
  entity: VerifiableEntity;
  outcome: VerificationOutcome;
  itemLabel?: string;
  reason?: string;
}): Promise<NotifyResult> {
  const to = await recipient(input.uid);
  if (!to) return { status: 'skipped', reason: 'no_recipient_email' };

  const { subject, text, html } = verificationEmail({
    locale: to.locale,
    entity: input.entity,
    outcome: input.outcome,
    itemLabel: input.itemLabel,
    reason: input.reason,
    dashboardUrl: appUrl(ENTITY_PATH[input.entity]),
  });

  return sendEmail({ kind: 'verification', to: to.email, subject, text, html });
}

export async function notifyFoundDrone(input: {
  ownerUid: string;
  droneLabel: string;
  finderName?: string;
  finderMessage?: string;
  location?: string;
}): Promise<NotifyResult> {
  const to = await recipient(input.ownerUid);
  if (!to) return { status: 'skipped', reason: 'no_recipient_email' };

  const { subject, text, html } = foundDroneEmail({
    locale: to.locale,
    droneLabel: input.droneLabel,
    finderName: input.finderName,
    finderMessage: input.finderMessage,
    location: input.location,
    dashboardUrl: appUrl('/account/inbox'),
  });

  return sendEmail({ kind: 'found_drone', to: to.email, subject, text, html });
}

export async function notifySupportReply(
  uid: string,
  ticketSubject: string,
): Promise<NotifyResult> {
  const to = await recipient(uid);
  if (!to) return { status: 'skipped', reason: 'no_recipient_email' };

  const { subject, text, html } = supportReplyEmail({
    locale: to.locale,
    ticketSubject: ticketSubject || (to.locale === 'it' ? 'Richiesta di supporto' : 'Support request'),
    ticketUrl: appUrl('/account/support'),
  });

  return sendEmail({ kind: 'support_reply', to: to.email, subject, text, html });
}
