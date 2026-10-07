'use client';

/**
 * Client half of `/u/[slug]`.
 *
 * Privacy properties (PR-SEC-1 / PR-SEC-4):
 *
 *   • Only `DronePublicSnapshot` fields ever reach the browser. No phone,
 *     address, DOB, VAT, full policy number, controller serial, internal
 *     IDs, audit metadata or owner uid.
 *
 *   • The `submitReport` Cloud Function looks the drone up server-side
 *     and derives the owner itself, so the page needs no owner id.
 */

import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PublicDroneCard } from '@/components/profile/PublicDroneCard';
import { Button } from '@/components/ui/Button';
import { getDronePublicBySlug } from '@/lib/firebase/dronesPublic';
import type { InitialPublicSnapshot } from '@/lib/server/publicSnapshot';

type ViewState = InitialPublicSnapshot | { kind: 'error' };

function PageSpinner({ label }: { label: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-8 sm:min-h-[50vh]" role="status">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-border)]" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--color-action)]" />
      </div>
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}

function UnavailableState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-md px-4 py-6 sm:px-0">
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        <div className="flex flex-col items-center px-6 pb-10 pt-12 text-center sm:px-8">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-hover)]">
            <svg
              className="h-8 w-8 text-[var(--color-text-secondary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
          {action ? <div className="mt-6 w-full max-w-xs">{action}</div> : null}
        </div>
        <div className="border-t border-[var(--color-border)] bg-[var(--color-hover)]/80 px-8 py-4 text-center">
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-secondary)]">
            {t('public.poweredBy')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PublicDroneView({ slug, initial }: { slug: string; initial: InitialPublicSnapshot }) {
  const { t } = useLanguage();
  const [state, setState] = useState<ViewState>(initial);
  const [attempt, setAttempt] = useState(0);

  const needsClientRead = state.kind === 'unknown';

  useEffect(() => {
    if (!needsClientRead || !slug) return;
    let cancelled = false;
    getDronePublicBySlug(slug)
      .then((snapshot) => {
        if (cancelled) return;
        setState(snapshot ? { kind: 'snapshot', snapshot } : { kind: 'notFound' });
      })
      .catch((err: unknown) => {
        const code =
          typeof err === 'object' && err !== null && 'code' in err
            ? String((err as { code: unknown }).code)
            : '';
        console.error('[publicDrone] load failed', { slug, code });
        if (!cancelled) setState({ kind: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [needsClientRead, slug, attempt]);

  const retry = useCallback(() => {
    setState({ kind: 'unknown' });
    setAttempt((n) => n + 1);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-0 py-0 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
      {state.kind === 'unknown' ? (
        <PageSpinner label={t('common.loading')} />
      ) : state.kind === 'error' ? (
        <UnavailableState
          title={t('publicDrone.errorTitle')}
          description={t('publicDrone.errorBody')}
          action={
            <Button onClick={retry} fullWidth className="tap-44">
              {t('error.boundary.retry')}
            </Button>
          }
        />
      ) : state.kind === 'notFound' ? (
        <UnavailableState title={t('profile.notFound')} description={t('profile.notFoundDesc')} />
      ) : (
        <PublicDroneCard snapshot={state.snapshot} />
      )}
    </div>
  );
}
