/**
 * Transactional email bodies, IT + EN.
 *
 * Kept as plain functions returning strings rather than a template engine:
 * there are a handful of messages, they need no logic beyond interpolation,
 * and a dependency would be hard to justify for that.
 *
 * Two rules apply to everything in this file:
 *
 *   • Minimise personal data. An email lands in an inbox the product does not
 *     control and is retained indefinitely. Include what the recipient needs
 *     to act, nothing else — no uids, no document ids, no policy numbers.
 *
 *   • Never expose one party's contact details to another. The found-drone
 *     notification in particular must not carry the owner's address into the
 *     finder's view, nor the finder's beyond what they chose to share.
 */

export type EmailLocale = 'it' | 'en';

/** Falls back to English for the languages that are not fully translated. */
export function resolveEmailLocale(raw: string | undefined): EmailLocale {
  return raw?.toLowerCase().startsWith('it') ? 'it' : 'en';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(title: string, bodyHtml: string, ctaLabel?: string, ctaUrl?: string): string {
  const cta =
    ctaLabel && ctaUrl
      ? `<p style="margin:24px 0"><a href="${escapeHtml(ctaUrl)}" style="background:#1a56db;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">${escapeHtml(ctaLabel)}</a></p>`
      : '';
  return [
    '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#111827;line-height:1.55">',
    `<h1 style="font-size:19px;margin:0 0 16px">${escapeHtml(title)}</h1>`,
    bodyHtml,
    cta,
    '<hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 12px">',
    '<p style="font-size:12px;color:#6b7280;margin:0">DroneTag</p>',
    '</div>',
  ].join('');
}

function paragraphs(lines: string[]): string {
  return lines.map((l) => `<p style="margin:0 0 12px">${escapeHtml(l)}</p>`).join('');
}

// ─── Admin verification outcome ────────────────────────────────────────────

export type VerifiableEntity = 'certificate' | 'insurance' | 'document' | 'authorization' | 'drone';
export type VerificationOutcome = 'approved' | 'rejected';

/** Italian needs the grammatical gender for the article and the participle. */
const IT_ENTITY: Record<VerifiableEntity, { label: string; feminine: boolean }> = {
  certificate: { label: 'certificato', feminine: false },
  insurance: { label: 'assicurazione', feminine: true },
  document: { label: 'documento', feminine: false },
  authorization: { label: 'autorizzazione', feminine: true },
  drone: { label: 'drone', feminine: false },
};

const EN_ENTITY: Record<VerifiableEntity, string> = {
  certificate: 'certificate',
  insurance: 'insurance policy',
  document: 'document',
  authorization: 'authorisation',
  drone: 'drone',
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface VerificationEmailInput {
  locale: EmailLocale;
  entity: VerifiableEntity;
  outcome: VerificationOutcome;
  /** Human label for the item, e.g. "EASA A1/A3". Optional. */
  itemLabel?: string;
  /** Admin's reason for rejection. Optional; only shown when present. */
  reason?: string;
  dashboardUrl: string;
}

export function verificationEmail(input: VerificationEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const { locale, entity, outcome, itemLabel, reason, dashboardUrl } = input;
  const approved = outcome === 'approved';

  if (locale === 'it') {
    const { label, feminine } = IT_ENTITY[entity];
    const named = itemLabel ? `${label} “${itemLabel}”` : label;
    const yours = feminine ? 'La tua' : 'Il tuo';
    const suffix = feminine ? 'a' : 'o';
    const subject = approved
      ? `DroneTag — ${capitalize(label)} approvat${suffix}`
      : `DroneTag — ${capitalize(label)} non approvat${suffix}`;
    const lines = approved
      ? [
          `${yours} ${named} è stat${suffix} verificat${suffix} e approvat${suffix}.`,
          'Lo stato di verifica del tuo profilo pubblico è aggiornato.',
        ]
      : [
          `${yours} ${named} non è stat${suffix} approvat${suffix}.`,
          ...(reason ? [`Motivazione: ${reason}`] : []),
          'Puoi caricare una versione corretta dalla tua area personale.',
        ];
    const cta = 'Apri DroneTag';
    return {
      subject,
      text: `${lines.join('\n\n')}\n\n${cta}: ${dashboardUrl}`,
      html: layout(subject, paragraphs(lines), cta, dashboardUrl),
    };
  }

  const label = EN_ENTITY[entity];
  const named = itemLabel ? `${label} “${itemLabel}”` : label;
  const subject = approved
    ? `DroneTag — ${capitalize(label)} approved`
    : `DroneTag — ${capitalize(label)} not approved`;
  const lines = approved
    ? [
        `Your ${named} has been reviewed and approved.`,
        'The verification status on your public profile has been updated.',
      ]
    : [
        `Your ${named} was not approved.`,
        ...(reason ? [`Reason: ${reason}`] : []),
        'You can upload a corrected version from your account.',
      ];
  const cta = 'Open DroneTag';
  return {
    subject,
    text: `${lines.join('\n\n')}\n\n${cta}: ${dashboardUrl}`,
    html: layout(subject, paragraphs(lines), cta, dashboardUrl),
  };
}

// ─── Found drone ───────────────────────────────────────────────────────────

export interface FoundDroneEmailInput {
  locale: EmailLocale;
  /** Manufacturer + model, e.g. "DJI Mavic 3". Never the serial number. */
  droneLabel: string;
  /** Only if the finder chose to give it. */
  finderName?: string;
  /** Only if the finder chose to give it. */
  finderMessage?: string;
  /** Only if the finder chose to share it. */
  location?: string;
  dashboardUrl: string;
}

export function foundDroneEmail(input: FoundDroneEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const { locale, droneLabel, finderName, finderMessage, location, dashboardUrl } = input;

  // Optional details are appended only when the finder actually supplied
  // them. Rendering "Location: not provided" would tell the owner nothing and
  // make the message longer.
  const optional = (itLabel: string, enLabel: string, value?: string) =>
    value?.trim() ? [`${locale === 'it' ? itLabel : enLabel}: ${value.trim()}`] : [];

  if (locale === 'it') {
    const subject = 'DroneTag — qualcuno ha trovato il tuo drone';
    const lines = [
      `Qualcuno ha scansionato il badge DroneTag del tuo ${droneLabel} e ha inviato una segnalazione.`,
      ...optional('Nome di chi lo ha trovato', 'Finder', finderName),
      ...optional('Luogo', 'Location', location),
      ...optional('Messaggio', 'Message', finderMessage),
      'Apri la dashboard per vedere la segnalazione completa e i recapiti che la persona ha scelto di lasciare.',
    ];
    const cta = 'Vedi la segnalazione';
    return {
      subject,
      text: `${lines.join('\n\n')}\n\n${cta}: ${dashboardUrl}`,
      html: layout(subject, paragraphs(lines), cta, dashboardUrl),
    };
  }

  const subject = 'DroneTag — someone found your drone';
  const lines = [
    `Someone scanned the DroneTag badge on your ${droneLabel} and submitted a report.`,
    ...optional('Nome di chi lo ha trovato', 'Finder', finderName),
    ...optional('Luogo', 'Location', location),
    ...optional('Messaggio', 'Message', finderMessage),
    'Open your dashboard to see the full report and any contact details the finder chose to leave.',
  ];
  const cta = 'View the report';
  return {
    subject,
    text: `${lines.join('\n\n')}\n\n${cta}: ${dashboardUrl}`,
    html: layout(subject, paragraphs(lines), cta, dashboardUrl),
  };
}

// ─── Support ───────────────────────────────────────────────────────────────

export function supportReplyEmail(input: {
  locale: EmailLocale;
  ticketSubject: string;
  ticketUrl: string;
}): { subject: string; text: string; html: string } {
  const { locale, ticketSubject, ticketUrl } = input;
  if (locale === 'it') {
    const subject = `DroneTag — risposta al tuo ticket: ${ticketSubject}`;
    const lines = [
      'Il team di supporto DroneTag ha risposto al tuo ticket.',
      'Apri il ticket per leggere la risposta e continuare la conversazione.',
    ];
    const cta = 'Apri il ticket';
    return {
      subject,
      text: `${lines.join('\n\n')}\n\n${cta}: ${ticketUrl}`,
      html: layout(subject, paragraphs(lines), cta, ticketUrl),
    };
  }
  const subject = `DroneTag — reply to your ticket: ${ticketSubject}`;
  const lines = [
    'The DroneTag support team has replied to your ticket.',
    'Open the ticket to read the reply and continue the conversation.',
  ];
  const cta = 'Open ticket';
  return {
    subject,
    text: `${lines.join('\n\n')}\n\n${cta}: ${ticketUrl}`,
    html: layout(subject, paragraphs(lines), cta, ticketUrl),
  };
}
