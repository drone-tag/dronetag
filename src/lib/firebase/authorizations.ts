/**
 * Authorizations / permits collection (daily, nullaosta, hourly, …).
 *
 * Path: `authorizations/{id}` with a `userId` field.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { awaitFirebaseAuthReady } from '@/lib/firebase/auth';
import { DEMO_MODE, getFirebaseDb } from '@/lib/firebase/config';
import * as demo from '@/lib/demo/entitiesStore';
import { fileToDataUrl } from '@/lib/demo/fileToDataUrl';
import { adminFetch } from '@/lib/client/adminApi';
import { readJsonOrThrow } from '@/lib/client/apiError';
import { attachFile, prepareFile } from '@/lib/client/fileUpload';
import { deleteEntityOnServer } from '@/lib/client/entityApi';
import type { Authorization, AuthorizationKind } from '@/lib/types/entities';
import type { VerificationStatus } from '@/lib/types';

const AUTHORIZATIONS = 'authorizations';

function authorizationFromRaw(id: string, raw: Record<string, unknown>): Authorization {
  const str = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : '');
  const num = (k: string) => (typeof raw[k] === 'number' ? (raw[k] as number) : 0);
  return {
    id,
    userId: str('userId'),
    kind: (str('kind') || 'other') as AuthorizationKind,
    label: str('label'),
    issuedBy: str('issuedBy'),
    area: str('area'),
    validFrom: str('validFrom'),
    validTo: str('validTo'),
    fileUrl: str('fileUrl'),
    fileName: str('fileName'),
    fileSize: num('fileSize'),
    mimeType: str('mimeType'),
    verificationStatus: (str('verificationStatus') || 'unverified') as VerificationStatus,
    notes: str('notes'),
    createdAt: str('createdAt'),
    updatedAt: str('updatedAt'),
  };
}

export async function listAuthorizations(userId: string): Promise<Authorization[]> {
  if (DEMO_MODE) return demo.listAuthorizations(userId);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, AUTHORIZATIONS), where('userId', '==', userId)),
  );
  return snap.docs
    .map((d) => authorizationFromRaw(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export async function getAuthorization(id: string): Promise<Authorization | null> {
  if (DEMO_MODE) return demo.getAuthorization(id);
  await awaitFirebaseAuthReady();
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, AUTHORIZATIONS, id));
  if (!snap.exists()) return null;
  return authorizationFromRaw(snap.id, snap.data() as Record<string, unknown>);
}

export async function createAuthorization(
  data: Omit<Authorization, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  if (DEMO_MODE) return demo.createAuthorization(data);
  const res = await adminFetch('/api/entities/authorizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind: data.kind,
      label: data.label,
      issuedBy: data.issuedBy,
      area: data.area,
      validFrom: data.validFrom,
      validTo: data.validTo,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      notes: data.notes,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok) {
    throw new Error(body.error || `create authorization failed (${res.status})`);
  }
  if (!body.id) throw new Error('create authorization failed: missing id');
  return body.id;
}

export async function uploadAuthorizationFile(
  authorizationId: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    const fileUrl = await fileToDataUrl(file);
    await demo.updateAuthorization(authorizationId, {
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      verificationStatus: 'pending',
    });
    return fileUrl;
  }
  const prepared = await prepareFile(file, 'pdf-or-image');
  const body = await attachFile<{ fileUrl?: string }>({
    route: `/api/entities/authorizations/${authorizationId}/file`,
    objectPath: `authorizations/${authorizationId}/file.${prepared.ext}`,
    file: prepared.file,
    contentType: prepared.contentType,
    fileName: file.name,
    onProgress,
  });
  if (!body.fileUrl) throw new Error('upload authorization failed: missing fileUrl');
  return body.fileUrl;
}

/**
 * Edit a permit through the server, which re-queues it for review when
 * reviewed details change. `removeFile` detaches and deletes the file.
 */
export async function updateAuthorization(
  id: string,
  patch: Partial<Authorization> & { removeFile?: boolean },
): Promise<void> {
  if (DEMO_MODE) {
    const { removeFile, ...rest } = patch;
    return demo.updateAuthorization(
      id,
      removeFile ? { ...rest, fileUrl: '', fileName: '', fileSize: 0, mimeType: '' } : rest,
    );
  }
  const body = Object.fromEntries(
    Object.entries(patch).filter(([k, v]) => k !== 'id' && v !== undefined),
  );
  const res = await adminFetch(`/api/entities/authorizations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  await readJsonOrThrow(res, 'update authorization');
}

export async function deleteAuthorization(id: string): Promise<void> {
  if (DEMO_MODE) return demo.deleteAuthorization(id);
  await deleteEntityOnServer('authorizations', id);
}

export async function listAllAuthorizations(): Promise<Authorization[]> {
  if (DEMO_MODE) return demo.listAllAuthorizations();
  await awaitFirebaseAuthReady({ refresh: true });
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, AUTHORIZATIONS));
  return snap.docs
    .map((d) => authorizationFromRaw(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}
