'use client';

/**
 * Admin: list every user account.
 *
 * Read-only list with text search across name / email / company / VAT.
 * Each row links to the per-user editor at `/admin/users/[uid]`.
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { listAllAccounts } from '@/lib/firebase/account';
import { listAllDrones } from '@/lib/firebase/drones';
import type { UserAccount } from '@/lib/types/account';
import { accountDisplayName } from '@/lib/utils/entities';
import { formatDate, getPublicProfileUrl } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';

export default function AdminUsersListPage() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [publicSlugByUser, setPublicSlugByUser] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    (async () => {
      try {
        const [list, drones] = await Promise.all([listAllAccounts(), listAllDrones()]);
        if (!cancelled) {
          setUsers(list);
          const slugMap = new Map<string, string>();
          for (const d of drones) {
            if (d.visibility === 'public' && d.slug.trim() && !slugMap.has(d.userId)) {
              slugMap.set(d.userId, d.slug.trim());
            }
          }
          setPublicSlugByUser(slugMap);
        }
      } catch (err) {
        console.error('[admin users] load failed', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = [
        u.firstName,
        u.lastName,
        u.email,
        u.companyName,
        u.companyVat,
        u.companyContactPerson,
        u.uid,
      ]
        .map((s) => (s || '').toLowerCase())
        .join(' ');
      return hay.includes(q);
    });
  }, [users, search]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeader title={t('admin.users.title')} description={t('admin.users.subtitle')} />
        <Button href="/admin/users/new">{t('admin.users.create.submit')}</Button>
      </div>

      <div className="mt-2 max-w-md">
        <Input
          name="search"
          label={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.users.searchPlaceholder')}
        />
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-gray-600" />
          {t('common.loading')}
        </div>
      ) : loadError ? (
        <Card className="mt-6 text-center" padding="lg">
          <p className="text-sm text-[var(--tone-warning-fg)]">{t('admin.users.loadError')}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="mt-6 text-center" padding="lg">
          <p className="text-sm text-[var(--color-text-secondary)]">{t('admin.users.empty')}</p>
        </Card>
      ) : (
        <Card className="mt-6 overflow-x-auto" padding="none">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-slate-50/80">
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {t('admin.users.col.name')}
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {t('admin.users.col.type')}
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {t('admin.users.col.email')}
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {t('admin.users.col.created')}
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map((u) => (
                <tr key={u.uid} className="transition hover:bg-slate-50/60">
                  <td className="px-4 py-3.5 font-medium text-[var(--color-text)]">
                    {accountDisplayName(u)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-[var(--color-hover)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text)]">
                      {t(`account.accountType.${u.accountType}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--color-text-secondary)]">{u.email || '—'}</td>
                  <td className="px-4 py-3.5 text-xs text-[var(--color-text-secondary)]">
                    {u.createdAt ? formatDate(u.createdAt) : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/admin/users/${u.uid}`}
                        className="rounded-md bg-[var(--color-hover)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text)] transition hover:bg-[var(--color-hover)]"
                      >
                        {t('admin.users.editData')}
                      </Link>
                      {publicSlugByUser.get(u.uid) ? (
                        <a
                          href={getPublicProfileUrl(publicSlugByUser.get(u.uid)!)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-800 transition hover:bg-sky-100"
                        >
                          {t('dashboard.viewPublicProfile')}
                        </a>
                      ) : (
                        <Link
                          href={`/admin/users/${u.uid}#pagina-pubblica`}
                          title={t('admin.users.publicProfileUnavailable')}
                          className="rounded-md border border-[var(--color-border)] bg-[var(--color-hover)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-border)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-secondary)]"
                        >
                          {t('dashboard.viewPublicProfile')}
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
