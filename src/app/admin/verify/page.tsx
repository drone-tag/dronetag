'use client';

/**
 * Admin verification queue + archive.
 *
 * Queue: pending / unverified items awaiting a decision.
 * Archive: verified or rejected items (can be reopened to pending).
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import {
  listAllAuthorizations,
  updateAuthorization,
} from '@/lib/firebase/authorizations';
import {
  listAllCertificates,
  updateCertificate,
} from '@/lib/firebase/certificates';
import {
  listAllDocuments,
  updateDocument,
} from '@/lib/firebase/documents';
import {
  listAllInsurances,
  updateInsurance,
} from '@/lib/firebase/insurances';
import { listAllDrones, updateDrone } from '@/lib/firebase/drones';
import { listAllAccounts } from '@/lib/firebase/account';
import { ensureSupportThread, sendSupportMessage } from '@/lib/firebase/support';
import { adminFetch } from '@/lib/client/adminApi';
import { DEMO_MODE } from '@/lib/firebase/config';
import type { UserAccount } from '@/lib/types/account';
import type { Authorization, Certificate, DocumentRef, Drone, Insurance } from '@/lib/types/entities';
import { AUTHORIZATION_KINDS, CERTIFICATE_KINDS } from '@/lib/types/entities';
import type { VerificationStatus } from '@/lib/types';
import { accountDisplayName } from '@/lib/utils/entities';
import { classNames, formatDate, formatDateTime, getPublicProfileUrl } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { VerifyControls } from '@/components/admin/VerifyControls';

type EntityTab = 'documents' | 'certificates' | 'insurances' | 'authorizations' | 'drones';
type ViewMode = 'queue' | 'archive';

function isQueued(status: VerificationStatus): boolean {
  return status === 'pending' || status === 'unverified';
}

function isArchived(status: VerificationStatus): boolean {
  return status === 'verified' || status === 'rejected';
}

/** Draft drones are not reviewed until the user publishes them. */
function isReviewableDrone(d: Drone): boolean {
  return d.status !== 'draft';
}

function StatusPill({ status }: { status: VerificationStatus }) {
  const { t } = useLanguage();
  const styles: Record<VerificationStatus, string> = {
    verified: 'bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)] ring-[var(--tone-success-ring)]',
    pending: 'bg-[var(--tone-warning-bg)] text-[var(--tone-warning-fg)] ring-[var(--tone-warning-ring)]',
    unverified: 'bg-[var(--color-hover)] text-[var(--color-text-secondary)] ring-[var(--color-border)]',
    rejected: 'bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] ring-[var(--tone-danger-ring)]',
  };
  return (
    <span
      className={classNames(
        'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        styles[status],
      )}
    >
      {t(`verification.${status}`)}
    </span>
  );
}

export default function AdminVerifyPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const [view, setView] = useState<ViewMode>('queue');
  const [tab, setTab] = useState<EntityTab>('documents');
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [documents, setDocuments] = useState<DocumentRef[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  /** Set when the decision saved but the user could not be emailed. */
  const [notifyWarning, setNotifyWarning] = useState<string | null>(null);

  const reload = async () => {
    const [a, d, c, i, az, dr] = await Promise.all([
      listAllAccounts(),
      listAllDocuments(),
      listAllCertificates(),
      listAllInsurances(),
      listAllAuthorizations(),
      listAllDrones(),
    ]);
    setAccounts(a);
    setDocuments(d);
    setCertificates(c);
    setInsurances(i);
    setAuthorizations(az);
    setDrones(dr);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } catch (err) {
        console.error('[admin verify] load failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Tell the user about a verification decision, by email and in the in-app
   * support thread.
   *
   * The decision itself is already saved by the time this runs, so a failure
   * here must not be surfaced as a failed approval. It is reported as a
   * separate, non-blocking warning instead.
   */
  async function notifyUserVerification(
    userId: string,
    kind: 'certificate' | 'insurance' | 'document' | 'drone' | 'authorization',
    label: string,
    status: VerificationStatus,
    reason?: string,
  ) {
    if (status !== 'verified' && status !== 'rejected') return;

    const kindLabel = t(`account.verification.kind.${kind}`);
    const body =
      status === 'verified'
        ? t('account.verification.notifyVerified', { kind: kindLabel, label })
        : t('account.verification.notifyRejected', { kind: kindLabel, label });
    const subject = t('account.verification.threadSubject');

    if (DEMO_MODE) {
      try {
        await ensureSupportThread(userId, subject);
        await sendSupportMessage({
          threadId: userId,
          sender: 'admin',
          senderUid: user?.uid ?? 'demo-admin',
          body,
          subject,
        });
      } catch (err) {
        console.warn('[admin verify] notify user failed', err);
      }
      return;
    }

    // `drone` has no email template — a drone is not a document a user submits
    // for approval — so it stays an in-app message only.
    const emailEntity =
      kind === 'drone' ? undefined : (kind as 'certificate' | 'insurance' | 'document' | 'authorization');

    try {
      const res = await adminFetch('/api/admin/notify-verification', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          entity: emailEntity ?? 'document',
          outcome: status === 'verified' ? 'approved' : 'rejected',
          itemLabel: label,
          reason,
          threadMessage: body,
          threadSubject: subject,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        email?: { status: string; reason?: string };
      };
      if (payload.email && payload.email.status !== 'sent') {
        setNotifyWarning(
          t('admin.verify.notifyWarning', { reason: payload.email.reason ?? payload.email.status }),
        );
      }
    } catch (err) {
      console.warn('[admin verify] notify user failed', err);
      setNotifyWarning(t('admin.verify.notifyWarning', { reason: 'network' }));
    }
  }

  /**
   * Shared wrapper for the five decision handlers below.
   *
   * They used to run under a `try/finally` with no `catch`: the local row was
   * only patched after the write resolved, so a rejected write left the row
   * exactly as it was and the admin saw the spinner stop with nothing else
   * changing. There was no way to tell a saved decision from a failed one.
   *
   * The toast deliberately talks about the decision only. Whether the user was
   * emailed is reported separately by `notifyWarning`, because notification is
   * best-effort and claiming it here would sometimes be untrue.
   */
  async function runDecision(status: VerificationStatus, apply: () => Promise<void>) {
    try {
      await apply();
      toast.success(
        t(
          status === 'verified'
            ? 'toast.verify.approved'
            : status === 'rejected'
              ? 'toast.verify.rejected'
              : 'toast.verify.reset',
        ),
      );
    } catch (err) {
      console.error('[admin verify] decision failed', err);
      toast.error(t('toast.verify.failed'));
    }
  }

  const accountsByUid = useMemo(() => {
    const map = new Map<string, UserAccount>();
    for (const a of accounts) map.set(a.uid, a);
    return map;
  }, [accounts]);

  const matchView = (status: VerificationStatus) =>
    view === 'queue' ? isQueued(status) : isArchived(status);

  const docsView = useMemo(
    () => documents.filter((d) => matchView(d.verificationStatus)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matchView depends on view
    [documents, view],
  );
  const certsView = useMemo(
    () => certificates.filter((c) => matchView(c.verificationStatus)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [certificates, view],
  );
  const insView = useMemo(
    () => insurances.filter((i) => matchView(i.verificationStatus)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [insurances, view],
  );
  const authzView = useMemo(
    () => authorizations.filter((a) => matchView(a.verificationStatus)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authorizations, view],
  );
  const dronesView = useMemo(
    () =>
      drones.filter(
        (d) => isReviewableDrone(d) && matchView(d.verificationStatus),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drones, view],
  );

  const queueCount =
    documents.filter((d) => isQueued(d.verificationStatus)).length +
    certificates.filter((c) => isQueued(c.verificationStatus)).length +
    insurances.filter((i) => isQueued(i.verificationStatus)).length +
    authorizations.filter((a) => isQueued(a.verificationStatus)).length +
    drones.filter((d) => isReviewableDrone(d) && isQueued(d.verificationStatus)).length;
  const archiveCount =
    documents.filter((d) => isArchived(d.verificationStatus)).length +
    certificates.filter((c) => isArchived(c.verificationStatus)).length +
    insurances.filter((i) => isArchived(i.verificationStatus)).length +
    authorizations.filter((a) => isArchived(a.verificationStatus)).length +
    drones.filter((d) => isReviewableDrone(d) && isArchived(d.verificationStatus)).length;

  async function setDocStatus(d: DocumentRef, s: VerificationStatus) {
    setBusyId(d.id);
    try {
      await runDecision(s, async () => {
        await updateDocument(d.id, { verificationStatus: s });
        setDocuments((prev) =>
          prev.map((x) => (x.id === d.id ? { ...x, verificationStatus: s } : x)),
        );
        await notifyUserVerification(d.userId, 'document', d.label || d.fileName || d.kind, s);
      });
    } finally {
      setBusyId(null);
    }
  }
  async function setCertStatus(c: Certificate, s: VerificationStatus) {
    setBusyId(c.id);
    try {
      await runDecision(s, async () => {
        await updateCertificate(c.id, { verificationStatus: s });
        setCertificates((prev) =>
          prev.map((x) => (x.id === c.id ? { ...x, verificationStatus: s } : x)),
        );
        await notifyUserVerification(
          c.userId,
          'certificate',
          c.registrationNumber || c.label || c.kind,
          s,
        );
      });
    } finally {
      setBusyId(null);
    }
  }
  async function setInsStatus(i: Insurance, s: VerificationStatus) {
    setBusyId(i.id);
    try {
      await runDecision(s, async () => {
        const patch: Partial<Insurance> = { verificationStatus: s };
        if (DEMO_MODE && s === 'verified') {
          const now = new Date();
          const renew = new Date(now);
          renew.setFullYear(renew.getFullYear() + 1);
          patch.issueDate = now.toISOString().slice(0, 10);
          patch.expiryDate = renew.toISOString().slice(0, 10);
        }
        await updateInsurance(i.id, patch);
        setInsurances((prev) =>
          prev.map((x) => (x.id === i.id ? { ...x, ...patch } : x)),
        );
        await notifyUserVerification(
          i.userId,
          'insurance',
          i.provider || i.policyNumber || '—',
          s,
        );
      });
    } finally {
      setBusyId(null);
    }
  }
  async function setAuthzStatus(a: Authorization, s: VerificationStatus) {
    setBusyId(a.id);
    try {
      await runDecision(s, async () => {
        await updateAuthorization(a.id, { verificationStatus: s });
        setAuthorizations((prev) =>
          prev.map((x) => (x.id === a.id ? { ...x, verificationStatus: s } : x)),
        );
        await notifyUserVerification(
          a.userId,
          'authorization',
          a.label || a.kind,
          s,
        );
      });
    } finally {
      setBusyId(null);
    }
  }
  async function setDroneStatus(d: Drone, s: VerificationStatus) {
    setBusyId(d.id);
    try {
      await runDecision(s, async () => {
        const patch: Partial<Drone> = {
          verificationStatus: s,
          lastVerifiedAt: s === 'verified' ? new Date().toISOString() : d.lastVerifiedAt,
        };
        await updateDrone(d.id, patch);
        setDrones((prev) =>
          prev.map((x) => (x.id === d.id ? { ...x, ...patch } : x)),
        );
        await notifyUserVerification(
          d.userId,
          'drone',
          [d.manufacturer, d.model].filter(Boolean).join(' ') || d.slug,
          s,
        );
      });
    } finally {
      setBusyId(null);
    }
  }

  const emptyTitle =
    view === 'queue' ? t('admin.verify.empty') : t('admin.verify.archive.empty');
  const emptyDesc =
    view === 'queue' ? t('admin.verify.emptyDesc') : t('admin.verify.archive.emptyDesc');

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <SectionHeader
        title={t('admin.verify.title')}
        description={
          view === 'queue' ? t('admin.verify.subtitle') : t('admin.verify.archive.subtitle')
        }
      />

      {notifyWarning ? (
        <div
          role="status"
          className="mt-4 flex items-start justify-between gap-3 rounded-lg bg-[var(--tone-warning-bg)] px-4 py-3 text-sm text-[var(--tone-warning-fg)] ring-1 ring-[var(--tone-warning-ring)]"
        >
          <span>{notifyWarning}</span>
          <button
            type="button"
            onClick={() => setNotifyWarning(null)}
            className="shrink-0 underline underline-offset-2"
          >
            {t('common.dismiss')}
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <ViewToggle
          active={view === 'queue'}
          onClick={() => setView('queue')}
          label={t('admin.verify.view.queue')}
          count={queueCount}
        />
        <ViewToggle
          active={view === 'archive'}
          onClick={() => setView('archive')}
          label={t('admin.verify.view.archive')}
          count={archiveCount}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1 border-b border-[var(--color-border)]">
        <TabButton active={tab === 'documents'} onClick={() => setTab('documents')}>
          {t('admin.verify.tab.documents')} ({docsView.length})
        </TabButton>
        <TabButton active={tab === 'certificates'} onClick={() => setTab('certificates')}>
          {t('admin.verify.tab.certificates')} ({certsView.length})
        </TabButton>
        <TabButton active={tab === 'insurances'} onClick={() => setTab('insurances')}>
          {t('admin.verify.tab.insurances')} ({insView.length})
        </TabButton>
        <TabButton active={tab === 'authorizations'} onClick={() => setTab('authorizations')}>
          {t('admin.verify.tab.authorizations')} ({authzView.length})
        </TabButton>
        <TabButton active={tab === 'drones'} onClick={() => setTab('drones')}>
          {t('admin.verify.tab.drones')} ({dronesView.length})
        </TabButton>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-gray-600" />
          {t('common.loading')}
        </div>
      ) : tab === 'documents' ? (
        docsView.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDesc} />
        ) : (
          <ul className="mt-4 space-y-3">
            {docsView.map((d) => {
              const owner = accountsByUid.get(d.userId);
              return (
                <li key={d.id}>
                  <Card padding="md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[var(--color-text)]">{d.label || d.kind}</p>
                          <StatusPill status={d.verificationStatus} />
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                          {owner ? (
                            <Link
                              href={`/admin/users/${owner.uid}`}
                              className="text-[var(--color-action)] underline-offset-2 hover:underline"
                            >
                              {accountDisplayName(owner)}
                            </Link>
                          ) : (
                            d.userId
                          )}
                          {' · '}
                          {d.fileName || '—'}
                          {d.updatedAt ? ` · ${formatDateTime(d.updatedAt)}` : null}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {d.fileUrl ? (
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[var(--color-action)] underline-offset-2 hover:underline"
                          >
                            {t('common.viewDocument')}
                          </a>
                        ) : null}
                        <VerifyControls
                          current={d.verificationStatus}
                          busy={busyId === d.id}
                          onSet={(s) => setDocStatus(d, s)}
                        />
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )
      ) : tab === 'certificates' ? (
        certsView.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDesc} />
        ) : (
          <ul className="mt-4 space-y-3">
            {certsView.map((c) => {
              const owner = accountsByUid.get(c.userId);
              const kindLabel = t(
                CERTIFICATE_KINDS.find((k) => k.value === c.kind)?.labelKey ?? 'cert.kind.custom',
              );
              return (
                <li key={c.id}>
                  <Card padding="md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[var(--color-text)]">{kindLabel}</p>
                          <StatusPill status={c.verificationStatus} />
                        </div>
                        {c.registrationNumber ? (
                          <p className="mt-0.5 font-mono text-xs text-[var(--color-text)]">
                            {c.registrationNumber}
                          </p>
                        ) : null}
                        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                          {owner ? (
                            <Link
                              href={`/admin/users/${owner.uid}`}
                              className="text-[var(--color-action)] underline-offset-2 hover:underline"
                            >
                              {accountDisplayName(owner)}
                            </Link>
                          ) : (
                            c.userId
                          )}
                          {c.expiresAt ? ` · ${t('field.expiresAt')}: ${formatDate(c.expiresAt)}` : null}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {c.fileUrl ? (
                          <a
                            href={c.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[var(--color-action)] underline-offset-2 hover:underline"
                          >
                            {t('common.viewDocument')}
                          </a>
                        ) : null}
                        <VerifyControls
                          current={c.verificationStatus}
                          busy={busyId === c.id}
                          onSet={(s) => setCertStatus(c, s)}
                        />
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )
      ) : tab === 'insurances' ? (
        insView.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDesc} />
        ) : (
          <ul className="mt-4 space-y-3">
            {insView.map((i) => {
              const owner = accountsByUid.get(i.userId);
              return (
                <li key={i.id}>
                  <Card padding="md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[var(--color-text)]">{i.provider || '—'}</p>
                          <StatusPill status={i.verificationStatus} />
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                          {i.policyNumber || '—'}
                          {' · '}
                          {owner ? (
                            <Link
                              href={`/admin/users/${owner.uid}`}
                              className="text-[var(--color-action)] underline-offset-2 hover:underline"
                            >
                              {accountDisplayName(owner)}
                            </Link>
                          ) : (
                            i.userId
                          )}
                          {i.expiryDate ? ` · ${t('profile.validUntil')} ${formatDate(i.expiryDate)}` : null}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {i.pdfUrl ? (
                          <a
                            href={i.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[var(--color-action)] underline-offset-2 hover:underline"
                          >
                            {t('common.viewDocument')}
                          </a>
                        ) : null}
                        <VerifyControls
                          current={i.verificationStatus}
                          busy={busyId === i.id}
                          onSet={(s) => setInsStatus(i, s)}
                        />
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )
      ) : tab === 'authorizations' ? (
        authzView.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDesc} />
        ) : (
          <ul className="mt-4 space-y-3">
            {authzView.map((a) => {
              const owner = accountsByUid.get(a.userId);
              const kindLabel = AUTHORIZATION_KINDS.includes(a.kind)
                ? t(`permits.kind.${a.kind}`)
                : a.kind;
              return (
                <li key={a.id}>
                  <Card padding="md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[var(--color-text)]">
                            {a.label || kindLabel}
                          </p>
                          <StatusPill status={a.verificationStatus} />
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                          {kindLabel}
                          {a.issuedBy ? ` · ${a.issuedBy}` : null}
                          {' · '}
                          {owner ? (
                            <Link
                              href={`/admin/users/${owner.uid}`}
                              className="text-[var(--color-action)] underline-offset-2 hover:underline"
                            >
                              {accountDisplayName(owner)}
                            </Link>
                          ) : (
                            a.userId
                          )}
                          {a.validTo
                            ? ` · ${t('profile.validUntil')} ${formatDate(a.validTo)}`
                            : null}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {a.fileUrl ? (
                          <a
                            href={a.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[var(--color-action)] underline-offset-2 hover:underline"
                          >
                            {t('common.viewDocument')}
                          </a>
                        ) : null}
                        <VerifyControls
                          current={a.verificationStatus}
                          busy={busyId === a.id}
                          onSet={(s) => setAuthzStatus(a, s)}
                        />
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )
      ) : dronesView.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDesc} />
      ) : (
        <ul className="mt-4 space-y-3">
          {dronesView.map((d) => {
            const owner = accountsByUid.get(d.userId);
            const label = [d.manufacturer, d.model].filter(Boolean).join(' ') || d.slug;
            return (
              <li key={d.id}>
                <Card padding="md">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[var(--color-text)]">{label}</p>
                        <StatusPill status={d.verificationStatus} />
                      </div>
                      <p className="mt-0.5 font-mono text-xs text-[var(--color-text-secondary)]">
                        {d.droneSerialNumber || d.slug}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                        {owner ? (
                          <Link
                            href={`/admin/users/${owner.uid}`}
                            className="text-[var(--color-action)] underline-offset-2 hover:underline"
                          >
                            {accountDisplayName(owner)}
                          </Link>
                        ) : (
                          d.userId
                        )}
                        {d.classMarking ? ` · ${d.classMarking}` : null}
                        {d.updatedAt ? ` · ${formatDateTime(d.updatedAt)}` : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {d.visibility === 'public' && d.slug ? (
                        <a
                          href={getPublicProfileUrl(d.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-[var(--color-action)] underline-offset-2 hover:underline"
                        >
                          {t('common.view')}
                        </a>
                      ) : null}
                      <VerifyControls
                        current={d.verificationStatus}
                        busy={busyId === d.id}
                        onSet={(s) => setDroneStatus(d, s)}
                      />
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'tap-44 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
        active
          ? 'border-[var(--color-action)] bg-[var(--color-action-light)] text-[var(--color-action)]'
          : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]',
      )}
    >
      {label}
      <span className="ml-1.5 tabular-nums opacity-80">({count})</span>
    </button>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        '-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition',
        active
          ? 'border-[var(--color-action)] text-[var(--color-action)]'
          : 'border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:text-[var(--color-text)]',
      )}
    >
      {children}
    </button>
  );
}
