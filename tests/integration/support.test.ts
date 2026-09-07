import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Tests for the support endpoints.
 *
 * Support was entirely non-functional before this — every live call threw
 * `support_unavailable` — so these tests cover the properties that make the
 * new implementation safe rather than merely working:
 *
 *   • A user reaches their own thread and no one else's. There is no thread id
 *     in the user-facing API; it is derived from the token.
 *   • `sender` cannot be forged. A user cannot post a message that renders as
 *     coming from DroneTag support.
 *   • The admin endpoints require the admin claim, not merely a valid session.
 *
 * Firebase Admin is mocked. What is under test is the handlers' decisions.
 */

const verifyIdToken = vi.fn();

interface StoredDoc {
  data: Record<string, unknown>;
  messages: Map<string, Record<string, unknown>>;
}

const threads = new Map<string, StoredDoc>();

function threadDoc(uid: string) {
  const ensure = () => {
    if (!threads.has(uid)) threads.set(uid, { data: {}, messages: new Map() });
    return threads.get(uid)!;
  };

  return {
    get: async () => ({
      exists: threads.has(uid),
      data: () => threads.get(uid)?.data,
    }),
    set: async (data: Record<string, unknown>) => {
      ensure().data = { ...data };
    },
    update: async (patch: Record<string, unknown>) => {
      const doc = ensure();
      for (const [k, v] of Object.entries(patch)) {
        // Mimic FieldValue.increment well enough for the unread counters.
        if (v && typeof v === 'object' && '__increment' in (v as object)) {
          const by = (v as { __increment: number }).__increment;
          doc.data[k] = ((doc.data[k] as number) ?? 0) + by;
        } else {
          doc.data[k] = v;
        }
      }
    },
    // The mock backs a single collection, so the name is ignored.
    collection: () => ({
      doc: (id = `m${ensure().messages.size + 1}`) => ({
        id,
        set: async (data: Record<string, unknown>) => {
          ensure().messages.set(id, data);
        },
      }),
      orderBy: () => ({
        limit: () => ({
          get: async () => ({
            docs: [...ensure().messages.values()].map((data) => ({ data: () => data })),
          }),
        }),
      }),
      where: () => ({
        limit: () => ({ get: async () => ({ empty: true, docs: [] }) }),
      }),
    }),
  };
}

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { increment: (n: number) => ({ __increment: n }) },
}));

vi.mock('@/lib/server/firebaseAdmin', () => ({
  isFirebaseAdminConfigured: () => true,
  adminAuth: () => ({ verifyIdToken, getUser: async () => ({ email: 'owner@example.test' }) }),
  adminFirestore: () => ({
    collection: () => ({
      doc: (uid: string) => threadDoc(uid),
      orderBy: () => ({
        limit: () => ({
          get: async () => ({
            docs: [...threads.entries()].map(([id, v]) => ({ id, data: () => v.data })),
          }),
        }),
      }),
    }),
    doc: (path: string) => threadDoc(path.split('/').pop() ?? ''),
    batch: () => ({ update: () => undefined, commit: async () => undefined }),
  }),
}));

const userRoute = await import('@/app/api/support/thread/route');
const adminRoute = await import('@/app/api/admin/support/route');

function req(url: string, method: string, token: string | null, body?: unknown) {
  return new Request(`https://dronetag.test${url}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

const asUser = (uid: string) => ({ uid, email: `${uid}@example.test`, admin: false });
const asAdmin = (uid: string) => ({ uid, email: `${uid}@example.test`, admin: true });

beforeEach(() => {
  threads.clear();
  verifyIdToken.mockReset();
});

describe('user endpoint authorisation', () => {
  it('rejects an unauthenticated read', async () => {
    const res = await userRoute.GET(req('/api/support/thread', 'GET', null));
    expect(res.status).toBe(401);
  });

  it('rejects an unauthenticated write', async () => {
    const res = await userRoute.POST(
      req('/api/support/thread', 'POST', null, { body: 'hello' }),
    );
    expect(res.status).toBe(401);
  });

  it('rejects a malformed token', async () => {
    verifyIdToken.mockRejectedValue(new Error('bad token'));
    const res = await userRoute.GET(req('/api/support/thread', 'GET', 'garbage'));
    expect(res.status).toBe(401);
  });
});

describe('thread ownership', () => {
  it('resolves the thread from the token, not from the request', async () => {
    verifyIdToken.mockResolvedValue(asUser('alice'));
    await userRoute.POST(
      // A uid in the body must be ignored — there is no supported way to
      // address someone else's thread from this endpoint.
      req('/api/support/thread', 'POST', 't', { body: 'my drone is stuck', userId: 'bob' }),
    );

    expect(threads.has('alice')).toBe(true);
    expect(threads.has('bob')).toBe(false);
  });

  it('returns only the caller"s own thread', async () => {
    verifyIdToken.mockResolvedValue(asUser('alice'));
    await userRoute.POST(req('/api/support/thread', 'POST', 't', { body: 'from alice' }));

    verifyIdToken.mockResolvedValue(asUser('bob'));
    const res = await userRoute.GET(req('/api/support/thread', 'GET', 't'));
    const payload = await res.json();

    expect(payload.thread).toBeNull();
    expect(payload.messages).toEqual([]);
  });
});

describe('sender cannot be forged', () => {
  it('records a user message as sender=user even if the body claims otherwise', async () => {
    verifyIdToken.mockResolvedValue(asUser('alice'));
    await userRoute.POST(
      req('/api/support/thread', 'POST', 't', { body: 'trust me', sender: 'admin' }),
    );

    const messages = [...threads.get('alice')!.messages.values()];
    expect(messages).toHaveLength(1);
    expect(messages[0].sender).toBe('user');
    expect(messages[0].senderUid).toBe('alice');
  });

  it('refuses a non-admin trying to reply through the admin endpoint', async () => {
    verifyIdToken.mockResolvedValue(asUser('mallory'));
    const res = await adminRoute.POST(
      req('/api/admin/support', 'POST', 't', { userId: 'alice', body: 'official reply' }),
    );

    expect(res.status).toBe(403);
    expect(threads.has('alice')).toBe(false);
  });

  it('lets a real admin reply, attributed to support', async () => {
    verifyIdToken.mockResolvedValue(asUser('alice'));
    await userRoute.POST(req('/api/support/thread', 'POST', 't', { body: 'help' }));

    verifyIdToken.mockResolvedValue(asAdmin('root'));
    const res = await adminRoute.POST(
      req('/api/admin/support', 'POST', 't', { userId: 'alice', body: 'on it' }),
    );

    expect(res.status).toBe(200);
    const messages = [...threads.get('alice')!.messages.values()];
    expect(messages.at(-1)).toMatchObject({ sender: 'admin', senderUid: 'root' });
  });
});

describe('thread state', () => {
  it('moves to open on a user message and pending on a support reply', async () => {
    verifyIdToken.mockResolvedValue(asUser('alice'));
    await userRoute.POST(req('/api/support/thread', 'POST', 't', { body: 'help' }));
    expect(threads.get('alice')!.data.status).toBe('open');

    verifyIdToken.mockResolvedValue(asAdmin('root'));
    await adminRoute.POST(
      req('/api/admin/support', 'POST', 't', { userId: 'alice', body: 'looking into it' }),
    );
    expect(threads.get('alice')!.data.status).toBe('pending');
  });

  it('counts unread for the other side only', async () => {
    verifyIdToken.mockResolvedValue(asUser('alice'));
    await userRoute.POST(req('/api/support/thread', 'POST', 't', { body: 'help' }));

    const data = threads.get('alice')!.data;
    expect(data.adminUnreadCount).toBe(1);
    expect(data.userUnreadCount).toBe(0);
  });

  it('rejects an empty message', async () => {
    verifyIdToken.mockResolvedValue(asUser('alice'));
    const res = await userRoute.POST(
      req('/api/support/thread', 'POST', 't', { body: '   ' }),
    );
    expect(res.status).toBe(400);
  });
});

describe('admin listing', () => {
  it('requires the admin claim', async () => {
    verifyIdToken.mockResolvedValue(asUser('alice'));
    const res = await adminRoute.GET(req('/api/admin/support', 'GET', 't'));
    expect(res.status).toBe(403);
  });

  it('returns every thread to an admin', async () => {
    verifyIdToken.mockResolvedValue(asUser('alice'));
    await userRoute.POST(req('/api/support/thread', 'POST', 't', { body: 'a' }));
    verifyIdToken.mockResolvedValue(asUser('bob'));
    await userRoute.POST(req('/api/support/thread', 'POST', 't', { body: 'b' }));

    verifyIdToken.mockResolvedValue(asAdmin('root'));
    const res = await adminRoute.GET(req('/api/admin/support', 'GET', 't'));
    const { threads: list } = await res.json();

    expect(list.map((t: { userId: string }) => t.userId).sort()).toEqual(['alice', 'bob']);
  });
});
