'use client';

/**
 * Account support chat — one thread with DroneTag admins.
 * Used for locked identity changes (name, phone, email, address).
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ensureSupportThread,
  getSupportThread,
  listSupportMessages,
  markSupportThreadRead,
  sendSupportMessage,
} from '@/lib/firebase/support';
import type { SupportMessage, SupportThread } from '@/lib/types/entities';
import { classNames, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function AccountSupportPage() {
  return (
    <Suspense
      fallback={
        <div className="mt-8 flex items-center gap-3 px-4 text-sm text-[var(--color-text-secondary)] sm:px-6">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-action)]" />
        </div>
      }
    >
      <AccountSupportInner />
    </Suspense>
  );
}

function AccountSupportInner() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const presetSubject = searchParams.get('subject') ?? '';

  const [thread, setThread] = useState<SupportThread | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState(presetSubject);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function reload(uid: string) {
    const [th, msgs] = await Promise.all([
      getSupportThread(uid),
      listSupportMessages(uid),
    ]);
    setThread(th);
    setMessages(msgs);
    if (th && th.userUnreadCount > 0) {
      await markSupportThreadRead(uid, 'user');
      setThread((prev) => (prev ? { ...prev, userUnreadCount: 0 } : prev));
    }
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        await reload(user.uid);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !body.trim() || sending) return;
    setSending(true);
    try {
      if (!thread) {
        await ensureSupportThread(user.uid, subject.trim());
      }
      await sendSupportMessage({
        threadId: user.uid,
        sender: 'user',
        senderUid: user.uid,
        body,
        subject: subject.trim() || undefined,
      });
      setBody('');
      await reload(user.uid);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-8 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-action)]" />
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeader title={t('support.title')} description={t('support.subtitle')} />

      <p className="rounded-xl border border-[var(--tone-info-border)] bg-[var(--tone-info-bg)] px-4 py-3 text-xs leading-relaxed text-[var(--tone-info-fg)]">
        {t('support.hint.nameChange')}
      </p>

      <Card padding="none" className="flex min-h-[28rem] flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">
              {thread?.subject || t('support.title')}
            </p>
            {thread ? (
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                {t(`support.status.${thread.status}`)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <EmptyState title={t('support.empty')} description={t('support.emptyDesc')} />
          ) : (
            messages.map((m) => {
              const mine = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={classNames('flex', mine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={classNames(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                      mine
                        ? 'bg-[var(--color-action)] text-white'
                        : 'bg-[var(--color-hover)] text-[var(--color-text)]',
                    )}
                  >
                    <p className={classNames('text-[10px] font-semibold uppercase tracking-wide', mine ? 'text-white/80' : 'text-[var(--color-text-secondary)]')}>
                      {mine ? t('support.you') : t('support.admin')}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap leading-relaxed">{m.body}</p>
                    <p className={classNames('mt-1 text-[10px]', mine ? 'text-white/70' : 'text-[var(--color-text-secondary)]')}>
                      {formatDateTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {thread?.status === 'closed' ? (
          <p className="border-t border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-text-secondary)]">
            {t('support.closed')}
          </p>
        ) : null}

        <form onSubmit={handleSend} className="space-y-2 border-t border-[var(--color-border)] p-4">
          {!thread?.subject ? (
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('support.composer.subjectPlaceholder')}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-action)] focus:ring-2 focus:ring-[var(--color-action)]/20"
            />
          ) : null}
          <div className="flex gap-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              placeholder={t('support.composer.placeholder')}
              className="min-h-[2.75rem] flex-1 resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-action)] focus:ring-2 focus:ring-[var(--color-action)]/20"
            />
            <Button type="submit" loading={sending} disabled={!body.trim()}>
              {sending ? t('support.sending') : t('support.send')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
