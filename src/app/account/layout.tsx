'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AccountProvisionGate } from '@/components/account/AccountProvisionGate';
import { AccountAppShell } from '@/components/layout/AccountAppShell';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const hadUser = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      // Signing out lands on a clean login; arriving signed out (a link from
      // an email) comes back to the page that was asked for.
      router.replace(
        hadUser.current ? '/login' : `/login?redirect=${encodeURIComponent(pathname || '/account')}`,
      );
      return;
    }
    hadUser.current = true;
    // Admin staff account has no user workspace — only /admin.
    if (isAdmin) router.replace('/admin');
  }, [user, loading, isAdmin, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--app-header-offset))] flex-col items-center justify-center gap-3 bg-[var(--color-app-bg)]">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-action)]"
          role="status"
          aria-label={t('common.loading')}
        />
        <p className="text-sm text-[var(--color-text-secondary)]">{t('common.loading')}</p>
      </div>
    );
  }

  if (!user || isAdmin) return null;

  return (
    <AccountProvisionGate>
      <AccountAppShell>{children}</AccountAppShell>
    </AccountProvisionGate>
  );
}
