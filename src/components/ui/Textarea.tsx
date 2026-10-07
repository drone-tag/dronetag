'use client';

import { type ChangeEvent, type TextareaHTMLAttributes } from 'react';
import { classNames } from '@/lib/utils';

export type TextareaProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'name' | 'value' | 'onChange' | 'rows' | 'className'
>;

const fieldBase =
  'w-full rounded-lg border bg-[var(--color-card)] px-4 py-3 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none transition focus:border-[var(--color-action)] focus:ring-2 focus:ring-[var(--color-action)]/20 resize-y min-h-[2.75rem] sm:py-2.5 sm:text-sm';

export function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
  error,
  disabled,
  className,
  id,
  ...rest
}: TextareaProps) {
  const textareaId = id ?? name;

  return (
    <div className={classNames('w-full', className)}>
      <label
        htmlFor={textareaId}
        className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-[var(--color-danger)]" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className={classNames(
          fieldBase,
          error
            ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20'
            : 'border-[var(--color-border)]',
          disabled && 'cursor-not-allowed bg-[var(--color-hover)] opacity-70'
        )}
        {...rest}
      />
      {error ? (
        <p
          id={`${textareaId}-error`}
          className="mt-1.5 text-sm text-[var(--tone-danger-fg)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
