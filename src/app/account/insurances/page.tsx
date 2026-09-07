'use client';

/**
 * Insurances dashboard page.
 *
 * - Lists policies belonging to the user.
 * - A policy is issued to a drone or an operator (`link`), and may cover
 *   many drones via `droneIds` (synced to `Drone.insuranceId`).
 * - Delete is guarded: if the policy is referenced by a public-active
 *   drone (`drone.insuranceId === policy.id`), the confirm dialog warns
 *   that the public profile will lose its insurance status.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import {
  createInsurance,
  deleteInsurance,
  listInsurances,
  updateInsurance,
  uploadInsurancePolicyPdf,
} from '@/lib/firebase/insurances';
import { listDronesByUser, updateDrone } from '@/lib/firebase/drones';
import { listOperators } from '@/lib/firebase/operators';
import { extractTextFromPdf } from '@/lib/insurance/extractPdfText';
import { parsePolicyPdfText, matchDronesFromPolicySpecs } from '@/lib/insurance/parsePolicyPdf';
import type {
  Drone,
  Insurance,
  InsuranceLink,
  Operator,
} from '@/lib/types/entities';
import { computePolicyStatus, describePolicyStatus, formatDate } from '@/lib/utils';
import { operatorDisplayName } from '@/lib/utils/entities';
import { primaryInsuranceDroneId } from '@/lib/utils/insurance';
import { EntityListRow } from '@/components/ui/EntityListRow';
import { RowActionMenu } from '@/components/ui/RowActionMenu';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { UploadField } from '@/components/ui/UploadField';
import { PolicyStatusBadge, PolicyStatusDetail, VerificationBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import { CoverdroneCta } from '@/components/account/CoverdroneCta';
import { EntityListShell } from '@/components/account/EntityListShell';
import { FormErrorBanner } from '@/components/account/FormErrorBanner';
import { ReadOnlyField } from '@/components/account/ReadOnlyField';
import { EntityPdfPreviewModal } from '@/components/account/EntityPdfPreviewModal';
import type { ParsedPolicyFields } from '@/lib/insurance/parsePolicyPdf';
import { insuranceFormMatchesParser } from '@/lib/parser/autoVerify';
import { classNames } from '@/lib/utils';

interface InsuranceFormState {
  link: InsuranceLink;
  droneIds: string[];
  operatorId: string;
  provider: string;
  policyNumber: string;
  holderName: string;
  issueDate: string;
  expiryDate: string;
  pdfUrl: string;
}

const EMPTY_FORM: InsuranceFormState = {
  link: 'drone',
  droneIds: [],
  operatorId: '',
  provider: '',
  policyNumber: '',
  holderName: '',
  issueDate: '',
  expiryDate: '',
  pdfUrl: '',
};

function formToInsurancePreview(form: InsuranceFormState): Insurance {
  return {
    id: 'preview',
    userId: '',
    link: form.link,
    droneId: form.droneIds[0] ?? null,
    droneIds: form.droneIds,
    operatorId: form.operatorId || null,
    provider: form.provider,
    policyNumber: form.policyNumber,
    holderName: form.holderName,
    issueDate: form.issueDate,
    expiryDate: form.expiryDate,
    notes: '',
    pdfUrl: form.pdfUrl,
    verificationStatus: 'unverified',
    createdAt: '',
    updatedAt: '',
    dataLockedAt: '',
  };
}

function droneLabel(d: Drone | undefined): string {
  if (!d) return '—';
  return [d.manufacturer, d.model].filter(Boolean).join(' ').trim() || d.slug;
}

function coveredDroneLabels(drones: Drone[], insurance: Insurance): string {
  const ids = insurance.droneIds.length
    ? insurance.droneIds
    : primaryInsuranceDroneId(insurance)
      ? [primaryInsuranceDroneId(insurance)!]
      : [];
  if (ids.length === 0) {
    // Fallback: reverse refs from drones
    const reverse = drones.filter((d) => d.insuranceId === insurance.id);
    if (reverse.length === 0) return '—';
    return reverse.map(droneLabel).join(', ');
  }
  return ids.map((id) => droneLabel(drones.find((d) => d.id === id))).join(', ');
}

function coveredDroneCount(drones: Drone[], insurance: Insurance): number {
  if (insurance.droneIds.length > 0) return insurance.droneIds.length;
  const reverse = drones.filter((d) => d.insuranceId === insurance.id);
  if (reverse.length > 0) return reverse.length;
  return primaryInsuranceDroneId(insurance) ? 1 : 0;
}

export default function AccountInsurancesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewing, setViewing] = useState<Insurance | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmingCreate, setConfirmingCreate] = useState(false);
  const [pendingCreate, setPendingCreate] = useState<{
    form: InsuranceFormState;
    pendingPdf: File | null;
    parserTrusted: boolean;
  } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Insurance | null>(null);
  const [previewing, setPreviewing] = useState<Insurance | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reload = useMemo(() => async () => {
    if (!user) return;
    const [iList, dList, oList] = await Promise.all([
      listInsurances(user.uid),
      listDronesByUser(user.uid),
      listOperators(user.uid),
    ]);
    setInsurances(iList);
    setDrones(dList);
    setOperators(oList);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try { await reload(); } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user, reload]);

  if (loading) {
    return (
      <div className="mt-8 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-gray-600" />
        {t('common.loading')}
      </div>
    );
  }

  function publicDronesUsingInsurance(insId: string): Drone[] {
    return drones.filter((d) =>
      d.insuranceId === insId && d.status === 'active' && d.visibility === 'public',
    );
  }

  async function handleCreate(
    form: InsuranceFormState,
    pendingPdf: File | null,
    parserTrusted: boolean,
  ) {
    if (!user) return;
    setSavingId('new');
    setSaveError(null);
    try {
      const droneIds = [...new Set(form.droneIds)];
      const operatorId = form.link === 'operator' ? (form.operatorId || null) : null;
      const insuranceId = await createInsurance({
        userId: user.uid,
        link: form.link,
        droneId: droneIds[0] ?? null,
        droneIds,
        operatorId,
        provider: form.provider,
        policyNumber: form.policyNumber,
        holderName: form.holderName,
        issueDate: form.issueDate,
        expiryDate: form.expiryDate,
        notes: '',
        pdfUrl: pendingPdf ? '' : form.pdfUrl,
        verificationStatus: parserTrusted ? 'verified' : 'pending',
      });

      if (pendingPdf) {
        await uploadInsurancePolicyPdf(insuranceId, pendingPdf, parserTrusted);
        if (parserTrusted) {
          await updateInsurance(insuranceId, { verificationStatus: 'verified' });
        }
      } else if (parserTrusted) {
        await updateInsurance(insuranceId, { verificationStatus: 'verified' });
      }

      await reload();
      setCreating(false);
      toast.success(t('toast.insurance.created'));
    } catch (err) {
      console.error('[insurances] create failed', err);
      setSaveError(
        err instanceof Error && err.message === 'storage_billing_required'
          ? t('account.storageBillingRequired')
          : (err instanceof Error ? err.message : t('account.saveError')),
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) return;
    setSavingId(confirmingDelete.id);
    try {
      // Detach from any drone(s) that reference this policy so they don't
      // hold a dangling insuranceId.
      const dependents = drones.filter((d) => d.insuranceId === confirmingDelete.id);
      await Promise.all(dependents.map((d) => updateDrone(d.id, { insuranceId: null })));
      await deleteInsurance(confirmingDelete.id);
      await reload();
      setConfirmingDelete(null);
      toast.success(t('toast.insurance.deleted'));
    } catch (err) {
      // Detaching dependent drones happens first, so a failure here can leave
      // those drones without a policy. Saying so beats a silent no-op.
      console.error('[insurances] delete failed', err);
      toast.error(t('toast.insurance.deleteFailed'));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <EntityListShell
      title={t('insurance.list.title')}
      subtitle={t('insurance.list.subtitle')}
      newLabel={t('insurance.list.new')}
      onNew={() => setCreating(true)}
    >
      <FormErrorBanner show={Boolean(saveError)} message={saveError ?? undefined} />
      {(() => {
        const activeInsurances = insurances.filter((i) => computePolicyStatus(i) !== 'expired');
        const archivedCount = insurances.length - activeInsurances.length;
        return (
          <>
      {archivedCount > 0 ? (
        <p className="mb-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
          {t('permits.archiveNotice').replace('{count}', String(archivedCount))}{' '}
          <a href="/account/archive" className="font-medium text-[var(--color-action)] underline-offset-2 hover:underline">
            {t('account.tab.archive')}
          </a>
        </p>
      ) : null}
      {activeInsurances.length === 0 ? (
        <EmptyState
          title={t('insurance.list.empty')}
          description={t('insurance.list.emptyDesc')}
          hints={[t('empty.hints.insurance.1'), t('empty.hints.insurance.2')]}
          action={<Button onClick={() => setCreating(true)}>{t('insurance.list.new')}</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {activeInsurances.map((ins) => (
            <InsuranceRow
              key={ins.id}
              insurance={ins}
              coveredLabel={coveredDroneLabels(drones, ins)}
              coveredCount={coveredDroneCount(drones, ins)}
              operatorLabel={
                ins.link === 'operator' && ins.operatorId
                  ? operators.find((o) => o.id === ins.operatorId)
                    ? operatorDisplayName(operators.find((o) => o.id === ins.operatorId)!)
                    : '—'
                  : null
              }
              publicUsage={publicDronesUsingInsurance(ins.id).length}
              onView={() => setViewing(ins)}
              onDelete={() => setConfirmingDelete(ins)}
            />
          ))}
        </ul>
      )}

      {activeInsurances.some((i) => {
        const s = computePolicyStatus(i);
        return s === 'expiring';
      }) ? (
        <div className="mt-4">
          <CoverdroneCta />
        </div>
      ) : null}
          </>
        );
      })()}

      {creating ? (
        <InsuranceFormModal
          isOpen
          drones={drones}
          operators={operators}
          saving={savingId === 'new'}
          onClose={() => setCreating(false)}
          onSubmit={(form, pendingPdf, parserTrusted) => {
            setPendingCreate({ form, pendingPdf, parserTrusted });
            setConfirmingCreate(true);
          }}
        />
      ) : null}

      {viewing ? (
        <InsuranceViewModal
          insurance={viewing}
          coveredLabel={coveredDroneLabels(drones, viewing)}
          coveredCount={coveredDroneCount(drones, viewing)}
          operatorLabel={
            viewing.link === 'operator' && viewing.operatorId
              ? operators.find((o) => o.id === viewing.operatorId)
                ? operatorDisplayName(operators.find((o) => o.id === viewing.operatorId)!)
                : '—'
              : null
          }
          onClose={() => setViewing(null)}
          onViewPdf={() => setPreviewing(viewing)}
        />
      ) : null}

      <ConfirmDialog
        isOpen={confirmingCreate}
        title={t('insurance.confirmCreate.title')}
        message={t('insurance.confirmCreate.message')}
        confirmLabel={t('common.confirm')}
        danger={false}
        loading={savingId === 'new'}
        onConfirm={() => {
          if (!pendingCreate) return;
          void handleCreate(
            pendingCreate.form,
            pendingCreate.pendingPdf,
            pendingCreate.parserTrusted,
          ).finally(() => {
            setConfirmingCreate(false);
            setPendingCreate(null);
          });
        }}
        onClose={() => {
          setConfirmingCreate(false);
          setPendingCreate(null);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmingDelete)}
        title={t('insurance.delete.title')}
        loading={savingId === confirmingDelete?.id}
        message={confirmingDelete
          ? `${confirmingDelete.provider || '—'} · ${confirmingDelete.policyNumber || '—'}`
          : ''}
        extraWarning={
          confirmingDelete && publicDronesUsingInsurance(confirmingDelete.id).length > 0
            ? t('insurance.delete.warningPublic')
            : undefined
        }
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onClose={() => setConfirmingDelete(null)}
      />

      <EntityPdfPreviewModal
        isOpen={Boolean(previewing)}
        title={previewing?.provider || t('field.policyPdf')}
        url={previewing?.pdfUrl ?? ''}
        onClose={() => setPreviewing(null)}
      />
    </EntityListShell>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────

function InsuranceRow({
  insurance,
  coveredLabel,
  coveredCount,
  operatorLabel,
  publicUsage,
  onView,
  onDelete,
}: {
  insurance: Insurance;
  coveredLabel: string;
  coveredCount: number;
  operatorLabel: string | null;
  publicUsage: number;
  onView: () => void;
  onDelete: () => void;
}) {
  const { t } = useLanguage();
  const status = computePolicyStatus(insurance);
  return (
    <li>
      <Card padding="md">
        <EntityListRow
          actions={
            <RowActionMenu
              actions={[
                { key: 'view', label: t('common.view'), onClick: onView },
                { key: 'delete', label: t('common.delete'), onClick: onDelete, danger: true },
              ]}
              extra={
                !insurance.pdfUrl ? (
                  <span className="text-[11px] text-[var(--color-text-secondary)]">{t('entity.noPdfAttached')}</span>
                ) : null
              }
            />
          }
        >
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <h3 className="text-sm font-semibold text-[var(--color-text)] sm:text-base">
              {insurance.provider || t('common.notAvailable')}
            </h3>
            <VerificationBadge status={insurance.verificationStatus} />
            <PolicyStatusBadge status={status} />
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-[var(--color-text-secondary)] sm:text-xs">{insurance.policyNumber || '—'}</p>
          {insurance.holderName ? (
            <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-secondary)] sm:text-xs">{insurance.holderName}</p>
          ) : null}
          <p className="mt-1 text-[11px] leading-snug text-[var(--color-text-secondary)] sm:text-xs">
            {t('insurance.field.link')}: {t(`insurance.link.${insurance.link}`)}
            {operatorLabel ? <> · {operatorLabel}</> : null}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-text-secondary)] sm:text-xs">
            {t('insurance.field.coveredDrones')}:{' '}
            {coveredCount > 0
              ? `${t('insurance.coveredCount', { count: coveredCount })} · ${coveredLabel}`
              : '—'}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)] sm:text-xs">
            {insurance.issueDate && insurance.expiryDate ? (
              <>
                {t('insurance.field.validity')}: {formatDate(insurance.issueDate)} – {formatDate(insurance.expiryDate)}
              </>
            ) : (
              <>
                {t('profile.validUntil')}: {insurance.expiryDate ? formatDate(insurance.expiryDate) : '—'}
              </>
            )}
          </p>
          {publicUsage > 0 ? (
            <p className="mt-1 text-[11px] text-[var(--tone-warning-fg)] sm:text-xs">
              {t('insurance.delete.warningPublic')}
            </p>
          ) : null}
          {status === 'expiring' || status === 'expired' ? (
            <div className="mt-2">
              <CoverdroneCta compact />
            </div>
          ) : null}
        </EntityListRow>
      </Card>
    </li>
  );
}

// ─── Form modal ───────────────────────────────────────────────────────────

function InsuranceFormModal({
  isOpen,
  drones,
  operators,
  saving,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  drones: Drone[];
  operators: Operator[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (form: InsuranceFormState, pendingPdf: File | null, parserTrusted: boolean) => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<InsuranceFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);
  const [parsedSnapshot, setParsedSnapshot] = useState<ParsedPolicyFields | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>(() => form.pdfUrl);
  const [parsing, setParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState<string | null>(null);
  const [detectedDrones, setDetectedDrones] = useState<{
    rows: { manufacturer: string; model: string; registrationMark: string }[];
    matchedDroneIds: string[];
  } | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
  }, []);

  function setField<K extends keyof InsuranceFormState>(k: K, v: InsuranceFormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function toggleDrone(id: string) {
    setForm((prev) => {
      const has = prev.droneIds.includes(id);
      const droneIds = has ? prev.droneIds.filter((x) => x !== id) : [...prev.droneIds, id];
      return { ...prev, droneIds };
    });
  }

  async function handlePdfUpload(file: File) {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;
    setPendingPdf(file);
    setPdfPreviewUrl(blobUrl);
    setParseMessage(null);
    setDetectedDrones(null);
    setParsedSnapshot(null);
    setParsing(true);

    try {
      const text = await extractTextFromPdf(file);
      const parsed = parsePolicyPdfText(text);
      setParsedSnapshot(parsed);
      const matchedDroneIds = matchDronesFromPolicySpecs(drones, parsed.coveredDrones);

      if (parsed.coveredDrones.length > 0) {
        setDetectedDrones({
          rows: parsed.coveredDrones,
          matchedDroneIds,
        });
      }

      setForm((prev) => ({
        ...prev,
        link:
          parsed.coveredDrones.length > 1
            ? 'operator'
            : parsed.coveredDrones.length === 1
              ? 'drone'
              : prev.link,
        droneIds: matchedDroneIds.length > 0 ? matchedDroneIds : prev.droneIds,
        holderName: parsed.holderName || prev.holderName,
        provider: parsed.provider || prev.provider,
        policyNumber: parsed.policyNumber || prev.policyNumber,
        issueDate: parsed.issueDate || prev.issueDate,
        expiryDate: parsed.expiryDate || prev.expiryDate,
      }));
      if (parsed.partial) {
        setParseMessage(t('insurance.parse.partial'));
      } else if (parsed.provider || parsed.policyNumber || parsed.expiryDate) {
        setParseMessage(t('insurance.parse.success'));
      } else {
        setParseMessage(t('insurance.parse.failed'));
      }
    } catch {
      setParseMessage(t('insurance.parse.failed'));
    } finally {
      setParsing(false);
    }
  }

  function handlePdfRemove() {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPendingPdf(null);
    setPdfPreviewUrl('');
    setParseMessage(null);
    setDetectedDrones(null);
    setParsedSnapshot(null);
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.provider.trim()) e.provider = t('form.validation.required');
    if (!form.policyNumber.trim()) e.policyNumber = t('form.validation.required');
    if (form.expiryDate && form.issueDate && form.expiryDate < form.issueDate) {
      e.expiryDate = t('form.errors.expiryBeforeIssue');
    }
    return e;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    const parserTrusted = insuranceFormMatchesParser(form, parsedSnapshot);
    onSubmit(form, pendingPdf, parserTrusted);
  }

  const previewInsurance = formToInsurancePreview(form);
  const policySummary = describePolicyStatus(previewInsurance);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('insurance.create.title')}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormErrorBanner show={Object.keys(errors).length > 0} />

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] p-4">
          <UploadField
            label={t('field.policyPdf')}
            accept=".pdf,application/pdf"
            currentUrl={pdfPreviewUrl || undefined}
            onUpload={handlePdfUpload}
            onRemove={pdfPreviewUrl ? handlePdfRemove : undefined}
            preview
            className="mb-0"
          />
          {parsing ? (
            <p className="mt-2 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-gray-600" />
              {t('insurance.parse.parsing')}
            </p>
          ) : null}
          {parseMessage ? (
            <p className="mt-2 text-xs text-blue-700">{parseMessage}</p>
          ) : null}
          <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">{t('insurance.parse.hint')}</p>
          <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">{t('account.verification.uploadHint')}</p>
        </div>

        {(form.provider || form.policyNumber || form.expiryDate) ? (
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--color-border)] px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)]">
                {form.provider || t('common.notAvailable')}
              </p>
              {form.holderName ? (
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{form.holderName}</p>
              ) : null}
              {form.policyNumber ? (
                <p className="mt-0.5 font-mono text-xs text-[var(--color-text-secondary)]">{form.policyNumber}</p>
              ) : null}
              {form.issueDate && form.expiryDate ? (
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {formatDate(form.issueDate)} – {formatDate(form.expiryDate)}
                </p>
              ) : form.expiryDate ? (
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {t('profile.validUntil')}: {formatDate(form.expiryDate)}
                </p>
              ) : null}
              {detectedDrones ? (
                <div className="mt-1 space-y-0.5 text-xs text-[var(--color-text-secondary)]">
                  <p>
                    {t('insurance.parse.dronesDetected', { count: detectedDrones.rows.length })}
                    {detectedDrones.matchedDroneIds.length > 0 ? (
                      <span className="text-emerald-700">
                        {' '}
                        · {t('insurance.parse.dronesMatched', { count: detectedDrones.matchedDroneIds.length })}
                      </span>
                    ) : (
                      <span className="text-[var(--tone-warning-fg)]"> · {t('insurance.parse.droneNotMatched')}</span>
                    )}
                  </p>
                  <ul className="list-inside list-disc">
                    {detectedDrones.rows.map((row, idx) => (
                      <li key={`${row.manufacturer}-${row.model}-${idx}`}>
                        {[row.manufacturer, row.model].filter(Boolean).join(' ') || row.registrationMark || '—'}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <PolicyStatusDetail summary={policySummary} />
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label={t('insurance.field.link')} name="link"
            value={form.link}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setField('link', e.target.value as InsuranceLink)
            }
            options={[
              { value: 'drone', label: t('insurance.link.drone') },
              { value: 'operator', label: t('insurance.link.operator') },
            ]}
          />
          {form.link === 'operator' ? (
            <Select
              label={t('insurance.field.operator')} name="operatorId"
              value={form.operatorId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setField('operatorId', e.target.value)
              }
              options={[
                { value: '', label: '—' },
                ...operators.map((op) => ({ value: op.id, label: operatorDisplayName(op) })),
              ]}
            />
          ) : (
            <div className="hidden sm:block" aria-hidden />
          )}

          <div className="sm:col-span-2">
            <p className="mb-1.5 text-sm font-medium text-[var(--color-text)]">
              {t('insurance.field.coveredDrones')}
            </p>
            <p className="mb-2 text-[11px] text-[var(--color-text-secondary)]">
              {t('insurance.field.coveredDronesHint')}
            </p>
            {drones.length === 0 ? (
              <p className="text-xs text-[var(--color-text-secondary)]">{t('insurance.field.noDrones')}</p>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-[var(--color-border)] p-2">
                {drones.map((d) => {
                  const checked = form.droneIds.includes(d.id);
                  const label = droneLabel(d);
                  return (
                    <li key={d.id}>
                      <label
                        className={classNames(
                          'tap-44 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors',
                          checked ? 'bg-[var(--color-action-light)]' : 'hover:bg-[var(--color-hover)]',
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-action)]"
                          checked={checked}
                          onChange={() => toggleDrone(d.id)}
                        />
                        <span className="min-w-0 truncate text-[var(--color-text)]">{label}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Input
            label={t('field.holderName')} name="holderName"
            value={form.holderName}
            onChange={(e) => setField('holderName', e.target.value)}
            className="sm:col-span-2"
          />
          <Input
            label={t('field.insuranceProvider')} name="provider" required
            value={form.provider}
            onChange={(e) => setField('provider', e.target.value)}
            error={errors.provider}
          />
          <Input
            label={t('field.policyNumber')} name="policyNumber" required
            value={form.policyNumber}
            onChange={(e) => setField('policyNumber', e.target.value)}
            error={errors.policyNumber}
          />
          <Input
            label={t('field.issuedAt')} name="issueDate" type="date"
            value={form.issueDate}
            onChange={(e) => setField('issueDate', e.target.value)}
          />
          <Input
            label={t('field.expiresAt')} name="expiryDate" type="date"
            value={form.expiryDate}
            onChange={(e) => setField('expiryDate', e.target.value)}
            error={errors.expiryDate}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={saving}>
            {t('common.confirm')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function InsuranceViewModal({
  insurance,
  coveredLabel,
  coveredCount,
  operatorLabel,
  onClose,
  onViewPdf,
}: {
  insurance: Insurance;
  coveredLabel: string;
  coveredCount: number;
  operatorLabel: string | null;
  onClose: () => void;
  onViewPdf: () => void;
}) {
  const { t } = useLanguage();
  const status = computePolicyStatus(insurance);

  return (
    <Modal isOpen onClose={onClose} title={t('insurance.view.title')}>
      <div className="space-y-4">
        <div className="rounded-lg border border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--tone-warning-fg)]">
          {t('insurance.locked.hint')}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--color-border)] px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)]">
              {insurance.provider || t('common.notAvailable')}
            </p>
            {insurance.holderName ? (
              <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{insurance.holderName}</p>
            ) : null}
            {insurance.policyNumber ? (
              <p className="mt-0.5 font-mono text-xs text-[var(--color-text-secondary)]">{insurance.policyNumber}</p>
            ) : null}
          </div>
          <PolicyStatusBadge status={status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField label={t('insurance.field.link')} value={t(`insurance.link.${insurance.link}`)} />
          {operatorLabel ? (
            <ReadOnlyField label={t('insurance.field.operator')} value={operatorLabel} />
          ) : (
            <div className="hidden sm:block" aria-hidden />
          )}
          <ReadOnlyField
            label={t('insurance.field.coveredDrones')}
            value={
              coveredCount > 0
                ? `${t('insurance.coveredCount', { count: coveredCount })} — ${coveredLabel}`
                : '—'
            }
            className="sm:col-span-2"
          />
          <ReadOnlyField
            label={t('field.holderName')}
            value={insurance.holderName}
            className="sm:col-span-2"
          />
          <ReadOnlyField label={t('field.insuranceProvider')} value={insurance.provider} />
          <ReadOnlyField label={t('field.policyNumber')} value={insurance.policyNumber} />
          <ReadOnlyField
            label={t('field.issuedAt')}
            value={insurance.issueDate ? formatDate(insurance.issueDate) : ''}
          />
          <ReadOnlyField
            label={t('field.expiresAt')}
            value={insurance.expiryDate ? formatDate(insurance.expiryDate) : ''}
          />
        </div>

        {status === 'expiring' || status === 'expired' ? <CoverdroneCta /> : null}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {insurance.pdfUrl ? (
            <Button variant="secondary" onClick={onViewPdf}>
              {t('common.viewDocument')}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
