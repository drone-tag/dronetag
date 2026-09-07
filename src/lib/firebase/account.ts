import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

import { awaitFirebaseAuthReady } from '@/lib/firebase/auth';
import { adminFetch } from '@/lib/client/adminApi';
import { provisionAccount } from '@/lib/client/provisionAccount';
import { DEMO_MODE, getFirebaseDb } from '@/lib/firebase/config';
import * as demoStore from '@/lib/demo/accountStore';
import type { AccountType, UserAccount } from '@/lib/types/account';
import type { ContactVerificationState } from '@/lib/types/contactVerification';

const USERS = 'users';

function accountFromRaw(uid: string, raw: Record<string, unknown>): UserAccount {
  const str = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : '');
  const addr = (raw['address'] ?? {}) as Record<string, unknown>;
  const addrStr = (k: string) => (typeof addr[k] === 'string' ? (addr[k] as string) : '');

  const rawType = str('accountType');
  const accountType: AccountType = rawType === 'company' ? 'company' : 'private';

  const rawCv = (raw.contactVerification ?? {}) as Record<string, unknown>;
  const channels = Array.isArray(rawCv.channels)
    ? rawCv.channels.filter((c): c is 'email' | 'phone' => c === 'email' || c === 'phone')
    : [];
  const contactVerification: ContactVerificationState = {
    channels,
    emailVerifiedAt: typeof rawCv.emailVerifiedAt === 'string' ? rawCv.emailVerifiedAt : '',
    phoneVerifiedAt: typeof rawCv.phoneVerifiedAt === 'string' ? rawCv.phoneVerifiedAt : '',
  };

  return {
    uid,
    email: str('email'),
    accountType,
    firstName: str('firstName'),
    lastName: str('lastName'),
    dateOfBirth: str('dateOfBirth'),
    phone: str('phone'),
    address: {
      line1: addrStr('line1'),
      line2: addrStr('line2'),
      city: addrStr('city'),
      postalCode: addrStr('postalCode'),
      country: addrStr('country'),
    },
    companyName: str('companyName'),
    companyContactPerson: str('companyContactPerson'),
    companyVat: str('companyVat'),
    companyUniqueNumber: str('companyUniqueNumber'),
    profilePhotoUrl: str('profilePhotoUrl'),
    logoUrl: str('logoUrl'),
    bannerUrl: str('bannerUrl'),
    contactVerification,
    createdAt: str('createdAt'),
    updatedAt: str('updatedAt'),
  };
}

export async function getAccount(uid: string): Promise<UserAccount | null> {
  if (DEMO_MODE) return demoStore.getAccountByUid(uid);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, USERS, uid));
  if (!snap.exists()) return null;
  return accountFromRaw(uid, snap.data() as Record<string, unknown>);
}

/**
 * Idempotently ensure the `users/{uid}` document exists after signup or first
 * login. Safe to call on every app start — it never overwrites existing data.
 *
 * In live mode the document is created by the server. Firestore rules declare
 * `allow create: if false` on this collection, so the `setDoc` this function
 * used to perform was always rejected: signup produced a Firebase Auth user
 * with no account record behind it. Provisioning now goes through
 * POST /api/account/provision, which runs the Admin SDK and takes the uid
 * from the verified token.
 */
export async function ensureAccount(
  uid: string,
  email: string,
  seed: Partial<UserAccount> & { acceptedTerms?: boolean } = {},
): Promise<UserAccount> {
  if (DEMO_MODE) return demoStore.ensureAccount(uid, email, seed);

  const existing = await getAccount(uid);
  if (existing) return existing;

  await provisionAccount({
    accountType: seed.accountType,
    firstName: seed.firstName,
    lastName: seed.lastName,
    dateOfBirth: seed.dateOfBirth,
    phone: seed.phone,
    address: seed.address,
    companyName: seed.companyName,
    companyContactPerson: seed.companyContactPerson,
    companyVat: seed.companyVat,
    companyUniqueNumber: seed.companyUniqueNumber,
    acceptedTerms: seed.acceptedTerms,
  });

  const created = await getAccount(uid);
  if (created) return created;

  // The route reported success but the document is not readable. Surfacing
  // this rather than fabricating an in-memory account keeps the caller from
  // rendering a dashboard backed by nothing.
  throw new Error('account provisioning did not produce a users/{uid} document');
}

/** Patch an existing `users/{uid}` document. */
export async function updateAccount(uid: string, patch: Partial<UserAccount>): Promise<void> {
  if (DEMO_MODE) return demoStore.updateAccount(uid, patch);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const payload = Object.fromEntries(
    Object.entries(patch).filter(([k, v]) => k !== 'uid' && v !== undefined),
  );
  await updateDoc(doc(db, USERS, uid), { ...payload, updatedAt: new Date().toISOString() });
}

export type AccountBrandingKind = 'photo' | 'logo' | 'banner';

/** Upload account branding image via Admin SDK (avoids client Storage rules). */
export async function uploadAccountBranding(
  kind: AccountBrandingKind,
  file: File,
): Promise<string> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 200));
    return compressImageForDemo(file);
  }

  const form = new FormData();
  form.append('kind', kind);
  form.append('file', file);
  const res = await adminFetch('/api/account/branding', {
    method: 'POST',
    body: form,
  });
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string; message?: string };
  if (!res.ok) {
    throw new Error(body.error || body.message || `upload ${kind} failed (${res.status})`);
  }
  if (!body.url) throw new Error(`upload ${kind} failed: missing url`);
  return body.url;
}

/** Shrink photos for demo localStorage (full camera JPEGs blow the quota). */
async function compressImageForDemo(file: File, maxEdge = 640, quality = 0.82): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no_canvas');
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (!dataUrl.startsWith('data:image/')) throw new Error('bad_data_url');
    return dataUrl;
  } catch {
    // HEIC / decode failures — fall back to raw data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('demo_image_read_failed'));
      reader.readAsDataURL(file);
    });
    if (!dataUrl) throw new Error('demo_image_read_failed');
    return dataUrl;
  }
}

export async function uploadAccountProfilePhoto(_uid: string, file: File): Promise<string> {
  return uploadAccountBranding('photo', file);
}

export async function uploadAccountLogo(_uid: string, file: File): Promise<string> {
  return uploadAccountBranding('logo', file);
}

export async function uploadAccountBanner(_uid: string, file: File): Promise<string> {
  return uploadAccountBranding('banner', file);
}

/**
 * Admin-only: list every user account. The Firestore rules grant read on
 * `users/*` to admin claims; ordinary users will get permission-denied.
 */
export async function listAllAccounts(): Promise<UserAccount[]> {
  if (DEMO_MODE) return demoStore.listAllAccounts();
  await awaitFirebaseAuthReady({ refresh: true });

  if (typeof window !== 'undefined') {
    try {
      const res = await adminFetch('/api/admin/accounts');
      if (res.ok) {
        const body = (await res.json()) as { accounts?: UserAccount[] };
        if (Array.isArray(body.accounts)) return body.accounts;
      }
    } catch {
      /* fall through to client Firestore */
    }
  }

  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, USERS));
  const accounts = snap.docs.map((d) =>
    accountFromRaw(d.id, d.data() as Record<string, unknown>),
  );
  return accounts.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}
