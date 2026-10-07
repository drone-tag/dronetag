import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { getBytes, ref, uploadBytes } from 'firebase/storage';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

/**
 * Storage rules regression suite.
 *
 * The finding these guard against (SEC-006) was a single line —
 * `allow read: if true` on `users/{uid}/{allPaths=**}` — which made every
 * uploaded insurance policy and identity document readable by anyone able to
 * guess a path. Paths are derived from ids, so guessing was realistic.
 *
 * The assertions below encode the namespace split that replaced it:
 * `public/users/{uid}/**` is anonymous-readable and images-only, everything
 * under `users/{uid}/**` is owner-or-admin.
 */

const PROJECT_ID = 'dronetag-rules-test';
const OWNER = 'user-owner';
const OTHER = 'user-other';

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearStorage();
});

function ownerStorage() {
  return testEnv.authenticatedContext(OWNER).storage();
}
function otherStorage() {
  return testEnv.authenticatedContext(OTHER).storage();
}
function adminStorage() {
  return testEnv.authenticatedContext('admin-uid', { admin: true }).storage();
}
function anonStorage() {
  return testEnv.unauthenticatedContext().storage();
}

/** Seed an object bypassing rules, so read tests have something to read. */
async function seed(path: string, bytes: Uint8Array, contentType: string) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await uploadBytes(ref(ctx.storage(), path), bytes, { contentType });
  });
}

describe('private namespace users/{uid}/**', () => {
  const policyPath = `users/${OWNER}/insurances/ins-1/policy.pdf`;

  beforeEach(async () => {
    await seed(policyPath, PDF, 'application/pdf');
  });

  it('denies anonymous read of an insurance policy (SEC-006)', async () => {
    await assertFails(getBytes(ref(anonStorage(), policyPath)));
  });

  it('denies another signed-in user read of the policy', async () => {
    await assertFails(getBytes(ref(otherStorage(), policyPath)));
  });

  it('allows the owner to read their own policy', async () => {
    await assertSucceeds(getBytes(ref(ownerStorage(), policyPath)));
  });

  it('allows an admin to read the policy for verification', async () => {
    await assertSucceeds(getBytes(ref(adminStorage(), policyPath)));
  });

  it('denies another user writing into the owner namespace', async () => {
    await assertFails(
      uploadBytes(ref(otherStorage(), `users/${OWNER}/insurances/ins-2/policy.pdf`), PDF, {
        contentType: 'application/pdf',
      }),
    );
  });

  it('allows the owner to upload their own policy', async () => {
    await assertSucceeds(
      uploadBytes(ref(ownerStorage(), `users/${OWNER}/insurances/ins-2/policy.pdf`), PDF, {
        contentType: 'application/pdf',
      }),
    );
  });

  it('rejects SVG, which can carry script on the storage origin (V-013)', async () => {
    await assertFails(
      uploadBytes(ref(ownerStorage(), `users/${OWNER}/documents/x.svg`), PNG, {
        contentType: 'image/svg+xml',
      }),
    );
  });
});

describe('public namespace public/users/{uid}/**', () => {
  const avatarPath = `public/users/${OWNER}/profiles/p1/photo.png`;

  beforeEach(async () => {
    await seed(avatarPath, PNG, 'image/png');
  });

  it('stays readable anonymously so /u/{slug} still renders after an NFC tap', async () => {
    await assertSucceeds(getBytes(ref(anonStorage(), avatarPath)));
  });

  it('allows the owner to upload branding images', async () => {
    await assertSucceeds(
      uploadBytes(ref(ownerStorage(), `public/users/${OWNER}/profiles/p1/logo.png`), PNG, {
        contentType: 'image/png',
      }),
    );
  });

  it('refuses a PDF in the public namespace, so policies cannot be published there', async () => {
    await assertFails(
      uploadBytes(ref(ownerStorage(), `public/users/${OWNER}/profiles/p1/policy.pdf`), PDF, {
        contentType: 'application/pdf',
      }),
    );
  });

  it('denies another user writing into the owner public namespace', async () => {
    await assertFails(
      uploadBytes(ref(otherStorage(), `public/users/${OWNER}/profiles/p1/logo.png`), PNG, {
        contentType: 'image/png',
      }),
    );
  });
});

describe('legacy and unknown paths', () => {
  it('no longer serves the legacy profiles namespace anonymously', async () => {
    await seed('profiles/some-slug/photo.png', PNG, 'image/png');
    await assertFails(getBytes(ref(anonStorage(), 'profiles/some-slug/photo.png')));
  });

  it('denies everything outside the declared namespaces', async () => {
    await assertFails(
      uploadBytes(ref(ownerStorage(), 'random/path.png'), PNG, { contentType: 'image/png' }),
    );
  });
});

describe('size limits', () => {
  it('rejects an image above the 20 MB public cap', async () => {
    const big = new Uint8Array(20 * 1024 * 1024 + 16);
    big.set(PNG);
    await assertFails(
      uploadBytes(ref(ownerStorage(), `public/users/${OWNER}/profiles/p1/big.png`), big, {
        contentType: 'image/png',
      }),
    );
  });

  it('accepts a file below the 50 MB private cap', async () => {
    const ok = new Uint8Array(1024);
    ok.set(PDF);
    await assertSucceeds(
      uploadBytes(ref(ownerStorage(), `users/${OWNER}/documents/ok.pdf`), ok, {
        contentType: 'application/pdf',
      }),
    );
  });
});

it('sanity: the rules file no longer contains a blanket public read', () => {
  const rules = readFileSync('storage.rules', 'utf8');
  const withoutComments = rules
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');
  const publicReads = withoutComments.match(/allow read:\s*if\s+true/g) ?? [];
  // Exactly one is expected: the public branding namespace.
  expect(publicReads).toHaveLength(1);
});
