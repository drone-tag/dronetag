'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LandingSectionHeader } from '@/components/landing/LandingSection';
import { classNames } from '@/lib/utils';

const FAQ_IDS = ['kit', 'pilotPro', 'team', 'payment', 'change'] as const;

export function PricingFaqSection() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<string | null>('kit');

  return (
    <div>
      <LandingSectionHeader title={t('pricing.faq.title')} subtitle={t('pricing.faq.subtitle')} />
      <div className="divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
        {FAQ_IDS.map((id) => {
          const expanded = open === id;
          const qKey = `pricing.faq.${id}.q` as const;
          const aKey = `pricing.faq.${id}.a` as const;
          return (
            <div key={id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : id)}
              >
                <span className="text-sm font-semibold text-[var(--color-text)]">{t(qKey)}</span>
                <span
                  className={classNames(
                    'text-lg leading-none text-[var(--color-text-secondary)] transition',
                    expanded ? 'rotate-45' : '',
                  )}
                  aria-hidden
                >
                  +
                </span>
              </button>
              {expanded ? (
                <p className="px-4 pb-4 text-sm leading-relaxed text-[var(--color-text-secondary)] sm:px-5">
                  {t(aKey)}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
