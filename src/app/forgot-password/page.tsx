'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';

import { useLanguage } from '@/contexts/LanguageContext';
import { sendPasswordReset } from '@/lib/firebase/auth';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Password reset request.
 *
 * There was no way to recover an account before this page existed: a user who
 * forgot their password was simply locked out, with no self-service path and
 * no support channel that worked either.
 *
 * The response is deliberately identical whether or not the address is
 * registered. Telling the user "no account with that email" would turn this
 * form into an account-existence oracle, which is exactly the kind of
 * enumeration the rest of the auth surface tries to avoid.
 */
export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t('forgot.error.invalidEmail'));
      return;
    }

    setSubmitting(true);
    try {
      await sendPasswordReset(trimmed);
      setSent(true);
    } catch {
      // sendPasswordReset already swallows "user not found" so a failure here
      // is a genuine transport or configuration problem, not a missing account.
      setError(t('forgot.error.generic'));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthPageLayout
        title={t('forgot.sent.title')}
        subtitle={t('forgot.sent.body')}
        footer={
          <Link
            href="/login"
            className="text-xs font-semibold text-[var(--color-action)] hover:underline"
          >
            {t('forgot.backToLogin')}
          </Link>
        }
      >
        <div
          className="rounded-lg bg-[var(--tone-success-bg)] px-4 py-3"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-[var(--tone-success-fg)]">{t('forgot.sent.body')}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          fullWidth
          className="mt-4 min-h-[2.75rem]"
          onClick={() => setSent(false)}
        >
          {t('forgot.sent.resend')}
        </Button>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title={t('forgot.title')}
      subtitle={t('forgot.subtitle')}
      footer={
        <Link
          href="/login"
          className="text-xs font-semibold text-[var(--color-action)] hover:underline"
        >
          {t('forgot.backToLogin')}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          name="email"
          type="email"
          label={t('forgot.email')}
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
          disabled={submitting}
        />
        {error ? (
          <div
            className="flex items-start gap-2 rounded-lg bg-[var(--tone-danger-bg)] px-3 py-2.5"
            role="alert"
          >
            <p className="text-sm text-[var(--tone-danger-fg)]">{error}</p>
          </div>
        ) : null}
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={submitting}
          disabled={submitting}
          className="min-h-[2.75rem]"
        >
          {submitting ? t('forgot.sending') : t('forgot.submit')}
        </Button>
      </form>
    </AuthPageLayout>
  );
}
