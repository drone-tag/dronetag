'use client';

import Link from 'next/link';
import { DEMO_MODE } from '@/lib/firebase/config';
import { MICHELE_CAFFAGNI_BRANDING } from '@/lib/demo/micheleCaffagni';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/Card';

type Scenario = {
  titleKey: string;
  badgeKey: string;
  stepsKey: string;
  publicPath: string;
  verifyHint?: boolean;
};

const SCENARIOS: Scenario[] = [
  {
    titleKey: 'demo.scenario.green.title',
    badgeKey: 'demo.scenario.green.badges',
    stepsKey: 'demo.scenario.green.steps',
    publicPath: `/u/${MICHELE_CAFFAGNI_BRANDING.publicSlug}`,
  },
  {
    titleKey: 'demo.scenario.review.title',
    badgeKey: 'demo.scenario.review.badges',
    stepsKey: 'demo.scenario.review.steps',
    publicPath: '/u/citymapper-anna',
    verifyHint: true,
  },
  {
    titleKey: 'demo.scenario.critical.title',
    badgeKey: 'demo.scenario.critical.badges',
    stepsKey: 'demo.scenario.critical.steps',
    publicPath: '/u/vistaone-carlos',
  },
  {
    titleKey: 'demo.scenario.fleet.title',
    badgeKey: 'demo.scenario.fleet.badges',
    stepsKey: 'demo.scenario.fleet.steps',
    publicPath: '/u/alpine-mavic',
  },
];

/** Client-facing demo playbook: which persona / URL shows which badge colors. */
export function DemoClientScenarios() {
  const { t } = useLanguage();
  if (!DEMO_MODE) return null;

  return (
    <Card>
      <h2 className="text-sm font-semibold text-[var(--color-text)]">{t('demo.scenarios.title')}</h2>
      <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        {t('demo.scenarios.subtitle')}
      </p>
      <ul className="mt-4 space-y-3">
        {SCENARIOS.map((s) => (
          <li
            key={s.publicPath}
            className="rounded-xl border border-[var(--color-border)] px-3 py-2.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)]">{t(s.titleKey)}</p>
                <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">{t(s.badgeKey)}</p>
              </div>
              <Link
                href={s.publicPath}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs font-semibold text-[var(--color-action)] underline-offset-2 hover:underline"
              >
                {t('demo.scenarios.openPublic')}
              </Link>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-text)]">{t(s.stepsKey)}</p>
            {s.verifyHint ? (
              <p className="mt-1.5 text-[11px] text-[var(--color-expiring)]">
                {t('demo.scenarios.verifyPath')}{' '}
                <Link href="/admin/verify" className="font-semibold underline-offset-2 hover:underline">
                  /admin/verify
                </Link>
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}
