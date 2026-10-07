'use client';

import { ErrorPanel } from '@/components/system/ErrorPanel';

export default function AccountError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}) {
  return (
    <div className="min-h-[60dvh] bg-[var(--color-hover)] py-12">
      <ErrorPanel error={error} reset={unstable_retry ?? reset} context="account" />
    </div>
  );
}
