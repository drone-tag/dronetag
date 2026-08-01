import type { Order, UserAccount } from '@/lib/types/account';
import { EMPTY_CONTACT_VERIFICATION } from '@/lib/types/contactVerification';
import { DEMO_ORDERS } from './accountData';
import { DEMO_ACCOUNTS } from './personas';
import { MICHELE_CAFFAGNI_BRANDING as MICHELE } from './micheleCaffagni';
import { DEMO_BRANDING } from './demoBranding';

const ACCOUNTS_STORAGE_KEY = 'dronetag-demo-accounts-v4';

function applySeedBranding(uid: string, merged: UserAccount): void {
  if (uid === 'demo-michele') {
    merged.profilePhotoUrl = MICHELE.profilePhotoUrl;
    merged.logoUrl = MICHELE.logoUrl;
    merged.bannerUrl = MICHELE.bannerUrl;
    merged.companyName = MICHELE.companyName;
    merged.companyContactPerson = 'Michele Caffagni';
    return;
  }
  const map: Record<string, { profilePhotoUrl: string; logoUrl: string; bannerUrl: string }> = {
    'demo-admin': DEMO_BRANDING.admin,
    'demo-alpine': DEMO_BRANDING.alpine,
    'demo-anna': DEMO_BRANDING.anna,
    'demo-pierre': DEMO_BRANDING.pierre,
    'demo-carlos': DEMO_BRANDING.carlos,
  };
  const b = map[uid];
  if (!b) return;
  merged.profilePhotoUrl = b.profilePhotoUrl;
  merged.logoUrl = b.logoUrl;
  merged.bannerUrl = b.bannerUrl;
}

function loadAccounts(): UserAccount[] {
  const base = DEMO_ACCOUNTS.map((a) => ({ ...a, address: { ...a.address } }));
  if (typeof window === 'undefined') return base;
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as UserAccount[];
    if (!Array.isArray(saved)) return base;
    const byUid = new Map(saved.map((a) => [a.uid, a]));
    return base.map((a) => {
      const s = byUid.get(a.uid);
      if (!s) return a;
      const merged: UserAccount = {
        ...a,
        ...s,
        uid: a.uid,
        email: a.email || s.email,
        profilePhotoUrl: s.profilePhotoUrl || a.profilePhotoUrl,
        logoUrl: s.logoUrl || a.logoUrl,
        bannerUrl: s.bannerUrl || a.bannerUrl,
        address: { ...a.address, ...s.address },
      };
      applySeedBranding(a.uid, merged);
      return merged;
    });
  } catch {
    return base;
  }
}

let accounts: UserAccount[] = loadAccounts();
const orders: Order[] = [...DEMO_ORDERS];

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersistAccounts(): void {
  if (typeof window === 'undefined') return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch {
      // quota — branding may not survive reload
    }
  }, 40);
}

function delay(ms = 120): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getAccountByUid(uid: string): Promise<UserAccount | null> {
  await delay();
  return accounts.find((a) => a.uid === uid) ?? null;
}

export async function ensureAccount(
  uid: string,
  email: string,
  seed: Partial<UserAccount> = {},
): Promise<UserAccount> {
  await delay();
  const existing = accounts.find((a) => a.uid === uid);
  if (existing) return existing;
  const now = new Date().toISOString();
  const account: UserAccount = {
    uid,
    email,
    accountType: seed.accountType ?? 'private',
    firstName: seed.firstName ?? '',
    lastName: seed.lastName ?? '',
    dateOfBirth: seed.dateOfBirth ?? '',
    phone: seed.phone ?? '',
    address: seed.address ?? {
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      country: '',
    },
    companyName: seed.companyName ?? '',
    companyContactPerson: seed.companyContactPerson ?? '',
    companyVat: seed.companyVat ?? '',
    companyUniqueNumber: seed.companyUniqueNumber ?? '',
    profilePhotoUrl: seed.profilePhotoUrl ?? '',
    logoUrl: seed.logoUrl ?? '',
    bannerUrl: seed.bannerUrl ?? '',
    contactVerification: seed.contactVerification ?? { ...EMPTY_CONTACT_VERIFICATION },
    createdAt: now,
    updatedAt: now,
  };
  accounts = [...accounts, account];
  schedulePersistAccounts();
  return account;
}

export async function updateAccount(
  uid: string,
  patch: Partial<UserAccount>,
): Promise<void> {
  await delay();
  accounts = accounts.map((a) =>
    a.uid === uid
      ? { ...a, ...patch, uid: a.uid, updatedAt: new Date().toISOString() }
      : a,
  );
  schedulePersistAccounts();
}

export async function listAllAccounts(): Promise<UserAccount[]> {
  await delay();
  return [...accounts].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function getOrdersByUser(uid: string): Promise<Order[]> {
  await delay();
  return orders
    .filter((o) => o.userId === uid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderById(
  id: string,
  uid: string,
): Promise<Order | null> {
  await delay();
  const order = orders.find((o) => o.id === id);
  if (!order || order.userId !== uid) return null;
  return order;
}

/** Wipe persisted account branding (settings “reset demo”). */
export function resetDemoAccounts(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
      localStorage.removeItem('dronetag-demo-accounts-v2');
      localStorage.removeItem('dronetag-demo-accounts-v3');
    } catch {
      /* ignore */
    }
  }
  accounts = DEMO_ACCOUNTS.map((a) => ({ ...a, address: { ...a.address } }));
}
