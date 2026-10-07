'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/firebase/auth';
import { DEMO_MODE } from '@/lib/firebase/config';
import { DEMO_PERSONA_EVENT, getDemoPersona } from '@/lib/demo/personas';
import { tokenExpiry } from '@/lib/auth/sessionCookieNames';

const TOKEN_COOKIE = '__dronetag_idt';
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

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
  // Never longer than the token itself stays valid.
  const exp = tokenExpiry(token);
  const remaining = exp ? exp - Math.floor(Date.now() / 1000) : 55 * 60;
  const maxAge = Math.max(60, Math.min(55 * 60, remaining));
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${maxAge}; SameSite=Strict${secure}`;
}

function hasIdTokenCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${TOKEN_COOKIE}=`));
}

let lastPostedSessionToken: string | null = null;

async function postSessionCookie(token: string): Promise<void> {
  if (DEMO_MODE) return;
  if (token === lastPostedSessionToken) return;
  lastPostedSessionToken = token;
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
    lastPostedSessionToken = null;
  }
}

async function clearSessionCookie(): Promise<void> {
  if (DEMO_MODE) return;
  lastPostedSessionToken = null;
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
        const hadSession = hasIdTokenCookie() || lastPostedSessionToken !== null;
        setIsAdmin(false);
        setIdTokenCookie(null);
        if (hadSession) void clearSessionCookie();
        setClaimsReady(true);
        return;
      }

      if (DEMO_MODE) {
        setIsAdmin(getDemoPersona().isAdmin);
        setIdTokenCookie(null);
        setClaimsReady(true);
        return;
      }

      const tokenResult = await u.getIdTokenResult(forceRefresh);
      if (cancelled) return;
      setIsAdmin(tokenResult.claims.admin === true);
      setIdTokenCookie(tokenResult.token);
      setClaimsReady(true);
      // The JS-readable cookie set above already satisfies the proxy and the
      // admin layout; the HttpOnly copy is defence in depth, so it is only
      // refreshed alongside a freshly minted token.
      if (forceRefresh) void postSessionCookie(tokenResult.token);
    }

    let currentUid: string | null = null;
    let settled = false;

    const unsubscribe = onAuthChange((u) => {
      const isNewIdentity = (u?.uid ?? null) !== currentUid;
      currentUid = u?.uid ?? null;
      setUser(u);
      // Claims belong to an identity: never let a previous user's admin flag
      // (or "ready" state) leak into the next sign-in on the same tab.
      if (u && isNewIdentity && !DEMO_MODE) {
        setIsAdmin(false);
        setClaimsReady(false);
      }
      void (async () => {
        try {
          await applyClaims(u, false);
          if (u && isNewIdentity && !DEMO_MODE) {
            void applyClaims(u, true).catch(() => undefined);
          }
        } catch (err) {
          console.warn('[auth] claims apply failed', err);
          if (!cancelled) setClaimsReady(true);
        } finally {
          settled = true;
          if (!cancelled) setLoading(false);
        }
      })();
    });

    // Safety net for a stalled auth bootstrap only; once the first auth event
    // has been processed, later sign-ins must wait for their own claims.
    const loadingTimeout = setTimeout(() => {
      if (!cancelled && !settled) {
        setLoading(false);
        setClaimsReady(true);
      }
    }, 2500);

    let lastRefreshAt = Date.now();
    async function refreshClaims(): Promise<void> {
      if (DEMO_MODE) return;
      const current = (await import('@/lib/firebase/auth')).getCurrentUser?.();
      if (!current) return;
      lastRefreshAt = Date.now();
      try {
        await applyClaims(current, true);
      } catch {
        /* ignore */
      }
    }

    refreshTimerRef.current = setInterval(() => void refreshClaims(), REFRESH_INTERVAL_MS);

    // Background tabs and sleeping laptops skip timer ticks; catch up as soon
    // as the page is visible again so the cookies never go stale under a
    // user who is actively navigating.
    function onVisible() {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastRefreshAt < REFRESH_INTERVAL_MS) return;
      void refreshClaims();
    }
    document.addEventListener('visibilitychange', onVisible);

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
      document.removeEventListener('visibilitychange', onVisible);
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
