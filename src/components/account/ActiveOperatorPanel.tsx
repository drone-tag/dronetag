'use client';

/**
 * Active-operator switching panel for the drone detail page (PRD §5).
 *
 * Responsibilities:
 *   • Visualise the three operator slots: effective right now (lazy 24h
 *     TTL), the default, and any active temporary override.
 *   • Live countdown to expiry (re-rendered every minute).
 *   • Modal flow to activate a temporary operator with the required
 *     responsibility checkbox + optional reason.
 *   • Clear-now action with a confirm dialog.
 *   • Opportunistic cleanup: when an override has expired by the time
 *     the page loads, we silently call clearActiveOperator so the audit
 *     trail doesn't keep stale data after the TTL window closes.
 *
 * The panel relies entirely on the M1 lazy TTL helper
 * `effectiveOperatorId()` for "what operator is in charge right now".
 * No timer / Cloud Function is needed — the data layer is the single
 * source of truth.
 */

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  clearActiveOperator,
  setActiveOperator,
} from '@/lib/firebase/drones';
import type { Drone, Operator } from '@/lib/types/entities';
import {
  effectiveOperatorId,
  isActiveOperatorOverride,
  operatorDisplayName,
} from '@/lib/utils/entities';
import { formatDateTime } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import { FormErrorBanner } from '@/components/account/FormErrorBanner';

export type ActiveOperatorPanelProps = {
  drone: Drone;
  operators: Operator[];
  /** Uid of the currently signed-in user (audit trail). */
  setBy: string;
  /** Called after any successful mutation so the parent reloads state. */
  onChanged: () => Promise<void> | void;
};

export function ActiveOperatorPanel({
  drone,
  operators,
  setBy,
  onChanged,
}: ActiveOperatorPanelProps) {
  const { t } = useLanguage();
  const [now, setNow] = useState(() => new Date());
  const [switchOpen, setSwitchOpen] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-render every minute so the countdown stays fresh and the
  // "expired" banner appears as soon as the TTL elapses.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Opportunistic cleanup: if the override expired between server reads,
  // silently clear it so the audit fields don't keep stale data.
  useEffect(() => {
    if (!drone.activeOperatorId || !drone.activeOperatorUntil) return;
    const until = new Date(drone.activeOperatorUntil).getTime();
    if (!Number.isFinite(until) || until > Date.now()) return;
    let cancelled = false;
    (async () => {
      try {
        await clearActiveOperator(drone.id);
        if (!cancelled) await onChanged();
      } catch (err) {
        console.warn('[activeOp] cleanup failed', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [drone.id, drone.activeOperatorId, drone.activeOperatorUntil, onChanged]);

  const overrideActive = isActiveOperatorOverride(drone, now);
  const effectiveId = effectiveOperatorId(drone, now);
  const effectiveOp = operators.find((o) => o.id === effectiveId) ?? null;
  const defaultOp = operators.find((o) => o.id === drone.defaultOperatorId) ?? null;
  const activeOp = drone.activeOperatorId
    ? operators.find((o) => o.id === drone.activeOperatorId) ?? null
    : null;

  // The selectable operators for the switch modal: everything the user owns
  // except the current default. PRD allows up to 3 operators; M2 enforces
  // that cap so this list is implicitly bounded.
  const alternativeOperators = operators.filter((o) => o.id !== drone.defaultOperatorId);

  async function handleApply(operatorId: string, reason: string) {
    setBusy(true);
    setError(null);
    try {
      await setActiveOperator(drone.id, operatorId, { setBy, reason });
      trackEvent('operator_override_activated', {
        slug: drone.slug,
        hasReason: reason.length > 0,
      });
      await onChanged();
      setSwitchOpen(false);
    } catch (err) {
      console.error('[activeOp] activate failed', err);
      setError(t('activeOp.errorBody'));
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    setBusy(true);
    setError(null);
    try {
      await clearActiveOperator(drone.id);
      await onChanged();
      setConfirmingClear(false);
    } catch (err) {
      console.error('[activeOp] clear failed', err);
      setError(t('activeOp.errorBody'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card padding="md">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            {t('activeOp.section.title')}
          </h3>
          <p className="mt-0.5 max-w-prose text-xs text-[var(--color-text-secondary)]">
            {t('activeOp.section.subtitle')}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {overrideActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingClear(true)}
            >
              {t('activeOp.cta.clearNow')}
            </Button>
          ) : null}
          <Button
            size="sm"
            onClick={() => setSwitchOpen(true)}
            disabled={alternativeOperators.length === 0}
          >
            {t('activeOp.cta.switch')}
          </Button>
        </div>
      </header>

      <FormErrorBanner show={Boolean(error)} message={error ?? undefined} />

      {alternativeOperators.length === 0 ? (
        <div className="mt-2 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-hover)] px-4 py-4">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {t('activeOp.empty.noAlternativeTitle')}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {t('activeOp.empty.noAlternativeDesc')}
          </p>
        </div>
      ) : null}

      {overrideActive ? (
        <div
          className="mb-4 flex items-start gap-3 rounded-lg border border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] px-3.5 py-3 text-sm text-[var(--tone-warning-fg)]"
          role="status"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden>
            <path fillRule="evenodd" d="M10 1a9 9 0 100 18 9 9 0 000-18zm-.75 5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0V6zm.75 8.25a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">{t('activeOp.banner.activeNow')}</p>
            <Countdown until={drone.activeOperatorUntil} now={now} />
          </div>
        </div>
      ) : null}

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SlotTile
          label={t('activeOp.label.effective')}
          name={effectiveOp ? operatorDisplayName(effectiveOp) : '—'}
          highlight
        />
        <SlotTile
          label={t('activeOp.label.default')}
          name={defaultOp ? operatorDisplayName(defaultOp) : '—'}
        />
        <SlotTile
          label={t('activeOp.label.activeOverride')}
          name={overrideActive && activeOp ? operatorDisplayName(activeOp) : '—'}
          muted={!overrideActive}
        />
      </dl>

      {overrideActive ? (
        <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-hover)] p-3.5 text-xs text-[var(--color-text-secondary)]">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {drone.activeOperatorSetAt ? (
              <Pair label={t('activeOp.label.setAt')} value={formatDateTime(drone.activeOperatorSetAt)} />
            ) : null}
            {drone.activeOperatorUntil ? (
              <Pair label={t('activeOp.label.expiresAt')} value={formatDateTime(drone.activeOperatorUntil)} />
            ) : null}
            {drone.activeOperatorReason ? (
              <div className="sm:col-span-2">
                <dt className="font-semibold uppercase tracking-wider text-[10px] text-[var(--color-text-secondary)]">
                  {t('activeOp.label.reason')}
                </dt>
                <dd className="mt-0.5 whitespace-pre-wrap leading-relaxed text-[var(--color-text)]">
                  {drone.activeOperatorReason}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      {switchOpen ? (
        <SwitchModal
          isOpen
          drone={drone}
          alternatives={alternativeOperators}
          submitting={busy}
          onClose={() => setSwitchOpen(false)}
          onSubmit={handleApply}
        />
      ) : null}

      <ConfirmDialog
        isOpen={confirmingClear}
        title={t('activeOp.clear.title')}
        message={t('activeOp.clear.message')}
        confirmLabel={t('activeOp.cta.clearNow')}
        loading={busy}
        onConfirm={handleClear}
        onClose={() => setConfirmingClear(false)}
      />
    </Card>
  );
}

// ─── Pieces ────────────────────────────────────────────────────────────────

function SlotTile({
  label,
  name,
  highlight,
  muted,
}: {
  label: string;
  name: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={[
        'rounded-lg border px-3 py-2.5',
        highlight ? 'border-[var(--tone-info-border)] bg-[var(--tone-info-bg)]' : 'border-[var(--color-border)] bg-[var(--color-card)]',
        muted ? 'opacity-70' : '',
      ].join(' ')}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p
        className={
          highlight
            ? 'mt-1 text-sm font-semibold text-blue-900'
            : 'mt-1 text-sm font-medium text-[var(--color-text)]'
        }
      >
        {name}
      </p>
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold uppercase tracking-wider text-[10px] text-[var(--color-text-secondary)]">{label}</dt>
      <dd className="mt-0.5 text-[var(--color-text)]">{value}</dd>
    </div>
  );
}

function Countdown({ until, now }: { until: string | null; now: Date }) {
  const { t } = useLanguage();
  if (!until) return null;
  const target = new Date(until).getTime();
  if (!Number.isFinite(target)) return null;
  const remaining = target - now.getTime();
  if (remaining <= 0) {
    return (
      <p className="mt-0.5 text-xs text-[var(--tone-warning-fg)]/80">
        {t('activeOp.countdown.expired')}
      </p>
    );
  }
  const minutes = Math.floor(remaining / 60_000);
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  const text =
    hours > 0
      ? t('activeOp.countdown.hours', { hours, minutes: remMinutes })
      : t('activeOp.countdown.minutes', { minutes });
  return <p className="mt-0.5 text-xs text-[var(--tone-warning-fg)]/90">{text}</p>;
}

// ─── Switch modal ──────────────────────────────────────────────────────────

function SwitchModal({
  isOpen,
  drone,
  alternatives,
  submitting,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  drone: Drone;
  alternatives: Operator[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (operatorId: string, reason: string) => Promise<void>;
}) {
  const { t } = useLanguage();
  const initialId = useMemo(() => alternatives[0]?.id ?? '', [alternatives]);
  const [operatorId, setOperatorId] = useState<string>(initialId);
  const [reason, setReason] = useState('');
  const [responsibility, setResponsibility] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const sameAsDefault = operatorId === drone.defaultOperatorId;
  const canSubmit = Boolean(operatorId) && !sameAsDefault && responsibility;

  function validate(): Record<string, string | undefined> {
    const e: Record<string, string | undefined> = {};
    if (!operatorId) e.operatorId = t('form.validation.required');
    if (sameAsDefault) e.operatorId = t('activeOp.modal.sameAsDefault');
    if (!responsibility) e.responsibility = t('activeOp.modal.responsibilityRequired');
    return e;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.values(v).some(Boolean)) return;
    void onSubmit(operatorId, reason.trim());
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('activeOp.modal.title')}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <p className="text-sm text-[var(--color-text-secondary)]">{t('activeOp.modal.subtitle')}</p>

        <FormErrorBanner show={Object.values(errors).some(Boolean)} />

        <Select
          label={t('activeOp.modal.field.operator')}
          name="operatorId"
          value={operatorId}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setOperatorId(e.target.value);
            if (errors.operatorId) setErrors((prev) => ({ ...prev, operatorId: undefined }));
          }}
          options={alternatives.map((op) => ({ value: op.id, label: operatorDisplayName(op) }))}
          required
          error={errors.operatorId}
        />

        <div>
          <Textarea
            label={t('activeOp.modal.field.reason')}
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t('activeOp.modal.field.reasonHint')}</p>
        </div>

        <p className="rounded-lg bg-[var(--tone-info-bg)] px-3 py-2.5 text-xs leading-relaxed text-[var(--tone-info-fg)]">
          {t('activeOp.modal.duration')}
        </p>

        <label className="flex items-start gap-3 rounded-lg border border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] px-3 py-2.5">
          <input
            type="checkbox"
            checked={responsibility}
            onChange={(e) => {
              setResponsibility(e.target.checked);
              if (errors.responsibility) {
                setErrors((prev) => ({ ...prev, responsibility: undefined }));
              }
            }}
            className="mt-0.5 h-4 w-4 rounded border-[var(--tone-warning-border)] text-[var(--tone-warning-fg)] focus:ring-[var(--color-expiring)]"
            aria-describedby="responsibility-help"
          />
          <span id="responsibility-help" className="text-xs leading-relaxed text-[var(--tone-warning-fg)]">
            {t('activeOp.modal.responsibility')}
          </span>
        </label>
        {errors.responsibility ? (
          <p className="-mt-2 text-xs text-red-600" role="alert">
            {errors.responsibility}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={submitting} disabled={!canSubmit}>
            {t('activeOp.cta.confirmAndApply')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
