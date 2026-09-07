'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { listAllReports, listReportsForOwner } from '@/lib/firebase/reports';
import {
  countSupportUnreadForAdmin,
  countSupportUnreadForUser,
} from '@/lib/firebase/support';
import { classNames } from '@/lib/utils';

/**
 * Notification bell.
 * - Account: found-drone inbox / support (prefer support when unread).
 * - Admin: dropdown with Droni + Droni trovati (removed from AdminSubNav).
 */
export function InboxBellButton({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  // Counts carry the scope they were fetched for. Which account and which
  // bell (personal or admin) the numbers describe is part of the value, so a
  // switch between accounts shows nothing rather than the previous account's
  // unread count while the new fetch is in flight. `pathname` still triggers a
  // refresh but is deliberately not part of the scope: navigating inside the
  // same account keeps the badge steady instead of blanking it on every page.
  const [counts, setCounts] = useState<{ scope: string; report: number; support: number } | null>(
    null,
  );
  const rootRef = useRef<HTMLDivElement>(null);

  const inAdmin = pathname.startsWith('/admin');
  const adminBell = Boolean(isAdmin && inAdmin);
  const scope = user ? `${user.uid}:${adminBell ? 'admin' : 'self'}` : '';

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const [reports, support] = await Promise.all([
          adminBell ? listAllReports() : listReportsForOwner(user.uid),
          adminBell ? countSupportUnreadForAdmin() : countSupportUnreadForUser(user.uid),
        ]);
        if (!cancelled) {
          setCounts({ scope, report: reports.filter((r) => !r.read).length, support });
        }
      } catch {
        if (!cancelled) setCounts({ scope, report: 0, support: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, adminBell, pathname, scope]);

  const fresh = counts?.scope === scope ? counts : null;
  const reportUnread = fresh?.report ?? 0;
  const supportUnread = fresh?.support ?? 0;

  // Same reasoning as the drawer in Navbar: the menu is scoped to the route it
  // was opened on, so navigating closes it by derivation rather than by a
  // second render from an effect.
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const menuOpen = menuOpenAt === pathname;
  const setMenuOpen = useCallback(
    (next: boolean | ((open: boolean) => boolean)) =>
      setMenuOpenAt((at) => {
        const open = typeof next === 'function' ? next(at === pathname) : next;
        return open ? pathname : null;
      }),
    [pathname],
  );

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen, setMenuOpen]);

  if (!user) return null;

  const unread = adminBell ? reportUnread : reportUnread + supportUnread;

  const accountHref =
    supportUnread > 0 ? '/account/support' : '/account/inbox';

  const accountActive =
    pathname.startsWith('/account/inbox') || pathname.startsWith('/account/support');

  const adminActive =
    pathname.startsWith('/admin/drones') || pathname.startsWith('/admin/reports');

  const label =
    unread > 0
      ? t('nav.inboxBell.unread', { count: unread })
      : adminBell
        ? t('nav.inboxBell.admin')
        : t('nav.inboxBell');

  const bellIcon = (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );

  const badge =
    unread > 0 ? (
      <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-expired)] px-1 text-[10px] font-bold leading-none text-white">
        {unread > 9 ? '9+' : unread}
      </span>
    ) : null;

  if (!adminBell) {
    return (
      <Link
        href={accountHref}
        className={classNames(
          'tap-44 relative inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
          accountActive
            ? 'bg-[var(--color-action-light)] text-[var(--color-action)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]',
          className,
        )}
        aria-label={label}
        title={label}
      >
        {bellIcon}
        {badge}
      </Link>
    );
  }

  return (
    <div ref={rootRef} className={classNames('relative', className)}>
      <button
        type="button"
        className={classNames(
          'tap-44 relative inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
          menuOpen || adminActive
            ? 'bg-[var(--color-action-light)] text-[var(--color-action)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]',
        )}
        aria-label={label}
        title={label}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((o) => !o)}
      >
        {bellIcon}
        {badge}
      </button>

      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-lg"
        >
          <Link
            role="menuitem"
            href="/admin/reports"
            className={classNames(
              'flex items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors',
              pathname.startsWith('/admin/reports')
                ? 'bg-[var(--color-action-light)] font-semibold text-[var(--color-action)]'
                : 'text-[var(--color-text)] hover:bg-[var(--color-hover)]',
            )}
            onClick={() => setMenuOpen(false)}
          >
            <span>{t('admin.nav.reports')}</span>
            {reportUnread > 0 ? (
              <span className="rounded-full bg-[var(--color-expired)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {reportUnread > 9 ? '9+' : reportUnread}
              </span>
            ) : null}
          </Link>
          <Link
            role="menuitem"
            href="/admin/drones"
            className={classNames(
              'flex items-center gap-2 px-3 py-2.5 text-sm transition-colors',
              pathname.startsWith('/admin/drones')
                ? 'bg-[var(--color-action-light)] font-semibold text-[var(--color-action)]'
                : 'text-[var(--color-text)] hover:bg-[var(--color-hover)]',
            )}
            onClick={() => setMenuOpen(false)}
          >
            {t('admin.nav.drones')}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
