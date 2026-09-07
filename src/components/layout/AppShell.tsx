'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { PublicHeader } from '@/components/landing/PublicHeader';

export function isPublicDronePage(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/u' || pathname.startsWith('/u/');
}

function isLandingPage(pathname: string | null): boolean {
  return pathname === '/';
}

function isPublicMarketingPage(pathname: string | null): boolean {
  return pathname === '/pricing' || pathname === '/checkout' || pathname?.startsWith('/checkout/') === true;
}

function isConsumerAuthPage(pathname: string | null): boolean {
  return pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
}

/** Draft privacy / terms / cookies notices — must render while logged out. */
function isLegalPage(pathname: string | null): boolean {
  return pathname === '/privacy' || pathname === '/terms' || pathname === '/cookies';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicDrone = isPublicDronePage(pathname);
  const landing = isLandingPage(pathname);
  const marketing = isPublicMarketingPage(pathname);
  const consumerAuth = isConsumerAuthPage(pathname);
  const legal = isLegalPage(pathname);
  const usePublicChrome = landing || consumerAuth || marketing || legal;

  return (
    <>
      {!publicDrone ? (usePublicChrome ? <PublicHeader /> : <Navbar />) : null}
      <main className={publicDrone ? 'min-h-dvh overflow-x-safe' : 'min-h-dvh overflow-x-safe pt-header'}>
        {children}
      </main>
    </>
  );
}
