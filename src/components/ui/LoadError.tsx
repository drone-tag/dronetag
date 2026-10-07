'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';

/**
 * Inline replacement for a list or panel whose data could not be loaded.
 * Shown instead of an empty state, so "nothing here" and "could not
 * check" never look the same.
 */
export function LoadError({
  message,
  onRetry,
}: {
  message?: string | null;
  onRetry: () => Promise<unknown> | void;
}) {
  const { t } = useLanguage();
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-[var(--radius-card)] border border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] px-4 py-6 text-center sm:px-6"
    >
      <p className="text-sm font-semibold text-[var(--tone-danger-fg)]">{t('loadError.title')}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--color-text-secondary)] sm:text-sm">
        {message || t('loadError.body')}
      </p>
      <div className="mt-4">
        <Button variant="secondary" onClick={() => void retry()} loading={retrying} className="tap-44">
          {t('error.boundary.retry')}
        </Button>
      </div>
    </div>
  );
}

export function PageLoading() {
  const { t } = useLanguage();
  return (
    <div className="mt-8 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]" role="status">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-text-secondary)]" />
      {t('common.loading')}
    </div>
  );
}
