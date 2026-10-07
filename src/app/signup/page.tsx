'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ALLOW_PUBLIC_SIGNUP } from '@/lib/config/features';
import { DEMO_MODE } from '@/lib/firebase/config';
import { signupWithEmail } from '@/lib/firebase/auth';
import { ensureAccount } from '@/lib/firebase/account';
import { trackEvent } from '@/lib/analytics';
import { adminFetch } from '@/lib/client/adminApi';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { AuthOrDivider } from '@/components/auth/AuthOrDivider';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { SignupOtpVerification } from '@/components/auth/SignupOtpVerification';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ContactVerificationChannel } from '@/lib/types/contactVerification';

type SignupStep = 'form' | 'verify';

export default function SignupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<SignupStep>('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [verifyEmail, setVerifyEmail] = useState(true);
  const [verifyPhone, setVerifyPhone] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set while this page is creating the account: the auth state flips to
  // signed-in before the records and the verification step are ready, and
  // the "already signed in" redirect must not cut that flow short.
  const signupInFlightRef = useRef(false);

  const channels: ContactVerificationChannel[] = [
    ...(verifyEmail ? (['email'] as const) : []),
    ...(verifyPhone ? (['phone'] as const) : []),
  ];

  useLayoutEffect(() => {
    if (authLoading) return;
    if (!ALLOW_PUBLIC_SIGNUP && !DEMO_MODE) {
      router.replace('/login');
      return;
    }
    if (user && step !== 'verify' && !signupInFlightRef.current) {
      router.replace('/account');
    }
  }, [user, authLoading, router, step]);

  useEffect(() => {
    if (authLoading || !user) return;
    router.prefetch('/account');
  }, [user, authLoading, router]);

  async function initVerification(ch: ContactVerificationChannel[], phoneNumber: string) {
    const res = await adminFetch('/api/auth/contact-verification/init', {
      method: 'POST',
      body: JSON.stringify({ channels: ch, phone: phoneNumber }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(body.error || 'init failed');
  }

  function signupErrorMessage(err: unknown): string {
    const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
    const message = err instanceof Error ? err.message : '';
    if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
      return t('signup.errorEmailInUse');
    }
    if (code === 'auth/invalid-email') return t('signup.errorInvalidEmail');
    if (code === 'auth/weak-password') return t('signup.errorPasswordShort');
    if (code === 'auth/network-request-failed') return t('signup.errorNetwork');
    return t('signup.errorGeneric');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError(t('signup.terms.required'));
      return;
    }
    if (channels.length === 0) {
      setError(t('signup.otp.channelRequired'));
      return;
    }
    if (verifyPhone && !phone.trim()) {
      setError(t('signup.otp.phoneRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('signup.errorPasswordShort'));
      return;
    }
    if (password !== passwordConfirm) {
      setError(t('signup.errorPasswordMismatch'));
      return;
    }

    setSubmitting(true);
    signupInFlightRef.current = true;
    let cred: Awaited<ReturnType<typeof signupWithEmail>>;
    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      cred = await signupWithEmail(email.trim(), password, displayName);
    } catch (err) {
      signupInFlightRef.current = false;
      setError(signupErrorMessage(err));
      setSubmitting(false);
      return;
    }

    // From here on the Firebase user exists. Failures below must not strand
    // the user on this form: the account gate finishes provisioning and the
    // verification step can be retried or skipped.
    const u = cred.user;
    if (u) {
      try {
        await ensureAccount(u.uid, u.email ?? email.trim(), {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          acceptedTerms: true,
        });
      } catch (err) {
        console.warn('[signup] provisioning deferred to the account gate', err);
      }
      try {
        await initVerification(channels, phone.trim());
      } catch (err) {
        console.warn('[signup] contact verification init failed', err);
      }
    }
    trackEvent('signup');
    setStep('verify');
    setSubmitting(false);
  }

  if (user && step === 'verify') {
    return (
      <AuthPageLayout title={t('signup.title')}>
        <SignupOtpVerification
          channels={channels.length > 0 ? channels : ['email']}
          phone={phone}
          onComplete={() => router.replace('/account')}
        />
      </AuthPageLayout>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--app-header-offset))] items-center justify-center bg-[var(--color-app-bg)] px-4">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-action)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <AuthPageLayout
      title={t('signup.title')}
      footer={
        <p className="text-xs text-[var(--color-text-secondary)]">
          {t('signup.haveAccount')}{' '}
          <Link href="/login" className="font-semibold text-[var(--color-action)] hover:underline">
            {t('nav.login')}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            disabled={submitting}
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border)] text-[var(--color-action)] focus:ring-[var(--color-action)]"
          />
          <span>
            {t('signup.terms.prefix')}{' '}
            <Link
              href="/terms"
              target="_blank"
              className="font-medium text-[var(--color-action)] underline underline-offset-2"
            >
              {t('signup.terms.termsLink')}
            </Link>{' '}
            {t('signup.terms.and')}{' '}
            <Link
              href="/privacy"
              target="_blank"
              className="font-medium text-[var(--color-action)] underline underline-offset-2"
            >
              {t('signup.terms.privacyLink')}
            </Link>
            .
          </span>
        </label>

        <GoogleAuthButton
          disabled={submitting || !acceptedTerms}
          acceptedTerms={acceptedTerms}
          onStart={() => {
            setError(null);
            signupInFlightRef.current = true;
          }}
          onAbort={() => {
            signupInFlightRef.current = false;
          }}
          onError={setError}
          // Google addresses arrive verified, so there is nothing to confirm.
          onSuccess={() => router.replace('/account')}
        />
        <p className="text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          {t('signup.terms.googleHint')}
        </p>
        <AuthOrDivider />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            name="firstName"
            label={t('field.firstName')}
            value={firstName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
            disabled={submitting}
          />
          <Input
            name="lastName"
            label={t('field.lastName')}
            value={lastName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
            disabled={submitting}
          />
        </div>
        <Input
          name="email"
          type="email"
          label={t('login.email')}
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={submitting}
        />
        <Input
          name="phone"
          label={t('field.phone')}
          value={phone}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
          required={verifyPhone}
          autoComplete="tel"
          disabled={submitting}
          placeholder="+39 333 1234567"
        />

        <fieldset className="space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] p-4">
          <legend className="px-1 text-sm font-medium text-[var(--color-text)]">
            {t('signup.otp.chooseChannels')}
          </legend>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={verifyEmail}
              onChange={(e) => setVerifyEmail(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-action)]"
            />
            {t('signup.otp.verifyEmailOption')}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={verifyPhone}
              onChange={(e) => setVerifyPhone(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-action)]"
            />
            {t('signup.otp.verifyPhoneOption')}
          </label>
          <p className="text-xs text-[var(--color-text-secondary)]">{t('signup.otp.channelHint')}</p>
        </fieldset>

        <Input
          name="password"
          type="password"
          label={t('login.password')}
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={submitting}
        />
        <Input
          name="passwordConfirm"
          type="password"
          label={t('signup.passwordConfirm')}
          value={passwordConfirm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordConfirm(e.target.value)}
          required
          autoComplete="new-password"
          disabled={submitting}
        />

        {error ? (
          <div className="flex items-start gap-2 rounded-lg bg-[var(--tone-danger-bg)] px-3 py-2.5" role="alert">
            <p className="text-sm text-[var(--tone-danger-fg)]">{error}</p>
          </div>
        ) : null}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={submitting}
          disabled={submitting || !acceptedTerms}
          className="min-h-[2.75rem]"
        >
          {t('signup.submit')}
        </Button>
      </form>
    </AuthPageLayout>
  );
}
