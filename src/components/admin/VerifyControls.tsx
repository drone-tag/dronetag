'use client';

/**
 * Three-button verification toggle used across all admin verification UIs
 * (per-user editor + cross-user queue). Renders the current state with a
 * blue ring on the active button so admins always see what's set.
 *
 * Rejecting asks for an optional reason first; it is sent to the owner with
 * the notification so they know what to fix.
 */

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { VerificationStatus } from '@/lib/types';
import { classNames } from '@/lib/utils';

export type VerifyControlsProps = {
  current: VerificationStatus;
  busy: boolean;
  onSet: (s: VerificationStatus, reason?: string) => void | Promise<void>;
};

const BUTTON =
  'min-h-10 touch-manipulation rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 sm:min-h-8 sm:px-2.5';

export function VerifyControls({ current, busy, onSet }: VerifyControlsProps) {
  const { t } = useLanguage();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  function ringFor(s: VerificationStatus) {
    return current === s
      ? 'ring-2 ring-[var(--color-action)] ring-offset-1 ring-offset-[var(--color-card)]'
      : '';
  }

  async function confirmReject() {
    const trimmed = reason.trim();
    await onSet('rejected', trimmed || undefined);
    setRejecting(false);
    setReason('');
  }

  if (rejecting) {
    return (
      <form
        className="flex w-full flex-col gap-2 sm:w-80"
        onSubmit={(e) => {
          e.preventDefault();
          void confirmReject();
        }}
      >
        <label className="text-xs font-medium text-[var(--color-text)]" htmlFor="verify-reason">
          {t('admin.verify.reason.label')}
        </label>
        <textarea
          id="verify-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          maxLength={1000}
          autoFocus
          placeholder={t('admin.verify.reason.placeholder')}
          className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-action)] focus:ring-2 focus:ring-[var(--color-action)]/20 sm:text-sm"
        />
        <div className="flex flex-wrap justify-end gap-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setRejecting(false);
              setReason('');
            }}
            className={classNames(BUTTON, 'bg-[var(--color-hover)] text-[var(--color-text-secondary)]')}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={busy}
            className={classNames(
              BUTTON,
              'bg-[var(--color-danger-solid)] text-white hover:opacity-90',
            )}
          >
            {t('admin.verify.reason.confirm')}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        disabled={busy}
        onClick={() => onSet('verified')}
        className={classNames(
          BUTTON,
          'bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)] hover:bg-[var(--tone-success-hover)]',
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
          BUTTON,
          'bg-[var(--tone-warning-bg)] text-[var(--tone-warning-fg)] hover:bg-[var(--tone-warning-hover)]',
          ringFor('pending'),
        )}
      >
        {t('admin.verify.markPending')}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => setRejecting(true)}
        className={classNames(
          BUTTON,
          'bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] hover:bg-[var(--tone-danger-hover)]',
          ringFor('rejected'),
        )}
      >
        {t('admin.verify.markRejected')}
      </button>
    </div>
  );
}
