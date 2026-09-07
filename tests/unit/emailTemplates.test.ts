import { describe, expect, it } from 'vitest';

import {
  foundDroneEmail,
  resolveEmailLocale,
  verificationEmail,
} from '@/lib/server/email/templates';

/**
 * These templates are the one place where product data crosses into an inbox
 * the platform does not control, so the tests are mostly about what must NOT
 * appear rather than about wording.
 */

describe('locale resolution', () => {
  it('uses Italian for it and its regional variants', () => {
    expect(resolveEmailLocale('it')).toBe('it');
    expect(resolveEmailLocale('it-CH')).toBe('it');
    expect(resolveEmailLocale('IT')).toBe('it');
  });

  it('falls back to English for anything else, including the untranslated languages', () => {
    expect(resolveEmailLocale('en')).toBe('en');
    expect(resolveEmailLocale('de')).toBe('en');
    expect(resolveEmailLocale('fr')).toBe('en');
    expect(resolveEmailLocale(undefined)).toBe('en');
  });
});

describe('found-drone notification', () => {
  const base = {
    droneLabel: 'DJI Mavic 3',
    dashboardUrl: 'https://drone-tag.com/dashboard/reports',
  };

  it('omits optional details the finder did not provide', () => {
    const { text } = foundDroneEmail({ locale: 'en', ...base });

    expect(text).not.toMatch(/Finder:/);
    expect(text).not.toMatch(/Location:/);
    expect(text).not.toMatch(/Message:/);
    // No "not provided" placeholders either — an absent field is simply absent.
    expect(text.toLowerCase()).not.toContain('not provided');
  });

  it('includes optional details when the finder did provide them', () => {
    const { text } = foundDroneEmail({
      locale: 'en',
      ...base,
      finderName: 'Sam',
      location: 'Parco Sempione, Milano',
      finderMessage: 'Found it in a tree.',
    });

    expect(text).toContain('Sam');
    expect(text).toContain('Parco Sempione, Milano');
    expect(text).toContain('Found it in a tree.');
  });

  it('treats whitespace-only optional fields as absent', () => {
    const { text } = foundDroneEmail({
      locale: 'en',
      ...base,
      finderName: '   ',
      location: '\n',
    });

    expect(text).not.toMatch(/Finder:/);
    expect(text).not.toMatch(/Location:/);
  });

  it('escapes finder-supplied text in the HTML body', () => {
    // The finder is anonymous and unauthenticated, so their message is the
    // most obvious injection vector in the whole product.
    const { html } = foundDroneEmail({
      locale: 'en',
      ...base,
      finderMessage: '<img src=x onerror="alert(1)">',
    });

    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('sends the owner to their dashboard rather than embedding contact details', () => {
    const { text } = foundDroneEmail({ locale: 'en', ...base });
    expect(text).toContain('https://drone-tag.com/dashboard/reports');
  });

  it('renders Italian when the owner prefers it', () => {
    const { subject } = foundDroneEmail({ locale: 'it', ...base });
    expect(subject).toContain('trovato il tuo drone');
  });
});

describe('verification outcome notification', () => {
  const base = { dashboardUrl: 'https://drone-tag.com/dashboard' } as const;

  it('states the outcome in the subject', () => {
    const approved = verificationEmail({
      locale: 'en',
      entity: 'certificate',
      outcome: 'approved',
      ...base,
    });
    const rejected = verificationEmail({
      locale: 'en',
      entity: 'certificate',
      outcome: 'rejected',
      ...base,
    });

    expect(approved.subject).toMatch(/approved/i);
    expect(rejected.subject).toMatch(/not approved/i);
  });

  it('includes the rejection reason when the admin gave one', () => {
    const { text } = verificationEmail({
      locale: 'en',
      entity: 'insurance',
      outcome: 'rejected',
      reason: 'The policy expired in 2024.',
      ...base,
    });

    expect(text).toContain('The policy expired in 2024.');
  });

  it('omits the reason line entirely when there is none', () => {
    const { text } = verificationEmail({
      locale: 'en',
      entity: 'insurance',
      outcome: 'rejected',
      ...base,
    });

    expect(text).not.toMatch(/Reason:/);
  });

  it('never mentions a reason on approval', () => {
    const { text } = verificationEmail({
      locale: 'en',
      entity: 'document',
      outcome: 'approved',
      reason: 'internal note that should not travel',
      ...base,
    });

    expect(text).not.toContain('internal note');
  });

  it('escapes an admin-written reason in the HTML body', () => {
    const { html } = verificationEmail({
      locale: 'en',
      entity: 'document',
      outcome: 'rejected',
      reason: '<script>alert(1)</script>',
      ...base,
    });

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('translates the entity name in Italian', () => {
    const { subject } = verificationEmail({
      locale: 'it',
      entity: 'insurance',
      outcome: 'approved',
      ...base,
    });

    expect(subject).toContain('assicurazione');
  });
});
