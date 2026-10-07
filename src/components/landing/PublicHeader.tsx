'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logout } from '@/lib/firebase/auth';
import { DEMO_MODE } from '@/lib/firebase/config';
import { ALLOW_PUBLIC_SIGNUP } from '@/lib/config/features';
import { LANGUAGES, type Language } from '@/lib/types';
import { classNames } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { userInitials, useLandingAuth } from '@/components/landing/landingAuth';
import { DemoPersonaSwitcher } from '@/components/demo/DemoPersonaSwitcher';
import { useSyncHeaderOffset } from '@/lib/hooks/useSyncHeaderOffset';

export function PublicHeader() {
  const { user, loading: authLoading } = useAuth();
  const { dashboardHref } = useLandingAuth();
  const { language, setLanguage, t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const displayName = user?.displayName ?? user?.email ?? '';
  const showSignup = ALLOW_PUBLIC_SIGNUP || DEMO_MODE;

  useSyncHeaderOffset(headerRef);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <>
      <header
        ref={headerRef}
        className={classNames(
          'safe-pt fixed top-0 right-0 left-0 z-50 border-b transition-[background,box-shadow,border-color] duration-200',
          scrolled
            ? 'surface-header shadow-sm backdrop-blur-md'
            : 'border-transparent bg-[var(--color-header-bg)] backdrop-blur-sm',
        )}
      >
        {DEMO_MODE ? (
          <div className="flex flex-wrap items-center justify-center gap-3 bg-[var(--color-expiring)] px-4 py-1.5 text-center text-xs font-medium text-white">
            <span>{t('demo.banner')}</span>
            <DemoPersonaSwitcher compact />
          </div>
        ) : null}
        <div className="mx-auto flex h-[var(--header-height)] max-w-[72rem] items-center justify-between gap-2 px-4 sm:gap-3 sm:px-5 lg:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="inline-flex overflow-hidden rounded-lg">
              <Image
                src="/logo-mark.webp"
                alt="DroneTag"
                width={192}
                height={192}
                className="h-7 w-7 sm:h-8 sm:w-8"
                priority
                unoptimized
              />
            </span>
            <span className="text-sm font-bold text-[var(--color-navy)]">DroneTag</span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/pricing"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
            >
              {t('nav.pricing')}
            </Link>
            <label htmlFor="landing-language" className="sr-only">
              {t('common.language')}
            </label>
            <select
              id="landing-language"
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

            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="tap-44 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-solid)] text-xs font-bold text-[var(--color-on-brand)]"
                  aria-label={t('home.nav.openDashboard')}
                >
                  {userInitials(displayName)}
                </Link>
                <Button href={dashboardHref} variant="primary" size="sm">
                  {t('home.nav.openDashboard')}
                </Button>
              </>
            ) : authLoading ? null : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                >
                  {t('nav.login')}
                </Link>
                {showSignup ? (
                  <Link
                    href="/signup"
                    className="rounded-lg bg-[var(--color-brand-solid)] px-3 py-2 text-sm font-semibold text-[var(--color-on-brand)] hover:opacity-90"
                  >
                    {t('nav.signup')}
                  </Link>
                ) : null}
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            {user ? (
              <Link
                href={dashboardHref}
                className="tap-44 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-solid)] text-xs font-bold text-[var(--color-on-brand)]"
                aria-label={t('home.nav.openDashboard')}
              >
                {userInitials(displayName)}
              </Link>
            ) : null}
            <button
              type="button"
              className="tap-44 inline-flex items-center justify-center rounded-xl p-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
              aria-expanded={drawerOpen}
              aria-controls="landing-mobile-drawer"
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

      <MobileDrawer isOpen={drawerOpen} onClose={closeDrawer} title="DroneTag">
        <div className="flex flex-col gap-1 p-3" id="landing-mobile-drawer">
          <Link
            href="/pricing"
            onClick={closeDrawer}
            className="tap-44 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-hover)]"
          >
            {t('nav.pricing')}
          </Link>
          <div className="mb-2 px-3">
            <label htmlFor="landing-language-mobile" className="sr-only">
              {t('common.language')}
            </label>
            <select
              id="landing-language-mobile"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="tap-44 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-base text-[var(--color-text)]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="tap-44 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--color-action)]"
                onClick={closeDrawer}
              >
                {t('home.nav.openDashboard')}
              </Link>
              <button
                type="button"
                className="tap-44 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--color-expired)] hover:bg-[var(--color-danger-soft)]"
                onClick={() => {
                  closeDrawer();
                  void logout();
                }}
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="tap-44 rounded-xl px-3 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-hover)]"
                onClick={closeDrawer}
              >
                {t('nav.login')}
              </Link>
              {showSignup ? (
                <Link
                  href="/signup"
                  className="tap-44 rounded-xl bg-[var(--color-brand-solid)] px-3 py-3 text-center text-sm font-semibold text-[var(--color-on-brand)]"
                  onClick={closeDrawer}
                >
                  {t('nav.signup')}
                </Link>
              ) : null}
            </>
          )}
        </div>
      </MobileDrawer>
    </>
  );
}
