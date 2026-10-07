/**
 * PATCH /api/account/preferences — store the caller's interface language.
 *
 * Emails are written in the language saved on users/{uid}; without this the
 * choice only lived in the browser and every email went out in English.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { logger } from '@/lib/server/logger';
import { requireUserFromRequest } from '@/lib/server/requestAuth';
import { parseJsonBody } from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  language: z.enum(['it', 'en', 'de', 'es', 'fr']),
});

export async function PATCH(request: Request) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = await parseJsonBody(request, schema);
  if ('response' in parsed) return parsed.response;

  const ref = adminFirestore().collection('users').doc(auth.uid);
  try {
    // `update`, not a merge: a profile that does not exist yet is created by
    // provisioning, and a stray language-only document would look like one.
    await ref.update({ language: parsed.data.language });
  } catch (err) {
    if ((err as { code?: number }).code === 5) {
      return NextResponse.json({ ok: false, reason: 'no_profile' });
    }
    logger.warn('account.preferences.failed', { uid: auth.uid }, err);
    return NextResponse.json({ error: 'update failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
