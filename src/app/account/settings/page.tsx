'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme, type ThemePreference } from '@/contexts/ThemeContext';
import { LANGUAGES, type Language } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { classNames } from '@/lib/utils';
import { NavIcons } from '@/components/layout/navIcons';

const THEME_OPTIONS: { value: ThemePreference; labelKey: string }[] = [
  { value: 'light', labelKey: 'settings.theme.light' },
  { value: 'dark', labelKey: 'settings.theme.dark' },
  { value: 'system', labelKey: 'settings.theme.system' },
];

export default function AccountSettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { preference, setPreference } = useTheme();

  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text)] sm:text-2xl">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t('settings.subtitle')}
        </p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          {t('settings.appearance')}
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {t('settings.theme.hint')}
        </p>
        <div
          className="mt-4 grid grid-cols-3 gap-2"
          role="radiogroup"
          aria-label={t('settings.theme')}
        >
          {THEME_OPTIONS.map((option) => {
            const active = preference === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPreference(option.value)}
                className={classNames(
                  'tap-44 rounded-xl border px-3 py-3 text-center text-sm font-medium transition-colors',
                  active
                    ? 'border-[var(--color-action)] bg-[var(--color-action-light)] text-[var(--color-action)]'
                    : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]',
                )}
              >
                {t(option.labelKey)}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          {t('settings.language')}
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {t('settings.language.hint')}
        </p>
        <label htmlFor="settings-language" className="sr-only">
          {t('settings.language')}
        </label>
        <select
          id="settings-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="tap-44 mt-4 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-action)] focus:ring-2 focus:ring-[var(--color-action)]/20"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </Card>

      <Card padding="none">
        <div className="border-b border-[var(--color-border)] px-4 py-3 sm:px-6">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            {t('settings.account')}
          </h2>
        </div>
        <Link
          href="/account/profile"
          className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[var(--color-hover)] sm:px-6"
        >
          <NavIcons.profile className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)]" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-[var(--color-text)]">
              {t('settings.profile')}
            </span>
            <span className="block text-xs text-[var(--color-text-secondary)]">
              {t('settings.profile.hint')}
            </span>
          </span>
          <span className="text-[var(--color-text-secondary)]" aria-hidden>
            →
          </span>
        </Link>
        <Link
          href="/account/billing"
          className="flex items-center gap-3 border-t border-[var(--color-border)] px-4 py-4 transition-colors hover:bg-[var(--color-hover)] sm:px-6"
        >
          <NavIcons.billing className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)]" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-[var(--color-text)]">
              {t('settings.billing')}
            </span>
            <span className="block text-xs text-[var(--color-text-secondary)]">
              {t('settings.billing.hint')}
            </span>
          </span>
          <span className="text-[var(--color-text-secondary)]" aria-hidden>
            →
          </span>
        </Link>
      </Card>
    </div>
  );
}
