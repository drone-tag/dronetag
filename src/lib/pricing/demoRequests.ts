/**
 * In-memory + localStorage store for commercial checkout requests (demo / pre-Stripe).
 * Never stores card data.
 */

export type PricingRequestStatus = 'received' | 'awaiting_payment' | 'contact';

export interface PricingRequestRecord {
  id: string;
  createdAt: string;
  planId: string;
  customerType: 'private' | 'company';
  operatorCount: number;
  kitQuantity: number;
  subscriptionCents: number;
  kitTotalCents: number;
  initialTotalCents: number;
  recurringCents: number;
  interval: string;
  isQuoteOnly: boolean;
  billing: {
    fullName: string;
    email: string;
    companyName: string;
    vat: string;
    addressLine1: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status: PricingRequestStatus;
  paymentNote: 'payment_not_active';
}

const STORAGE_KEY = 'dronetag-pricing-requests-v1';

const memory = new Map<string, PricingRequestRecord>();

function persist(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...memory.values()]));
  } catch {
    /* quota */
  }
}

function hydrate(): void {
  if (typeof window === 'undefined') return;
  if (memory.size > 0) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list = JSON.parse(raw) as PricingRequestRecord[];
    if (!Array.isArray(list)) return;
    for (const row of list) {
      if (row?.id) memory.set(row.id, row);
    }
  } catch {
    /* ignore */
  }
}

export function savePricingRequest(record: PricingRequestRecord): void {
  hydrate();
  memory.set(record.id, record);
  persist();
}

export function getPricingRequest(id: string): PricingRequestRecord | null {
  hydrate();
  return memory.get(id) ?? null;
}

export function listPricingRequests(): PricingRequestRecord[] {
  hydrate();
  return [...memory.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
