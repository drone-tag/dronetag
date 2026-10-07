'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { adminFetch } from '@/lib/client/adminApi';
import { DEMO_MODE } from '@/lib/firebase/config';

const SYNCED_KEY = 'dronetag-language-synced';

/**
 * Copies the interface language onto the signed-in user's profile, so emails
 * reach them in the language they use. Sent once per user and language.
 */
export function LanguagePreferenceSync() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    if (DEMO_MODE || loading || !user) return;
    const marker = `${user.uid}:${language}`;
    try {
      if (localStorage.getItem(SYNCED_KEY) === marker) return;
    } catch {
      // Storage unavailable (private mode): sync anyway, it is idempotent.
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void adminFetch('/api/account/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ language }),
      })
        .then(async (res) => {
          const body = (await res.json().catch(() => ({}))) as { ok?: boolean };
          if (cancelled || !res.ok || !body.ok) return;
          try {
            localStorage.setItem(SYNCED_KEY, marker);
          } catch {
            // Nothing to remember it in; the next visit sends it again.
          }
        })
        .catch(() => undefined);
    }, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [user, loading, language]);

  return null;
}
