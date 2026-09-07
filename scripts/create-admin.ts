/**
 * Bootstrap the first DroneTag administrator.
 *
 * SECURITY HISTORY — read before editing.
 * ---------------------------------------
 * Until the pre-beta hardening pass this file contained a hardcoded admin
 * email AND a hardcoded plaintext password, plus the full Firebase web
 * config, all committed to git. That credential must be considered
 * COMPROMISED and rotated manually in the Firebase Console — deleting it
 * from the source tree does not invalidate it.
 *
 * This rewrite guarantees that no password ever exists in the repository:
 *
 *   • the script runs on firebase-admin with server-side credentials,
 *     never on the client SDK;
 *   • when a new Auth user has to be created, its initial password is a
 *     cryptographically random value that is generated in memory, never
 *     logged, never persisted and immediately discarded;
 *   • the operator receives a one-time password-reset link and chooses
 *     the real password themselves, so it never transits through this
 *     process at all.
 *
 * Prefer `npm run grant-admin -- <email>` when the user already exists.
 * This script exists only for the very first administrator, when there is
 * no account to promote yet.
 *
 * Credentials (first match wins), same resolution as grant-admin.ts:
 *   1. FIREBASE_SERVICE_ACCOUNT_KEY — JSON one-liner in .env.local
 *   2. gcloud Application Default Credentials —
 *      run: gcloud auth application-default login
 *
 * Usage:
 *
 *   npm run create-admin -- <email>
 *   ADMIN_BOOTSTRAP_EMAIL=<email> npm run create-admin
 */

import { randomBytes } from 'node:crypto';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function parseEmail(argv: string[]): string {
  const positional = argv.filter((a) => !a.startsWith('--'));
  const email = (positional[0] ?? process.env.ADMIN_BOOTSTRAP_EMAIL ?? '').trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Usage: npm run create-admin -- <email>');
    console.error('   or: ADMIN_BOOTSTRAP_EMAIL=<email> npm run create-admin');
    process.exit(1);
  }
  return email;
}

function initAdminApp(): void {
  if (getApps().length > 0) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (raw) {
    try {
      initializeApp({ credential: cert(JSON.parse(raw) as Parameters<typeof cert>[0]) });
      return;
    } catch (err) {
      console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON:', err);
      process.exit(2);
    }
  }

  try {
    initializeApp({ credential: applicationDefault() });
  } catch (err) {
    console.error(
      'No Firebase Admin credentials found.\n' +
        '  Option A: set FIREBASE_SERVICE_ACCOUNT_KEY in .env.local (JSON one-liner)\n' +
        '  Option B: gcloud auth application-default login (no key file needed)',
    );
    console.error(err);
    process.exit(2);
  }
}

/**
 * Placeholder password for a freshly created account. It is never shown to
 * anyone: the operator sets the real one through the reset link. 48 random
 * bytes keep it far above any brute-force concern for the seconds it lives.
 */
function throwawayPassword(): string {
  return randomBytes(48).toString('base64url');
}

async function main() {
  const email = parseEmail(process.argv.slice(2));

  initAdminApp();
  const auth = getAuth();

  let user = await auth.getUserByEmail(email).catch(() => null);
  let created = false;

  if (!user) {
    user = await auth.createUser({
      email,
      emailVerified: false,
      password: throwawayPassword(),
      displayName: 'DroneTag Admin',
    });
    created = true;
  }

  const existing = user.customClaims ?? {};
  const next = { ...existing, admin: true };
  await auth.setCustomUserClaims(user.uid, next);

  // Invalidate any session minted before the claim change.
  await auth.revokeRefreshTokens(user.uid);

  const resetLink = await auth.generatePasswordResetLink(email);

  console.log('[create-admin] OK');
  console.log(`  email:   ${email}`);
  console.log(`  uid:     ${user.uid}`);
  console.log(`  created: ${created ? 'yes (new Auth user)' : 'no (existing user promoted)'}`);
  console.log(`  claims:  ${JSON.stringify(next)}`);
  console.log('');
  console.log('  Set the password with this one-time link (do not commit or share it):');
  console.log(`  ${resetLink}`);
  console.log('');
  console.log('  The claim takes effect on next sign-in.');
}

main().catch((e) => {
  console.error('[create-admin] failed:', e instanceof Error ? e.message : e);
  process.exit(1);
});
