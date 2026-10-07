/**
 * Cookie names shared by Proxy, Server Components and /api/*.
 *
 * This module must stay free of Node-only imports (`firebase-admin`, `fs`,
 * etc.). Next.js 16 documents Proxy as defaulting to the Node.js runtime
 * and forbids a `runtime` export
 * (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`).
 * The Netlify `@netlify/plugin-nextjs` adapter still compiles `src/proxy.ts`
 * into an Edge handler (`___netlify-edge-handler-node-middleware`). Importing
 * firebase-admin from that graph crashes production with ERR_MODULE_NOT_FOUND.
 */
export const ID_TOKEN_COOKIE = '__dronetag_idt';
export const SESSION_COOKIE = '__dronetag_session';

/** `exp` claim of a JWT (seconds), read without verifying it; 0 if unreadable. */
export function tokenExpiry(token: string): number {
  const payload = token.split('.')[1];
  if (!payload) return 0;
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === 'number' ? exp : 0;
  } catch {
    return 0;
  }
}

/**
 * Of the session cookie and the client-set token cookie, the one that expires
 * last. The HttpOnly session cookie is only rewritten on sign-in, so after a
 * token refresh it can hold an expired token while the other is fresh.
 * Only picks a candidate; the caller still verifies it.
 */
export function freshestToken(...tokens: (string | null | undefined)[]): string | null {
  let best: string | null = null;
  let bestExp = -1;
  for (const token of tokens) {
    if (!token) continue;
    const exp = tokenExpiry(token);
    if (exp > bestExp) {
      best = token;
      bestExp = exp;
    }
  }
  return best;
}
