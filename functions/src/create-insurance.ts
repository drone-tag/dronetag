/**
 * createInsurance — owner-only callable. One policy may cover many drones
 * (`droneIds`); each listed drone gets `insuranceId` set. verificationStatus
 * forced to 'unverified' (V-003).
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import {
  cleanString,
  nowIso,
  requireAppCheck,
  requireAuth,
  sanitizeAllowedUrl,
} from './util';

interface Input {
  link?: string;
  droneId?: string | null;
  droneIds?: string[];
  operatorId?: string | null;
  provider?: string;
  policyNumber?: string;
  holderName?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
  pdfUrl?: string;
}

function normalizeDroneIds(droneIds: unknown, droneId: string | null): string[] {
  const fromArray = Array.isArray(droneIds)
    ? droneIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    : [];
  if (fromArray.length > 0) return [...new Set(fromArray.map((id) => id.trim()))];
  if (droneId) return [droneId];
  return [];
}

export const createInsurance = onCall<Input>(async (request) => {
  requireAppCheck(request, 'createInsurance');
  const ctx = requireAuth(request);

  const link = cleanString(request.data.link, 16);
  if (link !== 'drone' && link !== 'operator') {
    throw new HttpsError('invalid-argument', 'link must be "drone" or "operator".');
  }

  const provider = cleanString(request.data.provider, 200);
  const policyNumber = cleanString(request.data.policyNumber, 128);
  if (!provider || !policyNumber) {
    throw new HttpsError('invalid-argument', 'provider and policyNumber are required.');
  }

  const issueDate = cleanString(request.data.issueDate, 32);
  const expiryDate = cleanString(request.data.expiryDate, 32);
  if (issueDate && expiryDate && expiryDate < issueDate) {
    throw new HttpsError('invalid-argument', 'expiryDate must be on or after issueDate.');
  }

  const legacyDroneId =
    typeof request.data.droneId === 'string' && request.data.droneId.trim()
      ? request.data.droneId.trim()
      : null;
  const droneIds = normalizeDroneIds(request.data.droneIds, legacyDroneId);
  const droneId = droneIds[0] ?? null;
  const operatorId =
    link === 'operator' && typeof request.data.operatorId === 'string'
      ? request.data.operatorId
      : null;

  const db = getFirestore();
  for (const id of droneIds) {
    const ds = await db.collection('drones').doc(id).get();
    if (!ds.exists || (ds.data() as { userId?: string }).userId !== ctx.uid) {
      throw new HttpsError('failed-precondition', 'Linked drone does not belong to caller.');
    }
  }
  if (operatorId) {
    const os = await db.collection('operators').doc(operatorId).get();
    if (!os.exists || (os.data() as { userId?: string }).userId !== ctx.uid) {
      throw new HttpsError('failed-precondition', 'Linked operator does not belong to caller.');
    }
  }

  const pdfUrl = sanitizeAllowedUrl(request.data.pdfUrl, 'pdfUrl');
  const batch = db.batch();
  const ref = db.collection('insurances').doc();
  batch.set(ref, {
    userId: ctx.uid,
    link,
    droneId,
    droneIds,
    operatorId,
    provider,
    policyNumber,
    holderName: cleanString(request.data.holderName, 200),
    issueDate,
    expiryDate,
    notes: cleanString(request.data.notes, 4000),
    pdfUrl,
    verificationStatus: 'unverified',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    dataLockedAt: nowIso(),
  });

  for (const id of droneIds) {
    batch.update(db.collection('drones').doc(id), {
      insuranceId: ref.id,
      updatedAt: nowIso(),
    });
  }

  await batch.commit();

  return { id: ref.id };
});
