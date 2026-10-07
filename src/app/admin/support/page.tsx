'use client';

/**
 * Admin support inbox — list of user threads + conversation pane.
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { listAllAccounts } from '@/lib/firebase/account';
import { errorMessage } from '@/lib/client/errorMessage';
import {
  listSupportMessages,
  listSupportThreads,
  markSupportThreadRead,
  sendSupportMessage,
  setSupportThreadStatus,
} from '@/lib/firebase/support';
import type { UserAccount } from '@/lib/types/account';
import type { SupportMessage, SupportThread } from '@/lib/types/entities';
import { accountDisplayName } from '@/lib/utils/entities';
import { classNames, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LoadError } from '@/components/ui/LoadError';

const SUPPORT_POLL_MS = 20_000;

/** Placeholder for a user who has never written in; the first reply creates it. */
function draftThread(userId: string): SupportThread {
  return {
    userId,
    subject: '',
    status: 'open',
    lastMessageAt: '',
    lastMessagePreview: '',
    userUnreadCount: 0,
    adminUnreadCount: 0,
    createdAt: '',
    updatedAt: '',
  };
}

export default function AdminSupportPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] px-4 py-8 text-sm text-[var(--color-text-secondary)]">
          …
        </div>
      }
    >
      <AdminSupportInner />
    </Suspense>
  );
}

function AdminSupportInner() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const searchParams = useSearchParams();
  const presetUser = searchParams.get('user');

  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [busyStatus, setBusyStatus] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef<string | null>(null);

  const accountsByUid = useMemo(() => {
    const map = new Map<string, UserAccount>();
    for (const a of accounts) map.set(a.uid, a);
    return map;
  }, [accounts]);

  const selected =
    threads.find((th) => th.userId === selectedId) ?? (selectedId ? draftThread(selectedId) : null);

  const reloadThreads = useCallback(async () => {
    const list = await listSupportThreads();
    setThreads(list);
    return list;
  }, []);

  const loadMessages = useCallback(async (userId: string) => {
    const msgs = await listSupportMessages(userId).catch(() => [] as SupportMessage[]);
    if (selectedIdRef.current === userId) setMessages(msgs);
    return msgs;
  }, []);

  async function openThread(userId: string, scroll = true) {
    selectedIdRef.current = userId;
    setSelectedId(userId);
    setMessages([]);
    await loadMessages(userId);
    setThreads((prev) =>
      prev.map((th) => (th.userId === userId ? { ...th, adminUnreadCount: 0 } : th)),
    );
    await markSupportThreadRead(userId, 'admin');
    // On phones the conversation sits under the list.
    if (scroll && window.matchMedia('(max-width: 1023px)').matches) {
      conversationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const initialLoad = useCallback(async () => {
    try {
      const [list, accts] = await Promise.all([reloadThreads(), listAllAccounts()]);
      setAccounts(accts);
      setLoadError(null);
      const initial = presetUser || list[0]?.userId || null;
      if (initial) await openThread(initial, Boolean(presetUser));
    } catch (err) {
      console.error('[admin/support] load failed', err);
      setLoadError(errorMessage(err, t, 'loadError.body'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- openThread is stable in behaviour
  }, [presetUser, reloadThreads, t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initialLoad();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialLoad]);

  // New user messages show up without a manual refresh.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      reloadThreads().catch(() => undefined);
      const current = selectedIdRef.current;
      if (current) void loadMessages(current);
    };
    const id = window.setInterval(refresh, SUPPORT_POLL_MS);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [reloadThreads, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length, selectedId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedId || !body.trim() || sending) return;
    setSending(true);
    try {
      await sendSupportMessage({
        threadId: selectedId,
        sender: 'admin',
        senderUid: user.uid,
        body,
      });
      setBody('');
      await Promise.all([reloadThreads(), loadMessages(selectedId)]);
    } catch (err) {
      console.error('[admin/support] send failed', err);
      toast.error(errorMessage(err, t, 'support.error.send'));
    } finally {
      setSending(false);
    }
  }

  async function toggleStatus() {
    if (!selected || busyStatus || !threads.some((th) => th.userId === selected.userId)) return;
    setBusyStatus(true);
    try {
      // `pending` (support has replied, waiting on the user) is an active
      // state, so it toggles to closed alongside `open`.
      const next = selected.status === 'closed' ? 'open' : 'closed';
      await setSupportThreadStatus(selected.userId, next);
      await reloadThreads();
    } catch (err) {
      console.error('[admin/support] status failed', err);
      toast.error(errorMessage(err, t));
    } finally {
      setBusyStatus(false);
    }
  }

  // The selected user may have no thread yet (opened from their profile).
  const listed =
    selectedId && !threads.some((th) => th.userId === selectedId)
      ? [draftThread(selectedId), ...threads]
      : threads;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader title={t('admin.support.title')} description={t('admin.support.subtitle')} />

        {loading ? (
          <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-action)]" />
            {t('common.loading')}
          </div>
        ) : loadError ? (
          <div className="mt-6">
            <LoadError message={loadError} onRetry={initialLoad} />
          </div>
        ) : listed.length === 0 ? (
          <div className="mt-6">
            <EmptyState title={t('admin.support.empty')} description={t('admin.support.emptyDesc')} />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <Card padding="none" className="overflow-hidden">
              <ul className="divide-y divide-[var(--color-border)]">
                {listed.map((th) => {
                  const acct = accountsByUid.get(th.userId);
                  const name = acct ? accountDisplayName(acct) : th.userId;
                  const active = th.userId === selectedId;
                  return (
                    <li key={th.userId}>
                      <button
                        type="button"
                        onClick={() => openThread(th.userId)}
                        className={classNames(
                          'w-full px-4 py-3 text-left transition',
                          active
                            ? 'bg-[var(--color-action-light)]'
                            : 'hover:bg-[var(--color-hover)]',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-[var(--color-text)]">{name}</p>
                          {th.adminUnreadCount > 0 ? (
                            <span className="shrink-0 rounded-full bg-[var(--color-expired)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {th.adminUnreadCount}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">
                          {th.subject || th.lastMessagePreview || t('admin.support.newConversation')}
                        </p>
                        <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
                          {th.lastMessageAt ? formatDateTime(th.lastMessageAt) : '—'}
                          {th.createdAt ? <>{' · '}{t(`admin.support.status.${th.status}`)}</> : null}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <div ref={conversationRef} className="scroll-mt-20">
            <Card padding="none" className="flex min-h-[28rem] flex-col overflow-hidden lg:max-h-[calc(100dvh-12rem)]">
              {!selected ? (
                <div className="flex flex-1 items-center justify-center p-6 text-sm text-[var(--color-text-secondary)]">
                  {t('admin.support.select')}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                        {accountsByUid.get(selected.userId)
                          ? accountDisplayName(accountsByUid.get(selected.userId)!)
                          : selected.userId}
                      </p>
                      <p className="truncate text-xs text-[var(--color-text-secondary)]">
                        {selected.subject || t('support.title')}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button href={`/admin/users/${selected.userId}`} variant="secondary" size="sm">
                        {t('admin.support.openUser')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        loading={busyStatus}
                        disabled={!selected.createdAt}
                        onClick={toggleStatus}
                      >
                        {selected.status === 'closed'
                          ? t('admin.support.reopen')
                          : t('admin.support.close')}
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                    {messages.map((m) => {
                      const mine = m.sender === 'admin';
                      const peerName = accountsByUid.get(selected.userId)
                        ? accountDisplayName(accountsByUid.get(selected.userId)!)
                        : t('support.you');
                      return (
                        <div
                          key={m.id}
                          className={classNames('flex', mine ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={classNames(
                              'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                              mine
                                ? 'bg-[var(--color-action-solid)] text-white'
                                : 'bg-[var(--color-hover)] text-[var(--color-text)]',
                            )}
                          >
                            <p
                              className={classNames(
                                'text-[10px] font-semibold uppercase tracking-wide',
                                mine ? 'text-white/80' : 'text-[var(--color-text-secondary)]',
                              )}
                            >
                              {mine ? t('support.admin') : peerName}
                            </p>
                            <p className="mt-0.5 whitespace-pre-wrap leading-relaxed">{m.body}</p>
                            <p
                              className={classNames(
                                'mt-1 text-[10px]',
                                mine ? 'text-white/70' : 'text-[var(--color-text-secondary)]',
                              )}
                            >
                              {formatDateTime(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  <form onSubmit={handleSend} className="flex gap-2 border-t border-[var(--color-border)] p-4">
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={2}
                      placeholder={t('admin.support.composer.placeholder')}
                      className="min-h-[2.75rem] flex-1 resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-base text-[var(--color-text)] outline-none focus:border-[var(--color-action)] focus:ring-2 focus:ring-[var(--color-action)]/20 sm:text-sm"
                    />
                    <Button type="submit" loading={sending} disabled={!body.trim()}>
                      {sending ? t('support.sending') : t('support.send')}
                    </Button>
                  </form>
                </>
              )}
            </Card>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
          <Link href="/admin/users" className="text-[var(--color-action)] underline-offset-2 hover:underline">
            {t('admin.nav.users')}
          </Link>
        </p>
    </div>
  );
}
