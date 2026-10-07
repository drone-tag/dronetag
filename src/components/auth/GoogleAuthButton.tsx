'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { loginWithGoogle } from '@/lib/firebase/auth';
import { ensureAccount } from '@/lib/firebase/account';
import { trackEvent } from '@/lib/analytics';
import { adminFetch } from '@/lib/client/adminApi';
import { splitDisplayName } from '@/lib/client/provisionAccount';
import { Button } from '@/components/ui/Button';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type GoogleAuthButtonProps = {
  disabled?: boolean;
  /** When true, the server records acceptedTermsAt on first provision. */
  acceptedTerms?: boolean;
  /** Called right before the popup opens, e.g. to hold page redirects. */
  onStart?: () => void;
  onError?: (message: string) => void;
  onSuccess?: (result: { isNewUser: boolean }) => void;
  /** Called when the popup was dismissed or sign-in failed. */
  onAbort?: () => void;
};

const SILENT_POPUP_ERRORS = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
]);

export function GoogleAuthButton({
  disabled = false,
  acceptedTerms = false,
  onStart,
  onError,
  onSuccess,
  onAbort,
}: GoogleAuthButtonProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    onStart?.();
    let signedIn = false;
    try {
      const result = await loginWithGoogle();
      signedIn = true;
      const u = result.user;
      if (u) {
        const { firstName, lastName } = splitDisplayName(u.displayName);
        try {
          await ensureAccount(u.uid, u.email ?? '', {
            firstName,
            lastName,
            acceptedTerms,
          });
        } catch (err) {
          // The account gate repairs missing records on the next screen.
          console.warn('[auth] google provisioning deferred', err);
        }
        if (result.isNewUser) {
          void adminFetch('/api/auth/contact-verification/init', {
            method: 'POST',
            body: JSON.stringify({ channels: ['email'] }),
          }).catch(() => undefined);
        }
      }
      trackEvent(result.isNewUser ? 'signup' : 'login');
      onSuccess?.({ isNewUser: result.isNewUser });
    } catch (err) {
      if (signedIn) {
        onSuccess?.({ isNewUser: false });
        return;
      }
      onAbort?.();
      const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
      if (SILENT_POPUP_ERRORS.has(code)) return;
      if (code === 'auth/popup-blocked') {
        onError?.(t('auth.googlePopupBlocked'));
        return;
      }
      onError?.(t('auth.googleError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      fullWidth
      loading={loading}
      disabled={disabled || loading}
      onClick={handleClick}
      className="min-h-[2.75rem] border-[var(--color-border)] bg-[var(--color-card)] font-medium text-[var(--color-text)]"
    >
      {!loading ? <GoogleIcon /> : null}
      {t('auth.google')}
    </Button>
  );
}
