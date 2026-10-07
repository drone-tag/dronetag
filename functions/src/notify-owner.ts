/**
 * Email the owner when someone reports their drone found.
 *
 * Why this duplicates src/lib/server/email/
 * -----------------------------------------
 * `functions/` is a separate npm package with its own tsconfig, dependency
 * tree and deploy target; it cannot import from the Next.js `src/` tree
 * without either flattening both into a workspace or pulling Next-specific
 * modules into the Functions bundle. `submitReport` has to stay a Cloud
 * Function — it is called anonymously from the public profile and relies on
 * App Check and an IP-keyed rate limit — so the choice is a small amount of
 * duplicated transport code here, or a fragile server-to-server hop back into
 * the web app. The duplication is the cheaper mistake, and is recorded in the
 * tech-debt notes with "extract a shared package" as the fix.
 *
 * Privacy constraints, which are the point of this file:
 *   • The owner's address is looked up here, server-side, and never returned
 *     to the caller. The finder must not learn who owns the drone.
 *   • The email carries only what the finder chose to provide. Nothing is
 *     invented and nothing internal (uids, report ids, serial numbers) is
 *     included.
 */

import * as logger from 'firebase-functions/logger';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export type NotifyOutcome = {
  sent: boolean;
  /** Stable, non-identifying failure category. Safe to persist and show. */
  error?: string;
};

function appUrl(path: string): string {
  const base = (process.env.APP_URL || 'https://drone-tag.com').replace(/\/$/, '');
  return `${base}${path}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function classify(status: number): string {
  if (status === 401 || status === 403) return 'email_provider_auth_failed';
  if (status === 422) return 'email_address_rejected';
  if (status === 429) return 'email_rate_limited';
  if (status >= 500) return 'email_provider_unavailable';
  return 'email_send_failed';
}

interface OwnerNotification {
  ownerUserId: string;
  droneLabel: string;
  finderName?: string;
  finderMessage?: string;
  location?: string;
}

function render(input: Omit<OwnerNotification, 'ownerUserId'>, italian: boolean) {
  const { droneLabel, finderName, finderMessage, location } = input;

  const detail = (itLabel: string, enLabel: string, value?: string) =>
    value && value.trim() ? [`${italian ? itLabel : enLabel}: ${value.trim()}`] : [];

  const lines = italian
    ? [
        `Qualcuno ha scansionato il badge DroneTag del tuo ${droneLabel} e ha inviato una segnalazione.`,
        ...detail('Nome di chi lo ha trovato', 'Finder', finderName),
        ...detail('Luogo', 'Location', location),
        ...detail('Messaggio', 'Message', finderMessage),
        'Apri la dashboard per vedere la segnalazione completa e i recapiti che la persona ha scelto di lasciare.',
      ]
    : [
        `Someone scanned the DroneTag badge on your ${droneLabel} and submitted a report.`,
        ...detail('Nome di chi lo ha trovato', 'Finder', finderName),
        ...detail('Luogo', 'Location', location),
        ...detail('Messaggio', 'Message', finderMessage),
        'Open your dashboard to see the full report and any contact details the finder chose to leave.',
      ];

  const subject = italian
    ? 'DroneTag — qualcuno ha trovato il tuo drone'
    : 'DroneTag — someone found your drone';
  const cta = italian ? 'Vedi la segnalazione' : 'View the report';
  const url = appUrl('/account/inbox');

  const html = [
    '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#111827;line-height:1.55">',
    `<h1 style="font-size:19px;margin:0 0 16px">${escapeHtml(subject)}</h1>`,
    lines.map((l) => `<p style="margin:0 0 12px">${escapeHtml(l)}</p>`).join(''),
    `<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="background:#1a56db;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">${escapeHtml(cta)}</a></p>`,
    '<hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 12px">',
    '<p style="font-size:12px;color:#6b7280;margin:0">DroneTag</p>',
    '</div>',
  ].join('');

  return { subject, text: `${lines.join('\n\n')}\n\n${cta}: ${url}`, html };
}

/**
 * Never throws. The report is already stored by the time this runs; a mail
 * failure must be recorded, not propagated back to the finder as an error.
 */
export async function notifyOwnerOfReport(input: OwnerNotification): Promise<NotifyOutcome> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    logger.info('[notifyOwner] skipped: no RESEND_API_KEY configured');
    return { sent: false, error: 'email_not_configured' };
  }

  let to = '';
  let italian = false;
  try {
    const [user, profile] = await Promise.all([
      getAuth().getUser(input.ownerUserId),
      getFirestore().doc(`users/${input.ownerUserId}`).get(),
    ]);
    to = (user.email || '').trim();
    italian = String(profile.data()?.language || '').toLowerCase().startsWith('it');
  } catch (err) {
    logger.warn('[notifyOwner] owner lookup failed', { reason: (err as Error).message });
    return { sent: false, error: 'owner_lookup_failed' };
  }

  if (!to) return { sent: false, error: 'no_recipient_email' };

  const { subject, text, html } = render(input, italian);

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: (process.env.OTP_EMAIL_FROM || '').trim() || 'DroneTag <noreply@drone-tag.com>',
        to: [to],
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const error = classify(res.status);
      // The recipient address is deliberately absent from the log line.
      logger.warn('[notifyOwner] send failed', { status: res.status, error });
      return { sent: false, error };
    }

    logger.info('[notifyOwner] sent');
    return { sent: true };
  } catch (err) {
    logger.warn('[notifyOwner] network error', { reason: (err as Error).message });
    return { sent: false, error: 'email_network_error' };
  }
}
