'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { listPlansByTarget, type PricingTarget } from '@/config/pricing';
import { LandingSection, LandingSectionHeader } from '@/components/landing/LandingSection';
import { LandingDisclaimer, PublicFooter } from '@/components/landing/PublicFooter';
import { Button } from '@/components/ui/Button';
import { PricingAudienceToggle } from '@/components/pricing/PricingAudienceToggle';
import { PricingPlanGrid } from '@/components/pricing/PricingPlanCard';
import { PricingNfcKitSection } from '@/components/pricing/PricingNfcKitSection';
import { PricingFaqSection } from '@/components/pricing/PricingFaqSection';
import { PricingHeroArt } from '@/components/pricing/PricingVisuals';

export default function PricingPage() {
  const { t } = useLanguage();
  const [audience, setAudience] = useState<PricingTarget>('individual');
  const plans = useMemo(() => listPlansByTarget(audience), [audience]);

  return (
    <div className="flex flex-col overflow-x-safe bg-[var(--color-app-bg)]">
      <section className="overflow-x-safe border-b border-[var(--color-border)] bg-[var(--color-card)] pt-6 pb-10 sm:pt-8 sm:pb-14">
        <div className="mx-auto grid max-w-[72rem] items-center gap-8 px-4 sm:px-5 lg:grid-cols-2 lg:gap-10 lg:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-action)]">
              {t('pricing.hero.eyebrow')}
            </p>
            <h1 className="mt-3 max-w-xl text-[1.75rem] font-bold leading-[1.15] tracking-tight text-[var(--color-navy)] sm:text-4xl lg:text-[2.5rem]">
              {t('pricing.hero.title')}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
              {t('pricing.hero.subtitle')}
            </p>
            <div className="mt-6">
              <PricingAudienceToggle value={audience} onChange={setAudience} />
            </div>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-[var(--tone-warning-fg)]">
              {t('pricing.hero.kitNotice')}
            </p>
          </div>
          <PricingHeroArt />
        </div>
      </section>

      <LandingSection id="piani" bg="default">
        <LandingSectionHeader
          title={
            audience === 'individual'
              ? t('pricing.section.individualTitle')
              : t('pricing.section.businessTitle')
          }
          subtitle={
            audience === 'individual'
              ? t('pricing.section.individualSubtitle')
              : t('pricing.section.businessSubtitle')
          }
        />
        <div className="mb-6 flex justify-center sm:justify-start">
          <PricingAudienceToggle value={audience} onChange={setAudience} />
        </div>
        <PricingPlanGrid plans={plans} />
      </LandingSection>

      <LandingSection id="kit-nfc" bg="white">
        <PricingNfcKitSection />
      </LandingSection>

      <LandingSection id="riepilogo" bg="default">
        <LandingSectionHeader
          title={t('pricing.summary.title')}
          subtitle={t('pricing.summary.subtitle')}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: t('pricing.summary.sub.title'), body: t('pricing.summary.sub.body') },
            { title: t('pricing.summary.kit.title'), body: t('pricing.summary.kit.body') },
            { title: t('pricing.summary.renew.title'), body: t('pricing.summary.renew.body') },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)]"
            >
              <h3 className="text-sm font-semibold text-[var(--color-navy)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.body}</p>
            </div>
          ))}
        </div>
      </LandingSection>

      <LandingSection id="faq" bg="white">
        <PricingFaqSection />
      </LandingSection>

      <LandingSection bg="default" className="py-8 sm:py-10">
        <div className="rounded-2xl bg-[var(--color-navy-surface)] px-5 py-8 text-center sm:px-8 sm:py-10">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {t('pricing.ctaFinal.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            {t('pricing.ctaFinal.subtitle')}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/checkout?plan=pilot-pro" size="lg" className="min-h-[2.75rem] sm:min-w-[12rem]">
              {t('pricing.ctaFinal.primary')}
            </Button>
            <a
              href="mailto:info@drone-tag.com"
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-base font-medium text-white transition hover:bg-white/15 sm:min-w-[12rem]"
            >
              {t('pricing.ctaFinal.secondary')}
            </a>
          </div>
          <p className="mt-4 text-xs text-white/60">
            <Link href="/" className="underline-offset-2 hover:underline">
              {t('pricing.ctaFinal.backHome')}
            </Link>
          </p>
        </div>
      </LandingSection>

      <LandingDisclaimer />
      <PublicFooter />
    </div>
  );
}
