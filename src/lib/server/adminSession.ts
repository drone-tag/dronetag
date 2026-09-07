/**
 * Session verification for Server Components (admin layout).
 *
 * `src/lib/server/requestAuth.ts` covers route handlers, which receive a
 * `Request` and can read an Authorization header. Server Components have
 * neither — they read cookies through `next/headers` — so this module offers
 * the same check against a cookie store.
 *
 * Both paths deliberately share the cookie names and the claim being checked;
 * only the way the token is obtained differs.
 */

import { ID_TOKEN_COOKIE, SESSION_COOKIE } from '@/lib/auth/sessionCookieNames';
import { adminAuth, isFirebaseAdminConfigured } from '@/lib/server/firebaseAdmin';

export { ID_TOKEN_COOKIE, SESSION_COOKIE };

/** Minimal shape shared by `next/headers` cookies() and NextRequest.cookies. */
interface CookieReader {
  get(name: string): { value: string } | undefined;
}

export type SessionResult =
  | { status: 'ok'; uid: string; email?: string }
  | { status: 'unauthenticated' }
  | { status: 'forbidden'; uid: string }
  | { status: 'unavailable' };

/**
 * Verify that the caller holds a valid session AND the `admin` custom claim.
 *
 * `checkRevoked: true` costs an extra round-trip to Firebase but means a
 * revoked admin loses access immediately rather than when their token expires.
 * For an area this privileged that trade is worth making — and it is what
 * makes `revokeRefreshTokens()` in scripts/grant-admin.ts actually effective.
 */
export async function verifyAdminSession(cookies: CookieReader): Promise<SessionResult> {
  if (!isFirebaseAdminConfigured()) return { status: 'unavailable' };

  const token =
    cookies.get(SESSION_COOKIE)?.value ?? cookies.get(ID_TOKEN_COOKIE)?.value ?? '';
  if (!token) return { status: 'unauthenticated' };

  try {
    const decoded = await adminAuth().verifyIdToken(token, true);
    if (decoded.admin !== true) {
      return { status: 'forbidden', uid: decoded.uid };
    }
    return { status: 'ok', uid: decoded.uid, email: decoded.email };
  } catch {
    // Expired, malformed or revoked — all indistinguishable to the caller on
    // purpose, and all mean "sign in again".
    return { status: 'unauthenticated' };
  }
}
