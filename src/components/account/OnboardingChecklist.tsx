'use client';

/**
 * "Complete your DroneTag profile" — a derived, non-blocking checklist.
 *
 * A new account previously landed on a dashboard of empty sections with no
 * indication of what to do first, or of the fact that the steps depend on each
 * other: a drone cannot be published without an operator, and a public profile
 * is not worth much without a certificate and an insurance policy attached.
 *
 * Two properties matter here:
 *
 *   • Completion is derived from real records on every render. Nothing is
 *     stored, so the checklist cannot drift out of step with the data, cannot
 *     be marked done by mistake, and correctly shows existing accounts as
 *     already advanced rather than resetting them to zero.
 *
 *   • It is guidance, not a wizard. It never blocks navigation and disappears
 *     once everything is done, so an established user is not nagged and a new
 *     one is not trapped.
 */

import Link from 'next/link';
import { useMemo } from 'react';

import { useLanguage } from '@/contexts/LanguageContext';
import type { UserAccount } from '@/lib/types/account';
import type { Certificate, Drone, Insurance, Operator } from '@/lib/types/entities';

export interface OnboardingInput {
  account: UserAccount | null;
  operators: Operator[];
  drones: Drone[];
  certificates: Certificate[];
  insurances: Insurance[];
}

interface Step {
  id: string;
  labelKey: string;
  hintKey: string;
  href: string;
  done: boolean;
}

/**
 * The badge step has no server-side proof: DroneTag does not read the chip, so
 * there is no way to know a physical badge was written. What IS verifiable is
 * that the user has something to write onto it — a published drone with a
 * public slug. The step is phrased as "your badge link is ready" rather than
 * claiming the badge itself is active, which would be an invented completion.
 */
function buildSteps(input: OnboardingInput): Step[] {
  const { account, operators, drones, certificates, insurances } = input;

  const profileDone = Boolean(
    account &&
      (account.accountType === 'company'
        ? account.companyName.trim()
        : account.firstName.trim() && account.lastName.trim()),
  );
  const publishedDrone = drones.find((d) => d.visibility === 'public' && d.slug);

  return [
    {
      id: 'profile',
      labelKey: 'onboarding.step.profile',
      hintKey: 'onboarding.step.profile.hint',
      href: '/account/profile',
      done: profileDone,
    },
    {
      id: 'operator',
      labelKey: 'onboarding.step.operator',
      hintKey: 'onboarding.step.operator.hint',
      href: '/account/operators',
      done: operators.length > 0,
    },
    {
      id: 'drone',
      labelKey: 'onboarding.step.drone',
      hintKey: 'onboarding.step.drone.hint',
      href: '/account/drones',
      done: drones.length > 0,
    },
    {
      id: 'certificate',
      labelKey: 'onboarding.step.certificate',
      hintKey: 'onboarding.step.certificate.hint',
      href: '/account/certificates',
      done: certificates.length > 0,
    },
    {
      id: 'insurance',
      labelKey: 'onboarding.step.insurance',
      hintKey: 'onboarding.step.insurance.hint',
      href: '/account/insurances',
      done: insurances.length > 0,
    },
    {
      id: 'public',
      labelKey: 'onboarding.step.public',
      hintKey: 'onboarding.step.public.hint',
      href: '/account/drones',
      done: Boolean(publishedDrone),
    },
    {
      id: 'badge',
      labelKey: 'onboarding.step.badge',
      hintKey: 'onboarding.step.badge.hint',
      href: publishedDrone ? `/account/drones/${publishedDrone.id}` : '/account/drones',
      done: Boolean(publishedDrone),
    },
  ];
}

export function OnboardingChecklist(input: OnboardingInput) {
  const { t } = useLanguage();
  const steps = useMemo(() => buildSteps(input), [input]);

  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  const percent = Math.round((completed / steps.length) * 100);
  // The first thing still outstanding, highlighted so there is one obvious
  // next action rather than seven equal ones.
  const nextStep = steps.find((s) => !s.done);

  return (
    <section
      aria-labelledby="onboarding-heading"
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="onboarding-heading"
            className="text-sm font-semibold text-[var(--color-text)] sm:text-base"
          >
            {t('onboarding.title')}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] sm:text-sm">
            {t('onboarding.subtitle')}
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-[var(--color-text-secondary)]">
          {t('onboarding.progress', { done: String(completed), total: String(steps.length) })}
        </span>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-hover)]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby="onboarding-heading"
      >
        <div
          className="h-full rounded-full bg-[var(--color-action)] transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Two columns from tablet width up: seven single-file rows leaves a lot
          of dead space at 768px and pushes the real dashboard below the fold. */}
      <ul className="mt-4 grid gap-1.5 md:grid-cols-2">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={`group flex items-start gap-3 rounded-lg px-2.5 py-2 transition hover:bg-[var(--color-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action)] ${
                step.id === nextStep?.id ? 'bg-[var(--color-hover)]' : ''
              }`}
            >
              <StepMark done={step.done} />
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm ${
                    step.done
                      ? 'text-[var(--color-text-secondary)] line-through'
                      : 'font-medium text-[var(--color-text)]'
                  }`}
                >
                  {t(step.labelKey)}
                </span>
                {!step.done ? (
                  <span className="block text-xs text-[var(--color-text-secondary)]">
                    {t(step.hintKey)}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StepMark({ done }: { done: boolean }) {
  if (done) {
    return (
      <span
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--tone-success-fg)] text-white"
        aria-hidden
      >
        <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6.5l2.5 2.5 4.5-5" />
        </svg>
      </span>
    );
  }
  return (
    <span
      className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-[var(--color-border)]"
      aria-hidden
    />
  );
}
