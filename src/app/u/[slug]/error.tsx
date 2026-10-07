'use client';

import { ErrorPanel } from '@/components/system/ErrorPanel';

export default function PublicProfileError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <ErrorPanel error={error} reset={unstable_retry ?? reset} context="public" />
    </div>
  );
}
