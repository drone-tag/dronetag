'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { accountNeedsProvisioning, getAccount } from '@/lib/firebase/account';
import { logout } from '@/lib/firebase/auth';
import { DEMO_MODE } from '@/lib/firebase/config';
import { provisionAccount, splitDisplayName } from '@/lib/client/provisionAccount';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type GateState = 'checking' | 'ready' | 'error';

/**
 * Makes sure the signed-in user has their account records before the
 * workspace renders. A missing or partial record is repaired on the spot
 * (provisioning is idempotent server-side), so a user who reaches /account
 * before the signup or Google flow finished provisioning never gets stuck.
 */
export function AccountProvisionGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [attempt, setAttempt] = useState(0);
  // Results carry the check they answer, so a new user or a retry reads as
  // "checking" by derivation instead of by a reset inside the effect.
  const [result, setResult] = useState<{ key: string; status: Exclude<GateState, 'checking'> } | null>(null);
  const [readyUid, setReadyUid] = useState<string | null>(null);
  const key = user ? `${user.uid}:${attempt}` : '';
  const ready = DEMO_MODE || Boolean(user && readyUid === user.uid);

  useEffect(() => {
    if (loading || !user || ready) return;
    let cancelled = false;
    (async () => {
      try {
        let account = await getAccount(user.uid);
        if (!account || accountNeedsProvisioning(account)) {
          await provisionAccount(splitDisplayName(user.displayName));
          account = await getAccount(user.uid);
        }
        if (cancelled) return;
        if (account) {
          setReadyUid(user.uid);
          setResult({ key, status: 'ready' });
        } else {
          setResult({ key, status: 'error' });
        }
      } catch (err) {
        console.warn('[account] provisioning check failed', err);
        if (!cancelled) setResult({ key, status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading, key, ready]);

  const state: GateState = ready ? 'ready' : result?.key === key ? result.status : 'checking';

  if (loading || (user && state === 'checking')) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-3 bg-[var(--color-app-bg)]">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-action)]"
          role="status"
          aria-label={t('common.loading')}
        />
        <p className="text-sm text-[var(--color-text-secondary)]">{t('common.loading')}</p>
      </div>
    );
  }

  if (!user) return null;

  if (state === 'error') {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg items-center px-4 py-16 sm:px-6">
        <Card padding="lg" className="w-full text-center">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {t('account.notProvisioned.title')}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {t('account.notProvisioned.body')}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" onClick={() => setAttempt((n) => n + 1)}>
              {t('common.retry')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => void logout()}>
              {t('nav.logout')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
