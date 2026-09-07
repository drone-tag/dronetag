'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminSubNav } from '@/components/layout/AdminSubNav';

/**
 * Client chrome for the admin area.
 *
 * This used to BE the admin layout, and its `useEffect` redirect was the only
 * thing standing between a normal user and /admin — a guard that runs after
 * the bundle has already been served, and that anyone can skip by disabling
 * JavaScript or reading the network response (SEC-003).
 *
 * The real gate now lives in the Server Component at src/app/admin/layout.tsx,
 * which verifies the session with firebase-admin before any admin markup is
 * produced. What remains here is a UX affordance: it keeps the page from
 * flashing admin chrome while the client-side auth context is still resolving,
 * and it reacts if a claim is revoked mid-session. It is not a security
 * boundary, and per-endpoint authorisation in the API routes is still what
 * actually protects the data.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
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
