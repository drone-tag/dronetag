'use client';

/**
 * Drone detail / editor page.
 *
 * Sections (top to bottom):
 *   1. Basics            — manufacturer, model, classMarking, serial numbers
 *   2. Active operator   — M4: live effective/default/override view + 24h
 *                          temporary switch with responsibility checkbox.
 *                          Lives outside the main form because its writes
 *                          go through dedicated `setActiveOperator` /
 *                          `clearActiveOperator` helpers and don't share
 *                          the form's dirty/submit lifecycle.
 *   3. Linked entities   — pilot (read-only), default operator selector,
 *                          insurance picker (drone-linked policies only)
 *
 * Identity fields are editable only until the owner confirms and locks them.
 * Publication is owner-controlled, gated by PublicationConsent.
 */

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  deleteDrone,
  getDrone,
  updateDrone,
} from '@/lib/firebase/drones';
import { listOperators } from '@/lib/firebase/operators';
import { listInsurances } from '@/lib/firebase/insurances';
import { getPilot } from '@/lib/firebase/pilots';
import {
  DRONE_CLASSES,
  type Drone,
  type DroneClass,
  type Insurance,
  type Operator,
  type Pilot,
} from '@/lib/types/entities';
import {
  isDroneDataLocked,
  operatorDisplayName,
  pilotDisplayName,
} from '@/lib/utils/entities';
import { getPublicProfileUrl } from '@/lib/utils';
import { PublicLinkCard } from '@/components/account/PublicLinkCard';
import { errorMessage } from '@/lib/client/errorMessage';
import { useToast } from '@/contexts/ToastContext';
import { LoadError, PageLoading } from '@/components/ui/LoadError';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ActiveOperatorPanel } from '@/components/account/ActiveOperatorPanel';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import { FormErrorBanner } from '@/components/account/FormErrorBanner';
import { ReadOnlyField } from '@/components/account/ReadOnlyField';
import { PublicationConsent } from '@/components/profile/PublicationConsent';

interface DroneFormState {
  manufacturer: string;
  model: string;
  classMarking: DroneClass;
  droneSerialNumber: string;
  controllerSerialNumber: string;
  defaultOperatorId: string;
  insuranceId: string;
}

function droneToForm(d: Drone): DroneFormState {
  return {
    manufacturer: d.manufacturer,
    model: d.model,
    classMarking: d.classMarking,
    droneSerialNumber: d.droneSerialNumber,
    controllerSerialNumber: d.controllerSerialNumber,
    defaultOperatorId: d.defaultOperatorId,
    insuranceId: d.insuranceId ?? '',
  };
}

export default function DroneDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const droneId = useMemo(() => {
    const raw = params?.id;
    return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] ?? '' : '';
  }, [params]);

  const [drone, setDrone] = useState<Drone | null>(null);
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<DroneFormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingLock, setConfirmingLock] = useState(false);
  const [confirmingPublish, setConfirmingPublish] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [linkedInsuranceId, setLinkedInsuranceId] = useState('');

  const reload = useCallback(async () => {
    if (!user || !droneId) return;
    try {
      const [d, opList, insList, p] = await Promise.all([
        getDrone(droneId),
        listOperators(user.uid),
        listInsurances(user.uid),
        getPilot(user.uid),
      ]);
      setLoadError(null);
      if (!d || d.userId !== user.uid) {
        setDrone(null);
        return;
      }
      setDrone(d);
      setOperators(opList);
      setInsurances(insList);
      setPilot(p);
      setForm(droneToForm(d));
      setLinkedInsuranceId(d.insuranceId ?? '');
      setDirty(false);
    } catch (err) {
      console.error('[drone detail] load failed', err);
      setLoadError(errorMessage(err, t, 'loadError.body'));
    }
  }, [user, droneId, t]);

  useEffect(() => {
    if (!user || !droneId) return;
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, droneId, reload]);

  if (loading) return <PageLoading />;

  if (loadError && !drone) {
    return (
      <div className="mt-4">
        <LoadError message={loadError} onRetry={reload} />
      </div>
    );
  }

  if (!drone || !form) {
    return (
      <div className="mt-8">
        <p className="text-sm text-[var(--color-text-secondary)]">{t('profile.notFound')}</p>
        <div className="mt-4">
          <Button href="/account/drones" variant="ghost">
            {t('drone.backToList')}
          </Button>
        </div>
      </div>
    );
  }

  function setField<K extends keyof DroneFormState>(k: K, v: DroneFormState[K]) {
    setForm((p) => (p ? { ...p, [k]: v } : p));
    setDirty(true);
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate(f: DroneFormState): Record<string, string> {
    const e: Record<string, string> = {};
    if (!f.manufacturer.trim()) e.manufacturer = t('form.validation.required');
    if (!f.model.trim()) e.model = t('form.validation.required');
    if (!f.defaultOperatorId) e.defaultOperatorId = t('form.validation.required');
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form || isDroneDataLocked(drone!)) return;
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setConfirmingLock(true);
  }

  async function handleConfirmLock() {
    if (!form) return;
    setSaving(true);
    try {
      await updateDrone(drone!.id, {
        ...form,
        insuranceId: form.insuranceId || null,
        dataLockedAt: new Date().toISOString(),
      });
      await reload();
      setSavedAt(Date.now());
      setConfirmingLock(false);
      toast.success(t('toast.drone.saved'));
    } catch (err) {
      console.error('[drone detail] save failed', err);
      setErrors({ submit: errorMessage(err, t) });
      setConfirmingLock(false);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setSaving(true);
    try {
      const { published } = await updateDrone(drone!.id, {
        status: 'active',
        visibility: 'public',
      });
      await reload();
      setConfirmingPublish(false);
      if (published) toast.success(t('drone.publish.success'));
      else toast.error(t('drone.publish.notLive'));
    } catch (err) {
      console.error('[drone detail] publish failed', err);
      toast.error(errorMessage(err, t));
      setConfirmingPublish(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish() {
    setSaving(true);
    try {
      await updateDrone(drone!.id, { visibility: 'private' });
      await reload();
      toast.success(t('drone.unpublish.success'));
    } catch (err) {
      console.error('[drone detail] unpublish failed', err);
      toast.error(errorMessage(err, t));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveInsuranceLink() {
    setSaving(true);
    try {
      await updateDrone(drone!.id, { insuranceId: linkedInsuranceId || null });
      await reload();
      toast.success(t('toast.drone.saved'));
    } catch (err) {
      console.error('[drone detail] insurance link failed', err);
      toast.error(errorMessage(err, t));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteDrone(drone!.id);
      // Fired before navigating: the toast provider lives in the root layout,
      // so the message survives the route change and lands on the list page
      // where the row is now gone.
      toast.success(t('toast.drone.deleted'));
      router.push('/account/drones');
    } catch (err) {
      console.error('[drone detail] delete failed', err);
      toast.error(errorMessage(err, t, 'toast.drone.deleteFailed'));
      setConfirmingDelete(false);
    } finally {
      setSaving(false);
    }
  }

  const isLocked = isDroneDataLocked(drone);
  const isPublic = drone.status === 'active' && drone.visibility === 'public';
  const droneInsurances = insurances;
  const defaultOperator = operators.find((o) => o.id === drone.defaultOperatorId);
  const classLabel = t(
    DRONE_CLASSES.find((c) => c.value === drone.classMarking)?.labelKey ?? 'drone.class.unknown',
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <Link
        href="/account/drones"
        className="tap-44 inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] sm:text-sm"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
          <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 010 1.06L7.06 8h7.69a.75.75 0 010 1.5H7.06l2.72 2.72a.75.75 0 11-1.06 1.06l-4-4a.75.75 0 010-1.06l4-4a.75.75 0 011.06 0z" clipRule="evenodd" />
        </svg>
        {t('drone.backToList')}
      </Link>

      <header className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-snug text-[var(--color-text)] sm:text-xl">
            {[drone.manufacturer, drone.model].filter(Boolean).join(' ').trim() || drone.slug}
          </h2>
          <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-secondary)] sm:text-xs">
            {t('drone.field.slug')}: <code className="font-mono">{drone.slug}</code>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {!isLocked && savedAt && !dirty ? (
            <span className="rounded-full bg-[var(--tone-success-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--tone-success-fg)] ring-1 ring-inset ring-[var(--tone-success-ring)] sm:px-2.5 sm:py-1 sm:text-xs">
              {t('account.saved')}
            </span>
          ) : null}
          {isPublic ? (
            <Button variant="secondary" size="sm" loading={saving} onClick={handleUnpublish}>
              {t('drone.unpublish')}
            </Button>
          ) : (
            <Button variant="secondary" size="sm" disabled={saving} onClick={() => setConfirmingPublish(true)}>
              {t('drone.publish')}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
            {t('common.delete')}
          </Button>
        </div>
      </header>

      {isPublic ? <PublicLinkCard url={getPublicProfileUrl(drone.slug)} /> : null}

      <ActiveOperatorPanel
        drone={drone}
        operators={operators}
        setBy={user?.uid ?? ''}
        onChanged={reload}
      />

      {isLocked ? (
        <div className="space-y-5">
          <div className="rounded-lg border border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] px-4 py-3 text-sm leading-relaxed text-[var(--tone-warning-fg)]">
            {t('drone.locked.hint')}
          </div>

          <Card padding="md">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">{t('drone.detail.basics')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ReadOnlyField label={t('drone.field.manufacturer')} value={drone.manufacturer} />
              <ReadOnlyField label={t('drone.field.model')} value={drone.model} />
              <ReadOnlyField label={t('drone.field.classMarking')} value={classLabel} />
              <ReadOnlyField label={t('drone.field.serialNumber')} value={drone.droneSerialNumber} />
              <ReadOnlyField
                label={t('drone.field.controllerSerial')}
                value={drone.controllerSerialNumber}
                className="sm:col-span-2"
              />
            </div>
          </Card>

          <Card padding="md">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">{t('drone.detail.linked')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ReadOnlyField label={t('drone.field.linkedPilot')} value={pilotDisplayName(pilot)} />
              <ReadOnlyField
                label={t('drone.field.defaultOperator')}
                value={defaultOperator ? operatorDisplayName(defaultOperator) : '—'}
              />
              <div className="sm:col-span-2">
                <Select
                  label={t('drone.field.insurance')} name="linkedInsuranceId"
                  value={linkedInsuranceId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setLinkedInsuranceId(e.target.value)}
                  options={[
                    { value: '', label: t('drone.field.insuranceNone') },
                    ...droneInsurances.map((i) => ({
                      value: i.id,
                      label: `${i.provider || '—'} · ${i.policyNumber || '—'}`,
                    })),
                  ]}
                />
                <p className="mt-1.5 text-[11px] text-[var(--color-text-secondary)]">
                  {t('drone.insuranceLink.hint')}
                </p>
                {linkedInsuranceId !== (drone.insuranceId ?? '') ? (
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" loading={saving} onClick={handleSaveInsuranceLink}>
                      {t('common.save')}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormErrorBanner show={Boolean(errors.submit) || Object.keys(errors).length > 0} message={errors.submit} />

          <Card padding="md">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">{t('drone.detail.basics')}</h3>
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
              <Select
                label={t('drone.field.classMarking')} name="classMarking"
                value={form.classMarking}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setField('classMarking', e.target.value as DroneClass)
                }
                options={DRONE_CLASSES.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
              />
              <Input
                label={t('drone.field.serialNumber')} name="droneSerialNumber"
                value={form.droneSerialNumber}
                onChange={(e) => setField('droneSerialNumber', e.target.value)}
                error={errors.droneSerialNumber}
              />
              <Input
                label={t('drone.field.controllerSerial')} name="controllerSerialNumber"
                value={form.controllerSerialNumber}
                onChange={(e) => setField('controllerSerialNumber', e.target.value)}
                className="sm:col-span-2"
              />
            </div>
          </Card>

          <Card padding="md">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">{t('drone.detail.linked')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                  {t('drone.field.linkedPilot')}
                </p>
                <p className="mt-0.5 text-sm text-[var(--color-text)]">{pilotDisplayName(pilot)}</p>
              </div>
              <Select
                label={t('drone.field.defaultOperator')} name="defaultOperatorId" required
                value={form.defaultOperatorId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setField('defaultOperatorId', e.target.value)
                }
                options={operators.map((op) => ({
                  value: op.id,
                  label: operatorDisplayName(op),
                }))}
                error={errors.defaultOperatorId}
              />
              <Select
                label={t('drone.field.insurance')} name="insuranceId"
                value={form.insuranceId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setField('insuranceId', e.target.value)
                }
                options={[
                  { value: '', label: t('drone.field.insuranceNone') },
                  ...droneInsurances.map((i) => ({
                    value: i.id,
                    label: `${i.provider || '—'} · ${i.policyNumber || '—'}`,
                  })),
                ]}
                className="sm:col-span-2"
              />
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="submit" loading={saving}>
              {t('common.confirm')}
            </Button>
          </div>
        </form>
      )}

      <PublicationConsent
        isOpen={confirmingPublish}
        busy={saving}
        publicUrl={getPublicProfileUrl(drone.slug)}
        onCancel={() => setConfirmingPublish(false)}
        onConfirm={handlePublish}
      />

      <ConfirmDialog
        isOpen={confirmingLock}
        title={t('drone.confirmLock.title')}
        message={t('drone.confirmLock.message')}
        confirmLabel={t('common.confirm')}
        danger={false}
        loading={saving}
        onConfirm={handleConfirmLock}
        onClose={() => setConfirmingLock(false)}
      />

      <ConfirmDialog
        isOpen={confirmingDelete}
        title={t('drone.delete.title')}
        loading={saving}
        message={[drone.manufacturer, drone.model].filter(Boolean).join(' ').trim() || drone.slug}
        extraWarning={
          isPublic
            ? t('drone.delete.warning', { url: getPublicProfileUrl(drone.slug) })
            : undefined
        }
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
