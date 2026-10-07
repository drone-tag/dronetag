/**
 * Errors returned by the app's API routes, with the HTTP status and the
 * machine-readable `code` the routes send, so the UI can explain them.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Parse a JSON response, throwing `ApiError` when it is not a success. */
export async function readJsonOrThrow<T>(res: Response, what: string): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as T & { error?: unknown; code?: unknown };
  if (!res.ok) {
    const message = typeof body.error === 'string' && body.error ? body.error : `${what} failed`;
    throw new ApiError(message, res.status, typeof body.code === 'string' ? body.code : undefined);
  }
  return body;
}
