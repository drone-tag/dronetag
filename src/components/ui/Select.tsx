'use client';

import { type ChangeEvent, type SelectHTMLAttributes } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { classNames } from '@/lib/utils';

export type SelectOption = { value: string; label: string };

export type SelectProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
} & Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'name' | 'value' | 'onChange' | 'className' | 'children'
>;

const fieldBase =
  'w-full rounded-lg border bg-[var(--color-card)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-action)] focus:ring-2 focus:ring-[var(--color-action)]/20';

export function Select({
  label,
  name,
  value,
  onChange,
  options,
  required,
  error,
  disabled,
  className,
  id,
  ...rest
}: SelectProps) {
  const { t } = useLanguage();
  const selectId = id ?? name;

  return (
    <div className={classNames('w-full', className)}>
      <label
        htmlFor={selectId}
        className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-[var(--color-expired)]" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={classNames(
          fieldBase,
          error
            ? 'border-[var(--color-expired)] focus:border-[var(--color-expired)] focus:ring-[var(--color-expired)]/20'
            : 'border-[var(--color-border)]',
          disabled && 'cursor-not-allowed bg-[var(--color-hover)] opacity-70',
        )}
        {...rest}
      >
        <option value="" disabled>
          {t('common.select')}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${selectId}-error`} className="mt-1.5 text-sm text-[var(--color-expired)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
