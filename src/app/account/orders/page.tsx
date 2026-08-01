'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getOrdersForUser } from '@/lib/firebase/orders';
import type { Order, OrderStatus } from '@/lib/types/account';
import { EmptyState } from '@/components/ui/EmptyState';
import { EntityListRow } from '@/components/ui/EntityListRow';
import { ResponsivePageHeader } from '@/components/ui/ResponsivePageHeader';
import { Card } from '@/components/ui/Card';

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await getOrdersForUser(user.uid);
        if (!cancelled) setOrders(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-action)]" />
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <ResponsivePageHeader title={t('account.tabOrders')} />

      {orders.length === 0 ? (
        <EmptyState
          title={t('orders.emptyTitle')}
          description={t('orders.emptyDesc')}
        />
      ) : (
        <ul className="space-y-2 sm:space-y-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const { t } = useLanguage();

  return (
    <li>
      <Link href={`/account/orders/${order.id}`} className="block">
        <Card padding="md" className="transition hover:border-[var(--color-action)]/30">
          <EntityListRow
            actions={<StatusPill status={order.status} />}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] sm:text-xs">
              {t('orders.orderNumber')}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-[var(--color-text)] sm:text-base">{order.number}</p>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)] sm:text-xs">
              {t('orders.placedOn', { date: formatDate(order.createdAt) })}
            </p>
            <p className="mt-2 line-clamp-2 text-[11px] text-[var(--color-text-secondary)] sm:text-sm">
              {order.items.map((i) => `${i.quantity}x ${i.name}`).join(' · ')}
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--color-text)]">
              {formatMoney(order.totals.total, order.totals.currency)}
            </p>
          </EntityListRow>
        </Card>
      </Link>
    </li>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const { t } = useLanguage();
  const styles: Record<OrderStatus, string> = {
    pending: 'bg-[var(--color-hover)] text-[var(--color-text)]',
    paid: 'bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)]',
    in_production: 'bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)]',
    assembled: 'bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)]',
    quality_check: 'bg-[var(--tone-warning-bg)] text-[var(--tone-warning-fg)]',
    packed: 'bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)]',
    shipped: 'bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)]',
    in_transit: 'bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)]',
    delivered: 'bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)]',
    cancelled: 'bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)]',
  };
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:px-2.5 sm:py-1 sm:text-[11px] ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      <span className="truncate">{t(`orderStatus.${status}`)}</span>
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
