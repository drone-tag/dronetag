'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'dronetag-theme';

type ThemeContextType = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (value: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  preference: 'system',
  resolved: 'light',
  setPreference: () => {},
});

const DEFAULT_PREFERENCE: ThemePreference = 'system';

// Two things outside React decide the theme: the stored preference and, when
// that preference is 'system', the OS setting. Both are exposed as
// `useSyncExternalStore` sources, which leaves `resolved` a plain derivation
// and removes the `ready` flag the old code needed to keep the media-query
// listener from running before the stored value had been read.
const preferenceListeners = new Set<() => void>();
let cachedPreference: ThemePreference | null = null;

function subscribePreference(onStoreChange: () => void): () => void {
  preferenceListeners.add(onStoreChange);
  return () => {
    preferenceListeners.delete(onStoreChange);
  };
}

function readStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCE;
  if (cachedPreference !== null) return cachedPreference;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return (cachedPreference = raw);
  } catch {
    /* ignore */
  }
  return (cachedPreference = DEFAULT_PREFERENCE);
}

function getPreferenceServerSnapshot(): ThemePreference {
  return DEFAULT_PREFERENCE;
}

function writePreference(value: ThemePreference): void {
  cachedPreference = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
  for (const listener of preferenceListeners) listener();
}

let darkQuery: MediaQueryList | null = null;

function systemDarkQuery(): MediaQueryList {
  darkQuery ??= window.matchMedia('(prefers-color-scheme: dark)');
  return darkQuery;
}

function subscribeSystemDark(onStoreChange: () => void): () => void {
  const mq = systemDarkQuery();
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getSystemDark(): boolean {
  return systemDarkQuery().matches;
}

// 'light' is what the server markup assumes, so the hydrating pass has to
// assume it too; the real OS value is picked up immediately afterwards.
function getSystemDarkServerSnapshot(): boolean {
  return false;
}

function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useSyncExternalStore(
    subscribePreference,
    readStoredPreference,
    getPreferenceServerSnapshot,
  );
  const systemDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDark,
    getSystemDarkServerSnapshot,
  );

  const resolved: ResolvedTheme =
    preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  // `data-theme` and `color-scheme` live on the document, so writing them from
  // an effect covers the stored value arriving, an explicit choice and an OS
  // change through one path instead of three.
  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  const setPreference = useCallback((value: ThemePreference) => {
    writePreference(value);
  }, []);

  // Memoised because the provider now also re-renders when the OS theme flips
  // while the preference is an explicit 'light' or 'dark' — a case where
  // nothing consumers can see has actually changed.
  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
