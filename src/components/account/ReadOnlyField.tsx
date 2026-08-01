'use client';

/** Label + value display for locked entity fields. */
export function ReadOnlyField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-0.5 text-sm text-[var(--color-text)]">{value || '-'}</p>
    </div>
  );
}
