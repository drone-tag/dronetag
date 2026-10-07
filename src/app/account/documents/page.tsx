'use client';

/**
 * Documents dashboard page — upload PDFs/images via drag-and-drop (Admin SDK).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import {
  createDocument,
  deleteDocument,
  listDocuments,
  updateDocument,
  uploadDocumentFile,
} from '@/lib/firebase/documents';
import { ensureSlots } from '@/lib/firebase/slots';
import { errorMessage } from '@/lib/client/errorMessage';
import { effectiveSlotCap } from '@/lib/config/features';
import type { DocumentRef, Slots } from '@/lib/types/entities';
import { EntityListRow } from '@/components/ui/EntityListRow';
import { RowActionMenu } from '@/components/ui/RowActionMenu';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { UploadField } from '@/components/ui/UploadField';
import { EmptyState } from '@/components/ui/EmptyState';
import { VerificationBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import { EntityListShell } from '@/components/account/EntityListShell';
import { FormErrorBanner } from '@/components/account/FormErrorBanner';
import { EntityPdfPreviewModal } from '@/components/account/EntityPdfPreviewModal';
import { LoadError, PageLoading } from '@/components/ui/LoadError';

interface DocFormState {
  label: string;
  fileUrl: string;
  notes: string;
}

const EMPTY_FORM: DocFormState = {
  label: '',
  fileUrl: '',
  notes: '',
};

const FILE_ACCEPT = '.pdf,application/pdf,image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif';

function docToForm(d: DocumentRef): DocFormState {
  return {
    label: d.label,
    fileUrl: d.fileUrl,
    notes: d.notes,
  };
}

export default function AccountDocumentsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [documents, setDocuments] = useState<DocumentRef[]>([]);
  const [slots, setSlots] = useState<Slots | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<DocumentRef | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<DocumentRef | null>(null);
  const [previewing, setPreviewing] = useState<DocumentRef | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      const [list, s] = await Promise.all([
        listDocuments(user.uid),
        ensureSlots(user.uid),
      ]);
      setDocuments(list);
      setSlots(s);
      setLoadError(null);
    } catch (err) {
      console.error('[documents] load failed', err);
      setLoadError(errorMessage(err, t, 'loadError.body'));
    }
  }, [user, t]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, reload]);

  if (loading) return <PageLoading />;

  const cap = effectiveSlotCap(slots?.pdf ?? 1);
  const atCap = documents.length >= cap;

  async function handleSave(form: DocFormState, target: DocumentRef | null, pendingFile: File | null) {
    if (!user) return;
    setSavingId(target?.id ?? 'new');
    setSaveError(null);
    let createdId: string | null = null;
    try {
      const label = form.label.trim() || pendingFile?.name.replace(/\.[^.]+$/, '') || target?.label || t('doc.kind.other');

      let documentId = target?.id;
      if (target) {
        // File fields are written by the upload route, never blanked here.
        await updateDocument(target.id, { label, notes: form.notes });
      } else {
        documentId = await createDocument({
          userId: user.uid,
          kind: 'other',
          label,
          fileUrl: '',
          fileName: pendingFile?.name ?? '',
          fileSize: pendingFile?.size ?? 0,
          mimeType: pendingFile?.type ?? '',
          verificationStatus: 'pending',
          notes: form.notes,
        });
        createdId = documentId;
      }

      if (pendingFile && documentId) {
        setUploadProgress(0);
        await uploadDocumentFile(documentId, pendingFile, setUploadProgress);
      }

      await reload();
      setCreating(false);
      setEditing(null);
      toast.success(t(target ? 'toast.document.updated' : 'toast.document.created'));
    } catch (err) {
      console.error('[documents] save failed', err);
      // A new document is nothing without its file: undo the empty record.
      if (createdId) await deleteDocument(createdId).catch(() => undefined);
      setSaveError(errorMessage(err, t));
    } finally {
      setSavingId(null);
      setUploadProgress(null);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) return;
    setSavingId(confirmingDelete.id);
    try {
      await deleteDocument(confirmingDelete.id);
      await reload();
      setConfirmingDelete(null);
      toast.success(t('toast.document.deleted'));
    } catch (err) {
      console.error('[documents] delete failed', err);
      toast.error(errorMessage(err, t, 'toast.document.deleteFailed'));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <EntityListShell
      title={t('doc.list.title')}
      subtitle={
        Number.isFinite(cap)
          ? t('doc.list.subtitle', { used: documents.length, max: cap })
          : t('doc.list.subtitleUnlimited')
      }
      used={documents.length}
      max={cap}
      newLabel={t('doc.list.new')}
      onNew={() => setCreating(true)}
      newDisabled={atCap}
    >
      {loadError ? (
        <LoadError message={loadError} onRetry={reload} />
      ) : documents.length === 0 ? (
        <EmptyState
          title={t('doc.list.empty')}
          description={t('doc.list.emptyDesc')}
          hints={[t('empty.hints.document.1'), t('empty.hints.document.2')]}
          action={
            <Button onClick={() => setCreating(true)} disabled={atCap}>
              {t('doc.list.new')}
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {documents.map((d) => (
            <li key={d.id}>
              <Card padding="md">
                <EntityListRow
                  actions={
                    <RowActionMenu
                      actions={[
                        ...(d.fileUrl
                          ? [{ key: 'view', label: t('common.view'), onClick: () => setPreviewing(d) }]
                          : []),
                        { key: 'edit', label: t('common.edit'), onClick: () => setEditing(d) },
                        { key: 'delete', label: t('common.delete'), onClick: () => setConfirmingDelete(d), danger: true },
                      ]}
                      extra={
                        !d.fileUrl ? (
                          <span className="text-[11px] text-[var(--color-text-secondary)]">{t('entity.noPdfAttached')}</span>
                        ) : null
                      }
                    />
                  }
                >
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] sm:text-base">
                      {d.label || t('doc.kind.other')}
                    </h3>
                    <VerificationBadge status={d.verificationStatus} />
                  </div>
                  {d.fileName ? (
                    <p className="mt-1 truncate font-mono text-[10px] text-[var(--color-text-secondary)] sm:text-[11px]">{d.fileName}</p>
                  ) : null}
                  {d.notes ? (
                    <p className="mt-1 line-clamp-2 text-[11px] text-[var(--color-text-secondary)] sm:text-xs">{d.notes}</p>
                  ) : null}
                </EntityListRow>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {(creating || editing) ? (
        <DocFormModal
          key={editing?.id ?? 'new'}
          isOpen
          target={editing}
          saving={savingId === (editing?.id ?? 'new')}
          error={saveError}
          progress={uploadProgress}
          onClose={() => {
            if (savingId) return;
            setCreating(false);
            setEditing(null);
            setSaveError(null);
          }}
          onSubmit={(form, pendingFile) => handleSave(form, editing, pendingFile)}
        />
      ) : null}

      <EntityPdfPreviewModal
        isOpen={Boolean(previewing)}
        title={previewing?.label ?? ''}
        url={previewing?.fileUrl ?? ''}
        onClose={() => setPreviewing(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmingDelete)}
        title={t('doc.delete.title')}
        loading={savingId === confirmingDelete?.id}
        message={confirmingDelete?.label ?? ''}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onClose={() => setConfirmingDelete(null)}
      />
    </EntityListShell>
  );
}

// ─── Form modal ───────────────────────────────────────────────────────────

function DocFormModal({
  isOpen,
  target,
  saving,
  error,
  progress,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  target: DocumentRef | null;
  saving: boolean;
  error: string | null;
  progress: number | null;
  onClose: () => void;
  onSubmit: (form: DocFormState, pendingFile: File | null) => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<DocFormState>(() =>
    target ? docToForm(target) : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>(() => form.fileUrl);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
  }, []);

  function setField<K extends keyof DocFormState>(k: K, v: DocFormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function handleFileUpload(file: File) {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;
    setPendingFile(file);
    setFilePreviewUrl(blobUrl);
    if (errors.file) setErrors((e) => ({ ...e, file: undefined }));
  }

  function handleFileRemove() {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPendingFile(null);
    setFilePreviewUrl(target?.fileUrl ?? '');
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    const hasFile = Boolean(pendingFile || form.fileUrl.trim());
    if (!hasFile) e.file = t('form.validation.required');
    return e;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    onSubmit(form, pendingFile);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={target ? t('doc.edit.title') : t('doc.create.title')}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormErrorBanner
          show={Boolean(error) || Object.values(errors).some(Boolean)}
          message={error ?? undefined}
        />

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] p-4">
          <UploadField
            label={t('doc.field.file')}
            accept={FILE_ACCEPT}
            currentUrl={filePreviewUrl || undefined}
            onUpload={handleFileUpload}
            onRemove={pendingFile && !saving ? handleFileRemove : undefined}
            preview
            required
            progress={progress}
          />
          {errors.file ? (
            <p className="mt-2 text-xs text-[var(--tone-danger-fg)]">{errors.file}</p>
          ) : (
            <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">{t('account.verification.documentUploadHint')}</p>
          )}
        </div>

        <Input
          label={t('doc.field.label')}
          name="label"
          value={form.label}
          onChange={(e) => setField('label', e.target.value)}
          placeholder={t('doc.field.labelHint')}
        />

        <Textarea
          label={t('doc.field.notes')}
          name="notes"
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
        />

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={saving}>
            {target ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
