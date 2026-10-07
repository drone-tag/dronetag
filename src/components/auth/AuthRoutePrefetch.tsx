'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/** Warm common post-login routes so client navigations feel instant. */
export function AuthRoutePrefetch() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    router.prefetch('/account');
    if (isAdmin) router.prefetch('/admin');
  }, [user, loading, isAdmin, router]);

  return null;
}
