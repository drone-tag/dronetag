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
 *   • Idempotent and race-safe. All three records are read and written in a
 *     single transaction, so concurrent calls (the signup form and the
 *     account gate, two tabs, a retry) serialise instead of overwriting each
 *     other. Re-running never replaces a value the user already has; it only
 *     creates missing records and fills fields that are still blank. That
 *     also repairs half-provisioned accounts, e.g. a `users/{uid}` stub
 *     written by the contact-verification endpoint before provisioning ran.
 */

import { NextResponse } from 'next/server';
import { ALLOW_PUBLIC_SIGNUP } from '@/lib/config/features';
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

type Doc = Record<string, unknown>;
type Seed = z.infer<typeof provisionSchema>;

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

function isBlankAddress(v: unknown): boolean {
  if (!v || typeof v !== 'object') return true;
  return Object.values(v as Doc).every(isBlank);
}

/**
 * Fields of `defaults` the existing document is missing, plus seed values
 * for fields that are still blank. Never returns a key whose current value
 * is meaningful, so a re-run cannot clobber what the user typed.
 */
function fillBlanks(existing: Doc, defaults: Doc, seeded: Doc): Doc {
  const patch: Doc = {};
  for (const [key, value] of Object.entries(defaults)) {
    if (!(key in existing) || existing[key] === undefined) patch[key] = value;
  }
  for (const [key, value] of Object.entries(seeded)) {
    if (key === 'address') {
      if (!isBlankAddress(value) && isBlankAddress(existing.address)) patch.address = value;
      continue;
    }
    if (!isBlank(value) && isBlank(existing[key])) patch[key] = value;
  }
  return patch;
}

function userSeedFields(seed: Seed, email: string): Doc {
  return {
    email,
    firstName: seed.firstName ?? '',
    lastName: seed.lastName ?? '',
    dateOfBirth: seed.dateOfBirth ?? '',
    phone: seed.phone ?? '',
    address: seed.address ?? EMPTY_ADDRESS,
    companyName: seed.companyName ?? '',
    companyContactPerson: seed.companyContactPerson ?? '',
    companyVat: seed.companyVat ?? '',
    companyUniqueNumber: seed.companyUniqueNumber ?? '',
  };
}

function pilotSeedFields(seed: Seed, email: string): Doc {
  return {
    email,
    firstName: seed.firstName ?? '',
    lastName: seed.lastName ?? '',
    dateOfBirth: seed.dateOfBirth ?? '',
    nationality: seed.nationality ?? '',
    phone: seed.phone ?? '',
    address: seed.address ?? EMPTY_ADDRESS,
  };
}

class SignupDisabledError extends Error {}

export async function POST(request: Request) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const parsed = await parseJsonBody(request, provisionSchema);
  if ('response' in parsed) return parsed.response;
  const seed: Seed = parsed.data ?? {};

  const uid = auth.uid;
  const email = auth.email ?? '';
  const db = adminFirestore();

  const userRef = db.doc(`users/${uid}`);
  const pilotRef = db.doc(`pilots/${uid}`);
  const slotsRef = db.doc(`slots/${uid}`);

  try {
    const created = await db.runTransaction(async (tx) => {
      const result = { account: false, pilot: false, slots: false };
      const now = new Date().toISOString();
      const [userSnap, pilotSnap, slotsSnap] = await tx.getAll(userRef, pilotRef, slotsRef);
      // With public signup off, only accounts an admin created get completed;
      // a stranger signing in with Google must not provision themselves.
      if (!userSnap.exists && !ALLOW_PUBLIC_SIGNUP && !auth.admin) {
        throw new SignupDisabledError();
      }

      // users/{uid}
      const userDefaults: Doc = {
        uid,
        accountType: seed.accountType ?? 'private',
        ...userSeedFields(seed, email),
        profilePhotoUrl: '',
        logoUrl: '',
        bannerUrl: '',
        contactVerification: { channels: [], emailVerifiedAt: '', phoneVerifiedAt: '' },
        // Recorded server-side so consent cannot be claimed by editing the
        // client. See FASE 18 / the signup checkbox.
        acceptedTermsAt: seed.acceptedTerms ? now : '',
        createdAt: now,
        updatedAt: now,
      };
      if (!userSnap.exists) {
        tx.create(userRef, userDefaults);
        result.account = true;
      } else {
        const existing = (userSnap.data() ?? {}) as Doc;
        const patch = fillBlanks(existing, userDefaults, userSeedFields(seed, email));
        if (seed.acceptedTerms && isBlank(existing.acceptedTermsAt)) patch.acceptedTermsAt = now;
        // The form is the only place a company account is declared; a stub
        // created moments earlier without a seed must not pin it to private.
        if (seed.accountType === 'company' && isBlank(existing.companyName)) {
          patch.accountType = 'company';
        }
        if (Object.keys(patch).length > 0) {
          tx.update(userRef, { ...patch, updatedAt: now });
          result.account = true;
        }
      }

      // pilots/{uid} — the personal remote-pilot record, always 1:1 with the account.
      const pilotDefaults: Doc = {
        userId: uid,
        ...pilotSeedFields(seed, email),
        operatorCode: '',
        operatorLicense: '',
        emergencyContact: '',
        createdAt: now,
        updatedAt: now,
      };
      if (!pilotSnap.exists) {
        tx.create(pilotRef, pilotDefaults);
        result.pilot = true;
      } else {
        const existing = (pilotSnap.data() ?? {}) as Doc;
        const patch = fillBlanks(existing, pilotDefaults, pilotSeedFields(seed, email));
        if (Object.keys(patch).length > 0) {
          tx.update(pilotRef, { ...patch, updatedAt: now });
          result.pilot = true;
        }
      }

      // slots/{uid} — normally written by the bootstrapSlots auth trigger. This
      // is a fallback for environments where Cloud Functions are not deployed;
      // an existing doc (trigger or admin grants) is never touched.
      if (!slotsSnap.exists) {
        tx.create(slotsRef, {
          userId: uid,
          ...BASE_SLOTS,
          createdAt: now,
          updatedAt: now,
          provisionedBy: 'api/account/provision',
        });
        result.slots = true;
      }

      return result;
    });

    logger.info('account.provisioned', { uid, created });
    return NextResponse.json({ ok: true, created });
  } catch (err) {
    if (err instanceof SignupDisabledError) {
      logger.warn('account.provision.signup_disabled', { uid });
      return NextResponse.json({ error: 'signup disabled', code: 'signup_disabled' }, { status: 403 });
    }
    logger.error('account.provision.failed', { uid }, err);
    return NextResponse.json({ error: 'provisioning failed' }, { status: 500 });
  }
}
