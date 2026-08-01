'use client';

/**
 * Billing portal placeholder (PR-SEC-4).
 *
 * Renders the user's current plan + slot summary alongside a disabled
 * "Subscribe" CTA. The functional checkout flow ships in PR-BILL-1
 * once Stripe (or another provider) is wired into the abstraction at
 * `src/lib/billing/types.ts`.
 */

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PlanSlotsSummary } from '@/components/account/PlanSlotsSummary';

export default function AccountBillingPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card padding="md">
        <header className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[var(--color-text)] sm:text-base">
              {t('billing.title')}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] sm:text-sm">{t('billing.subtitle')}</p>
          </div>
          <span className="w-fit rounded-full bg-[var(--tone-warning-bg)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--tone-warning-fg)] ring-1 ring-inset ring-[var(--tone-warning-ring)] sm:px-3 sm:py-1 sm:text-xs">
            {t('billing.comingSoon')}
          </span>
        </header>

        <p className="mt-3 rounded-lg bg-[var(--color-hover)] px-3 py-2.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)] sm:mt-4 sm:px-4 sm:py-3 sm:text-xs">
          {t('billing.comingSoonBody')}
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:flex-wrap">
          <Button disabled fullWidth className="sm:w-auto">{t('billing.subscribe')}</Button>
          <Button href="/account/profile" variant="ghost" fullWidth className="sm:w-auto">
            {t('billing.manageProfile')}
          </Button>
        </div>
      </Card>

      <PlanSlotsSummary />
    </div>
  );
}
