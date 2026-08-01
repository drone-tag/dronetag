'use client';

/**
 * Three-button verification toggle used across all admin verification UIs
 * (per-user editor + cross-user queue). Renders the current state with a
 * blue ring on the active button so admins always see what's set.
 */

import { useLanguage } from '@/contexts/LanguageContext';
import type { VerificationStatus } from '@/lib/types';
import { classNames } from '@/lib/utils';

export type VerifyControlsProps = {
  current: VerificationStatus;
  busy: boolean;
  onSet: (s: VerificationStatus) => void | Promise<void>;
};

export function VerifyControls({ current, busy, onSet }: VerifyControlsProps) {
  const { t } = useLanguage();

  function ringFor(s: VerificationStatus) {
    return current === s
      ? 'ring-2 ring-[var(--color-action)] ring-offset-1 ring-offset-[var(--color-card)]'
      : '';
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => onSet('verified')}
        className={classNames(
          'rounded-md bg-[var(--tone-success-bg)] px-2 py-1 text-[11px] font-medium text-[var(--tone-success-fg)] transition hover:bg-[var(--tone-success-hover)] disabled:opacity-50',
          ringFor('verified'),
        )}
      >
        {t('admin.verify.markVerified')}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onSet('pending')}
        className={classNames(
          'rounded-md bg-[var(--tone-warning-bg)] px-2 py-1 text-[11px] font-medium text-[var(--tone-warning-fg)] transition hover:bg-[var(--tone-warning-hover)] disabled:opacity-50',
          ringFor('pending'),
        )}
      >
        {t('admin.verify.markPending')}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onSet('rejected')}
        className={classNames(
          'rounded-md bg-[var(--tone-danger-bg)] px-2 py-1 text-[11px] font-medium text-[var(--tone-danger-fg)] transition hover:bg-[var(--tone-danger-hover)] disabled:opacity-50',
          ringFor('rejected'),
        )}
      >
        {t('admin.verify.markRejected')}
      </button>
    </div>
  );
}
