'use client';

/**
 * Authorizations / permits — daily, nullaosta, hourly, temporary.
 * Active (non-expired) items live here; expired ones appear in Archive.
 */

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import {
  createAuthorization,
  deleteAuthorization,
  listAuthorizations,
  updateAuthorization,
  uploadAuthorizationFile,
} from '@/lib/firebase/authorizations';
import { ensureSlots } from '@/lib/firebase/slots';
import { errorMessage } from '@/lib/client/errorMessage';
import { effectiveSlotCap } from '@/lib/config/features';
import {
  AUTHORIZATION_KINDS,
  type Authorization,
  type AuthorizationKind,
  type Slots,
} from '@/lib/types/entities';
import { computeAuthorizationStatus, formatDate } from '@/lib/utils';
import { EntityListRow } from '@/components/ui/EntityListRow';
import { RowActionMenu } from '@/components/ui/RowActionMenu';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { UploadField } from '@/components/ui/UploadField';
import { EmptyState } from '@/components/ui/EmptyState';
import { PolicyStatusBadge, VerificationBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import { EntityListShell } from '@/components/account/EntityListShell';
import { FormErrorBanner } from '@/components/account/FormErrorBanner';
import { EntityPdfPreviewModal } from '@/components/account/EntityPdfPreviewModal';
import { LoadError, PageLoading } from '@/components/ui/LoadError';

interface AuthzFormState {
  kind: AuthorizationKind;
  label: string;
  issuedBy: string;
  area: string;
  validFrom: string;
  validTo: string;
  notes: string;
  fileUrl: string;
}

const EMPTY_FORM: AuthzFormState = {
  kind: 'nullaosta',
  label: '',
  issuedBy: '',
  area: '',
  validFrom: '',
  validTo: '',
  notes: '',
  fileUrl: '',
};

const FILE_ACCEPT = '.pdf,application/pdf,image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif';

function isActive(a: Authorization): boolean {
  return computeAuthorizationStatus(a) !== 'expired';
}

export default function AccountPermitsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [items, setItems] = useState<Authorization[]>([]);
  const [slots, setSlots] = useState<Slots | null>(null);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Authorization | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Authorization | null>(null);
  const [previewing, setPreviewing] = useState<Authorization | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      const [list, s] = await Promise.all([
        listAuthorizations(user.uid),
        ensureSlots(user.uid),
      ]);
      setItems(list);
      setSlots(s);
      setLoadError(null);
    } catch (err) {
      console.error('[permits] load failed', err);
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
    return () => {
      cancelled = true;
    };
  }, [user, reload]);

  const active = items.filter(isActive);
  const expiredCount = items.length - active.length;
  const cap = effectiveSlotCap(slots?.permit ?? 3);
  const atCap = active.length >= cap;

  if (loading) return <PageLoading />;

  async function handleSave(
    form: AuthzFormState,
    target: Authorization | null,
    pendingFile: File | null,
  ) {
    if (!user) return;
    setSavingId(target?.id ?? 'new');
    setSaveError(null);
    let createdId: string | null = null;
    try {
      const label =
        form.label.trim() ||
        pendingFile?.name.replace(/\.[^.]+$/, '') ||
        target?.label ||
        t(`permits.kind.${form.kind}`);

      if (target) {
        await updateAuthorization(target.id, {
          kind: form.kind,
          label,
          issuedBy: form.issuedBy.trim(),
          area: form.area.trim(),
          validFrom: form.validFrom,
          validTo: form.validTo,
          notes: form.notes,
          removeFile: !pendingFile && !form.fileUrl && Boolean(target.fileUrl),
        });
        if (pendingFile) {
          setUploadProgress(0);
          await uploadAuthorizationFile(target.id, pendingFile, setUploadProgress);
        }
      } else {
        const id = await createAuthorization({
          userId: user.uid,
          kind: form.kind,
          label,
          issuedBy: form.issuedBy.trim(),
          area: form.area.trim(),
          validFrom: form.validFrom,
          validTo: form.validTo,
          fileUrl: '',
          fileName: pendingFile?.name ?? '',
          fileSize: pendingFile?.size ?? 0,
          mimeType: pendingFile?.type ?? '',
          verificationStatus: 'pending',
          notes: form.notes,
        });
        createdId = id;
        if (pendingFile) {
          setUploadProgress(0);
          await uploadAuthorizationFile(id, pendingFile, setUploadProgress);
        }
      }

      await reload();
      setCreating(false);
      setEditing(null);
      toast.success(t(target ? 'toast.permit.updated' : 'toast.permit.created'));
    } catch (err) {
      console.error('[permits] save failed', err);
      if (createdId && pendingFile) {
        await deleteAuthorization(createdId).catch(() => undefined);
      }
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
      await deleteAuthorization(confirmingDelete.id);
      await reload();
      setConfirmingDelete(null);
      toast.success(t('toast.permit.deleted'));
    } catch (err) {
      console.error('[permits] delete failed', err);
      toast.error(errorMessage(err, t, 'toast.permit.deleteFailed'));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <EntityListShell
      title={t('permits.list.title')}
      subtitle={t('permits.list.subtitle')}
      used={active.length}
      max={cap}
      newLabel={t('permits.list.new')}
      onNew={() => {
        setSaveError(null);
        setCreating(true);
      }}
      newDisabled={atCap}
    >
      {expiredCount > 0 ? (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
          {t('permits.archiveNotice').replace('{count}', String(expiredCount))}{' '}
          <Link href="/account/archive" className="font-medium text-[var(--color-action)] underline-offset-2 hover:underline">
            {t('account.tab.archive')}
          </Link>
        </p>
      ) : null}

      {loadError ? (
        <LoadError message={loadError} onRetry={reload} />
      ) : active.length === 0 ? (
        <EmptyState
          title={t('permits.list.empty')}
          description={t('permits.list.emptyDesc')}
          hints={[t('permits.hint.parser'), t('permits.hint.storage'), t('permits.hint.admin')]}
          action={
            atCap ? undefined : (
              <Button onClick={() => setCreating(true)}>{t('permits.list.new')}</Button>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {active.map((a) => {
            const status = computeAuthorizationStatus(a);
            return (
              <li key={a.id} className="app-card p-3 sm:p-4">
                <EntityListRow
                  actions={
                    <RowActionMenu
                      actions={[
                        ...(a.fileUrl
                          ? [{ key: 'preview', label: t('common.preview'), onClick: () => setPreviewing(a) }]
                          : []),
                        { key: 'edit', label: t('common.edit'), onClick: () => setEditing(a) },
                        {
                          key: 'delete',
                          label: t('common.delete'),
                          onClick: () => setConfirmingDelete(a),
                          danger: true,
                        },
                      ]}
                    />
                  }
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                      {a.label || t(`permits.kind.${a.kind}`)}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {[
                        t(`permits.kind.${a.kind}`),
                        a.issuedBy || null,
                        a.validTo ? `${t('permits.field.validTo')}: ${formatDate(a.validTo)}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <PolicyStatusBadge status={status} />
                      <VerificationBadge status={a.verificationStatus} />
                    </div>
                  </div>
                </EntityListRow>
              </li>
            );
          })}
        </ul>
      )}

      {atCap ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('permits.list.atCap')}{' '}
          <Link href="/account/billing" className="font-medium text-[var(--color-action)] underline-offset-2 hover:underline">
            {t('archive.hint.upgrade')}
          </Link>
        </p>
      ) : null}

      {creating || editing ? (
        <PermitFormModal
          // Remounting on a change of edit target is what resets the form.
          // The previous version did it from an effect keyed on `initial`,
          // which `authzToForm` rebuilds on every parent render — so the draft
          // was discarded far more often than when the target actually changed.
          key={editing?.id ?? 'new'}
          isOpen
          initial={editing ? authzToForm(editing) : EMPTY_FORM}
          title={editing ? t('permits.edit.title') : t('permits.create.title')}
          saving={savingId === (editing?.id ?? 'new')}
          error={saveError}
          progress={uploadProgress}
          onClose={() => {
            if (savingId) return;
            setCreating(false);
            setEditing(null);
            setSaveError(null);
          }}
          onSubmit={(form, file) => {
            setSaveError(null);
            void handleSave(form, editing, file);
          }}
        />
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(confirmingDelete)}
        title={t('permits.delete.title')}
        message={t('permits.delete.message')}
        confirmLabel={t('common.delete')}
        danger
        loading={savingId === confirmingDelete?.id}
        onConfirm={() => void handleDelete()}
        onClose={() => setConfirmingDelete(null)}
      />

      {previewing?.fileUrl ? (
        <EntityPdfPreviewModal
          isOpen
          title={previewing.label}
          url={previewing.fileUrl}
          onClose={() => setPreviewing(null)}
        />
      ) : null}
    </EntityListShell>
  );
}

function authzToForm(a: Authorization): AuthzFormState {
  return {
    kind: a.kind,
    label: a.label,
    issuedBy: a.issuedBy,
    area: a.area,
    validFrom: a.validFrom.slice(0, 10),
    validTo: a.validTo.slice(0, 10),
    notes: a.notes,
    fileUrl: a.fileUrl,
  };
}

function PermitFormModal({
  isOpen,
  initial,
  title,
  saving,
  error,
  progress,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  initial: AuthzFormState;
  title: string;
  saving: boolean;
  error: string | null;
  progress: number | null;
  onClose: () => void;
  onSubmit: (form: AuthzFormState, file: File | null) => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState(initial);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
  }, [pendingPreview]);

  function pickFile(file: File | null) {
    setPendingFile(file);
    setPendingPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.validFrom && form.validTo && form.validTo < form.validFrom) {
      setDateError(t('form.errors.expiryBeforeIssue'));
      return;
    }
    setDateError(null);
    onSubmit(form, pendingFile);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <FormErrorBanner show={Boolean(error)} message={error ?? undefined} />
        <Select
          label={t('permits.field.kind')}
          name="kind"
          value={form.kind}
          onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as AuthorizationKind }))}
          options={AUTHORIZATION_KINDS.map((k) => ({
            value: k,
            label: t(`permits.kind.${k}`),
          }))}
        />
        <Input
          label={t('permits.field.label')}
          name="label"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
        />
        <Input
          label={t('permits.field.issuedBy')}
          name="issuedBy"
          value={form.issuedBy}
          onChange={(e) => setForm((f) => ({ ...f, issuedBy: e.target.value }))}
        />
        <Input
          label={t('permits.field.area')}
          name="area"
          value={form.area}
          onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            type="date"
            label={t('permits.field.validFrom')}
            name="validFrom"
            value={form.validFrom}
            onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
          />
          <Input
            type="date"
            label={t('permits.field.validTo')}
            name="validTo"
            value={form.validTo}
            onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))}
            error={dateError ?? undefined}
          />
        </div>
        <Textarea
          label={t('permits.field.notes')}
          name="notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={3}
        />
        <UploadField
          label={t('permits.field.file')}
          accept={FILE_ACCEPT}
          currentUrl={pendingPreview ?? (form.fileUrl || undefined)}
          onUpload={(f) => pickFile(f)}
          onRemove={
            (pendingFile || form.fileUrl) && !saving
              ? () => {
                  pickFile(null);
                  setForm((prev) => ({ ...prev, fileUrl: '' }));
                }
              : undefined
          }
          progress={progress}
        />
        {pendingFile ? (
          <p className="truncate text-xs text-[var(--color-text-secondary)]">{pendingFile.name}</p>
        ) : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={saving}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
