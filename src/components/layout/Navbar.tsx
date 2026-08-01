'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logout } from '@/lib/firebase/auth';
import { DEMO_MODE } from '@/lib/firebase/config';
import { ALLOW_PUBLIC_SIGNUP } from '@/lib/config/features';
import { LANGUAGES, type Language } from '@/lib/types';
import { classNames } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { ACCOUNT_NAV_ITEMS, isAccountNavActive } from '@/components/layout/accountNavConfig';
import { NavIcons } from '@/components/layout/navIcons';
import { DemoPersonaSwitcher } from '@/components/demo/DemoPersonaSwitcher';
import { useSyncHeaderOffset } from '@/lib/hooks/useSyncHeaderOffset';
import { InboxBellButton } from '@/components/layout/InboxBellButton';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAccountAvatar } from '@/lib/hooks/useAccountAvatar';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const inAdmin = pathname.startsWith('/admin');
  const inAccount = pathname === '/account' || pathname.startsWith('/account/');
  /** Profile chip in the top bar on small screens only; desktop sidebar owns it. Never for admin. */
  const showAccountProfileChip = Boolean(user && inAccount && !isAdmin);
  const { photoUrl, name: accountName } = useAccountAvatar(user?.uid);

  useSyncHeaderOffset(headerRef);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const displayName = accountName || user?.displayName || user?.email || '';

  function drawerNavLink(href: string, label: string, icon: ReactNode, active: boolean) {
    return (
      <Link
        href={href}
        className={classNames(
          'tap-44 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
          active
            ? 'bg-[var(--color-action-light)] text-[var(--color-action)]'
            : 'text-[var(--color-text)] hover:bg-[var(--color-hover)]',
        )}
        onClick={() => setDrawerOpen(false)}
      >
        <span className="shrink-0">{icon}</span>
        {label}
      </Link>
    );
  }

  const brandLink = (
    <Link
      href={user ? (isAdmin ? '/admin' : '/account') : '/'}
      className="flex shrink-0 items-center gap-2"
      onClick={() => setDrawerOpen(false)}
    >
      <span className="inline-flex overflow-hidden rounded-lg">
        <Image
          src="/logo.png?v=3"
          alt="DroneTag"
          width={512}
          height={512}
          className="h-7 w-7 sm:h-9 sm:w-9"
          priority
          unoptimized
        />
      </span>
      <span className="hidden text-sm font-bold text-[var(--color-navy)] sm:inline">
        DroneTag
      </span>
    </Link>
  );

  return (
    <>
      <header
        ref={headerRef}
        className="safe-pt surface-header fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-md"
      >
        {DEMO_MODE ? (
          <div className="flex flex-wrap items-center justify-center gap-3 bg-[var(--color-expiring)] px-4 py-1.5 text-center text-xs font-medium text-white">
            <span>{t('demo.banner')}</span>
            <DemoPersonaSwitcher compact />
          </div>
        ) : null}
        <div className="mx-auto flex h-[var(--header-height)] max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
          {showAccountProfileChip ? (
            <>
              <Link
                href="/account/settings"
                className="flex min-w-0 shrink items-center gap-2 lg:hidden"
                onClick={() => setDrawerOpen(false)}
                aria-label={t('settings.title')}
              >
                <UserAvatar
                  name={displayName}
                  photoUrl={photoUrl}
                  className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
                  textClassName="bg-[var(--color-brand-solid)] text-[10px] text-[var(--color-on-brand)] sm:text-xs"
                />
                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate text-sm font-semibold text-[var(--color-text)]">
                    {displayName || t('nav.account')}
                  </span>
                  <span className="block truncate text-[11px] text-[var(--color-text-secondary)]">
                    {t('account.tab.settings')}
                  </span>
                </span>
              </Link>
              <div className="hidden lg:block">{brandLink}</div>
            </>
          ) : (
            brandLink
          )}

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            <label htmlFor="nav-language" className="sr-only">
              {t('common.language')}
            </label>
            <select
              id="nav-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-1.5 pr-8 pl-2 text-xs text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-action)] focus:ring-2 focus:ring-[var(--color-action)]/20"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            {user ? <InboxBellButton /> : null}
            {user ? (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                  >
                    {t('nav.dashboard')}
                  </Link>
                ) : (
                  <Link
                    href="/account"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                  >
                    {t('nav.account')}
                  </Link>
                )}
                <Button type="button" variant="ghost" size="sm" onClick={() => void logout()}>
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
                >
                  {t('nav.login')}
                </Link>
                {ALLOW_PUBLIC_SIGNUP || DEMO_MODE ? (
                  <Link
                    href="/signup"
                    className="rounded-lg bg-[var(--color-brand-solid)] px-3 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:opacity-90"
                  >
                    {t('nav.signup')}
                  </Link>
                ) : null}
              </>
            )}
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            {user ? <InboxBellButton /> : null}
            {user && !inAccount && !isAdmin ? (
              <Link
                href="/account/settings"
                className="tap-44 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
                aria-label={t('account.tab.settings')}
              >
                <UserAvatar
                  name={displayName}
                  photoUrl={photoUrl}
                  className="h-9 w-9"
                  textClassName="bg-[var(--color-brand-solid)] text-xs text-[var(--color-on-brand)]"
                />
              </Link>
            ) : null}
            <button
              type="button"
              className="tap-44 inline-flex items-center justify-center rounded-xl p-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              aria-label={drawerOpen ? t('nav.menuClose') : t('nav.menuOpen')}
              onClick={() => setDrawerOpen((o) => !o)}
            >
              {drawerOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="DroneTag">
        <div className="flex flex-col gap-1 p-3" id="mobile-drawer">
          <div className="mb-2 px-3">
            <label htmlFor="nav-language-mobile" className="sr-only">
              {t('common.language')}
            </label>
            <select
              id="nav-language-mobile"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="tap-44 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {user && !inAccount && !isAdmin ? (
            <>
              {drawerNavLink('/account', t('account.nav.home'), <NavIcons.home className="h-5 w-5" />, false)}
              {ACCOUNT_NAV_ITEMS.filter((i) => i.href !== '/account').map((item) => {
                const Icon = NavIcons[item.icon];
                return (
                  <div key={item.href}>
                    {drawerNavLink(
                      item.href,
                      t(item.labelKey),
                      <Icon className="h-5 w-5" />,
                      isAccountNavActive(pathname ?? '', item),
                    )}
                  </div>
                );
              })}
            </>
          ) : null}

          {!user ? (
            <>
              {drawerNavLink('/', t('nav.home'), <NavIcons.home className="h-5 w-5" />, pathname === '/')}
              {drawerNavLink('/login', t('nav.login'), <NavIcons.profile className="h-5 w-5" />, pathname === '/login')}
              {ALLOW_PUBLIC_SIGNUP || DEMO_MODE
                ? drawerNavLink(
                    '/signup',
                    t('nav.signup'),
                    <NavIcons.certificates className="h-5 w-5" />,
                    pathname === '/signup',
                  )
                : null}
            </>
          ) : (
            <>
              {isAdmin
                ? drawerNavLink(
                    '/admin',
                    t('nav.dashboard'),
                    <NavIcons.settings className="h-5 w-5" />,
                    inAdmin,
                  )
                : null}
              <button
                type="button"
                className="tap-44 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--color-expired)] hover:bg-[var(--color-danger-soft)]"
                onClick={() => {
                  setDrawerOpen(false);
                  void logout();
                }}
              >
                <NavIcons.logout className="h-5 w-5 shrink-0" />
                {t('nav.logout')}
              </button>
            </>
          )}
        </div>
      </MobileDrawer>
    </>
  );
}
