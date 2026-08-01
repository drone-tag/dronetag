'use client';

/**
 * Authorizations / permits — daily, nullaosta, hourly, temporary.
 * Active (non-expired) items live here; expired ones appear in Archive.
 */

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  createAuthorization,
  deleteAuthorization,
  listAuthorizations,
  updateAuthorization,
  uploadAuthorizationFile,
} from '@/lib/firebase/authorizations';
import { ensureSlots } from '@/lib/firebase/slots';
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

const FILE_ACCEPT = '.pdf,application/pdf,image/png,image/jpeg,image/webp';

function isActive(a: Authorization): boolean {
  return computeAuthorizationStatus(a) !== 'expired';
}

export default function AccountPermitsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Authorization[]>([]);
  const [slots, setSlots] = useState<Slots | null>(null);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Authorization | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Authorization | null>(null);
  const [previewing, setPreviewing] = useState<Authorization | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reload = useMemo(() => async () => {
    if (!user) return;
    const [list, s] = await Promise.all([
      listAuthorizations(user.uid),
      ensureSlots(user.uid),
    ]);
    setItems(list);
    setSlots(s);
  }, [user]);

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
  const cap = slots?.permit ?? 3;
  const atCap = active.length >= cap;

  if (loading) {
    return (
      <div className="mt-8 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-gray-600" />
        {t('common.loading')}
      </div>
    );
  }

  async function handleSave(
    form: AuthzFormState,
    target: Authorization | null,
    pendingFile: File | null,
  ) {
    if (!user) return;
    setSavingId(target?.id ?? 'new');
    setSaveError(null);
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
        });
        if (pendingFile) {
          await uploadAuthorizationFile(target.id, pendingFile);
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
          fileUrl: pendingFile ? '' : form.fileUrl,
          fileName: pendingFile?.name ?? '',
          fileSize: pendingFile?.size ?? 0,
          mimeType: pendingFile?.type ?? '',
          verificationStatus: 'pending',
          notes: form.notes,
        });
        if (pendingFile) {
          await uploadAuthorizationFile(id, pendingFile);
        }
      }

      await reload();
      setCreating(false);
      setEditing(null);
    } catch (err) {
      console.error('[permits] save failed', err);
      setSaveError(
        err instanceof Error && err.message === 'storage_billing_required'
          ? t('account.storageBillingRequired')
          : err instanceof Error
            ? err.message
            : t('account.saveError'),
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) return;
    setSavingId(confirmingDelete.id);
    try {
      await deleteAuthorization(confirmingDelete.id);
      await reload();
      setConfirmingDelete(null);
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
      <FormErrorBanner show={Boolean(saveError)} message={saveError ?? undefined} />

      {expiredCount > 0 ? (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
          {t('permits.archiveNotice').replace('{count}', String(expiredCount))}{' '}
          <Link href="/account/archive" className="font-medium text-[var(--color-action)] underline-offset-2 hover:underline">
            {t('account.tab.archive')}
          </Link>
        </p>
      ) : null}

      {active.length === 0 ? (
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
          isOpen
          initial={editing ? authzToForm(editing) : EMPTY_FORM}
          title={editing ? t('permits.edit.title') : t('permits.create.title')}
          saving={savingId === (editing?.id ?? 'new')}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={(form, file) => void handleSave(form, editing, file)}
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
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  initial: AuthzFormState;
  title: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (form: AuthzFormState, file: File | null) => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState(initial);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    setForm(initial);
    setPendingFile(null);
  }, [initial]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(form, pendingFile);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-3">
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
          currentUrl={pendingFile ? undefined : form.fileUrl || undefined}
          onUpload={(f) => setPendingFile(f)}
          onRemove={
            pendingFile || form.fileUrl
              ? () => {
                  setPendingFile(null);
                  setForm((prev) => ({ ...prev, fileUrl: '' }));
                }
              : undefined
          }
          preview={Boolean(form.fileUrl) && !pendingFile}
        />
        {pendingFile ? (
          <p className="text-xs text-[var(--color-text-secondary)]">{pendingFile.name}</p>
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
