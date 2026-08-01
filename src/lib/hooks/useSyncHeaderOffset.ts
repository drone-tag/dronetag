'use client';

import { type RefObject, useEffect } from 'react';

const OFFSET_VAR = '--app-header-offset';

/**
 * Keeps --app-header-offset in sync with the fixed header's real height
 * (row + optional demo banner + safe-area padding), including wrap on narrow screens.
 */
export function useSyncHeaderOffset(headerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const sync = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty(OFFSET_VAR, `${height}px`);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
      document.documentElement.style.removeProperty(OFFSET_VAR);
    };
  }, [headerRef]);
}
