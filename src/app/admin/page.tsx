'use client';

/**
 * Admin operations overview — actionable work queue, not a link directory.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { listAllAccounts } from '@/lib/firebase/account';
import { listAllAuthorizations } from '@/lib/firebase/authorizations';
import { listAllCertificates } from '@/lib/firebase/certificates';
import { listAllDocuments } from '@/lib/firebase/documents';
import { listAllDrones } from '@/lib/firebase/drones';
import { listAllInsurances } from '@/lib/firebase/insurances';
import { listAllReports } from '@/lib/firebase/reports';
import { listSupportThreads } from '@/lib/firebase/support';
import type { UserAccount } from '@/lib/types/account';
import type { Drone, Report, SupportThread } from '@/lib/types/entities';
import type { VerificationStatus } from '@/lib/types';
import { accountDisplayName, isActiveOperatorOverride } from '@/lib/utils/entities';
import { classNames, formatDateTime, getPublicProfileUrl } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AdminSubNav } from '@/components/layout/AdminSubNav';

/** Shape of GET /api/health (see src/app/api/health/route.ts). */
interface HealthPayload {
  status: 'ok' | 'degraded';
  version?: string;
  commit?: string;
}

async function fetchHealth(): Promise<HealthPayload | null> {
  try {
    const res = await fetch('/api/health', { credentials: 'same-origin', cache: 'no-store' });
    const body = (await res.json().catch(() => ({}))) as Partial<HealthPayload>;
    return {
      status: res.ok && body.status === 'ok' ? 'ok' : 'degraded',
      version: typeof body.version === 'string' ? body.version : undefined,
      commit: typeof body.commit === 'string' ? body.commit : undefined,
    };
  } catch {
    return null;
  }
}

function settledValue<T>(result: PromiseSettledResult<T>, fallback: T, failures: string[], label: string): T {
  if (result.status === 'fulfilled') return result.value;
  console.error(`[admin overview] ${label} failed`, result.reason);
  failures.push(label);
  return fallback;
}

function isQueued(status: VerificationStatus): boolean {
  return status === 'pending' || status === 'unverified';
}

function isReviewableDrone(d: Drone): boolean {
  return d.status !== 'draft';
}

type DashboardData = {
  queue: {
    documents: number;
    certificates: number;
    insurances: number;
    authorizations: number;
    drones: number;
    total: number;
  };
  unreadReports: Report[];
  supportNeedsReply: SupportThread[];
  overrides: Drone[];
  /** Totals; the lists above only keep the most recent few. */
  counts: { unreadReports: number; supportNeedsReply: number; overrides: number };
  publicDrones: number;
  users: number;
  accountsByUid: Map<string, UserAccount>;
  health: HealthPayload | null;
  /** Sections that could not be loaded; the rest of the page still renders. */
  failures: string[];
};

export default function AdminOverviewPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [results, healthRes] = await Promise.all([
          Promise.allSettled([
            listAllAccounts(),
            listAllDrones(),
            listAllReports(),
            listAllCertificates(),
            listAllDocuments(),
            listAllInsurances(),
            listAllAuthorizations(),
            listSupportThreads(),
          ] as const),
          fetchHealth(),
        ]);
        if (cancelled) return;

        const failures: string[] = [];
        const accounts = settledValue(results[0], [], failures, t('admin.nav.users'));
        const drones = settledValue(results[1], [], failures, t('admin.nav.drones'));
        const reports = settledValue(results[2], [], failures, t('admin.nav.reports'));
        const certificates = settledValue(results[3], [], failures, t('admin.verify.tab.certificates'));
        const documents = settledValue(results[4], [], failures, t('admin.verify.tab.documents'));
        const insurances = settledValue(results[5], [], failures, t('admin.verify.tab.insurances'));
        const authorizations = settledValue(results[6], [], failures, t('admin.verify.tab.authorizations'));
        const threads = settledValue(results[7], [], failures, t('admin.nav.support'));

        const accountsByUid = new Map(accounts.map((a) => [a.uid, a]));
        const queue = {
          documents: documents.filter((d) => isQueued(d.verificationStatus)).length,
          certificates: certificates.filter((c) => isQueued(c.verificationStatus)).length,
          insurances: insurances.filter((i) => isQueued(i.verificationStatus)).length,
          authorizations: authorizations.filter((a) => isQueued(a.verificationStatus)).length,
          drones: drones.filter((d) => isReviewableDrone(d) && isQueued(d.verificationStatus)).length,
          total: 0,
        };
        queue.total =
          queue.documents +
          queue.certificates +
          queue.insurances +
          queue.authorizations +
          queue.drones;

        const allUnreadReports = reports
          .filter((r) => !r.adminReadAt)
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        // `pending` means support already replied, but a new user message
        // still needs an answer.
        const allSupportNeedsReply = threads
          .filter((th) => th.status !== 'closed' && (th.adminUnreadCount || 0) > 0)
          .sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));

        const allOverrides = drones
          .filter((d) => isActiveOperatorOverride(d))
          .sort((a, b) => (a.activeOperatorUntil || '').localeCompare(b.activeOperatorUntil || ''));

        setData({
          queue,
          unreadReports: allUnreadReports.slice(0, 6),
          supportNeedsReply: allSupportNeedsReply.slice(0, 6),
          overrides: allOverrides.slice(0, 6),
          counts: {
            unreadReports: allUnreadReports.length,
            supportNeedsReply: allSupportNeedsReply.length,
            overrides: allOverrides.length,
          },
          publicDrones: drones.filter((d) => d.status === 'active' && d.visibility === 'public').length,
          users: accounts.length,
          accountsByUid,
          health: healthRes,
          failures,
        });
      } catch (err) {
        console.error('[admin overview] load failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // `t` changes identity with the language; the labels are only used for
    // the failure notice, which does not warrant refetching every list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const attentionTotal = useMemo(() => {
    if (!data) return 0;
    return data.queue.total + data.counts.unreadReports + data.counts.supportNeedsReply;
  }, [data]);

  return (
    <div>
      <AdminSubNav />
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader title={t('admin.title')} description={t('admin.overview.subtitle')} />

        {loading && !data ? (
          <OverviewSkeleton />
        ) : !data ? (
          <div className="mt-6 rounded-xl border border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] px-4 py-3 text-sm text-[var(--tone-danger-fg)]" role="alert">
            <p className="font-semibold">{t('admin.overview.loadFailed')}</p>
            <button
              type="button"
              onClick={() => setReloadKey((n) => n + 1)}
              className="mt-2 text-xs font-semibold underline underline-offset-2"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : (
          <>
            {data.failures.length > 0 ? (
              <div
                className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] px-4 py-3 text-sm text-[var(--tone-danger-fg)]"
                role="alert"
              >
                <p>
                  <span className="font-semibold">{t('admin.overview.partialFailure')}</span>{' '}
                  <span className="opacity-90">({data.failures.join(', ')})</span>
                </p>
                <button
                  type="button"
                  onClick={() => setReloadKey((n) => n + 1)}
                  disabled={loading}
                  className="text-xs font-semibold underline underline-offset-2 disabled:opacity-60"
                >
                  {t('common.retry')}
                </button>
              </div>
            ) : null}
            {attentionTotal > 0 ? (
              <div
                className="mt-4 rounded-xl border border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] px-4 py-3 text-sm text-[var(--tone-warning-fg)]"
                role="status"
              >
                <p className="font-semibold">{t('admin.overview.attentionTitle')}</p>
                <p className="mt-0.5 text-xs opacity-90">
                  {t('admin.overview.attentionBody', { count: attentionTotal })}
                </p>
              </div>
            ) : (
              <div
                className="mt-4 rounded-xl border border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] px-4 py-3 text-sm text-[var(--tone-success-fg)]"
                role="status"
              >
                <p className="font-semibold">{t('admin.overview.allClearTitle')}</p>
                <p className="mt-0.5 text-xs opacity-90">{t('admin.overview.allClearBody')}</p>
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ActionStat
                href="/admin/verify"
                label={t('admin.overview.stat.queue')}
                value={data.queue.total}
                variant={data.queue.total > 0 ? 'warning' : 'success'}
              />
              <ActionStat
                href="/admin/reports"
                label={t('admin.overview.stat.unreadReports')}
                value={data.counts.unreadReports}
                variant={data.counts.unreadReports > 0 ? 'warning' : 'default'}
              />
              <ActionStat
                href="/admin/support"
                label={t('admin.overview.stat.support')}
                value={data.counts.supportNeedsReply}
                variant={data.counts.supportNeedsReply > 0 ? 'warning' : 'default'}
              />
              <ActionStat
                href="/admin/drones"
                label={t('admin.overview.stat.overrides')}
                value={data.counts.overrides}
                variant={data.counts.overrides > 0 ? 'warning' : 'default'}
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Card padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-text)]">
                      {t('admin.overview.verify.title')}
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {t('admin.overview.verify.subtitle')}
                    </p>
                  </div>
                  <Link
                    href="/admin/verify"
                    className="shrink-0 text-xs font-semibold text-[var(--color-action)] underline-offset-2 hover:underline"
                  >
                    {t('admin.overview.openQueue')}
                  </Link>
                </div>
                <ul className="mt-4 space-y-2">
                  {(
                    [
                      { key: 'documents', href: '/admin/verify', count: data.queue.documents, label: t('admin.verify.tab.documents') },
                      { key: 'certificates', href: '/admin/verify', count: data.queue.certificates, label: t('admin.verify.tab.certificates') },
                      { key: 'insurances', href: '/admin/verify', count: data.queue.insurances, label: t('admin.verify.tab.insurances') },
                      { key: 'authorizations', href: '/admin/verify', count: data.queue.authorizations, label: t('admin.verify.tab.authorizations') },
                      { key: 'drones', href: '/admin/verify', count: data.queue.drones, label: t('admin.verify.tab.drones') },
                    ] as const
                  ).map((row) => (
                    <li key={row.key}>
                      <Link
                        href={row.href}
                        className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm transition hover:border-[var(--color-action)]/40 hover:bg-[var(--color-hover)]"
                      >
                        <span className="font-medium text-[var(--color-text)]">{row.label}</span>
                        <span
                          className={classNames(
                            'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                            row.count > 0
                              ? 'bg-[var(--tone-warning-bg)] text-[var(--tone-warning-fg)]'
                              : 'bg-[var(--color-hover)] text-[var(--color-text-secondary)]',
                          )}
                        >
                          {row.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-text)]">
                      {t('admin.overview.reports.title')}
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {t('admin.overview.reports.subtitle')}
                    </p>
                  </div>
                  <Link
                    href="/admin/reports"
                    className="shrink-0 text-xs font-semibold text-[var(--color-action)] underline-offset-2 hover:underline"
                  >
                    {t('admin.overview.openReports')}
                  </Link>
                </div>
                {data.unreadReports.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState
                      title={t('admin.overview.reports.empty')}
                      description={t('admin.overview.reports.emptyDesc')}
                    />
                  </div>
                ) : (
                  <ul className="mt-4 divide-y divide-[var(--color-border)]">
                    {data.unreadReports.map((r) => {
                      const owner = data.accountsByUid.get(r.ownerUserId);
                      return (
                        <li key={r.id}>
                          <Link
                            href="/admin/reports"
                            className="block py-3 transition hover:bg-[var(--color-hover)]/60"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                                {r.finderName || t('admin.overview.reports.anonymous')}
                              </p>
                              <span className="shrink-0 text-[10px] text-[var(--color-text-secondary)]">
                                {r.createdAt ? formatDateTime(r.createdAt) : '—'}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">
                              /u/{r.droneSlug}
                              {owner ? ` · ${accountDisplayName(owner)}` : ''}
                            </p>
                            {r.message ? (
                              <p className="mt-1 line-clamp-2 text-xs text-[var(--color-text)]">
                                {r.message}
                              </p>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <Card padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-text)]">
                      {t('admin.overview.support.title')}
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {t('admin.overview.support.subtitle')}
                    </p>
                  </div>
                  <Link
                    href="/admin/support"
                    className="shrink-0 text-xs font-semibold text-[var(--color-action)] underline-offset-2 hover:underline"
                  >
                    {t('admin.overview.openSupport')}
                  </Link>
                </div>
                {data.supportNeedsReply.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState
                      title={t('admin.overview.support.empty')}
                      description={t('admin.overview.support.emptyDesc')}
                    />
                  </div>
                ) : (
                  <ul className="mt-4 divide-y divide-[var(--color-border)]">
                    {data.supportNeedsReply.map((th) => {
                      const acct = data.accountsByUid.get(th.userId);
                      return (
                        <li key={th.userId}>
                          <Link
                            href={`/admin/support?user=${encodeURIComponent(th.userId)}`}
                            className="flex items-start justify-between gap-2 py-3 transition hover:bg-[var(--color-hover)]/60"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                                {acct ? accountDisplayName(acct) : th.userId}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">
                                {th.subject || th.lastMessagePreview || '—'}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-[var(--color-expired)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {th.adminUnreadCount}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <Card padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-text)]">
                      {t('admin.overview.overrides.title')}
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {t('admin.overview.overrides.subtitle')}
                    </p>
                  </div>
                  <Link
                    href="/admin/drones"
                    className="shrink-0 text-xs font-semibold text-[var(--color-action)] underline-offset-2 hover:underline"
                  >
                    {t('admin.overview.openDrones')}
                  </Link>
                </div>
                {data.overrides.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState
                      title={t('admin.overview.overrides.empty')}
                      description={t('admin.overview.overrides.emptyDesc')}
                    />
                  </div>
                ) : (
                  <ul className="mt-4 divide-y divide-[var(--color-border)]">
                    {data.overrides.map((d) => (
                      <li key={d.id}>
                        <Link
                          href={`/admin/drones/${d.id}`}
                          className="block py-3 transition hover:bg-[var(--color-hover)]/60"
                        >
                          <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                            {[d.manufacturer, d.model].filter(Boolean).join(' ') || d.slug}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                            {t('admin.overview.overrides.until', {
                              when: d.activeOperatorUntil
                                ? formatDateTime(d.activeOperatorUntil)
                                : '—',
                            })}
                          </p>
                          {d.status === 'active' && d.visibility === 'public' ? (
                            <p className="mt-1 truncate font-mono text-[10px] text-[var(--color-text-secondary)]">
                              {getPublicProfileUrl(d.slug)}
                            </p>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--color-text-secondary)]">
              <span>
                {t('admin.overview.foot.users')}:{' '}
                <Link href="/admin/users" className="font-semibold text-[var(--color-text)] underline-offset-2 hover:underline">
                  {data.users}
                </Link>
              </span>
              <span aria-hidden>·</span>
              <span>
                {t('admin.overview.foot.public')}:{' '}
                <span className="font-semibold text-[var(--color-text)]">{data.publicDrones}</span>
              </span>
            </div>

            <OpsFooter health={data.health} />
          </>
        )}
      </div>
    </div>
  );
}

function ActionStat({
  href,
  label,
  value,
  variant,
}: {
  href: string;
  label: string;
  value: number;
  variant: 'default' | 'success' | 'warning';
}) {
  const styles = {
    default: 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)]',
    success: 'border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)]',
    warning: 'border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] text-[var(--tone-warning-fg)]',
  } as const;
  const dot = {
    default: 'bg-[var(--color-border)]',
    success: 'bg-[var(--color-valid)]',
    warning: 'bg-[var(--color-expiring)]',
  } as const;

  return (
    <Link
      href={href}
      className={classNames(
        'rounded-xl border px-4 py-3.5 transition hover:scale-[1.01]',
        styles[variant],
      )}
    >
      <div className="flex items-center gap-1.5">
        {variant !== 'default' && value > 0 ? (
          <span className={classNames('h-1.5 w-1.5 rounded-full', dot[variant])} aria-hidden />
        ) : null}
        <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">{label}</p>
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </Link>
  );
}

function OverviewSkeleton() {
  return (
    <div className="mt-4 animate-pulse" aria-hidden>
      <div className="h-14 rounded-xl bg-[var(--color-hover)]" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[84px] rounded-xl bg-[var(--color-hover)]" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-56 rounded-xl bg-[var(--color-hover)]" />
        ))}
      </div>
    </div>
  );
}

function OpsFooter({ health }: { health: HealthPayload | null }) {
  const { t } = useLanguage();
  if (!health) return null;
  const ok = health.status === 'ok';
  const statusColour = ok
    ? 'bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)] ring-[var(--tone-success-ring)]'
    : 'bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] ring-[var(--tone-danger-ring)]';

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-4 text-[11px] text-[var(--color-text-secondary)]">
      <span className={`rounded-full px-2.5 py-0.5 font-medium ring-1 ring-inset ${statusColour}`}>
        {ok ? t('admin.overview.health.ok') : t('admin.overview.health.degraded')}
      </span>
      {health.version ? (
        <span className="ml-auto font-mono">
          v{health.version}
          {health.commit ? ` · ${health.commit}` : ''}
        </span>
      ) : null}
    </div>
  );
}
