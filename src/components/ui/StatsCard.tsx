'use client';

import { classNames } from '@/lib/utils';

type Variant = 'default' | 'success' | 'warning' | 'danger';

const styles: Record<Variant, { border: string; bg: string; text: string }> = {
  default: {
    border: 'border-[var(--color-border)]',
    bg: 'bg-[var(--color-card)]',
    text: 'text-[var(--color-text)]',
  },
  success: {
    border: 'border-[var(--tone-success-border)]',
    bg: 'bg-[var(--tone-success-bg)]',
    text: 'text-[var(--tone-success-fg)]',
  },
  warning: {
    border: 'border-[var(--tone-warning-border)]',
    bg: 'bg-[var(--tone-warning-bg)]',
    text: 'text-[var(--tone-warning-fg)]',
  },
  danger: {
    border: 'border-[var(--tone-danger-border)]',
    bg: 'bg-[var(--tone-danger-bg)]',
    text: 'text-[var(--tone-danger-fg)]',
  },
};

const dotColor: Record<Variant, string> = {
  default: 'bg-[var(--color-border)]',
  success: 'bg-[var(--color-valid)]',
  warning: 'bg-[var(--color-expiring)]',
  danger: 'bg-[var(--color-expired)]',
};

export function StatsCard({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number | string;
  variant?: Variant;
}) {
  const s = styles[variant];
  const showDot = variant !== 'default' && Number(value) > 0;
  return (
    <div className={classNames('rounded-xl border px-4 py-3.5', s.border, s.bg)}>
      <div className="flex items-center gap-1.5">
        {showDot ? <span className={classNames('h-1.5 w-1.5 rounded-full', dotColor[variant])} aria-hidden /> : null}
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">{label}</p>
      </div>
      <p className={classNames('mt-1 text-2xl font-semibold tabular-nums', s.text)}>{value}</p>
    </div>
  );
}
