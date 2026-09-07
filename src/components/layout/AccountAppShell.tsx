'use client';

import { type ReactNode } from 'react';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/layout/MobileBottomNavigation';

export function AccountAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh overflow-x-safe bg-[var(--color-app-bg)] pb-bottom-nav md:pb-0">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pt-3 pb-3 sm:px-6 sm:pt-4 sm:pb-4 lg:pt-6 lg:pb-6">
        <DesktopSidebar />
        <div className="min-w-0 flex-1 overflow-x-safe pt-0.5">{children}</div>
      </div>
      <MobileBottomNavigation />
    </div>
  );
}
