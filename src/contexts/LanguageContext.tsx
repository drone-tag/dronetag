'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { t as translate } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

const STORAGE_KEY = 'dronetag-language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'it',
  setLanguage: () => {},
  t: (key) => key,
});

function isLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'it' || value === 'de' || value === 'es' || value === 'fr';
}

const DEFAULT_LANGUAGE: Language = 'it';

// The selected language lives in localStorage, which React reaches through
// `useSyncExternalStore` rather than through an effect that copies it into
// state after mount. `cached` holds the value so the snapshot is a cheap read
// — it is consulted on every render — and so an explicit choice still applies
// when localStorage refuses the write, as it does in private browsing.
const listeners = new Set<() => void>();
let cached: Language | null = null;

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  if (cached !== null) return cached;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(raw)) return (cached = raw);
  } catch {
    /* ignore */
  }
  return (cached = DEFAULT_LANGUAGE);
}

// Rendered on the server and again on the client's hydrating pass, so both
// agree on the markup; React then re-reads the stored value.
function getServerSnapshot(): Language {
  return DEFAULT_LANGUAGE;
}

function writeLanguage(lang: Language): void {
  cached = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  for (const listener of listeners) listener();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, readStoredLanguage, getServerSnapshot);

  // The `lang` attribute is state held outside React, so it is synchronised
  // here rather than written from the setter — this way it also tracks the
  // post-hydration read, which is when the stored language first arrives.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    writeLanguage(lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(key, language, params),
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
