import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Tests for POST /api/account/provision.
 *
 * This route is what makes signup work at all: Firestore rules deny client
 * creates on `users/{uid}` and `pilots/{uid}`, so before it existed a new user
 * got a Firebase Auth identity backed by no application records.
 *
 * The properties worth protecting are authorisation and idempotency. Firebase
 * Admin is mocked — the point is the handler's decisions, not Firestore's
 * behaviour, which is covered by the rules suite.
 */

const verifyIdToken = vi.fn();
const docs = new Map<string, Record<string, unknown>>();
const setCalls: { path: string; data: Record<string, unknown> }[] = [];

vi.mock('@/lib/server/firebaseAdmin', () => ({
  isFirebaseAdminConfigured: () => true,
  adminAuth: () => ({ verifyIdToken }),
  adminFirestore: () => ({
    doc: (path: string) => ({
      get: async () => ({
        exists: docs.has(path),
        data: () => docs.get(path),
      }),
      set: async (data: Record<string, unknown>) => {
        docs.set(path, data);
        setCalls.push({ path, data });
      },
    }),
  }),
}));

const { POST } = await import('@/app/api/account/provision/route');

function requestWith(token: string | null, body: unknown = {}) {
  return new Request('https://dronetag.test/api/account/provision', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  docs.clear();
  setCalls.length = 0;
  verifyIdToken.mockReset();
});

describe('authorisation', () => {
  it('rejects a request with no token', async () => {
    const res = await POST(requestWith(null));
    expect(res.status).toBe(401);
    expect(setCalls).toHaveLength(0);
  });

  it('rejects a malformed or unverifiable token', async () => {
    verifyIdToken.mockRejectedValue(Object.assign(new Error('bad'), { code: 'auth/argument-error' }));
    const res = await POST(requestWith('not-a-real-token'));
    expect(res.status).toBe(401);
    expect(setCalls).toHaveLength(0);
  });

  it('takes the uid from the token and ignores any uid in the body', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'real-uid', email: 'real@example.com' });

    // A caller trying to provision an account for someone else.
    const res = await POST(requestWith('valid', { uid: 'victim-uid', email: 'victim@example.com' }));
    expect(res.status).toBe(200);

    const paths = setCalls.map((c) => c.path);
    expect(paths).toContain('users/real-uid');
    expect(paths).not.toContain('users/victim-uid');
    expect(paths.some((p) => p.includes('victim'))).toBe(false);
  });

  it('stores the email from the token, not from the body', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'u1', email: 'token@example.com' });
    await POST(requestWith('valid', { email: 'attacker@example.com' }));

    const user = setCalls.find((c) => c.path === 'users/u1')!.data;
    expect(user.email).toBe('token@example.com');
  });
});

describe('provisioning', () => {
  beforeEach(() => {
    verifyIdToken.mockResolvedValue({ uid: 'u1', email: 'u1@example.com' });
  });

  it('creates the account, pilot and slots records for a new user', async () => {
    const res = await POST(requestWith('valid', { firstName: 'Marco', lastName: 'Rossi' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.created).toEqual({ account: true, pilot: true, slots: true });
    expect(setCalls.map((c) => c.path)).toEqual(['users/u1', 'pilots/u1', 'slots/u1']);
  });

  it('is idempotent — a second call writes nothing', async () => {
    await POST(requestWith('valid'));
    setCalls.length = 0;

    const res = await POST(requestWith('valid'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.created).toEqual({ account: false, pilot: false, slots: false });
    expect(setCalls).toHaveLength(0);
  });

  it('repairs an account left half-provisioned by the old broken flow', async () => {
    docs.set('users/u1', { uid: 'u1' });

    const res = await POST(requestWith('valid'));
    const body = await res.json();

    expect(body.created).toEqual({ account: false, pilot: true, slots: true });
    expect(setCalls.map((c) => c.path)).toEqual(['pilots/u1', 'slots/u1']);
  });

  it('provisions from the token alone, as the Google sign-in path does', async () => {
    const res = await POST(
      new Request('https://dronetag.test/api/account/provision', {
        method: 'POST',
        headers: { authorization: 'Bearer valid' },
      }),
    );
    // No body at all: must not 400.
    expect(res.status).toBe(200);
    expect(setCalls.map((c) => c.path)).toContain('users/u1');
  });

  it('rejects an invalid accountType instead of silently defaulting', async () => {
    const res = await POST(requestWith('valid', { accountType: 'superuser' }));
    expect(res.status).toBe(400);
    expect(setCalls).toHaveLength(0);
  });

  it('rejects a malformed date of birth', async () => {
    const res = await POST(requestWith('valid', { dateOfBirth: '12/04/1985' }));
    expect(res.status).toBe(400);
  });

  it('records consent server-side only when the client actually sent it', async () => {
    await POST(requestWith('valid', { acceptedTerms: true }));
    const withConsent = setCalls.find((c) => c.path === 'users/u1')!.data;
    expect(withConsent.acceptedTermsAt).not.toBe('');

    docs.clear();
    setCalls.length = 0;
    await POST(requestWith('valid', {}));
    const without = setCalls.find((c) => c.path === 'users/u1')!.data;
    expect(without.acceptedTermsAt).toBe('');
  });

  it('never grants admin through the provisioning payload', async () => {
    await POST(requestWith('valid', { admin: true, role: 'admin' }));
    const user = setCalls.find((c) => c.path === 'users/u1')!.data;
    expect(user).not.toHaveProperty('admin');
    expect(user).not.toHaveProperty('role');
  });
});
