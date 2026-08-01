'use client';

import { classNames } from '@/lib/utils';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

type UserAvatarProps = {
  name: string;
  photoUrl?: string | null;
  className?: string;
  textClassName?: string;
  alt?: string;
};

/** Circular profile photo with initials fallback (matches public profile pattern). */
export function UserAvatar({
  name,
  photoUrl,
  className,
  textClassName,
  alt = '',
}: UserAvatarProps) {
  const url = (photoUrl ?? '').trim();
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Firebase Storage / data URLs
      <img
        src={url}
        alt={alt}
        referrerPolicy="no-referrer"
        className={classNames('rounded-full object-cover', className)}
      />
    );
  }
  return (
    <span
      className={classNames(
        'flex shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-solid)] font-bold text-[var(--color-on-brand)]',
        className,
        textClassName,
      )}
      aria-hidden={!alt}
    >
      {initials(name)}
    </span>
  );
}
