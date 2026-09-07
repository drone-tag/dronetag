'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DEFAULT_BUSINESS_OPERATORS,
  formatEuroFromCents,
  getPlanById,
  KIT_BADGES_PER_PILOT,
  type PlanId,
} from '@/config/pricing';
import { buildPricingQuote } from '@/lib/pricing/quote';
import { savePricingRequest } from '@/lib/pricing/demoRequests';
import { LandingDisclaimer, PublicFooter } from '@/components/landing/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormErrorBanner } from '@/components/account/FormErrorBanner';
import type { TranslationKey } from '@/lib/i18n/en';
import type { PricingRequestRecord } from '@/lib/pricing/demoRequests';

type CustomerType = 'private' | 'company';

function CheckoutInner() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = language === 'en' ? 'en-GB' : 'it-IT';

  const initialPlanId = (searchParams.get('plan') || 'pilot-pro') as PlanId;
  const plan = getPlanById(initialPlanId) ?? getPlanById('pilot-pro')!;

  const [customerType, setCustomerType] = useState<CustomerType>(
    plan.target === 'business' ? 'company' : 'private',
  );
  const [operatorCount, setOperatorCount] = useState(
    plan.requiresOperators ? DEFAULT_BUSINESS_OPERATORS : 1,
  );
  // Badge count is derived, never chosen: exactly one per pilot / profile.
  // The old editable field was a remnant of the two-badge kit.
  const kitQuantity = plan.requiresOperators
    ? operatorCount * KIT_BADGES_PER_PILOT
    : KIT_BADGES_PER_PILOT;
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<PricingRequestRecord | null>(null);

  const [billing, setBilling] = useState({
    fullName: '',
    email: '',
    companyName: '',
    vat: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: 'Italia',
  });

  useEffect(() => {
    const p = getPlanById(initialPlanId);
    if (!p) return;
    setCustomerType(p.target === 'business' ? 'company' : 'private');
    setOperatorCount(p.requiresOperators ? DEFAULT_BUSINESS_OPERATORS : 1);
  }, [initialPlanId]);

  const localQuote = useMemo(() => {
    try {
      return buildPricingQuote({
        planId: plan.id,
        customerType,
        operatorCount,
        kitQuantity,
      });
    } catch {
      return null;
    }
  }, [plan.id, customerType, operatorCount, kitQuantity]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/pricing/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          customerType,
          operatorCount,
          kitQuantity,
          termsAccepted,
          billing,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        record?: PricingRequestRecord;
        requestId?: string;
      };
      if (!res.ok) {
        setError(t((`pricing.checkout.error.${data.error ?? 'generic'}`) as TranslationKey) || t('pricing.checkout.error.generic'));
        return;
      }
      if (data.record) {
        savePricingRequest(data.record);
        setDone(data.record);
      } else {
        setError(t('pricing.checkout.error.generic'));
      }
    } catch {
      setError(t('pricing.checkout.error.generic'));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-5">
        <div className="rounded-2xl border border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] p-6 text-center">
          <h1 className="text-xl font-bold text-[var(--tone-success-fg)]">{t('pricing.checkout.success.title')}</h1>
          <p className="mt-2 text-sm text-[var(--color-text)]">{t('pricing.checkout.success.body')}</p>
          <p className="mt-3 rounded-lg bg-[var(--color-card)] px-3 py-2 text-xs font-medium text-[var(--tone-warning-fg)] ring-1 ring-[var(--tone-warning-ring)]">
            {t('pricing.checkout.paymentInactive')}
          </p>
          <p className="mt-3 font-mono text-xs text-[var(--color-text-secondary)]">
            {t('pricing.checkout.requestId')}: {done.id}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button href="/pricing">{t('pricing.checkout.backPricing')}</Button>
            <Button href="/" variant="secondary">{t('pricing.ctaFinal.backHome')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[72rem] px-4 py-8 sm:px-5 lg:px-6 lg:py-10">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-action)]">
          {t('pricing.checkout.eyebrow')}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-navy)] sm:text-3xl">
          {t('pricing.checkout.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
          {t('pricing.checkout.subtitle')}
        </p>
        <p className="mt-3 inline-flex rounded-lg bg-[var(--tone-warning-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--tone-warning-fg)] ring-1 ring-[var(--tone-warning-ring)]">
          {t('pricing.checkout.paymentInactive')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">{t('pricing.checkout.plan')}</h2>
            <p className="mt-1 text-lg font-bold text-[var(--color-navy)]">
              {t(plan.nameKey as TranslationKey)}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              <Link href="/pricing" className="text-[var(--color-action)] underline-offset-2 hover:underline">
                {t('pricing.checkout.changePlan')}
              </Link>
            </p>

            <fieldset className="mt-4">
              <legend className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                {t('pricing.checkout.customerType')}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm">
                  <input
                    type="radio"
                    name="customerType"
                    checked={customerType === 'private'}
                    disabled={plan.target === 'business'}
                    onChange={() => setCustomerType('private')}
                  />
                  {t('pricing.checkout.private')}
                </label>
                <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm">
                  <input
                    type="radio"
                    name="customerType"
                    checked={customerType === 'company'}
                    disabled={plan.target === 'individual'}
                    onChange={() => setCustomerType('company')}
                  />
                  {t('pricing.checkout.company')}
                </label>
              </div>
            </fieldset>

            {plan.requiresOperators ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  name="operatorCount"
                  label={t('pricing.checkout.operators')}
                  type="number"
                  min={1}
                  max={plan.maxOperators ?? 500}
                  value={String(operatorCount)}
                  onChange={(e) => setOperatorCount(Math.max(1, Number(e.target.value) || 1))}
                />
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-app-bg)] px-3 py-2.5">
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                    {t('pricing.checkout.kits')}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[var(--color-text)]">
                    {kitQuantity}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
                    {t('pricing.checkout.kitsHint')}
                  </p>
                </div>
              </div>
            ) : !plan.kitIncluded && plan.interval !== 'quote' ? (
              <p className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-app-bg)] px-3 py-2.5 text-xs text-[var(--color-text-secondary)]">
                {t('pricing.checkout.kitsHint')}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">{t('pricing.checkout.billing')}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input
                name="fullName"
                label={t('pricing.checkout.fullName')}
                required
                value={billing.fullName}
                onChange={(e) => setBilling((b) => ({ ...b, fullName: e.target.value }))}
              />
              <Input
                name="email"
                label={t('pricing.checkout.email')}
                type="email"
                required
                value={billing.email}
                onChange={(e) => setBilling((b) => ({ ...b, email: e.target.value }))}
              />
              {customerType === 'company' ? (
                <>
                  <Input
                    name="companyName"
                    label={t('pricing.checkout.companyName')}
                    required
                    value={billing.companyName}
                    onChange={(e) => setBilling((b) => ({ ...b, companyName: e.target.value }))}
                  />
                  <Input
                    name="vat"
                    label={t('pricing.checkout.vat')}
                    value={billing.vat}
                    onChange={(e) => setBilling((b) => ({ ...b, vat: e.target.value }))}
                  />
                </>
              ) : null}
              <div className="sm:col-span-2">
                <Input
                  name="addressLine1"
                  label={t('pricing.checkout.address')}
                  required
                  value={billing.addressLine1}
                  onChange={(e) => setBilling((b) => ({ ...b, addressLine1: e.target.value }))}
                />
              </div>
              <Input
                name="city"
                label={t('pricing.checkout.city')}
                required
                value={billing.city}
                onChange={(e) => setBilling((b) => ({ ...b, city: e.target.value }))}
              />
              <Input
                name="postalCode"
                label={t('pricing.checkout.postalCode')}
                required
                value={billing.postalCode}
                onChange={(e) => setBilling((b) => ({ ...b, postalCode: e.target.value }))}
              />
              <Input
                name="country"
                label={t('pricing.checkout.country')}
                required
                value={billing.country}
                onChange={(e) => setBilling((b) => ({ ...b, country: e.target.value }))}
              />
            </div>

            <label className="mt-4 flex items-start gap-2 text-sm text-[var(--color-text)]">
              <input
                type="checkbox"
                className="mt-1"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <span>{t('pricing.checkout.terms')}</span>
            </label>
          </section>

          <FormErrorBanner show={Boolean(error)} message={error ?? undefined} />

          <Button type="submit" size="lg" loading={submitting} disabled={!termsAccepted} fullWidth className="sm:w-auto">
            {plan.interval === 'quote'
              ? t('pricing.checkout.submitQuote')
              : t('pricing.checkout.submit')}
          </Button>
        </div>

        <aside className="h-fit rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-[calc(var(--app-header-offset)+1rem)]">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">{t('pricing.checkout.summary')}</h2>
          {!localQuote ? (
            <p className="mt-3 text-sm text-[var(--color-expired)]">{t('pricing.checkout.error.generic')}</p>
          ) : localQuote.isQuoteOnly ? (
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{t('pricing.checkout.quoteOnly')}</p>
          ) : (
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--color-text-secondary)]">{t('pricing.checkout.line.subscription')}</dt>
                <dd className="font-medium text-[var(--color-text)]">
                  {formatEuroFromCents(localQuote.subscriptionCents, locale)}
                  <span className="block text-right text-[10px] font-normal text-[var(--color-text-secondary)]">
                    {localQuote.interval === 'month'
                      ? t('pricing.price.perMonth')
                      : t('pricing.price.perYear')}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--color-text-secondary)]">
                  {t('pricing.checkout.line.kit')}
                  {localQuote.kitQuantity > 1 ? ` × ${localQuote.kitQuantity}` : ''}
                </dt>
                <dd className="font-medium text-[var(--color-text)]">
                  {plan.kitIncluded
                    ? t('pricing.kit.included')
                    : formatEuroFromCents(localQuote.kitTotalCents, locale)}
                </dd>
              </div>
              {plan.requiresOperators ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--color-text-secondary)]">{t('pricing.checkout.line.operators')}</dt>
                  <dd className="font-medium text-[var(--color-text)]">{localQuote.operatorCount}</dd>
                </div>
              ) : null}
              <div className="border-t border-[var(--color-border)] pt-2">
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-[var(--color-text)]">{t('pricing.checkout.line.initial')}</dt>
                  <dd className="text-base font-bold text-[var(--color-navy)]">
                    {formatEuroFromCents(localQuote.initialTotalCents, locale)}
                  </dd>
                </div>
                <div className="mt-2 flex justify-between gap-3">
                  <dt className="text-[var(--color-text-secondary)]">{t('pricing.checkout.line.recurring')}</dt>
                  <dd className="font-medium text-[var(--color-text)]">
                    {formatEuroFromCents(localQuote.recurringCents, locale)}
                  </dd>
                </div>
              </div>
            </dl>
          )}
          <p className="mt-4 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            {t('pricing.checkout.summaryNote')}
          </p>
          <button
            type="button"
            className="mt-3 text-xs text-[var(--color-action)] underline-offset-2 hover:underline"
            onClick={() => router.push('/pricing')}
          >
            {t('pricing.checkout.backPricing')}
          </button>
        </aside>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col overflow-x-safe bg-[var(--color-app-bg)]">
      <Suspense
        fallback={
          <div className="px-4 py-10 text-sm text-[var(--color-text-secondary)]">{t('common.loading')}</div>
        }
      >
        <CheckoutInner />
      </Suspense>
      <LandingDisclaimer />
      <PublicFooter />
    </div>
  );
}
