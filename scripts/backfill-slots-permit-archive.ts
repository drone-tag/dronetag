/**
 * Backfill `permit` and `archive` on existing `slots/{uid}` docs.
 *
 * New accounts get these from `bootstrapSlots`. Legacy docs created before
 * authorizations/archive shipped only had certificate/drone/operator/pdf/…
 *
 * Idempotent: skips docs that already have numeric `permit` and `archive`.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/backfill-slots-permit-archive.ts
 *   npx tsx --env-file=.env.local scripts/backfill-slots-permit-archive.ts --dry-run
 */

import { applicationDefault, cert, initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const DEFAULT_PERMIT = 3;
const DEFAULT_ARCHIVE = 0;

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
    console.error('No Firebase credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY or ADC.', err);
    process.exit(2);
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  initAdminApp();
  const db = getFirestore();
  const snap = await db.collection('slots').get();

  let updated = 0;
  let skipped = 0;

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const needsPermit = typeof data.permit !== 'number';
    const needsArchive = typeof data.archive !== 'number';
    if (!needsPermit && !needsArchive) {
      skipped += 1;
      continue;
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (needsPermit) patch.permit = DEFAULT_PERMIT;
    if (needsArchive) patch.archive = DEFAULT_ARCHIVE;

    console.log(
      dryRun ? '[dry-run]' : '[update]',
      doc.id,
      patch,
    );

    if (!dryRun) {
      await doc.ref.update(patch);
    }
    updated += 1;
  }

    console.log(`Done. updated=${updated} skipped=${skipped} dryRun=${dryRun}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
