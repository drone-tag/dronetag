'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
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

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'it';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(raw)) return raw;
  } catch {
    /* ignore */
  }
  return 'it';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('it');

  useEffect(() => {
    const stored = readStoredLanguage();
    setLanguageState(stored);
    document.documentElement.lang = stored;
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
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
