'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/** The published drone's public address: what goes on the NFC badge or QR code. */
export function PublicLinkCard({ url }: { url: string }) {
  const { t } = useLanguage();
  const toast = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('common.copied'));
    } catch {
      toast.error(t('drone.publicLink.copyFailed'));
    }
  }

  return (
    <Card padding="md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">{t('drone.publicLink.title')}</h3>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{t('drone.publicLink.hint')}</p>
          <p className="mt-2 select-all break-all font-mono text-xs text-[var(--color-text)]">{url}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="primary" size="sm" onClick={() => void copy()} className="flex-1 sm:flex-none">
            {t('drone.publicLink.copy')}
          </Button>
          <Button href={url} external variant="secondary" size="sm" className="flex-1 sm:flex-none">
            {t('drone.publicLink.open')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
