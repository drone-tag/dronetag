'use client';

/**
 * Admin NFC / QR tooling (PR-SEC-4).
 *
 * Lists every public-active drone with the canonical public URL that
 * should be encoded onto its badge, and exposes a one-click batch
 * CSV export compatible with NXP TagWriter / Zebra ZPL data merging.
 *
 * No hardware integration here — the actual writer is whatever tool
 * the operator uses to read this CSV. A future module can plug into
 * `buildPublicUrl()` directly when we ship in-app encoding.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { errorMessage } from '@/lib/client/errorMessage';
import { listAllDrones } from '@/lib/firebase/drones';
import { listAllAccounts } from '@/lib/firebase/account';
import { buildPublicUrl, exportNfcCsv, type NfcPayloadRow } from '@/lib/nfc/payload';
import { accountDisplayName } from '@/lib/utils/entities';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LoadError } from '@/components/ui/LoadError';
import type { Drone } from '@/lib/types/entities';
import type { UserAccount } from '@/lib/types/account';

/**
 * Badges are written once and read for years, so they must point at the
 * production domain even when the console is opened from a preview deploy.
 */
const CANONICAL_ORIGIN = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '') ?? '';

type NfcRow = NfcPayloadRow & { ownerUid: string };

export default function AdminNfcPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [accounts, setAccounts] = useState<Record<string, UserAccount>>({});
  const [origin] = useState(() =>
    CANONICAL_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : ''),
  );

  const reload = useCallback(async () => {
    try {
      const [dr, accs] = await Promise.all([listAllDrones(), listAllAccounts().catch(() => [])]);
      setDrones(dr.filter((d) => d.status === 'active' && d.visibility === 'public'));
      setAccounts(Object.fromEntries(accs.map((a) => [a.uid, a])));
      setLoadError(null);
    } catch (err) {
      console.error('[admin nfc] load failed', err);
      setLoadError(errorMessage(err, t, 'loadError.body'));
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const rows = useMemo<NfcRow[]>(() => {
    const out: NfcRow[] = [];
    if (!origin) return out;
    for (const d of drones) {
      try {
        out.push({
          slug: d.slug,
          url: buildPublicUrl(d.slug, origin),
          label: `${d.manufacturer} ${d.model}`.trim(),
          ownerUid: d.userId,
        });
      } catch {
        // Skip rows whose slug doesn't validate. The admin will see a
        // shorter list than `drones.length` and can investigate.
      }
    }
    return out;
  }, [drones, origin]);

  function downloadCsv() {
    const csv = exportNfcCsv(rows.map(({ slug, url, label }) => ({ slug, url, label })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dronetag-nfc-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('common.copied'));
    } catch {
      // Clipboard may be unavailable — fall back to a prompt.
      window.prompt('URL', url);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader title={t('admin.nfc.title')} description={t('admin.nfc.subtitle')} />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={downloadCsv} disabled={loading || rows.length === 0}>
            {t('admin.nfc.exportCsv')}
          </Button>
          {!loading ? (
            <p className="text-xs text-[var(--color-text-secondary)]">
              {t('admin.nfc.baseUrl', { url: origin || '—' })}
            </p>
          ) : null}
        </div>

        {loadError ? (
          <div className="mt-4">
            <LoadError message={loadError} onRetry={reload} />
          </div>
        ) : null}

        <Card padding="none" className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-[var(--color-border)] text-sm">
              <thead className="bg-[var(--color-hover)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                <tr>
                  <th className="px-4 py-3">{t('admin.nfc.col.slug')}</th>
                  <th className="px-4 py-3">{t('admin.nfc.col.url')}</th>
                  <th className="px-4 py-3">{t('admin.nfc.col.owner')}</th>
                  <th className="px-4 py-3" aria-hidden />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-card)]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-[var(--color-text-secondary)]">
                      {t('common.loading')}
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-[var(--color-text-secondary)]">
                      {t('admin.nfc.empty')}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const owner = accounts[row.ownerUid];
                    return (
                      <tr key={row.slug}>
                        <td className="px-4 py-2 font-mono text-xs text-[var(--color-text)]">{row.slug}</td>
                        <td className="px-4 py-2 font-mono text-xs text-[var(--color-text-secondary)]">{row.url}</td>
                        <td className="px-4 py-2 text-xs text-[var(--color-text-secondary)]">
                          {owner ? accountDisplayName(owner) : '—'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Button size="sm" variant="ghost" onClick={() => copyUrl(row.url)}>
                            {t('admin.nfc.copyUrl')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
    </div>
  );
}
