'use client';

import { ErrorPanel } from '@/components/system/ErrorPanel';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60dvh] bg-[var(--color-hover)] py-12">
      <ErrorPanel error={error} reset={reset} context="admin" />
    </div>
  );
}
