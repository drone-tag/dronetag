import type { User } from 'firebase/auth';
import type { UserAccount } from '@/lib/types/account';
import { EMPTY_CONTACT_VERIFICATION } from '@/lib/types/contactVerification';
import { MICHELE_CAFFAGNI_BRANDING as MICHELE } from '@/lib/demo/micheleCaffagni';
import { DEMO_BRANDING } from '@/lib/demo/demoBranding';

const ago = (days: number): string =>
  new Date(Date.now() - days * 86400000).toISOString();

export type DemoPersonaId =
  | 'demo-admin'
  | 'demo-michele'
  | 'demo-alpine'
  | 'demo-anna'
  | 'demo-pierre'
  | 'demo-carlos';

export type DemoPersona = {
  id: DemoPersonaId;
  label: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  summary: string;
};

const STORAGE_KEY = 'dronetag-demo-persona';
export const DEMO_PERSONA_EVENT = 'dronetag-demo-persona';

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'demo-admin',
    label: 'Admin · DroneTag',
    email: 'admin@dronetag.io',
    displayName: 'Admin DroneTag',
    isAdmin: true,
    summary: 'Coda verifica, utenti, support — solo area /admin',
  },
  {
    id: 'demo-michele',
    label: 'OK · Michele',
    email: 'michele@360drone.it',
    displayName: 'Michele Caffagni',
    isAdmin: false,
    summary: `Profilo reale 360° Drone — foto/banner/logo · /u/${MICHELE.publicSlug}`,
  },
  {
    id: 'demo-alpine',
    label: 'Azienda · Alpine',
    email: 'ops@alpinedrones.it',
    displayName: 'Alpine Drones SRL',
    isAdmin: false,
    summary: 'Flotta multi-drone + override operatore — /u/alpine-mavic',
  },
  {
    id: 'demo-anna',
    label: 'In verifica · Anna',
    email: 'anna.mueller@skymap.de',
    displayName: 'Anna Müller',
    isAdmin: false,
    summary: 'Attestati pending + polizza in scadenza — verifica da Admin, poi torna su Anna',
  },
  {
    id: 'demo-pierre',
    label: 'Incompleto · Pierre',
    email: 'pierre.dupont@aeropro.fr',
    displayName: 'Pierre Dupont',
    isAdmin: false,
    summary: 'Account nuovo, poco compilato — nessun profilo pubblico attivo',
  },
  {
    id: 'demo-carlos',
    label: 'Critico · Carlos',
    email: 'carlos@dronevista.es',
    displayName: 'Carlos García',
    isAdmin: false,
    summary: 'Assicurazione scaduta + ritrovi non letti — /u/vistaone-carlos',
  },
];

function emptyAddress() {
  return { line1: '', line2: '', city: '', postalCode: '', country: '' };
}

export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    uid: 'demo-admin',
    email: 'admin@dronetag.io',
    accountType: 'private',
    firstName: 'Admin',
    lastName: 'DroneTag',
    dateOfBirth: '',
    phone: '',
    address: emptyAddress(),
    companyName: '',
    companyContactPerson: '',
    companyVat: '',
    companyUniqueNumber: '',
    profilePhotoUrl: DEMO_BRANDING.admin.profilePhotoUrl,
    logoUrl: '',
    bannerUrl: '',
    contactVerification: {
      channels: ['email'],
      emailVerifiedAt: ago(365),
      phoneVerifiedAt: '',
    },
    createdAt: ago(365),
    updatedAt: ago(0),
  },
  {
    uid: 'demo-michele',
    email: 'michele@360drone.it',
    accountType: 'private',
    firstName: 'Michele',
    lastName: 'Caffagni',
    dateOfBirth: '1985-03-12',
    phone: '+39 340 123 4567',
    address: {
      line1: 'Salita della Resistenza 1',
      line2: '360° Drone',
      city: 'Deiva Marina (SP)',
      postalCode: '19013',
      country: 'Italy',
    },
    companyName: MICHELE.companyName,
    companyContactPerson: 'Michele Caffagni',
    companyVat: '',
    companyUniqueNumber: '',
    profilePhotoUrl: MICHELE.profilePhotoUrl,
    logoUrl: MICHELE.logoUrl,
    bannerUrl: MICHELE.bannerUrl,
    contactVerification: {
      channels: ['email', 'phone'],
      emailVerifiedAt: ago(120),
      phoneVerifiedAt: ago(120),
    },
    createdAt: ago(120),
    updatedAt: ago(0),
  },
  {
    uid: 'demo-alpine',
    email: 'ops@alpinedrones.it',
    accountType: 'company',
    firstName: 'Luca',
    lastName: 'Ferrari',
    dateOfBirth: '',
    phone: '+39 0471 555 210',
    address: {
      line1: 'Via Roma 42',
      line2: '',
      city: 'Bolzano',
      postalCode: '39100',
      country: 'Italy',
    },
    companyName: 'Alpine Drones SRL',
    companyContactPerson: 'Luca Ferrari',
    companyVat: 'IT02345678901',
    companyUniqueNumber: 'REA BZ-123456',
    profilePhotoUrl: DEMO_BRANDING.alpine.profilePhotoUrl,
    logoUrl: DEMO_BRANDING.alpine.logoUrl,
    bannerUrl: DEMO_BRANDING.alpine.bannerUrl,
    contactVerification: {
      channels: ['email', 'phone'],
      emailVerifiedAt: ago(200),
      phoneVerifiedAt: ago(200),
    },
    createdAt: ago(210),
    updatedAt: ago(1),
  },
  {
    uid: 'demo-anna',
    email: 'anna.mueller@skymap.de',
    accountType: 'private',
    firstName: 'Anna',
    lastName: 'Müller',
    dateOfBirth: '1992-07-22',
    phone: '+49 170 1234567',
    address: {
      line1: 'Hauptstr. 15',
      line2: '',
      city: 'München',
      postalCode: '80331',
      country: 'Germany',
    },
    companyName: '',
    companyContactPerson: '',
    companyVat: '',
    companyUniqueNumber: '',
    profilePhotoUrl: DEMO_BRANDING.anna.profilePhotoUrl,
    logoUrl: DEMO_BRANDING.anna.logoUrl,
    bannerUrl: DEMO_BRANDING.anna.bannerUrl,
    contactVerification: {
      channels: ['email'],
      emailVerifiedAt: ago(30),
      phoneVerifiedAt: '',
    },
    createdAt: ago(45),
    updatedAt: ago(1),
  },
  {
    uid: 'demo-pierre',
    email: 'pierre.dupont@aeropro.fr',
    accountType: 'company',
    firstName: 'Pierre',
    lastName: 'Dupont',
    dateOfBirth: '',
    phone: '',
    address: emptyAddress(),
    companyName: 'AeroPro SARL',
    companyContactPerson: 'Pierre Dupont',
    companyVat: '',
    companyUniqueNumber: '',
    profilePhotoUrl: DEMO_BRANDING.pierre.profilePhotoUrl,
    logoUrl: '',
    bannerUrl: '',
    contactVerification: { ...EMPTY_CONTACT_VERIFICATION },
    createdAt: ago(3),
    updatedAt: ago(3),
  },
  {
    uid: 'demo-carlos',
    email: 'carlos@dronevista.es',
    accountType: 'company',
    firstName: 'Carlos',
    lastName: 'García',
    dateOfBirth: '1978-11-05',
    phone: '+34 612 345 678',
    address: {
      line1: 'Calle Gran Vía 28',
      line2: '',
      city: 'Madrid',
      postalCode: '28013',
      country: 'Spain',
    },
    companyName: 'DroneVista S.L.',
    companyContactPerson: 'Carlos García',
    companyVat: 'ESB12345678',
    companyUniqueNumber: '',
    profilePhotoUrl: DEMO_BRANDING.carlos.profilePhotoUrl,
    logoUrl: DEMO_BRANDING.carlos.logoUrl,
    bannerUrl: DEMO_BRANDING.carlos.bannerUrl,
    contactVerification: {
      channels: ['email', 'phone'],
      emailVerifiedAt: ago(150),
      phoneVerifiedAt: ago(150),
    },
    createdAt: ago(180),
    updatedAt: ago(8),
  },
];

export function getDemoPersonaId(): DemoPersonaId {
  if (typeof window === 'undefined') return 'demo-admin';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (DEMO_PERSONAS.some((p) => p.id === raw)) return raw as DemoPersonaId;
  } catch {
    /* ignore */
  }
  return 'demo-admin';
}

export function getDemoPersona(id = getDemoPersonaId()): DemoPersona {
  return DEMO_PERSONAS.find((p) => p.id === id) ?? DEMO_PERSONAS[0];
}

/**
 * `useSyncExternalStore` pair for the persona held in localStorage.
 *
 * The server has no localStorage, so the server snapshot is the same default
 * the markup is rendered with; React swaps in the stored value once hydration
 * is done. That is the same two-pass behaviour the switcher used to get from an
 * effect, minus the extra state write that made it a cascading render.
 */
export function subscribeDemoPersona(onChange: () => void): () => void {
  window.addEventListener(DEMO_PERSONA_EVENT, onChange);
  return () => window.removeEventListener(DEMO_PERSONA_EVENT, onChange);
}

export function getDemoPersonaServerSnapshot(): DemoPersonaId {
  return 'demo-admin';
}

export function setDemoPersonaId(id: DemoPersonaId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DEMO_PERSONA_EVENT, { detail: id }));
  }
}

export function buildDemoAuthUser(persona = getDemoPersona()): User {
  const token = `demo-token-${persona.id}`;
  return {
    uid: persona.id,
    email: persona.email,
    displayName: persona.displayName,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    delete: async () => undefined,
    getIdToken: async () => token,
    getIdTokenResult: async () => ({
      token,
      claims: { admin: persona.isAdmin },
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      signInProvider: 'custom',
      signInSecondFactor: null,
    }),
    reload: async () => undefined,
    toJSON: () => ({}),
  } as unknown as User;
}
