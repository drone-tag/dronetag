/**
 * Minimal structured server logger.
 *
 * The codebase logs with bare `console.log` / `console.warn` / `console.error`
 * and frequently passes whole request bodies or Firestore documents, which
 * puts email addresses, phone numbers and policy numbers into Netlify's log
 * retention (finding PRV-006). This module gives route handlers one place to
 * log through, with two properties the ad-hoc calls did not have:
 *
 *   • a fixed JSON shape, so logs are greppable and parseable;
 *   • redaction, so a caller that hands over a raw object does not silently
 *     leak personal data.
 *
 * It deliberately does not wrap a vendor SDK. Introducing Sentry was out of
 * scope for the pre-beta pass, and this keeps the seam where it would go.
 *
 * Not a security boundary: redaction is a safety net for honest mistakes, not
 * a guarantee. Do not pass personal data and rely on this to strip it.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function minLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL ?? '').toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

/**
 * Keys whose values are replaced with '[redacted]'. Matched case-insensitively
 * on a substring basis, so `userEmail` and `contactEmail` are both caught.
 */
const REDACTED_KEY_PARTS = [
  'password', 'secret', 'token', 'authorization', 'cookie', 'apikey', 'api_key',
  'email', 'phone', 'address', 'dateofbirth', 'dob', 'policynumber', 'vat',
  'serviceaccount', 'privatekey', 'idtoken', 'otp', 'code',
];

function shouldRedact(key: string): boolean {
  const k = key.toLowerCase();
  return REDACTED_KEY_PARTS.some((part) => k.includes(part));
}

/**
 * Uids are pseudonymous but still identify a person across log lines. They are
 * genuinely useful for debugging, so they are truncated rather than dropped.
 */
function truncateId(value: string): string {
  return value.length <= 8 ? value : `${value.slice(0, 8)}…`;
}

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[depth-limit]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));
  if (typeof value !== 'object') return '[unloggable]';

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (shouldRedact(k)) {
      out[k] = '[redacted]';
    } else if ((k === 'uid' || k === 'userId' || k === 'ownerUserId') && typeof v === 'string') {
      out[k] = truncateId(v);
    } else {
      out[k] = redact(v, depth + 1);
    }
  }
  return out;
}

/**
 * Errors are reduced to name + message. Stacks are kept only outside
 * production, where they are useful and where the logs are not retained.
 */
function serialiseError(err: unknown): Record<string, unknown> | undefined {
  if (err === undefined) return undefined;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }),
    };
  }
  return { message: String(err) };
}

function emit(level: LogLevel, event: string, context?: unknown, err?: unknown): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel()]) return;

  const line = {
    level,
    event,
    at: new Date().toISOString(),
    ...(context === undefined ? {} : { ctx: redact(context) }),
    ...(err === undefined ? {} : { err: serialiseError(err) }),
  };

  const serialised = JSON.stringify(line);
  if (level === 'error') console.error(serialised);
  else if (level === 'warn') console.warn(serialised);
  else console.log(serialised);
}

export const logger = {
  debug: (event: string, context?: unknown) => emit('debug', event, context),
  info: (event: string, context?: unknown) => emit('info', event, context),
  warn: (event: string, context?: unknown, err?: unknown) => emit('warn', event, context, err),
  error: (event: string, context?: unknown, err?: unknown) => emit('error', event, context, err),
};

/**
 * Correlation id for a single request. Prefers the id the platform already
 * assigned so app logs line up with Netlify's, and falls back to a random one.
 */
export function requestId(request: Request): string {
  return (
    request.headers.get('x-nf-request-id') ??
    request.headers.get('x-request-id') ??
    crypto.randomUUID()
  );
}
