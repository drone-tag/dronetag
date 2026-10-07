'use client';

/**
 * Root-layout error boundary (STAGING-OPS-1).
 *
 * Required by Next.js to render a fallback when the root `layout.tsx`
 * itself throws — at that point the providers haven't mounted, so we
 * deliberately render the bare minimum: HTML + body + a static panel.
 * This document does not inherit the root layout, so it imports the
 * global stylesheet itself and reads theme/language straight from
 * localStorage instead of the (unmounted) contexts.
 */

import './globals.css';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/Button';

const COPY = {
  it: {
    title: 'Si è verificato un problema nel caricamento di DroneTag.',
    body: 'La pagina non è stata caricata correttamente. Riprova oppure torna alla home.',
    retry: 'Riprova',
    home: 'Vai alla home',
  },
  en: {
    title: 'Something went wrong loading DroneTag.',
    body: 'The page failed to render. Please try again, or go back to the home page.',
    retry: 'Try again',
    home: 'Go to home page',
  },
} as const;

type Prefs = { lang: keyof typeof COPY; theme: 'light' | 'dark' };

const SERVER_PREFS = 'it|light';

function readPrefs(): string {
  try {
    const lang = localStorage.getItem('dronetag-language') === 'en' ? 'en' : 'it';
    const stored = localStorage.getItem('dronetag-theme');
    const dark =
      stored === 'dark' ||
      (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return `${lang}|${dark ? 'dark' : 'light'}`;
  } catch {
    return SERVER_PREFS;
  }
}

const noopSubscribe = () => () => {};

export default function GlobalError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}) {
  const [lang, theme] = useSyncExternalStore(noopSubscribe, readPrefs, () => SERVER_PREFS).split('|') as [
    Prefs['lang'],
    Prefs['theme'],
  ];
  const copy = COPY[lang];

  return (
    <html lang={lang} data-theme={theme} style={{ colorScheme: theme }}>
      <body className="bg-[var(--color-app-bg)] text-[var(--color-text)] antialiased">
        <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-6 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)]">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[var(--color-text)]">{copy.title}</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{copy.body}</p>
          {error.digest ? (
            <p className="mt-3 font-mono text-[11px] text-[var(--color-text-secondary)] opacity-70">
              digest: {error.digest}
            </p>
          ) : null}
          <div className="mt-6 flex w-full flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
            <Button onClick={unstable_retry ?? reset} className="tap-44">
              {copy.retry}
            </Button>
            <Button href="/" variant="secondary" className="tap-44">
              {copy.home}
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
