/**
 * PATCH /api/admin/users/{uid} — change a user's sign-in email (admin only).
 *
 * The address lives in two places: Firebase Auth (what the user signs in
 * with) and users/{uid}.email (what the console and the emails read). Writing
 * only the profile document left them disagreeing, so both are updated here,
 * Auth first so a rejected address never reaches the profile.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { adminAuth, adminFirestore } from '@/lib/server/firebaseAdmin';
import { logger } from '@/lib/server/logger';
import { parseJsonBody } from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

export async function PATCH(request: Request, ctx: { params: Promise<{ uid: string }> }) {
  const auth = await requireAdminFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { uid } = await ctx.params;
  if (!uid || uid.length > 128) {
    return NextResponse.json({ error: 'invalid uid' }, { status: 400 });
  }

  const parsed = await parseJsonBody(request, schema);
  if ('response' in parsed) return parsed.response;
  const { email } = parsed.data;

  try {
    await adminAuth().updateUser(uid, { email, emailVerified: false });
  } catch (err) {
    const code = (err as { code?: string }).code ?? '';
    if (code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'email already in use', code: 'email_in_use' }, { status: 409 });
    }
    if (code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }
    if (code === 'auth/invalid-email') {
      return NextResponse.json({ error: 'invalid email', code: 'invalid_email' }, { status: 400 });
    }
    logger.error('admin.user.email_update_failed', { targetUid: uid }, err);
    return NextResponse.json({ error: 'update failed' }, { status: 500 });
  }

  await adminFirestore()
    .collection('users')
    .doc(uid)
    .set({ email, updatedAt: new Date().toISOString() }, { merge: true });

  logger.info('admin.user.email_updated', { targetUid: uid, by: auth.uid });
  return NextResponse.json({ ok: true, email });
}
