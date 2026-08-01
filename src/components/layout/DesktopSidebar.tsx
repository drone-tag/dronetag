'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logout } from '@/lib/firebase/auth';
import { countSupportUnreadForUser } from '@/lib/firebase/support';
import { classNames } from '@/lib/utils';
import {
  ACCOUNT_NAV_ITEMS,
  ACCOUNT_NAV_SECTIONS,
  isAccountNavActive,
} from '@/components/layout/accountNavConfig';
import { NavIcons } from '@/components/layout/navIcons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAccountAvatar } from '@/lib/hooks/useAccountAvatar';

function SupportNavBadge() {
  const { user } = useAuth();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void countSupportUnreadForUser(user.uid).then((c) => {
      if (!cancelled) setN(c);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);
  if (n <= 0) return null;
  return (
    <span className="rounded-full bg-[var(--color-expired)] px-1.5 py-0.5 text-[10px] font-bold text-white">
      {n > 9 ? '9+' : n}
    </span>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { photoUrl, name: accountName } = useAccountAvatar(user?.uid);

  const displayName = accountName || user?.displayName || user?.email || t('nav.account');
  const email = user?.email ?? '';
  const settingsActive =
    pathname === '/account/settings' ||
    pathname?.startsWith('/account/settings/') ||
    pathname === '/account/profile' ||
    pathname?.startsWith('/account/profile/');

  return (
    <aside
      className="hidden w-[var(--sidebar-width)] shrink-0 lg:flex lg:flex-col"
      aria-label={t('account.nav.sidebar')}
    >
      <div className="sticky top-[calc(var(--app-header-offset)+1rem)] flex max-h-[calc(100dvh-var(--app-header-offset)-2rem)] flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-card)]">
        <div className="border-b border-[var(--color-border)] p-3">
          <Link
            href="/account/settings"
            className={classNames(
              'flex items-center gap-3 rounded-xl px-2 py-2 transition-colors',
              settingsActive
                ? 'bg-[var(--color-action-light)]'
                : 'hover:bg-[var(--color-hover)]',
            )}
            aria-label={t('settings.title')}
          >
            <UserAvatar
              name={displayName}
              photoUrl={photoUrl}
              className="h-10 w-10 shrink-0"
              textClassName="bg-[var(--color-brand-solid)] text-xs text-[var(--color-on-brand)]"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[var(--color-text)]">
                {displayName}
              </span>
              {email ? (
                <span className="block truncate text-[11px] text-[var(--color-text-secondary)]">
                  {email}
                </span>
              ) : (
                <span className="block truncate text-[11px] text-[var(--color-text-secondary)]">
                  {t('account.tab.settings')} · {t('account.tabProfile')}
                </span>
              )}
            </span>
            <NavIcons.settings className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {ACCOUNT_NAV_SECTIONS.map((section) => {
            const items = ACCOUNT_NAV_ITEMS.filter((item) => item.section === section.id);
            if (items.length === 0) return null;
            return (
              <div key={section.id} className="mb-3">
                <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  {t(section.labelKey)}
                </p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = isAccountNavActive(pathname ?? '', item);
                    const Icon = NavIcons[item.icon];
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={classNames(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                            active
                              ? 'bg-[var(--color-action-light)] text-[var(--color-action)]'
                              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]',
                          )}
                          aria-current={active ? 'page' : undefined}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="flex-1 truncate">{t(item.labelKey)}</span>
                          {item.href === '/account/support' ? <SupportNavBadge /> : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-[var(--color-border)] p-2">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-expired)]"
            onClick={() => void logout()}
          >
            <NavIcons.logout className="h-5 w-5 shrink-0" />
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </aside>
  );
}
