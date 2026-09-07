/**
 * Shared transactional email client (Resend).
 *
 * Before this module the only outbound email in the product was the signup
 * OTP, sent by an inline `fetch` inside src/lib/server/otp.ts. Every other
 * notification the UI implied — document approved, document rejected, someone
 * found your drone — did not exist. Adding each one as another inline fetch
 * would have duplicated the API key handling, the from-address resolution and
 * the failure semantics five times over.
 *
 * Design decisions worth knowing:
 *
 *   • Sending NEVER throws. Every caller is a side effect of a primary action
 *     that has already succeeded — an admin has approved a certificate, a
 *     finder has filed a report. Failing that action because an email bounced
 *     would lose real work to fix a notification. Callers receive a result
 *     object and decide what to record.
 *
 *   • No API key configured is a normal state, not an error. Local
 *     development and CI run without one; `skipped` distinguishes that from a
 *     genuine delivery failure so logs stay honest.
 *
 *   • Errors are sanitised before they leave this module. Resend echoes the
 *     recipient address back in some error payloads, and those strings end up
 *     in Firestore documents (`notificationError`) that admins can read.
 */

import { logger } from '@/lib/server/logger';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Short tag used for logging and metrics; never sent to the provider. */
  kind: string;
}

export type EmailResult =
  | { status: 'sent'; id?: string }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string };

function fromAddress(): string {
  return process.env.OTP_EMAIL_FROM?.trim() || 'DroneTag <noreply@drone-tag.com>';
}

/**
 * Reduce a provider error to something safe to persist and show to an admin.
 *
 * Deliberately coarse: a handful of stable categories rather than the raw
 * message, because the raw message can contain the recipient address and is
 * not stable across provider changes.
 */
function sanitiseFailure(status: number): string {
  if (status === 401 || status === 403) return 'email_provider_auth_failed';
  if (status === 422) return 'email_address_rejected';
  if (status === 429) return 'email_rate_limited';
  if (status >= 500) return 'email_provider_unavailable';
  return 'email_send_failed';
}

/** Cheap sanity check; the provider does the real validation. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    logger.info('email.skipped', { kind: message.kind, reason: 'no_api_key' });
    return { status: 'skipped', reason: 'email_not_configured' };
  }
  if (!looksLikeEmail(message.to)) {
    return { status: 'skipped', reason: 'no_recipient' };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });

    if (!res.ok) {
      const reason = sanitiseFailure(res.status);
      // `to` is intentionally absent from the log context — the logger would
      // redact it anyway, but not building it in is cheaper and clearer.
      logger.warn('email.failed', { kind: message.kind, status: res.status, reason });
      return { status: 'failed', reason };
    }

    const payload = (await res.json().catch(() => ({}))) as { id?: string };
    logger.info('email.sent', { kind: message.kind });
    return { status: 'sent', id: payload.id };
  } catch (err) {
    logger.warn('email.failed', { kind: message.kind, reason: 'network' }, err);
    return { status: 'failed', reason: 'email_network_error' };
  }
}
