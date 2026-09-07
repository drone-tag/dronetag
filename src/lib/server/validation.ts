/**
 * Shared request-validation helpers for route handlers.
 *
 * The existing routes hand-roll validation with `cleanString(body.x, 200)`
 * calls repeated per field. That works, but each route re-decides what a
 * valid address or account type is, and the checks live far from the types
 * they are supposed to protect. Zod was introduced during the pre-beta pass
 * for the endpoints added or reworked then; the older routes were left alone
 * deliberately, since rewriting two dozen working handlers carries more risk
 * than it removes.
 *
 * Everything here is server-side. Client-side validation is a UX affordance
 * and is never trusted.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Trimmed string with a hard length cap; empty string allowed. */
export const boundedString = (max: number) =>
  z.string().trim().max(max).default('');

/** Trimmed string that must not be empty. */
export const requiredString = (max: number) =>
  z.string().trim().min(1).max(max);

export const isoDateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
  .or(z.literal(''))
  .default('');

export const addressSchema = z
  .object({
    line1: boundedString(200),
    line2: boundedString(200),
    city: boundedString(120),
    postalCode: boundedString(32),
    country: boundedString(80),
  })
  .default({ line1: '', line2: '', city: '', postalCode: '', country: '' });

export type ParsedAddress = z.infer<typeof addressSchema>;

/**
 * Parse and validate a JSON request body.
 *
 * Returns either the parsed value or a ready-to-return 400. Field paths are
 * included so the client can highlight the offending input, but raw values
 * never are — echoing them back would put user data into error responses and,
 * from there, into logs.
 */
export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ data: z.infer<T> } | { response: NextResponse }> {
  let raw: unknown;
  const text = await request.text().catch(() => '');
  if (text.trim() === '') {
    // An absent body is not malformed input. Several callers legitimately have
    // nothing to send — the Google sign-in path provisions an account from the
    // token alone — so let the schema's defaults decide whether that is valid.
    raw = undefined;
  } else {
    try {
      raw = JSON.parse(text);
    } catch {
      return { response: NextResponse.json({ error: 'invalid json' }, { status: 400 }) };
    }
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      response: NextResponse.json(
        {
          error: 'invalid request',
          fields: result.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 },
      ),
    };
  }

  return { data: result.data };
}
