'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { NFC_KIT_CONTENTS_KEYS } from '@/config/pricing';
import { LandingSectionHeader } from '@/components/landing/LandingSection';
import { PricingVisualBadge } from '@/components/pricing/PricingVisuals';
import type { TranslationKey } from '@/lib/i18n/en';

export function PricingNfcKitSection() {
  const { t } = useLanguage();

  return (
    <div>
      <LandingSectionHeader
        title={t('pricing.kit.sectionTitle')}
        subtitle={t('pricing.kit.sectionSubtitle')}
      />
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* One badge, not two. The old model shipped a separate certificate
            badge and insurance badge; the current model is a single badge per
            pilot carrying the public profile link, which covers both. */}
        <div className="flex justify-center">
          <PricingVisualBadge label={t('pricing.kit.visual.badge')} />
        </div>
        <div className="rounded-2xl border border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] p-5 sm:p-6">
          <p className="text-sm font-semibold text-[var(--tone-warning-fg)]">
            {t('pricing.kit.mandatoryBanner')}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text)]">
            {t('pricing.kit.mandatoryBody')}
          </p>
          <ul className="mt-4 space-y-2">
            {NFC_KIT_CONTENTS_KEYS.map((key) => (
              <li key={key} className="flex gap-2 text-sm text-[var(--color-text)]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-action)]" aria-hidden />
                {t(key as TranslationKey)}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--color-text-secondary)]">{t('pricing.kit.note')}</p>
        </div>
      </div>
    </div>
  );
}
