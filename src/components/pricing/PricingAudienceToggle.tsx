'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { classNames } from '@/lib/utils';
import type { PricingTarget } from '@/config/pricing';

export function PricingAudienceToggle({
  value,
  onChange,
}: {
  value: PricingTarget;
  onChange: (next: PricingTarget) => void;
}) {
  const { t } = useLanguage();

  return (
    <div
      className="inline-flex rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1 shadow-sm"
      role="tablist"
      aria-label={t('pricing.toggle.label')}
    >
      {(
        [
          { id: 'individual' as const, label: t('pricing.toggle.individual') },
          { id: 'business' as const, label: t('pricing.toggle.business') },
        ] as const
      ).map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={classNames(
              'min-h-10 rounded-lg px-4 py-2 text-sm font-semibold transition',
              active
                ? 'bg-[var(--color-navy)] text-[var(--color-on-brand)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
