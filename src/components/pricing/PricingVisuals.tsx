'use client';

import { classNames } from '@/lib/utils';

export function PricingVisualBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        'relative flex h-28 w-20 flex-col items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-navy-surface)] via-[#0f274f] to-[#1e3a8a] shadow-[var(--shadow-card)]',
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage:
          'radial-gradient(circle at 30% 25%, rgb(96 165 250 / 0.55), transparent 45%), radial-gradient(circle at 70% 80%, rgb(34 211 238 / 0.25), transparent 40%)',
      }} />
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
        <span className="h-5 w-5 rounded-sm border-2 border-dashed border-cyan-200/80" />
      </span>
      <span className="relative mt-2 px-1 text-center text-[9px] font-semibold uppercase tracking-wide text-white/90">
        {label}
      </span>
    </div>
  );
}

export function PricingHeroArt() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-card)]" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-action-light)] via-transparent to-cyan-50/40 dark:to-cyan-950/20" />
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[var(--color-action)]/10 blur-2xl" />
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-3">
        <PricingVisualBadge label="CERT" />
        <div className="mb-2 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/90 p-3 backdrop-blur">
          <div className="h-2 w-16 rounded bg-[var(--color-action)]/40" />
          <div className="mt-2 h-2 w-full rounded bg-[var(--color-border)]" />
          <div className="mt-1.5 h-2 w-3/4 rounded bg-[var(--color-border)]" />
          <div className="mt-3 flex gap-1.5">
            <span className="h-5 rounded-full bg-[var(--tone-success-bg)] px-2 text-[9px] font-semibold leading-5 text-[var(--tone-success-fg)]">OK</span>
            <span className="h-5 rounded-full bg-[var(--tone-info-bg)] px-2 text-[9px] font-semibold leading-5 text-[var(--tone-info-fg)]">NFC</span>
          </div>
        </div>
        <PricingVisualBadge label="INS" className="translate-y-3" />
      </div>
      <svg className="absolute left-1/2 top-8 h-16 w-24 -translate-x-1/2 text-[var(--color-navy)] opacity-80" viewBox="0 0 96 64" fill="none" aria-hidden>
        <path d="M48 10 L72 28 L48 22 L24 28 Z" fill="currentColor" opacity="0.85" />
        <circle cx="48" cy="34" r="6" fill="var(--color-action)" />
        <path d="M18 36 H78" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <path d="M30 44 H66" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      </svg>
    </div>
  );
}
