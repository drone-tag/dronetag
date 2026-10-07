/**
 * Certificates collection — A1/A3, A2, STS-theoretical, STS-01, STS-02, custom.
 *
 * Path: `certificates/{certId}` with a `userId` field.
 * Owner-only read/write; admin can read all (see firestore.rules).
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { awaitFirebaseAuthReady } from '@/lib/firebase/auth';
import { DEMO_MODE, getFirebaseDb } from '@/lib/firebase/config';
import * as demo from '@/lib/demo/entitiesStore';
import { lockedAtFromRaw } from '@/lib/utils/entities';
import { fileToDataUrl } from '@/lib/demo/fileToDataUrl';
import { adminFetch } from '@/lib/client/adminApi';
import { attachFile, prepareFile } from '@/lib/client/fileUpload';
import { deleteEntityOnServer } from '@/lib/client/entityApi';
import { requestPublicDroneResync } from '@/lib/client/resyncPublicDrones';
import type { Certificate, CertificateKind } from '@/lib/types/entities';
import type { VerificationStatus } from '@/lib/types';

const CERTIFICATES = 'certificates';

function certificateFromRaw(id: string, raw: Record<string, unknown>): Certificate {
  const str = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : '');
  const label = str('label');
  const registrationNumber = str('registrationNumber')
    || (label && !/training|coordinator|first and last/i.test(label) && /[0-9]/.test(label) ? label : '');
  return {
    id,
    userId: str('userId'),
    kind: (str('kind') || 'custom') as CertificateKind,
    label,
    registrationNumber,
    issuedBy: str('issuedBy'),
    issuedAt: str('issuedAt'),
    expiresAt: str('expiresAt'),
    fileUrl: str('fileUrl'),
    verificationStatus: (str('verificationStatus') || 'unverified') as VerificationStatus,
    notes: str('notes'),
    createdAt: str('createdAt'),
    updatedAt: str('updatedAt'),
    dataLockedAt: lockedAtFromRaw(raw),
  };
}

export async function listCertificates(userId: string): Promise<Certificate[]> {
  if (DEMO_MODE) return demo.listCertificates(userId);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, CERTIFICATES), where('userId', '==', userId)),
  );
  return snap.docs
    .map((d) => certificateFromRaw(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
}

export async function getCertificate(id: string): Promise<Certificate | null> {
  if (DEMO_MODE) return demo.getCertificate(id);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, CERTIFICATES, id));
  if (!snap.exists()) return null;
  return certificateFromRaw(snap.id, snap.data() as Record<string, unknown>);
}

/**
 * Server-side create via `/api/entities/certificates` (Admin SDK).
 * Quota-checked and verificationStatus is forced to 'unverified'.
 */
export async function createCertificate(
  data: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt' | 'dataLockedAt'>,
): Promise<string> {
  if (DEMO_MODE) return demo.createCertificate(data);
  const res = await adminFetch('/api/entities/certificates', {
    method: 'POST',
    body: JSON.stringify({
      kind: data.kind,
      label: data.label,
      registrationNumber: data.registrationNumber,
      issuedBy: data.issuedBy,
      issuedAt: data.issuedAt,
      expiresAt: data.expiresAt,
      fileUrl: data.fileUrl,
      notes: data.notes,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok) {
    throw new Error(body.error || `create certificate failed (${res.status})`);
  }
  if (!body.id) throw new Error('create certificate failed: missing id');
  return body.id;
}

/** Upload the certificate PDF and attach it to the certificate. */
export async function uploadCertificatePdf(
  certificateId: string,
  file: File,
  parserTrusted = false,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    const fileUrl = await fileToDataUrl(file);
    await demo.updateCertificate(certificateId, {
      fileUrl,
      verificationStatus: parserTrusted ? 'verified' : 'pending',
    });
    const cert = await demo.getCertificate(certificateId);
    if (cert?.userId) await requestPublicDroneResync(cert.userId);
    return fileUrl;
  }
  const prepared = await prepareFile(file, 'pdf');
  // The route also refreshes the owner's public pages (the badge).
  const body = await attachFile<{ fileUrl?: string }>({
    route: `/api/entities/certificates/${certificateId}/pdf`,
    objectPath: `certificates/${certificateId}/certificate.pdf`,
    file: prepared.file,
    contentType: prepared.contentType,
    fileName: file.name,
    fields: parserTrusted ? { parserTrusted: '1' } : undefined,
    onProgress,
  });
  if (!body.fileUrl) throw new Error('upload certificate pdf failed: missing fileUrl');
  return body.fileUrl;
}

export async function updateCertificate(id: string, patch: Partial<Certificate>): Promise<void> {
  if (DEMO_MODE) {
    await demo.updateCertificate(id, patch);
    const cert = await demo.getCertificate(id);
    if (cert?.userId) await requestPublicDroneResync(cert.userId);
    return;
  }
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const before = await getCertificate(id);
  const payload = Object.fromEntries(
    Object.entries(patch).filter(([k, v]) => k !== 'id' && v !== undefined),
  );
  await updateDoc(doc(db, CERTIFICATES, id), { ...payload, updatedAt: new Date().toISOString() });
  const uid = before?.userId ?? patch.userId;
  if (uid) await requestPublicDroneResync(uid);
}

export async function deleteCertificate(id: string): Promise<void> {
  if (DEMO_MODE) {
    const before = await demo.getCertificate(id);
    await demo.deleteCertificate(id);
    if (before?.userId) await requestPublicDroneResync(before.userId);
    return;
  }
  // The server also refreshes the owner's public pages (the badge).
  await deleteEntityOnServer('certificates', id);
}

/** Admin-only: list every certificate across users. */
export async function listAllCertificates(): Promise<Certificate[]> {
  if (DEMO_MODE) return demo.listAllCertificates();
  await awaitFirebaseAuthReady({ refresh: true });
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, CERTIFICATES));
  return snap.docs
    .map((d) => certificateFromRaw(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}
