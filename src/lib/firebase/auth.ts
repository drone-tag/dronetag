import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Unsubscribe,
  type User,
  type UserCredential,
} from 'firebase/auth';

import { DEMO_MODE, getFirebaseAuth } from '@/lib/firebase/config';
import {
  buildDemoAuthUser,
  getDemoPersona,
  type DemoPersonaId,
} from '@/lib/demo/personas';

export type GoogleSignInResult = UserCredential & {
  isNewUser: boolean;
};

function currentDemoUser(): User {
  return buildDemoAuthUser(getDemoPersona());
}

export function loginWithGoogle(): Promise<GoogleSignInResult> {
  if (DEMO_MODE) {
    return Promise.resolve({ user: currentDemoUser(), isNewUser: false } as GoogleSignInResult);
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(getFirebaseAuth(), provider).then((credential) => {
    const info = getAdditionalUserInfo(credential);
    return { ...credential, isNewUser: info?.isNewUser ?? false };
  });
}

export function loginWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  if (DEMO_MODE) {
    return Promise.resolve({ user: currentDemoUser() } as UserCredential);
  }
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signupWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<UserCredential> {
  if (DEMO_MODE) {
    return { user: currentDemoUser() } as UserCredential;
  }
  const credential = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  );
  if (displayName && credential.user) {
    try {
      await updateProfile(credential.user, { displayName });
    } catch {
      /* non-fatal */
    }
  }
  return credential;
}

export function logout(): Promise<void> {
  if (DEMO_MODE) return Promise.resolve();
  return signOut(getFirebaseAuth());
}

/**
 * Send a Firebase password-reset email.
 *
 * `auth/user-not-found` is swallowed on purpose. Firebase distinguishes a
 * missing account from other failures, and surfacing that distinction would
 * let anyone use the reset form to test whether an address is registered.
 * The caller shows the same confirmation either way, so this function
 * resolves rather than rejects in that case.
 *
 * Other errors — network, quota, misconfigured project — still reject, since
 * those genuinely mean the request did not go through and the user should be
 * told to retry.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  if (DEMO_MODE) return;
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  } catch (err) {
    const code = (err as { code?: string }).code ?? '';
    if (code === 'auth/user-not-found' || code === 'auth/invalid-email') return;
    throw err;
  }
}

export type AwaitFirebaseAuthOptions = {
  /**
   * Make sure the token carries the latest custom claims before an
   * admin-only read. Costs a network round trip at most once per signed-in
   * identity, and only when the cached token has no admin claim yet.
   */
  refresh?: boolean;
};

let identityRefresh: { uid: string; promise: Promise<void> } | null = null;

function refreshTokenOncePerIdentity(u: User): Promise<void> {
  if (!identityRefresh || identityRefresh.uid !== u.uid) {
    const promise: Promise<void> = u.getIdToken(true).then(
      () => undefined,
      () => {
        if (identityRefresh?.promise === promise) identityRefresh = null;
      },
    );
    identityRefresh = { uid: u.uid, promise };
  }
  return identityRefresh.promise;
}

/**
 * Resolve once the cached token is good enough for admin-gated reads and
 * API calls: a token that already carries `admin: true` is used as is, any
 * other token is refreshed once so a freshly granted claim is picked up.
 */
export async function ensureFreshClaims(u: User): Promise<void> {
  if (DEMO_MODE) return;
  try {
    const result = await u.getIdTokenResult();
    if (result.claims.admin === true) return;
  } catch {
    /* fall through to a forced refresh */
  }
  await refreshTokenOncePerIdentity(u);
}

export async function awaitFirebaseAuthReady(
  options: AwaitFirebaseAuthOptions = {},
): Promise<void> {
  if (DEMO_MODE) return;
  const auth = getFirebaseAuth();
  await auth.authStateReady();
  const u = auth.currentUser;
  if (!u) return;
  if (options.refresh) await ensureFreshClaims(u);
}

export function onAuthChange(
  callback: (user: User | null) => void,
): Unsubscribe {
  if (DEMO_MODE) {
    const timer = setTimeout(() => callback(currentDemoUser()), 50);
    return () => clearTimeout(timer);
  }
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export function getCurrentUser(): User | null {
  if (DEMO_MODE) return currentDemoUser();
  try {
    return getFirebaseAuth().currentUser;
  } catch {
    return null;
  }
}

export function getDemoAuthPersonaId(): DemoPersonaId {
  return getDemoPersona().id;
}
