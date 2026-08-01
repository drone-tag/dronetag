'use client';

import { type ChangeEvent, type InputHTMLAttributes } from 'react';
import { classNames } from '@/lib/utils';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local';

export type InputProps = {
  label: string;
  name: string;
  type?: InputType;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'name' | 'className'
>;

const inputBase =
  'w-full rounded-lg border bg-[var(--color-card)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-action)] focus:ring-2 focus:ring-[var(--color-action)]/20 sm:py-2.5 sm:text-sm';

export function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  error,
  disabled,
  className,
  id,
  ...rest
}: InputProps) {
  const inputId = id ?? name;

  return (
    <div className={classNames('w-full', className)}>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-[var(--color-expired)]" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={classNames(
          inputBase,
          error
            ? 'border-[var(--color-expired)] focus:border-[var(--color-expired)] focus:ring-[var(--color-expired)]/20'
            : 'border-[var(--color-border)]',
          disabled && 'cursor-not-allowed bg-[var(--color-hover)] opacity-70',
        )}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-[var(--color-expired)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
