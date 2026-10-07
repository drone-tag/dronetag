'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { useLandingAuth } from '@/components/landing/landingAuth';

export function LandingCTA() {
  const { t } = useLanguage();
  const { user, dashboardHref } = useLandingAuth();

  return (
    <div className="rounded-2xl bg-[var(--color-navy-surface)] px-5 py-8 text-center sm:px-8 sm:py-10 lg:px-12">
      <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-[1.75rem]">
        {t('home.ctaFinal.title')}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
        {t('home.ctaFinal.subtitle')}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button href={user ? dashboardHref : '/pricing'} size="lg" className="min-h-[2.75rem] sm:min-w-[14rem]">
          {user ? t('home.hero.ctaDashboard') : t('nav.pricing')}
        </Button>
        {!user ? (
          <Button href="/login" variant="secondary" size="lg" className="min-h-[2.75rem] border-white/20 bg-white/10 text-white hover:bg-white/15 sm:min-w-[12rem]">
            {t('home.hero.ctaPrimary')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
