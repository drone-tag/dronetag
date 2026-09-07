import { NextResponse, type NextRequest } from 'next/server';

import { ID_TOKEN_COOKIE, SESSION_COOKIE } from '@/lib/server/adminSession';

/**
 * Optimistic pre-filter for the admin area.
 *
 * In Next.js 16 this file replaces `middleware.ts`
 * (node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md). Several
 * project documents referenced a `proxy.ts` that had never been written; this
 * is it.
 *
 * WHAT THIS IS NOT
 * ----------------
 * This is not the admin authorisation check. Next's own guidance is explicit
 * that Proxy runs on every request — prefetches included — and should only
 * read the session cookie, never perform verification or database work
 * (02-guides/authentication.md, "Optimistic checks with Proxy"). Doing a
 * `verifyIdToken()` round-trip here would put a Firebase call on the path of
 * every hovered link.
 *
 * So this only answers "is there plausibly a session at all?" and bounces
 * requests that obviously have none, saving a render. The decisions that
 * matter happen in two places that cannot be bypassed:
 *
 *   • src/app/admin/layout.tsx  — Server Component, verifies the token and
 *                                 the admin claim before emitting any markup.
 *   • src/lib/server/adminAuth.ts — called by every /api/admin/* handler.
 *
 * A forged cookie gets past this file by design. It does not get past those.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie =
    Boolean(request.cookies.get(SESSION_COOKIE)?.value) ||
    Boolean(request.cookies.get(ID_TOKEN_COOKIE)?.value);

  if (hasSessionCookie) return NextResponse.next();

  const loginUrl = new URL('/login', request.url);
  // `redirect` is the param the login page already reads; see
  // resolveDestination() in src/app/login/page.tsx.
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Page routes only. /api/admin/* is intentionally excluded: those handlers
  // do their own verification and must return 401/403 as JSON, not a redirect
  // to an HTML login page.
  matcher: ['/admin/:path*'],
};
