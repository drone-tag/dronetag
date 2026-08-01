'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/firebase/auth';
import { DEMO_MODE } from '@/lib/firebase/config';
import { DEMO_PERSONA_EVENT, getDemoPersona } from '@/lib/demo/personas';

const TOKEN_COOKIE = '__dronetag_idt';
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

function setIdTokenCookie(token: string | null): void {
  if (typeof document === 'undefined') return;
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : '';
  if (!token) {
    document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Strict${secure}`;
    return;
  }
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${55 * 60}; SameSite=Strict${secure}`;
}

async function postSessionCookie(token: string): Promise<void> {
  if (DEMO_MODE) return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    await fetch('/api/session', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    /* best-effort */
  }
}

async function clearSessionCookie(): Promise<void> {
  if (DEMO_MODE) return;
  try {
    await fetch('/api/session', { method: 'DELETE', credentials: 'same-origin' });
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claimsReady, setClaimsReady] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function applyClaims(u: User | null, forceRefresh = false): Promise<void> {
      if (!u) {
        setIsAdmin(false);
        setIdTokenCookie(null);
        void clearSessionCookie();
        setClaimsReady(true);
        return;
      }

      if (DEMO_MODE) {
        setIsAdmin(getDemoPersona().isAdmin);
        setIdTokenCookie(null);
        setClaimsReady(true);
        return;
      }

      const token = await u.getIdToken(forceRefresh);
      const tokenResult = await u.getIdTokenResult(forceRefresh);
      if (cancelled) return;
      setIsAdmin(tokenResult.claims.admin === true);
      setIdTokenCookie(token);
      void postSessionCookie(token);
      setClaimsReady(true);
    }

    let initialAuthEvent = true;

    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      void (async () => {
        try {
          await applyClaims(u, false);
          if (u && initialAuthEvent && !DEMO_MODE) {
            initialAuthEvent = false;
            void applyClaims(u, true).catch(() => undefined);
          }
        } catch (err) {
          console.warn('[auth] claims apply failed', err);
          if (!cancelled) setClaimsReady(true);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    });

    const loadingTimeout = setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
        setClaimsReady(true);
      }
    }, 2500);

    refreshTimerRef.current = setInterval(async () => {
      if (DEMO_MODE) return;
      const current = (await import('@/lib/firebase/auth')).getCurrentUser?.();
      if (!current) return;
      try {
        await applyClaims(current, true);
      } catch {
        /* ignore */
      }
    }, REFRESH_INTERVAL_MS);

    function onPersonaChange() {
      if (!DEMO_MODE) return;
      window.location.assign(getDemoPersona().isAdmin ? '/admin' : '/account');
    }
    window.addEventListener(DEMO_PERSONA_EVENT, onPersonaChange);

    return () => {
      cancelled = true;
      clearTimeout(loadingTimeout);
      unsubscribe();
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      window.removeEventListener(DEMO_PERSONA_EVENT, onPersonaChange);
    };
  }, []);

  const resolvedAdmin = DEMO_MODE ? getDemoPersona().isAdmin : isAdmin;
  const resolvedLoading = loading || (Boolean(user) && !claimsReady && !DEMO_MODE);

  return (
    <AuthContext.Provider
      value={{ user, loading: resolvedLoading, isAdmin: resolvedAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
