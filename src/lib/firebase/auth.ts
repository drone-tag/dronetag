import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  onAuthStateChanged,
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

export type AwaitFirebaseAuthOptions = {
  refresh?: boolean;
};

export async function awaitFirebaseAuthReady(
  options: AwaitFirebaseAuthOptions = {},
): Promise<void> {
  if (DEMO_MODE) return;
  const auth = getFirebaseAuth();
  await new Promise<void>((resolve) => {
    const unsub = onAuthStateChanged(auth, () => {
      unsub();
      resolve();
    });
  });
  const u = auth.currentUser;
  if (u) await u.getIdToken(Boolean(options.refresh));
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
