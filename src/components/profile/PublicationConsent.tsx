'use client';

/**
 * Shown before a profile becomes publicly readable.
 *
 * Publishing was previously a visibility dropdown with no explanation. The
 * consequence — that the page becomes readable by anyone on the internet who
 * has the link, with no login — was never stated, and neither was which fields
 * travel with it. That is a poor basis for consent given the data involved.
 *
 * The two lists below are written from the actual public projection in
 * src/lib/utils/publicProjection.ts. They must be kept in step with it: a
 * field added to `PublicDroneCard` without a line here turns this screen into
 * a false reassurance, which is worse than not showing it.
 */

import { useState } from 'react';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

/** Mirrors the fields present in `PublicDroneCard`. */
const SHARED_KEYS = [
  'consent.shared.name',
  'consent.shared.drone',
  'consent.shared.serial',
  'consent.shared.certStatus',
  'consent.shared.insuranceStatus',
  'consent.shared.insuranceProvider',
  'consent.shared.insuranceExpiry',
  'consent.shared.maskedPolicy',
  'consent.shared.verification',
] as const;

/**
 * Deliberately excluded. Listed explicitly because "we don't publish your
 * address" is only reassuring if it is said out loud — and because each line
 * here corresponds to a decision in the projection that a future change could
 * quietly reverse.
 */
const WITHHELD_KEYS = [
  'consent.withheld.policyPdf',
  'consent.withheld.address',
  'consent.withheld.email',
  'consent.withheld.phone',
  'consent.withheld.fullPolicy',
  'consent.withheld.ids',
] as const;

export interface PublicationConsentProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /** The URL the profile will be reachable at, if already known. */
  publicUrl?: string;
  busy?: boolean;
}

export function PublicationConsent({
  isOpen,
  onCancel,
  onConfirm,
  publicUrl,
  busy = false,
}: PublicationConsentProps) {
  const { t } = useLanguage();
  const [agreed, setAgreed] = useState(false);

  function handleCancel() {
    setAgreed(false);
    onCancel();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={t('consent.title')}
      description={t('consent.description')}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={handleCancel} disabled={busy}>
            {t('common.cancel')}
          </Button>
          {/* Gated on the checkbox: consent that can be given by pressing the
              default button without reading anything is not consent. */}
          <Button onClick={onConfirm} disabled={!agreed || busy} loading={busy}>
            {t('consent.confirm')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-[var(--tone-warning-bg)] px-3 py-2.5 text-sm text-[var(--tone-warning-fg)] ring-1 ring-[var(--tone-warning-ring)]">
          {t('consent.warning')}
        </div>

        {publicUrl ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              {t('consent.urlLabel')}
            </p>
            <p className="mt-1 break-all font-mono text-sm text-[var(--color-text)]">{publicUrl}</p>
          </div>
        ) : null}

        <FieldList
          heading={t('consent.sharedTitle')}
          tone="shared"
          items={SHARED_KEYS.map((k) => t(k))}
        />
        <FieldList
          heading={t('consent.withheldTitle')}
          tone="withheld"
          items={WITHHELD_KEYS.map((k) => t(k))}
        />

        <label className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-[var(--color-hover)] px-3 py-2.5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-border)] text-[var(--color-action)] focus:ring-[var(--color-action)]"
          />
          <span className="text-sm text-[var(--color-text)]">{t('consent.checkbox')}</span>
        </label>

        <p className="text-xs text-[var(--color-text-secondary)]">{t('consent.revocable')}</p>
      </div>
    </Modal>
  );
}

function FieldList({
  heading,
  tone,
  items,
}: {
  heading: string;
  tone: 'shared' | 'withheld';
  items: string[];
}) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
        {heading}
      </h3>
      <ul className="mt-1.5 space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
            <span
              aria-hidden
              className={
                tone === 'shared'
                  ? 'mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tone-info-fg)]'
                  : 'mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-border)]'
              }
            />
            <span className={tone === 'withheld' ? 'text-[var(--color-text-secondary)]' : undefined}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
