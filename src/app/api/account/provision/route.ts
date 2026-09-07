/**
 * POST /api/account/provision — create the Firestore records a new account
 * needs, using the Admin SDK.
 *
 * Why this exists
 * ---------------
 * Signup was broken in any environment with the real Firestore rules applied.
 * The browser created the Firebase Auth user, then called `ensureAccount()`
 * and `ensurePilot()`, which do `setDoc(users/{uid})` and
 * `setDoc(pilots/{uid})`. Both collections declare `allow create: if false`,
 * so both writes were rejected. The user ended up with an Auth identity and
 * no application records: able to log in, unable to use anything, and unable
 * to retry because the Auth account already existed.
 *
 * The rules are right — clients should not be able to mint their own account
 * documents — so the fix is to move provisioning to the server.
 *
 * Guarantees
 * ----------
 *   • The uid and email come from the verified ID token, never from the body.
 *     A caller cannot provision an account for someone else.
 *   • Idempotent. Re-running never overwrites existing records, so a page
 *     refresh, a retry after a network error, or a second login all converge
 *     on the same state. This also repairs accounts left half-provisioned by
 *     the previous broken flow.
 *   • Partial failures are reported per record rather than rolled back.
 *     Deleting a just-created `users/{uid}` because the pilot write failed
 *     would risk destroying data on a retry; leaving it and reporting what is
 *     missing lets the next call finish the job.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { adminFirestore } from '@/lib/server/firebaseAdmin';
import { logger } from '@/lib/server/logger';
import { requireUserFromRequest } from '@/lib/server/requestAuth';
import { addressSchema, boundedString, isoDateString, parseJsonBody } from '@/lib/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Optional profile seed collected by the signup form. Everything is
 * optional: an account must be provisionable from the token alone, because
 * the Google sign-in path has no form at all.
 */
const provisionSchema = z
  .object({
    accountType: z.enum(['private', 'company']).default('private'),
    firstName: boundedString(120),
    lastName: boundedString(120),
    dateOfBirth: isoDateString,
    phone: boundedString(40),
    address: addressSchema,
    companyName: boundedString(200),
    companyContactPerson: boundedString(200),
    companyVat: boundedString(60),
    companyUniqueNumber: boundedString(60),
    nationality: boundedString(80),
    acceptedTerms: z.boolean().default(false),
  })
  .partial()
  .default({});

/** Mirrors BASE_SLOTS in src/lib/types/entities.ts and functions/src/bootstrap-slots.ts. */
const BASE_SLOTS = {
  certificate: 1,
  drone: 1,
  operator: 1,
  pdf: 1,
  permit: 3,
  archive: 0,
  nfc_badge: 0,
  personalization: 0,
} as const;

const EMPTY_ADDRESS = { line1: '', line2: '', city: '', postalCode: '', country: '' };

export async function POST(request: Request) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = await parseJsonBody(request, provisionSchema);
  if ('response' in parsed) return parsed.response;
  const seed = parsed.data ?? {};

  const uid = auth.uid;
  const email = auth.email ?? '';
  const now = new Date().toISOString();
  const db = adminFirestore();

  const created = { account: false, pilot: false, slots: false };

  try {
    // users/{uid}
    const userRef = db.doc(`users/${uid}`);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      await userRef.set({
        uid,
        email,
        accountType: seed.accountType ?? 'private',
        firstName: seed.firstName ?? '',
        lastName: seed.lastName ?? '',
        dateOfBirth: seed.dateOfBirth ?? '',
        phone: seed.phone ?? '',
        address: seed.address ?? EMPTY_ADDRESS,
        companyName: seed.companyName ?? '',
        companyContactPerson: seed.companyContactPerson ?? '',
        companyVat: seed.companyVat ?? '',
        companyUniqueNumber: seed.companyUniqueNumber ?? '',
        profilePhotoUrl: '',
        logoUrl: '',
        bannerUrl: '',
        contactVerification: {
          emailVerified: false,
          emailVerifiedAt: '',
          phoneVerified: false,
          phoneVerifiedAt: '',
        },
        // Recorded server-side so consent cannot be claimed by editing the
        // client. See FASE 18 / the signup checkbox.
        acceptedTermsAt: seed.acceptedTerms ? now : '',
        createdAt: now,
        updatedAt: now,
      });
      created.account = true;
    }

    // pilots/{uid} — the personal remote-pilot record, always 1:1 with the account.
    const pilotRef = db.doc(`pilots/${uid}`);
    const pilotSnap = await pilotRef.get();
    if (!pilotSnap.exists) {
      await pilotRef.set({
        userId: uid,
        firstName: seed.firstName ?? '',
        lastName: seed.lastName ?? '',
        dateOfBirth: seed.dateOfBirth ?? '',
        nationality: seed.nationality ?? '',
        email,
        phone: seed.phone ?? '',
        address: seed.address ?? EMPTY_ADDRESS,
        operatorCode: '',
        operatorLicense: '',
        emergencyContact: '',
        createdAt: now,
        updatedAt: now,
      });
      created.pilot = true;
    }

    // slots/{uid} — normally written by the bootstrapSlots auth trigger. This
    // is a fallback for environments where Cloud Functions are not deployed;
    // it must stay idempotent so the two writers cannot conflict.
    const slotsRef = db.doc(`slots/${uid}`);
    const slotsSnap = await slotsRef.get();
    if (!slotsSnap.exists) {
      await slotsRef.set({
        userId: uid,
        ...BASE_SLOTS,
        createdAt: now,
        updatedAt: now,
        provisionedBy: 'api/account/provision',
      });
      created.slots = true;
    }

    logger.info('account.provisioned', { uid, created });
    return NextResponse.json({ ok: true, created });
  } catch (err) {
    logger.error('account.provision.failed', { uid, created }, err);
    return NextResponse.json(
      {
        error: 'provisioning failed',
        // Tell the client what did land, so a retry is informed and the UI can
        // explain the state rather than showing a generic failure.
        created,
      },
      { status: 500 },
    );
  }
}
