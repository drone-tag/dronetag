import type { Order, OrderItem, UserAccount } from '@/lib/types/account';
import { DEMO_ACCOUNTS } from './personas';

const ago = (days: number, hours = 0): string =>
  new Date(Date.now() - days * 86400000 - hours * 3600000).toISOString();

const ahead = (days: number): string =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

export const DEMO_USER_ACCOUNT: UserAccount = DEMO_ACCOUNTS[0];

const PRICE_TESSERA = 19;
const PRICE_RIBBON = 0;
const PRICE_POUCH = 0;
const SHIPPING = 8;

function tessera(
  serial: string,
  batch: string,
  ts: { printed: string; assembled: string; qc: string },
  variant = 'DroneTag · PVC + QR inciso',
): OrderItem {
  return {
    id: `tes-${serial}`,
    name: `Tessera DroneTag · ${variant}`,
    productCode: 'product.tessera',
    quantity: 1,
    unitPrice: PRICE_TESSERA,
    trace: {
      serialNumber: serial,
      batchNumber: batch,
      printedAt: ts.printed,
      printerId: 'Roland LV-290 · laser engraver',
      material: 'PVC ISO/IEC 7810 · Matt White · lot PVC-2611',
      assembledBy: 'A. Rossi',
      assembledAt: ts.assembled,
      qcBy: 'M. Bianchi',
      qcAt: ts.qc,
      notes: 'QR scan test OK · NFC UID verified.',
    },
  };
}

function ribbon(orderNo: string): OrderItem {
  return {
    id: `rib-${orderNo}`,
    name: 'Fiocchetto portachiavi (incluso)',
    productCode: 'product.ribbon',
    quantity: 1,
    unitPrice: PRICE_RIBBON,
    trace: null,
  };
}

function pouch(orderNo: string): OrderItem {
  return {
    id: `pou-${orderNo}`,
    name: 'Sacchettino per portachiavi (incluso)',
    productCode: 'product.pouch',
    quantity: 1,
    unitPrice: PRICE_POUCH,
    trace: null,
  };
}

function totalOf(items: OrderItem[]): number {
  return items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
}

function accountByUid(uid: string): UserAccount {
  return DEMO_ACCOUNTS.find((a) => a.uid === uid) ?? DEMO_ACCOUNTS[0];
}

function simpleOrder(opts: {
  id: string;
  number: string;
  userId: string;
  status: Order['status'];
  createdDaysAgo: number;
  items: OrderItem[];
  tracking?: string;
}): Order {
  const account = accountByUid(opts.userId);
  const created = ago(opts.createdDaysAgo);
  const shipped = ['shipped', 'in_transit', 'delivered'].includes(opts.status)
    ? ago(Math.max(0, opts.createdDaysAgo - 2))
    : '';
  const delivered = opts.status === 'delivered' ? ago(Math.max(0, opts.createdDaysAgo - 4)) : '';
  return {
    id: opts.id,
    number: opts.number,
    userId: opts.userId,
    status: opts.status,
    createdAt: created,
    paidAt: created,
    shippedAt: shipped,
    deliveredAt: delivered,
    items: opts.items,
    shipping: {
      address: account.address.line1
        ? account.address
        : {
            line1: 'Via Example 1',
            line2: '',
            city: 'Milano',
            postalCode: '20100',
            country: 'Italy',
          },
      carrier: 'Poste Italiane · Raccomandata 1',
      trackingNumber: opts.tracking ?? '',
      trackingUrl: opts.tracking
        ? `https://www.poste.it/cerca/index.html#/risultati-cerca-spedizioni/${opts.tracking}`
        : '',
      estimatedDelivery: opts.status === 'in_transit' ? ahead(2) : '',
    },
    totals: {
      subtotal: totalOf(opts.items),
      shipping: SHIPPING,
      total: totalOf(opts.items) + SHIPPING,
      currency: 'CHF',
    },
    timeline: [
      { at: created, type: 'created', label: 'Ordine creato', note: '', location: 'dronetag.io', by: 'cliente' },
      { at: created, type: 'paid', label: 'Pagamento confermato', note: 'Stripe', location: '', by: 'Stripe' },
    ],
  };
}

export const DEMO_ORDERS: Order[] = [
  simpleOrder({
    id: 'ord-001',
    number: 'DT-2026-0427',
    userId: 'demo-michele',
    status: 'in_transit',
    createdDaysAgo: 6,
    tracking: 'RR123456789IT',
    items: [
      tessera('DT-T-2026-0427-01', 'BATCH-26W14-T', { printed: ago(5, 14), assembled: ago(4, 10), qc: ago(3, 9) }),
      tessera('DT-T-2026-0427-02', 'BATCH-26W14-T', { printed: ago(5, 13), assembled: ago(4, 10), qc: ago(3, 9) }),
      tessera('DT-T-2026-0427-03', 'BATCH-26W14-T', { printed: ago(5, 12), assembled: ago(4, 10), qc: ago(3, 9) }),
      ribbon('0427'),
      pouch('0427'),
    ],
  }),
  simpleOrder({
    id: 'ord-002',
    number: 'DT-2026-0411',
    userId: 'demo-michele',
    status: 'delivered',
    createdDaysAgo: 23,
    tracking: 'RR987654321IT',
    items: [
      tessera('DT-T-2026-0411-01', 'BATCH-26W11-T', { printed: ago(22, 16), assembled: ago(21, 12), qc: ago(21, 9) }),
      tessera('DT-T-2026-0411-02', 'BATCH-26W11-T', { printed: ago(22, 15), assembled: ago(21, 12), qc: ago(21, 9) }),
      ribbon('0411'),
      pouch('0411'),
    ],
  }),
  simpleOrder({
    id: 'ord-004',
    number: 'DT-2026-0448',
    userId: 'demo-alpine',
    status: 'in_production',
    createdDaysAgo: 2,
    items: [
      tessera('DT-T-2026-0448-01', 'BATCH-26W18-T', { printed: ago(1, 8), assembled: '', qc: '' }),
      tessera('DT-T-2026-0448-02', 'BATCH-26W18-T', { printed: ago(1, 7), assembled: '', qc: '' }),
      tessera('DT-T-2026-0448-03', 'BATCH-26W18-T', { printed: ago(1, 6), assembled: '', qc: '' }),
      tessera('DT-T-2026-0448-04', 'BATCH-26W18-T', { printed: ago(1, 5), assembled: '', qc: '' }),
      ribbon('0448'),
      pouch('0448'),
    ],
  }),
  simpleOrder({
    id: 'ord-005',
    number: 'DT-2026-0431',
    userId: 'demo-carlos',
    status: 'paid',
    createdDaysAgo: 1,
    items: [
      tessera('DT-T-2026-0431-01', 'BATCH-26W17-T', { printed: '', assembled: '', qc: '' }),
      ribbon('0431'),
      pouch('0431'),
    ],
  }),
  simpleOrder({
    id: 'ord-006',
    number: 'DT-2026-0402',
    userId: 'demo-anna',
    status: 'pending',
    createdDaysAgo: 0,
    items: [
      tessera('DT-T-2026-0402-01', 'BATCH-26W18-T', { printed: '', assembled: '', qc: '' }),
      ribbon('0402'),
      pouch('0402'),
    ],
  }),
];
