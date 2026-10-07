/**
 * Authenticated fetch for API routes (Safari-safe Bearer token).
 */

import { ensureFreshClaims, getCurrentUser } from '@/lib/firebase/auth';

export async function adminFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const user = getCurrentUser();
  const send = async (forceRefresh: boolean) => {
    const headers = new Headers(init.headers);
    if (!headers.has('content-type') && init.body && !(init.body instanceof FormData)) {
      headers.set('content-type', 'application/json');
    }
    if (user) {
      // The SDK refreshes an expiring token on its own; only admin endpoints
      // need the claim check, and that costs a round trip at most once.
      if (path.startsWith('/api/admin') && !forceRefresh) await ensureFreshClaims(user);
      const token = await user.getIdToken(forceRefresh);
      headers.set('authorization', `Bearer ${token}`);
    }
    return fetch(path, {
      ...init,
      credentials: 'same-origin',
      headers,
    });
  };

  const res = await send(false);
  // A token revoked or rotated server-side gets one retry with a fresh one.
  // Streams cannot be replayed, so those requests surface the 401 as is.
  if (res.status === 401 && user && !(init.body instanceof ReadableStream)) {
    return send(true);
  }
  return res;
}
