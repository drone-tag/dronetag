'use client';

/**
 * Compact "Plan & slots" summary card shown on /account/profile.
 *
 * Reads `slots/{uid}` to display the current quota for each slot kind
 * alongside live usage from the new-model collections. Pricing comes
 * from `plans/{*}` and is read from Firestore, never hardcoded — the
 * card lists each active plan as a price reference for the user.
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { listAuthorizations } from '@/lib/firebase/authorizations';
import { listCertificates } from '@/lib/firebase/certificates';
import { listDocuments } from '@/lib/firebase/documents';
import { listDronesByUser } from '@/lib/firebase/drones';
import { listOperators } from '@/lib/firebase/operators';
import { listPlans } from '@/lib/firebase/plans';
import { ensureSlots } from '@/lib/firebase/slots';
import {
  MAX_OPERATORS,
  type Plan,
  type Slots,
  type SlotKind,
} from '@/lib/types/entities';
import { computeAuthorizationStatus, computeCertificateStatus } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

type Usage = Record<SlotKind, number>;

const SLOT_ORDER: SlotKind[] = [
  'drone',
  'operator',
  'certificate',
  'pdf',
  'permit',
  'nfc_badge',
  'personalization',
];

function formatPrice(p: Plan): string {
  const amount = (p.priceCents / 100).toLocaleString('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${p.currency} ${amount}`;
}

export function PlanSlotsSummary() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [slots, setSlots] = useState<Slots | null>(null);
  const [usage, setUsage] = useState<Usage>({
    drone: 0,
    operator: 0,
    certificate: 0,
    pdf: 0,
    permit: 0,
    archive: 0,
    nfc_badge: 0,
    personalization: 0,
  });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const [s, drones, operators, certificates, documents, authorizations, planList] =
          await Promise.all([
            ensureSlots(user.uid),
            listDronesByUser(user.uid),
            listOperators(user.uid),
            listCertificates(user.uid),
            listDocuments(user.uid),
            listAuthorizations(user.uid),
            listPlans(),
          ]);
        if (cancelled) return;
        setSlots(s);
        setUsage({
          drone: drones.length,
          operator: operators.length,
          certificate: certificates.filter((c) => computeCertificateStatus(c) !== 'expired').length,
          pdf: documents.length,
          permit: authorizations.filter((a) => computeAuthorizationStatus(a) !== 'expired').length,
          archive: 0,
          nfc_badge: 0,
          personalization: 0,
        });
        setPlans(planList);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const activePlansByKind = useMemo(() => {
    const map = new Map<SlotKind, Plan>();
    for (const p of plans) {
      if (p.active && !map.has(p.slotKind)) map.set(p.slotKind, p);
    }
    return map;
  }, [plans]);

  if (loading || !slots) {
    return (
      <Card padding="md">
        <p className="text-sm text-[var(--color-text-secondary)]">{t('common.loading')}</p>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <header>
        <h2 className="text-base font-semibold text-[var(--color-text)]">{t('account.plan.title')}</h2>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{t('account.plan.subtitle')}</p>
      </header>

      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SLOT_ORDER.map((k) => {
          // Operators are double-capped: by slots[k] AND MAX_OPERATORS = 3.
          const cap = k === 'operator' ? Math.min(slots[k], MAX_OPERATORS) : slots[k];
          const used = usage[k];
          const atCap = used >= cap;
          const plan = activePlansByKind.get(k);
          return (
            <li
              key={k}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm"
            >
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  {t(`admin.slots.kind.${k}`)}
                </p>
                {plan ? (
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    {plan.label} · <span className="font-mono">{formatPrice(plan)}</span>
                  </p>
                ) : null}
              </div>
              <span
                className={
                  atCap
                    ? 'rounded-full bg-[var(--tone-warning-bg)] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--tone-warning-fg)] ring-1 ring-inset ring-[var(--tone-warning-ring)]'
                    : 'rounded-full bg-[var(--color-hover)] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--color-text)] ring-1 ring-inset ring-[var(--color-border)]'
                }
              >
                {used} / {cap}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
        {t('account.plan.contactAdmin')}.{' '}
        <Link href="/account/profile" className="text-[var(--color-action)] underline-offset-2 hover:underline">
          {t('account.plan.empty')}
        </Link>
      </p>
    </Card>
  );
}
