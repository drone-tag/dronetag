'use client';

/**
 * Shared shell for the three legal placeholder pages (/privacy, /terms,
 * /cookies).
 *
 * The draft banner belongs to the shell rather than to each page on
 * purpose: none of this text has been through a lawyer, so a page must not
 * be able to render without saying so. Removing the warning means removing
 * it here, once, deliberately.
 *
 * The "last updated" value is the date the DRAFT was last edited. It is not
 * an effective date, because no version of these documents is in force.
 */

import { type ReactNode } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { LandingDisclaimer, PublicFooter } from '@/components/landing/PublicFooter';
import { formatDate } from '@/lib/utils';

export const LEGAL_DRAFT_LAST_UPDATED = '2026-09-07';

const LEGAL_ROUTES: { href: string; titleKey: string }[] = [
  { href: '/privacy', titleKey: 'legal.privacy.title' },
  { href: '/terms', titleKey: 'legal.terms.title' },
  { href: '/cookies', titleKey: 'legal.cookies.title' },
];

function DraftBanner() {
  const { t } = useLanguage();

  return (
    <aside
      role="note"
      className="rounded-2xl border-2 border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-[var(--tone-warning-fg)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--tone-warning-fg)]">
            {t('legal.draft.bannerTitle')}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--tone-warning-fg)]">
            {t('legal.draft.bannerBody')}
          </p>
        </div>
      </div>
    </aside>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[var(--color-border)] pt-6">
      <h2 className="text-base font-semibold text-[var(--color-navy)] sm:text-lg">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {children}
      </div>
    </section>
  );
}

/** Cross-links to the two sibling drafts, so a reader can find them all. */
function RelatedDrafts({ current }: { current: string }) {
  const { t } = useLanguage();
  const others = LEGAL_ROUTES.filter((route) => route.href !== current);

  return (
    <section className="border-t border-[var(--color-border)] pt-6">
      <h2 className="text-base font-semibold text-[var(--color-navy)] sm:text-lg">
        {t('legal.related.title')}
      </h2>
      <ul className="mt-2 space-y-1.5">
        {others.map((route) => (
          <li key={route.href}>
            <Link
              href={route.href}
              className="text-sm text-[var(--color-action)] underline-offset-2 hover:underline"
            >
              {t(route.titleKey)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LegalPageShell({
  route,
  title,
  subtitle,
  children,
}: {
  route: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col overflow-x-safe bg-[var(--color-app-bg)]">
      <div className="mx-auto w-full max-w-[48rem] px-4 py-8 sm:px-5 sm:py-12 lg:px-6">
        <header>
          <span className="inline-flex items-center rounded-full bg-[var(--tone-warning-bg)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tone-warning-fg)] ring-1 ring-inset ring-[var(--tone-warning-ring)]">
            {t('legal.draft.badge')}
          </span>
          <h1 className="mt-3 text-[1.75rem] font-bold leading-[1.15] tracking-tight text-[var(--color-navy)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
            {subtitle}
          </p>
        </header>

        <div className="mt-6">
          <DraftBanner />
        </div>

        <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
          {t('legal.draft.lastUpdated', { date: formatDate(LEGAL_DRAFT_LAST_UPDATED) })}
        </p>

        <div className="mt-8 space-y-6">
          {children}

          <LegalSection title={t('legal.contact.title')}>
            <p>{t('legal.contact.body')}</p>
          </LegalSection>

          <RelatedDrafts current={route} />
        </div>
      </div>

      <LandingDisclaimer />
      <PublicFooter />
    </div>
  );
}
