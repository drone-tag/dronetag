'use client';

/**
 * User archive — expired certificates, insurance policies, and authorizations.
 * Storage is metered (base 30 MB + purchased packs); upgrade via billing.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import {
  deleteAuthorization,
  listAuthorizations,
} from '@/lib/firebase/authorizations';
import { deleteCertificate, listCertificates } from '@/lib/firebase/certificates';
import { deleteInsurance, listInsurances } from '@/lib/firebase/insurances';
import { ensureSlots } from '@/lib/firebase/slots';
import { errorMessage } from '@/lib/client/errorMessage';
import { ENFORCE_SLOT_QUOTAS } from '@/lib/config/features';
import {
  archiveCapacityMb,
  type Certificate,
  type Insurance,
  type Slots,
} from '@/lib/types/entities';
import {
  computeAuthorizationStatus,
  computeCertificateStatus,
  computePolicyStatus,
  formatDate,
} from '@/lib/utils';
import { EntityListRow } from '@/components/ui/EntityListRow';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PolicyStatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import { EntityListShell } from '@/components/account/EntityListShell';
import { EntityPdfPreviewModal } from '@/components/account/EntityPdfPreviewModal';
import { LoadError, PageLoading } from '@/components/ui/LoadError';

type ArchiveItem = {
  key: string;
  entityId: string;
  kind: 'certificate' | 'insurance' | 'authorization';
  label: string;
  detail: string;
  expiresAt: string;
  fileUrl: string;
  fileSize: number;
  href: string;
};

function estimateCertSize(c: Certificate): number {
  return c.fileUrl ? 250_000 : 0;
}

function estimateInsSize(i: Insurance): number {
  return i.pdfUrl ? 300_000 : 0;
}

export default function AccountArchivePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<Slots | null>(null);
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [preview, setPreview] = useState<ArchiveItem | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<ArchiveItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const rebuild = useCallback(async () => {
    if (!user) return;
    let certs, ins, authz, s;
    try {
      [certs, ins, authz, s] = await Promise.all([
        listCertificates(user.uid),
        listInsurances(user.uid),
        listAuthorizations(user.uid),
        ensureSlots(user.uid),
      ]);
      setLoadError(null);
    } catch (err) {
      console.error('[archive] load failed', err);
      setLoadError(errorMessage(err, t, 'loadError.body'));
      return;
    }
    setSlots(s);

    const archived: ArchiveItem[] = [];

    for (const c of certs) {
      if (computeCertificateStatus(c) !== 'expired') continue;
      archived.push({
        key: `cert-${c.id}`,
        entityId: c.id,
        kind: 'certificate',
        label: c.label || c.registrationNumber || t('account.tab.certificates'),
        detail: `${t('account.tab.certificates')} · ${c.issuedBy || '—'}`,
        expiresAt: c.expiresAt,
        fileUrl: c.fileUrl,
        fileSize: estimateCertSize(c),
        href: '/account/certificates',
      });
    }

    for (const i of ins) {
      if (computePolicyStatus(i) !== 'expired') continue;
      archived.push({
        key: `ins-${i.id}`,
        entityId: i.id,
        kind: 'insurance',
        label: i.provider
          ? `${i.provider}${i.policyNumber ? ` · ${i.policyNumber}` : ''}`
          : i.policyNumber || t('account.tab.insurances'),
        detail: t('account.tab.insurances'),
        expiresAt: i.expiryDate,
        fileUrl: i.pdfUrl,
        fileSize: estimateInsSize(i),
        href: '/account/insurances',
      });
    }

    for (const a of authz) {
      if (computeAuthorizationStatus(a) !== 'expired') continue;
      archived.push({
        key: `authz-${a.id}`,
        entityId: a.id,
        kind: 'authorization',
        label: a.label || t(`permits.kind.${a.kind}`),
        detail: `${t('account.tab.permits')} · ${t(`permits.kind.${a.kind}`)}`,
        expiresAt: a.validTo,
        fileUrl: a.fileUrl,
        fileSize: a.fileSize || 0,
        href: '/account/permits',
      });
    }

    archived.sort((x, y) => (y.expiresAt || '').localeCompare(x.expiresAt || ''));
    setItems(archived);
  }, [user, t]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        await rebuild();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, rebuild]);

  const capacityMb = useMemo(
    () => (slots ? archiveCapacityMb(slots) : 30),
    [slots],
  );
  const usedBytes = useMemo(
    () => items.reduce((sum, i) => sum + (i.fileSize || 0), 0),
    [items],
  );
  const usedMb = usedBytes / (1024 * 1024);
  const usagePct = Math.min(100, Math.round((usedMb / Math.max(capacityMb, 0.001)) * 100));

  async function handleDelete() {
    if (!confirmingDelete) return;
    setDeleting(true);
    try {
      if (confirmingDelete.kind === 'certificate') {
        await deleteCertificate(confirmingDelete.entityId);
      } else if (confirmingDelete.kind === 'insurance') {
        await deleteInsurance(confirmingDelete.entityId);
      } else {
        await deleteAuthorization(confirmingDelete.entityId);
      }
      setConfirmingDelete(null);
      await rebuild();
      // Deletion here is permanent and frees quota, so the confirmation is
      // worth more than the usual "the row disappeared" signal.
      toast.success(t('toast.archive.deleted'));
    } catch (err) {
      console.error('[archive] delete failed', err);
      toast.error(errorMessage(err, t, 'toast.archive.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <PageLoading />;

  return (
    <EntityListShell
      title={t('archive.list.title')}
      subtitle={t('archive.list.subtitle')}
      rightActions={
        ENFORCE_SLOT_QUOTAS ? (
          <Button href="/account/billing" variant="secondary" size="sm">
            {t('archive.cta.buySpace')}
          </Button>
        ) : undefined
      }
    >
      {ENFORCE_SLOT_QUOTAS ? (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {t('archive.storage.title')}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              {t('archive.storage.used')
                .replace('{used}', usedMb.toFixed(1))
                .replace('{max}', String(capacityMb))}
            </p>
          </div>
          <Link
            href="/pricing"
            className="text-xs font-medium text-[var(--color-action)] underline-offset-2 hover:underline"
          >
            {t('archive.hint.upgrade')}
          </Link>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-action)] transition-all"
            style={{ width: `${usagePct}%` }}
          />
        </div>
        <ul className="mt-3 space-y-1 text-xs text-[var(--color-text-secondary)]">
          <li>{t('archive.hint.storage')}</li>
          <li>{t('archive.hint.autoMove')}</li>
        </ul>
      </div>
      ) : (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text-secondary)] sm:text-sm">
          {t('archive.hint.autoMove')}
        </p>
      )}

      {loadError ? (
        <LoadError message={loadError} onRetry={rebuild} />
      ) : items.length === 0 ? (
        <EmptyState
          title={t('archive.list.empty')}
          description={t('archive.list.emptyDesc')}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.key} className="app-card p-3 sm:p-4">
              <EntityListRow
                actions={
                  <div className="flex flex-wrap items-center gap-2">
                    {item.fileUrl ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreview(item)}
                      >
                        {t('common.preview')}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmingDelete(item)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                }
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">{item.label}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {item.detail} · {t('archive.expiredOn')}: {formatDate(item.expiresAt)}
                  </p>
                  <div className="pt-1">
                    <PolicyStatusBadge status="expired" />
                  </div>
                </div>
              </EntityListRow>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmingDelete)}
        title={t('archive.delete.title')}
        message={t('archive.delete.message')}
        confirmLabel={t('common.delete')}
        danger
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setConfirmingDelete(null)}
      />

      {preview?.fileUrl ? (
        <EntityPdfPreviewModal
          isOpen
          title={preview.label}
          url={preview.fileUrl}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </EntityListShell>
  );
}
