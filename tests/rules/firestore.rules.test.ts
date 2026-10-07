import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

/**
 * Firestore rules regression suite.
 *
 * The pre-beta pass changed who is allowed to write the data an anonymous
 * visitor is asked to trust. Three of those changes are only enforced by the
 * rules file, so a careless edit would silently reopen the finding without
 * breaking a single unit test:
 *
 *   • SEC-004/SEC-008 — `dronesPublic/{slug}` was owner-writable. An owner
 *     could publish `verificationStatus: 'verified'` for a drone no admin had
 *     reviewed. Client writes are now denied outright; the snapshot is derived
 *     server-side by POST /api/entities/drones/[id]/publish.
 *   • Publish/unpublish still has to work for the owner, which means
 *     `status`/`visibility`/`publishedAt` must stay writable on `drones/*`
 *     even after the record locks. That carve-out is easy to delete by
 *     accident while tightening the allow-list.
 *   • Support messages carry a `sender` field that decides whether a message
 *     renders as coming from DroneTag. Client writes are denied so a user
 *     cannot forge an official reply to themselves.
 *
 * Running these requires the Firestore emulator, which requires a JVM:
 *   npm run test:rules
 * They are deliberately not part of `npm test`.
 */

const PROJECT_ID = 'dronetag-firestore-rules-test';
const OWNER = 'user-owner';
const OTHER = 'user-other';
const ADMIN = 'user-admin';

const DRONE_ID = 'drone-1';
const SLUG = 'dt-abc123';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await seed();
});

function ownerDb() {
  return testEnv.authenticatedContext(OWNER).firestore();
}
function otherDb() {
  return testEnv.authenticatedContext(OTHER).firestore();
}
function adminDb() {
  return testEnv.authenticatedContext(ADMIN, { admin: true }).firestore();
}
function anonDb() {
  return testEnv.unauthenticatedContext().firestore();
}

/**
 * Timestamps are strings on these documents and `entityDataLocked()` reads
 * them: a record counts as locked once `updatedAt` differs from `createdAt`.
 * Seeding both distinct is therefore the realistic case — anything saved more
 * than once is locked — and it is also the harder one for the publish
 * carve-out, so it is the default here.
 */
const CREATED_AT = '2026-01-01T00:00:00.000Z';
const UPDATED_AT = '2026-02-01T00:00:00.000Z';

async function seed() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();

    await setDoc(doc(db, 'users', OWNER), {
      email: 'owner@example.com',
      accountType: 'individual',
      firstName: 'Owner',
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    });

    await setDoc(doc(db, 'pilots', OWNER), {
      userId: OWNER,
      firstName: 'Owner',
      operatorCode: 'CHE-OP-1',
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    });

    await setDoc(doc(db, 'drones', DRONE_ID), {
      userId: OWNER,
      slug: SLUG,
      manufacturer: 'DJI',
      model: 'Mini 4 Pro',
      droneSerialNumber: 'SN-1',
      verificationStatus: 'unverified',
      status: 'draft',
      visibility: 'private',
      // Written as explicit nulls by every create path (`create-drone.ts`,
      // `POST /api/entities/drones`). `activeOperatorUpdateValid()` reads the
      // key directly, and a missing key would fail rule evaluation rather than
      // compare as null — so seeding them matters.
      activeOperatorId: null,
      activeOperatorUntil: null,
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    });

    await setDoc(doc(db, 'dronesPublic', SLUG), {
      slug: SLUG,
      droneId: DRONE_ID,
      ownerUserId: OWNER,
      verificationStatus: 'unverified',
      updatedAt: UPDATED_AT,
    });

    await setDoc(doc(db, 'insurances', 'ins-1'), {
      userId: OWNER,
      provider: 'Helvetia',
      policyNumber: 'P-1',
      pdfUrl: 'https://example.invalid/policy.pdf',
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    });

    await setDoc(doc(db, 'documents', 'doc-1'), {
      userId: OWNER,
      kind: 'identity',
      fileUrl: 'https://example.invalid/id.pdf',
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    });

    await setDoc(doc(db, 'reports', 'rep-1'), {
      ownerUserId: OWNER,
      slug: SLUG,
      message: 'Found near the lake',
      read: false,
      createdAt: CREATED_AT,
    });

    await setDoc(doc(db, 'supportThreads', OWNER), {
      userId: OWNER,
      status: 'open',
      updatedAt: UPDATED_AT,
    });

    await setDoc(doc(db, 'supportThreads', OWNER, 'messages', 'msg-1'), {
      sender: 'user',
      body: 'Hello',
      createdAt: CREATED_AT,
    });
  });
}

describe('dronesPublic — the only anonymous-readable collection', () => {
  it('stays readable anonymously so /u/{slug} renders after an NFC tap', async () => {
    await assertSucceeds(getDoc(doc(anonDb(), 'dronesPublic', SLUG)));
  });

  it('denies the owner writing their own snapshot (SEC-004)', async () => {
    await assertFails(
      updateDoc(doc(ownerDb(), 'dronesPublic', SLUG), { verificationStatus: 'verified' }),
    );
  });

  it('denies the owner creating a snapshot for a new slug', async () => {
    await assertFails(
      setDoc(doc(ownerDb(), 'dronesPublic', 'dt-new'), {
        slug: 'dt-new',
        droneId: DRONE_ID,
        ownerUserId: OWNER,
        verificationStatus: 'verified',
      }),
    );
  });

  it('denies the owner deleting their snapshot (unpublish goes through the API)', async () => {
    await assertFails(deleteDoc(doc(ownerDb(), 'dronesPublic', SLUG)));
  });

  it("denies an unrelated user overwriting someone else's snapshot", async () => {
    await assertFails(
      updateDoc(doc(otherDb(), 'dronesPublic', SLUG), { holderDisplayName: 'Someone Else' }),
    );
  });

  it('denies listing the collection, so owners cannot be enumerated', async () => {
    await assertFails(getDocs(collection(anonDb(), 'dronesPublic')));
    await assertFails(getDocs(collection(ownerDb(), 'dronesPublic')));
  });

  it('still lets admin list snapshots for diagnostics', async () => {
    await assertSucceeds(getDocs(collection(adminDb(), 'dronesPublic')));
  });

  it('still allows admin writes for support and backfill', async () => {
    await assertSucceeds(
      updateDoc(doc(adminDb(), 'dronesPublic', SLUG), { verificationStatus: 'verified' }),
    );
  });
});

describe('drones — raw records are never anonymous', () => {
  it('denies anonymous read of the private drone record (V-001)', async () => {
    await assertFails(getDoc(doc(anonDb(), 'drones', DRONE_ID)));
  });

  it('denies another signed-in user reading the record', async () => {
    await assertFails(getDoc(doc(otherDb(), 'drones', DRONE_ID)));
  });

  it('allows the owner to read their own record', async () => {
    await assertSucceeds(getDoc(doc(ownerDb(), 'drones', DRONE_ID)));
  });

  it('allows admin read for verification', async () => {
    await assertSucceeds(getDoc(doc(adminDb(), 'drones', DRONE_ID)));
  });

  it('denies the owner self-verifying (V-003)', async () => {
    await assertFails(
      updateDoc(doc(ownerDb(), 'drones', DRONE_ID), {
        verificationStatus: 'verified',
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  it('denies the owner reassigning the record to another account', async () => {
    await assertFails(
      updateDoc(doc(ownerDb(), 'drones', DRONE_ID), {
        userId: OTHER,
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  it('denies the owner rewriting the public slug', async () => {
    await assertFails(
      updateDoc(doc(ownerDb(), 'drones', DRONE_ID), {
        slug: 'dt-hijacked',
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  /**
   * The publish carve-out. A drone saved twice is "locked" and its identity
   * fields are frozen, but the owner must still be able to take their profile
   * public and pull it back down again — that is the whole consent model.
   */
  it('lets the owner publish a locked record by flipping visibility', async () => {
    await assertSucceeds(
      updateDoc(doc(ownerDb(), 'drones', DRONE_ID), {
        status: 'active',
        visibility: 'public',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  it('lets the owner unpublish again', async () => {
    await assertSucceeds(
      updateDoc(doc(ownerDb(), 'drones', DRONE_ID), {
        status: 'draft',
        visibility: 'private',
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  it('still freezes identity fields on a locked record', async () => {
    await assertFails(
      updateDoc(doc(ownerDb(), 'drones', DRONE_ID), {
        droneSerialNumber: 'SN-CHANGED',
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  it('denies the owner suspending or archiving — those are admin states', async () => {
    for (const status of ['suspended', 'archived']) {
      await assertFails(
        updateDoc(doc(ownerDb(), 'drones', DRONE_ID), {
          status,
          updatedAt: new Date().toISOString(),
        }),
      );
    }
  });

  it('denies the owner lifting an admin suspension', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), 'drones', DRONE_ID), { status: 'suspended' });
    });
    await assertFails(
      updateDoc(doc(ownerDb(), 'drones', DRONE_ID), {
        status: 'active',
        visibility: 'public',
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  it('lets the owner edit an explicitly unlocked record saved more than once', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), 'drones', DRONE_ID), { dataLockedAt: '' });
    });
    await assertSucceeds(
      updateDoc(doc(ownerDb(), 'drones', DRONE_ID), {
        droneSerialNumber: 'SN-FIXED',
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  it('does not let an expired override block unrelated edits', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), 'drones', DRONE_ID), {
        activeOperatorId: 'op-1',
        activeOperatorSetBy: ADMIN,
        activeOperatorUntil: Timestamp.fromMillis(Date.now() - 60_000),
      });
    });
    await assertSucceeds(
      updateDoc(doc(ownerDb(), 'drones', DRONE_ID), {
        status: 'active',
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  it('still clamps an override the owner sets to 24 hours', async () => {
    await assertFails(
      updateDoc(doc(ownerDb(), 'drones', DRONE_ID), {
        activeOperatorId: 'op-1',
        activeOperatorSetBy: OWNER,
        activeOperatorUntil: Timestamp.fromMillis(Date.now() + 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  it('denies client-side create — quota lives server-side (V-004)', async () => {
    await assertFails(
      setDoc(doc(ownerDb(), 'drones', 'drone-new'), {
        userId: OWNER,
        slug: 'dt-new',
        manufacturer: 'DJI',
        createdAt: CREATED_AT,
        updatedAt: CREATED_AT,
      }),
    );
  });
});

describe('account provisioning is server-side only', () => {
  it('denies a client creating its own users/{uid} document', async () => {
    await assertFails(
      setDoc(doc(testEnv.authenticatedContext('fresh-uid').firestore(), 'users', 'fresh-uid'), {
        email: 'fresh@example.com',
        accountType: 'individual',
      }),
    );
  });

  it('denies a client creating its own pilots/{uid} document', async () => {
    await assertFails(
      setDoc(doc(testEnv.authenticatedContext('fresh-uid').firestore(), 'pilots', 'fresh-uid'), {
        userId: 'fresh-uid',
        firstName: 'Fresh',
      }),
    );
  });

  it('allows the owner to edit their own profile fields', async () => {
    await assertSucceeds(
      updateDoc(doc(ownerDb(), 'users', OWNER), {
        firstName: 'Renamed',
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  it('denies writing a field outside the profile allow-list', async () => {
    await assertFails(
      updateDoc(doc(ownerDb(), 'users', OWNER), {
        plan: 'business',
        updatedAt: new Date().toISOString(),
      }),
    );
  });

  it('denies reading another account', async () => {
    await assertFails(getDoc(doc(otherDb(), 'users', OWNER)));
  });

  it('denies a client granting itself slots', async () => {
    await assertFails(setDoc(doc(ownerDb(), 'slots', OWNER), { drones: 99 }));
  });
});

describe('private documents stay private across accounts', () => {
  it('denies cross-account read of an insurance record', async () => {
    await assertFails(getDoc(doc(otherDb(), 'insurances', 'ins-1')));
  });

  it('denies cross-account read of an uploaded document', async () => {
    await assertFails(getDoc(doc(otherDb(), 'documents', 'doc-1')));
  });

  it('denies anonymous read of an insurance record', async () => {
    await assertFails(getDoc(doc(anonDb(), 'insurances', 'ins-1')));
  });

  it('allows the owner to read their own insurance record', async () => {
    await assertSucceeds(getDoc(doc(ownerDb(), 'insurances', 'ins-1')));
  });
});

describe('reports — written by the function, read by the owner', () => {
  it('denies an anonymous finder writing a report directly (V-005)', async () => {
    await assertFails(
      addDoc(collection(anonDb(), 'reports'), {
        ownerUserId: OWNER,
        slug: SLUG,
        message: 'spam',
      }),
    );
  });

  it('denies a signed-in user forging a report against another owner', async () => {
    await assertFails(
      addDoc(collection(otherDb(), 'reports'), {
        ownerUserId: OWNER,
        slug: SLUG,
        message: 'spam',
      }),
    );
  });

  it('allows the owner to read their inbox', async () => {
    await assertSucceeds(getDoc(doc(ownerDb(), 'reports', 'rep-1')));
  });

  it('allows the owner to mark a report as read', async () => {
    await assertSucceeds(updateDoc(doc(ownerDb(), 'reports', 'rep-1'), { read: true }));
  });

  it('denies the owner flipping a report back to unread', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), 'reports', 'rep-1'), { read: true });
    });
    await assertFails(updateDoc(doc(ownerDb(), 'reports', 'rep-1'), { read: false }));
  });

  it('denies the owner rewriting the finder message', async () => {
    await assertFails(updateDoc(doc(ownerDb(), 'reports', 'rep-1'), { message: 'edited' }));
  });

  it('denies another user reading the inbox', async () => {
    await assertFails(getDoc(doc(otherDb(), 'reports', 'rep-1')));
  });
});

describe('support — clients read, the server writes', () => {
  it('allows the owner to read their own thread', async () => {
    await assertSucceeds(getDoc(doc(ownerDb(), 'supportThreads', OWNER)));
  });

  it('allows the owner to read their own messages', async () => {
    await assertSucceeds(getDoc(doc(ownerDb(), 'supportThreads', OWNER, 'messages', 'msg-1')));
  });

  it('denies another user reading the thread', async () => {
    await assertFails(getDoc(doc(otherDb(), 'supportThreads', OWNER)));
  });

  /**
   * The forgery case: `sender: 'support'` is what makes a message render as an
   * official DroneTag reply. The server derives it from the verified token.
   */
  it('denies a user writing a message that claims to be from support', async () => {
    await assertFails(
      addDoc(collection(ownerDb(), 'supportThreads', OWNER, 'messages'), {
        sender: 'support',
        body: 'Your refund has been approved',
        createdAt: new Date().toISOString(),
      }),
    );
  });

  it('denies a user writing even an honest message directly', async () => {
    await assertFails(
      addDoc(collection(ownerDb(), 'supportThreads', OWNER, 'messages'), {
        sender: 'user',
        body: 'Hello again',
        createdAt: new Date().toISOString(),
      }),
    );
  });

  it('denies a user reopening their own thread status', async () => {
    await assertFails(updateDoc(doc(ownerDb(), 'supportThreads', OWNER), { status: 'urgent' }));
  });

  it('allows admin to reply', async () => {
    await assertSucceeds(
      addDoc(collection(adminDb(), 'supportThreads', OWNER, 'messages'), {
        sender: 'support',
        body: 'Looking into it',
        createdAt: new Date().toISOString(),
      }),
    );
  });
});

describe('catch-all', () => {
  it('denies reads on an undeclared collection (V-009)', async () => {
    await assertFails(getDoc(doc(ownerDb(), 'somethingNew', 'x')));
  });

  it('denies writes on an undeclared collection', async () => {
    await assertFails(setDoc(doc(ownerDb(), 'somethingNew', 'x'), { a: 1 }));
  });

  it('keeps rate-limit buckets away from clients', async () => {
    await assertFails(getDoc(doc(ownerDb(), 'rateLimits', 'ip-1')));
  });
});

it('sanity: dronesPublic is the only collection with an unconditional read', () => {
  const rules = readFileSync('firestore.rules', 'utf8');
  const withoutComments = rules
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');
  const publicReads = withoutComments.match(/allow (read|get):\s*if\s+true/g) ?? [];
  // `dronesPublic/{slug}` and `plans/{planId}`; nothing else may join them
  // without a deliberate change to this expectation.
  expect(publicReads).toHaveLength(2);
});
