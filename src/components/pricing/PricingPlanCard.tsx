'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  formatEuroFromCents,
  type PricingPlan,
} from '@/config/pricing';
import { classNames } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { TranslationKey } from '@/lib/i18n/en';

function priceLabel(
  plan: PricingPlan,
  t: (k: TranslationKey, vars?: Record<string, string | number>) => string,
  locale: string,
): { primary: string; secondary: string } {
  if (plan.priceCents === null || plan.interval === 'quote') {
    return { primary: t('pricing.price.onRequest'), secondary: t('pricing.price.custom') };
  }
  if (plan.priceCents === 0) {
    return {
      primary: formatEuroFromCents(0, locale),
      secondary: t('pricing.price.perYear'),
    };
  }
  return {
    primary: formatEuroFromCents(plan.priceCents, locale),
    secondary:
      plan.interval === 'month' ? t('pricing.price.perMonth') : t('pricing.price.perYear'),
  };
}

function kitLabel(
  plan: PricingPlan,
  t: (k: TranslationKey, vars?: Record<string, string | number>) => string,
  locale: string,
): string {
  if (plan.kitPriceCents === null) return t('pricing.kit.onRequest');
  if (plan.kitIncluded) return t('pricing.kit.included');
  const amount = formatEuroFromCents(plan.kitPriceCents, locale);
  if (plan.requiresOperators) {
    return t('pricing.kit.perOperator', { amount });
  }
  return t('pricing.kit.mandatoryPrice', { amount });
}

export function PricingPlanCard({ plan }: { plan: PricingPlan }) {
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-GB' : 'it-IT';
  const price = priceLabel(plan, t, locale);
  const checkoutHref =
    plan.interval === 'quote'
      ? `/checkout?plan=${plan.id}`
      : `/checkout?plan=${plan.id}`;

  return (
    <article
      className={classNames(
        'relative flex h-full flex-col rounded-2xl border bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)] sm:p-6',
        plan.recommended
          ? 'border-[var(--color-action)] ring-2 ring-[var(--color-action)]/25'
          : 'border-[var(--color-border)]',
      )}
    >
      {plan.recommended ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-action-solid)] px-3 py-0.5 text-[11px] font-semibold text-white">
          {t('pricing.badge.recommended')}
        </span>
      ) : null}

      <div className="min-w-0">
        <h3 className="text-lg font-bold tracking-tight text-[var(--color-navy)]">
          {t(plan.nameKey as TranslationKey)}
        </h3>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {t(plan.audienceKey as TranslationKey)}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-[var(--color-text)]">{price.primary}</p>
        <p className="text-xs font-medium text-[var(--color-text-secondary)]">{price.secondary}</p>
      </div>

      <div
        className={classNames(
          'mt-4 rounded-xl border px-3 py-2.5 text-xs leading-relaxed',
          plan.kitIncluded
            ? 'border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)]'
            : 'border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] text-[var(--tone-warning-fg)]',
        )}
      >
        <p className="font-semibold">{t('pricing.kit.mandatoryLabel')}</p>
        <p className="mt-0.5 opacity-95">{kitLabel(plan, t, locale)}</p>
      </div>

      <ul className="mt-4 flex-1 space-y-2">
        {plan.featureKeys.map((key) => (
          <li key={key} className="flex gap-2 text-sm text-[var(--color-text)]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-action)]" aria-hidden />
            <span>{t(key as TranslationKey)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Button href={checkoutHref} fullWidth size="lg" variant={plan.recommended ? 'primary' : 'secondary'}>
          {t(plan.ctaKey as TranslationKey)}
        </Button>
        {plan.interval !== 'quote' ? (
          <p className="mt-2 text-center text-[11px] text-[var(--color-text-secondary)]">
            <Link href={checkoutHref} className="underline-offset-2 hover:underline">
              {t('pricing.card.seeCheckout')}
            </Link>
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function PricingPlanGrid({ plans }: { plans: PricingPlan[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {plans.map((plan) => (
        <PricingPlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
