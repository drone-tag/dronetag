'use client';

import { COVERDRONE_QUOTE_URL } from '@/lib/config/features';
import { useLanguage } from '@/contexts/LanguageContext';
import { classNames } from '@/lib/utils';

type CoverdroneCtaProps = {
  className?: string;
  compact?: boolean;
};

/** External quote CTA for renewing / buying Coverdrone coverage. */
export function CoverdroneCta({ className, compact = false }: CoverdroneCtaProps) {
  const { t } = useLanguage();

  return (
    <div
      className={classNames(
        'rounded-xl border border-[var(--color-action)]/25 bg-[var(--color-action-light)]',
        compact ? 'px-3 py-2' : 'px-3 py-2.5 sm:px-4 sm:py-3',
        className,
      )}
    >
      {!compact ? (
        <p className="text-[11px] leading-snug text-[var(--color-text-secondary)] sm:text-xs">
          {t('insurance.coverdrone.hint')}
        </p>
      ) : null}
      <a
        href={COVERDRONE_QUOTE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={classNames(
          'tap-44 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-action)] underline-offset-2 hover:underline',
          compact ? '' : 'mt-1.5',
        )}
      >
        {t('insurance.coverdrone.cta')}
        <span aria-hidden className="text-xs">
          ↗
        </span>
      </a>
    </div>
  );
}
