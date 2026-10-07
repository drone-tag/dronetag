'use client';

import { useEffect, useRef, useState } from 'react';
import type { ConfirmationResult } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { adminFetch } from '@/lib/client/adminApi';
import { getAccount } from '@/lib/firebase/account';
import { DEMO_MODE } from '@/lib/firebase/config';
import {
  clearPhoneRecaptcha,
  confirmPhoneOtp,
  startPhoneOtp,
  toE164Phone,
} from '@/lib/firebase/phoneAuth';
import type { ContactVerificationChannel } from '@/lib/types/contactVerification';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type SignupOtpVerificationProps = {
  channels: ContactVerificationChannel[];
  phone: string;
  onComplete: () => void;
};

/**
 * Optional contact confirmation shown right after signup.
 *
 * Verification is never a hard gate: the account is fully usable without
 * it, so a delivery problem (email provider down, SMS quota) must not lock
 * a new user out. The email code is sent automatically on arrival and the
 * user moves on by themselves as soon as every chosen channel is confirmed.
 */
export function SignupOtpVerification({ channels, phone, onComplete }: SignupOtpVerificationProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const autoSentRef = useRef(false);
  const completedRef = useRef(false);

  const wantsEmail = channels.includes('email');
  const wantsPhone = channels.includes('phone');

  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [phoneStarted, setPhoneStarted] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [devEmailCode, setDevEmailCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const phoneConfirmationRef = useRef<ConfirmationResult | null>(null);

  const phoneE164 = toE164Phone(phone);

  useEffect(() => {
    if (DEMO_MODE) {
      setEmailVerified(true);
      setPhoneVerified(true);
      setStatusLoaded(true);
      return;
    }
    if (!user) return;
    if (user.emailVerified) setEmailVerified(true);
    let cancelled = false;
    void getAccount(user.uid)
      .then((account) => {
        if (cancelled) return;
        if (account?.contactVerification?.emailVerifiedAt) setEmailVerified(true);
        if (account?.contactVerification?.phoneVerifiedAt) setPhoneVerified(true);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setStatusLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => () => clearPhoneRecaptcha(), []);

  const emailDone = !wantsEmail || emailVerified;
  const phoneDone = !wantsPhone || phoneVerified;
  const canFinish = emailDone && phoneDone;

  useEffect(() => {
    if (!statusLoaded || !canFinish || completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [statusLoaded, canFinish, onComplete]);

  async function sendEmailOtp() {
    setError(null);
    setBusy('email-send');
    try {
      const res = await adminFetch('/api/auth/otp/email/send', { method: 'POST' });
      const body = (await res.json().catch(() => ({}))) as { devCode?: string; error?: string };
      if (res.status === 429) {
        // A code from a moment ago is still valid; let the user type it.
        setEmailSent(true);
        setError(t('signup.otp.errorCooldown'));
        return;
      }
      if (res.status === 503) {
        setError(t('signup.otp.errorDelivery'));
        return;
      }
      if (!res.ok) throw new Error(body.error || 'send failed');
      setEmailSent(true);
      if (body.devCode) setDevEmailCode(body.devCode);
    } catch {
      setError(t('signup.otp.errorSend'));
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    if (!statusLoaded || !wantsEmail || emailVerified || autoSentRef.current) return;
    autoSentRef.current = true;
    void sendEmailOtp();
    // sendEmailOtp only touches state setters and stable helpers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusLoaded, wantsEmail, emailVerified]);

  async function verifyEmailOtp() {
    setError(null);
    setBusy('email-verify');
    try {
      const res = await adminFetch('/api/auth/otp/email/verify', {
        method: 'POST',
        body: JSON.stringify({ code: emailCode }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error || 'verify failed');
      setEmailVerified(true);
    } catch {
      setError(t('signup.otp.errorCode'));
    } finally {
      setBusy(null);
    }
  }

  async function sendPhoneOtp() {
    if (!recaptchaRef.current) return;
    setError(null);
    setBusy('phone-send');
    try {
      recaptchaRef.current.id = recaptchaRef.current.id || 'signup-phone-recaptcha';
      phoneConfirmationRef.current = await startPhoneOtp(phoneE164, recaptchaRef.current.id);
      setPhoneStarted(true);
    } catch (err) {
      const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
      setError(code === 'auth/invalid-phone-number' ? t('signup.otp.errorPhone') : t('signup.otp.errorSend'));
    } finally {
      setBusy(null);
    }
  }

  async function verifyPhoneOtp() {
    if (!phoneConfirmationRef.current) return;
    setError(null);
    setBusy('phone-verify');
    try {
      await confirmPhoneOtp(phoneConfirmationRef.current, phoneCode);
      const res = await adminFetch('/api/auth/contact-verification/phone', {
        method: 'POST',
        body: JSON.stringify({ phone: phoneE164 }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error || 'record failed');
      setPhoneVerified(true);
    } catch {
      setError(t('signup.otp.errorCode'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[var(--color-navy)]">{t('signup.otp.title')}</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t('signup.otp.subtitle')}</p>
      </div>

      {wantsEmail ? (
        <section className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] p-4">
          <p className="text-sm font-medium text-[var(--color-text)]">{t('signup.otp.emailSection')}</p>
          <p className="break-all text-xs text-[var(--color-text-secondary)]">
            {emailSent && user?.email ? t('signup.otp.sentTo', { email: user.email }) : user?.email}
          </p>
          {!emailVerified ? (
            <>
              {emailSent ? (
                <form
                  className="flex items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (emailCode.length === 6 && !busy) void verifyEmailOtp();
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <Input
                      name="emailOtp"
                      label={t('signup.otp.codeLabel')}
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      disabled={Boolean(busy)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="min-h-[50px] shrink-0 sm:min-h-[42px]"
                    loading={busy === 'email-verify'}
                    disabled={emailCode.length !== 6 || Boolean(busy)}
                  >
                    {t('signup.otp.verify')}
                  </Button>
                </form>
              ) : null}
              <Button
                type="button"
                variant={emailSent ? 'ghost' : 'secondary'}
                fullWidth
                loading={busy === 'email-send'}
                disabled={Boolean(busy)}
                onClick={() => void sendEmailOtp()}
              >
                {emailSent ? t('signup.otp.resend') : t('signup.otp.sendEmail')}
              </Button>
              {devEmailCode ? (
                <p className="text-xs text-[var(--tone-warning-fg)]">{t('signup.otp.devCode', { code: devEmailCode })}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm font-medium text-[var(--tone-success-fg)]">{t('signup.otp.verified')}</p>
          )}
        </section>
      ) : null}

      {wantsPhone ? (
        <section className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] p-4">
          <p className="text-sm font-medium text-[var(--color-text)]">{t('signup.otp.phoneSection')}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{phoneE164}</p>
          {!phoneVerified ? (
            <>
              {phoneStarted ? (
                <form
                  className="flex items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (phoneCode.length === 6 && !busy) void verifyPhoneOtp();
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <Input
                      name="phoneOtp"
                      label={t('signup.otp.codeLabel')}
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      disabled={Boolean(busy)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="min-h-[50px] shrink-0 sm:min-h-[42px]"
                    loading={busy === 'phone-verify'}
                    disabled={phoneCode.length !== 6 || Boolean(busy)}
                  >
                    {t('signup.otp.verify')}
                  </Button>
                </form>
              ) : null}
              <Button
                type="button"
                variant={phoneStarted ? 'ghost' : 'secondary'}
                fullWidth
                loading={busy === 'phone-send'}
                disabled={Boolean(busy)}
                onClick={() => void sendPhoneOtp()}
              >
                {phoneStarted ? t('signup.otp.resend') : t('signup.otp.sendPhone')}
              </Button>
            </>
          ) : (
            <p className="text-sm font-medium text-[var(--tone-success-fg)]">{t('signup.otp.verified')}</p>
          )}
        </section>
      ) : null}

      <div ref={recaptchaRef} id="signup-phone-recaptcha" className="hidden" aria-hidden />

      {error ? (
        <div className="rounded-lg bg-[var(--tone-danger-bg)] px-3 py-2.5 text-sm text-[var(--tone-danger-fg)]" role="alert">
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <Button
          type="button"
          fullWidth
          size="lg"
          className="min-h-[2.75rem]"
          disabled={!canFinish || Boolean(busy)}
          onClick={() => onComplete()}
        >
          {t('signup.otp.continue')}
        </Button>
        {!canFinish ? (
          <Button
            type="button"
            variant="ghost"
            fullWidth
            disabled={Boolean(busy)}
            onClick={() => onComplete()}
          >
            {t('signup.otp.skip')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
