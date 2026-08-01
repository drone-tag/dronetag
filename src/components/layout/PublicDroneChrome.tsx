'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES, type Language } from '@/lib/types';

export function PublicDroneChrome({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-dvh bg-[var(--color-app-bg)]">
      <div className="safe-pt sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-header-bg)] backdrop-blur-md">
        <div className="safe-px mx-auto flex max-w-2xl items-center justify-between px-4 py-2.5 sm:px-6">
          <span className="text-xs font-bold tracking-[0.14em] text-[var(--color-text-secondary)] sm:text-[11px] sm:font-semibold">
            DRONETAG
          </span>
          <label className="sr-only" htmlFor="public-lang">
            {t('common.language')}
          </label>
          <select
            id="public-lang"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="tap-44 min-w-[7.5rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-action)] focus:ring-2 focus:ring-[var(--color-action)]/20 sm:min-w-0 sm:px-2 sm:py-1 sm:text-[11px]"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {children}
    </div>
  );
}
