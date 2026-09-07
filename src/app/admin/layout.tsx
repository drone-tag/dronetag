import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { AdminShell } from '@/components/layout/AdminShell';
import { verifyAdminSession } from '@/lib/server/adminSession';

/**
 * Server-side gate for the whole /admin subtree.
 *
 * Before this existed, /admin was protected only by a `useEffect` redirect in
 * a Client Component (SEC-003). That guard runs after the server has already
 * rendered and shipped the admin markup, so it stopped a casual visitor and
 * nobody else: disabling JavaScript, or simply reading the HTML response, was
 * enough to see it.
 *
 * As a Server Component this runs before any admin markup is produced. The
 * session cookie is verified with firebase-admin and the `admin` custom claim
 * is checked; an unauthorised request is redirected and never receives the
 * page.
 *
 * This is a gate, not the authorisation model. Every /api/admin/* route still
 * calls `requireAdminFromRequest` independently — a layout check protects
 * pages, not the endpoints those pages call, and the endpoints are where the
 * data actually lives.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const result = await verifyAdminSession(cookieStore);

  if (result.status === 'unauthenticated') {
    redirect('/login?redirect=/admin');
  }
  if (result.status === 'forbidden') {
    redirect('/account');
  }
  // status === 'unavailable' — the Admin SDK is not configured (local dev
  // without credentials). Fall through to the client shell rather than locking
  // the operator out of their own dev environment; there is nothing to protect
  // in that configuration because the API routes return 503 anyway.

  return <AdminShell>{children}</AdminShell>;
}
