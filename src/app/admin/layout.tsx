'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminSubNav } from '@/components/layout/AdminSubNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!isAdmin) router.replace('/account');
  }, [user, loading, isAdmin, router]);

  if (loading) {
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

  if (!user || !isAdmin) {
    return null;
  }

  const showSubNav = pathname !== '/admin';

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[var(--color-app-bg)]">
      {showSubNav ? <AdminSubNav /> : null}
      {children}
    </div>
  );
}
