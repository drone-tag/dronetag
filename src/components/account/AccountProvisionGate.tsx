'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAccount } from '@/lib/firebase/account';
import { logout } from '@/lib/firebase/auth';
import { DEMO_MODE } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function AccountProvisionGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [checking, setChecking] = useState(true);
  const [provisioned, setProvisioned] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (DEMO_MODE) {
      setProvisioned(true);
      setChecking(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const account = await getAccount(user.uid);
        if (!cancelled) setProvisioned(Boolean(account));
      } catch {
        if (!cancelled) setProvisioned(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (loading || checking) {
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

  if (!provisioned) {
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
