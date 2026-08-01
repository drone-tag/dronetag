'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  createDrone,
  deleteDrone,
  listDronesByUser,
} from '@/lib/firebase/drones';
import { listOperators } from '@/lib/firebase/operators';
import { ensureSlots } from '@/lib/firebase/slots';
import { trackEvent } from '@/lib/analytics';
import {
  CUSTOM_DRONE_CATALOG_ID,
  findDroneCatalogEntry,
  type DroneCatalogEntry,
} from '@/lib/droneCatalog';
import {
  DRONE_CLASSES,
  type Drone,
  type DroneClass,
  type Operator,
  type Slots,
} from '@/lib/types/entities';
import { operatorDisplayName } from '@/lib/utils/entities';
import { getPublicProfileUrl } from '@/lib/utils';
import { EntityListRow } from '@/components/ui/EntityListRow';
import { RowActionMenu } from '@/components/ui/RowActionMenu';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import { EntityListShell } from '@/components/account/EntityListShell';
import { FormErrorBanner } from '@/components/account/FormErrorBanner';
import { DroneCatalogPicker } from '@/components/account/DroneCatalogPicker';
import { VerificationBadge } from '@/components/ui/StatusBadge';

interface CreateFormState {
  catalogId: string | null;
  manufacturer: string;
  model: string;
  classMarking: DroneClass;
  defaultOperatorId: string;
  droneSerialNumber: string;
}

const EMPTY_FORM: CreateFormState = {
  catalogId: null,
  manufacturer: '',
  model: '',
  classMarking: 'unknown',
  defaultOperatorId: '',
  droneSerialNumber: '',
};

export default function AccountDronesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [slots, setSlots] = useState<Slots | null>(null);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [confirmingCreate, setConfirmingCreate] = useState(false);
  const [pendingCreate, setPendingCreate] = useState<CreateFormState | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Drone | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reload = useMemo(() => async () => {
    if (!user) return;
    const [dList, oList, s] = await Promise.all([
      listDronesByUser(user.uid),
      listOperators(user.uid),
      ensureSlots(user.uid),
    ]);
    setDrones(dList);
    setOperators(oList);
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

  const cap = slots?.drone ?? 1;
  const atCap = drones.length >= cap;
  const noOperators = operators.length === 0;

  async function handleCreate(form: CreateFormState) {
    if (!user) return;
    setSavingId('new');
    setSaveError(null);
    try {
      const { id } = await createDrone({
        userId: user.uid,
        status: 'draft',
        visibility: 'private',
        verificationStatus: 'unverified',
        manufacturer: form.manufacturer,
        model: form.model,
        classMarking: form.classMarking,
        droneSerialNumber: form.droneSerialNumber,
        controllerSerialNumber: '',
        linkedPilotId: user.uid,
        defaultOperatorId: form.defaultOperatorId,
        activeOperatorId: null,
        activeOperatorUntil: null,
        activeOperatorSetAt: '',
        activeOperatorSetBy: '',
        activeOperatorReason: '',
        insuranceId: null,
        publishedAt: '',
        lastVerifiedAt: '',
        dataLockedAt: '',
      });
      trackEvent('drone_created', { classMarking: form.classMarking });
      setCreating(false);
      router.push(`/account/drones/${id}`);
    } catch (err) {
      console.error('[drones] create failed', err);
      setSaveError(err instanceof Error ? err.message : t('account.saveError'));
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) return;
    setSavingId(confirmingDelete.id);
    try {
      await deleteDrone(confirmingDelete.id);
      await reload();
      setConfirmingDelete(null);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <EntityListShell
      title={t('drone.list.title')}
      used={drones.length}
      max={cap}
      newLabel={t('drone.list.new')}
      onNew={() => setCreating(true)}
      newDisabled={atCap || noOperators}
    >
      <FormErrorBanner show={Boolean(saveError)} message={saveError ?? undefined} />
      {noOperators && drones.length === 0 ? (
        <EmptyState
          title={t('drone.list.empty')}
          description={t('drone.list.emptyDesc')}
          hints={[
            t('empty.hints.operator.1'),
            t('empty.hints.operator.2'),
            t('empty.hints.operator.3'),
          ]}
          action={<Button href="/account/operators">{t('account.tab.operators')}</Button>}
        />
      ) : drones.length === 0 ? (
        <EmptyState
          title={t('drone.list.empty')}
          description={t('drone.list.emptyDesc')}
          hints={[
            t('empty.hints.drone.1'),
            t('empty.hints.drone.2'),
            t('empty.hints.drone.3'),
          ]}
          action={
            <Button onClick={() => setCreating(true)} disabled={atCap}>
              {t('drone.list.new')}
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {drones.map((d) => {
            const op = operators.find((o) => o.id === d.defaultOperatorId);
            return (
              <DroneRow
                key={d.id}
                drone={d}
                operatorName={op ? operatorDisplayName(op) : '—'}
                onDelete={() => setConfirmingDelete(d)}
              />
            );
          })}
        </ul>
      )}

      {creating ? (
        <CreateDroneModal
          isOpen
          saving={savingId === 'new'}
          operators={operators}
          onClose={() => setCreating(false)}
          onSubmit={(form) => {
            setPendingCreate(form);
            setConfirmingCreate(true);
          }}
        />
      ) : null}

      <ConfirmDialog
        isOpen={confirmingCreate}
        title={t('drone.confirmCreate.title')}
        message={t('drone.confirmCreate.message')}
        confirmLabel={t('common.confirm')}
        danger={false}
        loading={savingId === 'new'}
        onConfirm={() => {
          if (!pendingCreate) return;
          void handleCreate(pendingCreate).finally(() => {
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
        title={t('drone.delete.title')}
        loading={savingId === confirmingDelete?.id}
        message={
          confirmingDelete
            ? `${confirmingDelete.manufacturer} ${confirmingDelete.model || confirmingDelete.slug}`.trim()
            : ''
        }
        extraWarning={
          confirmingDelete && confirmingDelete.status === 'active' && confirmingDelete.visibility === 'public'
            ? t('drone.delete.warning', { url: getPublicProfileUrl(confirmingDelete.slug) })
            : undefined
        }
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onClose={() => setConfirmingDelete(null)}
      />
    </EntityListShell>
  );
}

// ─── Drone row ────────────────────────────────────────────────────────────

function DroneRow({
  drone,
  operatorName,
  onDelete,
}: {
  drone: Drone;
  operatorName: string;
  onDelete: () => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const isPublic = drone.status === 'active' && drone.visibility === 'public';
  return (
    <li>
      <Card padding="md">
        <EntityListRow
          actions={
            <RowActionMenu
              actions={[
                { key: 'view', label: t('common.view'), onClick: () => router.push(`/account/drones/${drone.id}`) },
                { key: 'delete', label: t('common.delete'), onClick: onDelete, danger: true },
              ]}
            />
          }
        >
          <Link
            href={`/account/drones/${drone.id}`}
            className="block min-w-0 text-sm font-semibold text-[var(--color-text)] hover:underline sm:text-base"
          >
            {[drone.manufacturer, drone.model].filter(Boolean).join(' ').trim() || drone.slug}
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
            <span className="rounded-full bg-[var(--color-hover)] px-2 py-0.5 font-mono uppercase text-[var(--color-text)]">
              {drone.classMarking}
            </span>
            <VerificationBadge status={drone.verificationStatus} />
            <span
              className={
                isPublic
                  ? 'rounded-full bg-[var(--tone-success-bg)] px-2 py-0.5 font-medium text-[var(--tone-success-fg)] ring-1 ring-inset ring-[var(--tone-success-ring)]'
                  : 'rounded-full bg-[var(--color-hover)] px-2 py-0.5 font-medium text-[var(--color-text-secondary)] ring-1 ring-inset ring-[var(--color-border)]'
              }
            >
              {isPublic ? t('visibility.public') : t('visibility.private')} · {t(`status.${drone.status}`)}
            </span>
          </div>
          <p className="mt-1 truncate text-[11px] text-[var(--color-text-secondary)] sm:text-xs">
            {t('drone.field.defaultOperator')}: {operatorName}
          </p>
          {isPublic ? (
            <p className="mt-1 truncate font-mono text-[10px] text-[var(--color-text-secondary)] sm:text-[11px]">
              {getPublicProfileUrl(drone.slug)}
            </p>
          ) : null}
        </EntityListRow>
      </Card>
    </li>
  );
}

// ─── Quick-create modal ───────────────────────────────────────────────────

function CreateDroneModal({
  isOpen,
  saving,
  operators,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  saving: boolean;
  operators: Operator[];
  onClose: () => void;
  onSubmit: (form: CreateFormState) => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<CreateFormState>(() => ({
    ...EMPTY_FORM,
    defaultOperatorId: operators.find((o) => o.isDefault)?.id ?? operators[0]?.id ?? '',
  }));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const isCustom = form.catalogId === CUSTOM_DRONE_CATALOG_ID;
  const fromCatalog = Boolean(form.catalogId && !isCustom);
  const hasChoice = Boolean(form.catalogId);

  function setField<K extends keyof CreateFormState>(k: K, v: CreateFormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function applyCatalogEntry(entry: DroneCatalogEntry | null) {
    if (!entry) {
      setForm((p) => ({
        ...p,
        catalogId: CUSTOM_DRONE_CATALOG_ID,
        manufacturer: '',
        model: '',
        classMarking: 'unknown',
      }));
      setErrors((e) => ({ ...e, manufacturer: undefined, model: undefined }));
      return;
    }
    setForm((p) => ({
      ...p,
      catalogId: entry.id,
      manufacturer: entry.manufacturer,
      model: entry.model,
      classMarking: entry.classMarking,
    }));
    setErrors((e) => ({ ...e, manufacturer: undefined, model: undefined }));
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!hasChoice) e.catalogId = t('drone.catalog.required');
    if (!form.manufacturer.trim()) e.manufacturer = t('form.validation.required');
    if (!form.model.trim()) e.model = t('form.validation.required');
    if (!form.defaultOperatorId) e.defaultOperatorId = t('form.validation.required');
    return e;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasChoice) {
      setErrors({ catalogId: t('drone.catalog.required') });
      return;
    }
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    onSubmit(form);
  }

  const selectedCatalog = form.catalogId && !isCustom
    ? findDroneCatalogEntry(form.catalogId)
    : null;

  const bannerMessage = errors.catalogId && !hasChoice
    ? errors.catalogId
    : undefined;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('drone.create.title')}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormErrorBanner
          show={Object.keys(errors).length > 0}
          message={bannerMessage}
        />

        <DroneCatalogPicker
          selectedId={form.catalogId}
          onSelect={(entry) => {
            applyCatalogEntry(entry);
            setErrors({});
          }}
        />
        {errors.catalogId && !hasChoice ? (
          <p className="text-sm text-[var(--color-expired)]" role="alert">{errors.catalogId}</p>
        ) : null}

        {selectedCatalog ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-hover)] px-3 py-2.5 text-sm">
            <p className="font-medium text-[var(--color-text)]">
              {selectedCatalog.manufacturer} {selectedCatalog.model}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              {t('drone.catalog.selectedClass')}: {selectedCatalog.classMarking}
              {selectedCatalog.note ? ` · ${selectedCatalog.note}` : ''}
            </p>
          </div>
        ) : null}

        {isCustom ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t('drone.field.manufacturer')} name="manufacturer" required
              value={form.manufacturer}
              onChange={(e) => setField('manufacturer', e.target.value)}
              error={errors.manufacturer}
            />
            <Input
              label={t('drone.field.model')} name="model" required
              value={form.model}
              onChange={(e) => setField('model', e.target.value)}
              error={errors.model}
            />
          </div>
        ) : null}

        {hasChoice ? (
          <>
            <Select
              label={t('drone.field.classMarking')} name="classMarking"
              value={form.classMarking}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setField('classMarking', e.target.value as DroneClass)
              }
              options={DRONE_CLASSES.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t('drone.field.serialNumber')} name="droneSerialNumber"
                value={form.droneSerialNumber}
                onChange={(e) => setField('droneSerialNumber', e.target.value)}
                placeholder={t('drone.catalog.serialHint')}
              />
              <Select
                label={t('drone.field.defaultOperator')} name="defaultOperatorId" required
                value={form.defaultOperatorId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setField('defaultOperatorId', e.target.value)
                }
                options={operators.map((op) => ({ value: op.id, label: operatorDisplayName(op) }))}
                error={errors.defaultOperatorId}
              />
            </div>
          </>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={saving} disabled={!hasChoice}>
            {t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

