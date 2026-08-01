/**
 * POST /api/pricing/checkout — validate + record a commercial request.
 * Payments are NOT active: no card data accepted; amounts from server config only.
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { buildPricingQuote, QuoteValidationError } from '@/lib/pricing/quote';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type BillingBody = {
  fullName?: unknown;
  email?: unknown;
  companyName?: unknown;
  vat?: unknown;
  addressLine1?: unknown;
  city?: unknown;
  postalCode?: unknown;
  country?: unknown;
};

function str(v: unknown, max = 200): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** Process-local store when Admin SDK / Firestore pricingRequests is not wired. */
const serverDemoRequests = new Map<string, Record<string, unknown>>();

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const billing = (raw.billing ?? {}) as BillingBody;
  const termsAccepted = raw.termsAccepted === true;

  if (!termsAccepted) {
    return NextResponse.json({ error: 'terms_required' }, { status: 400 });
  }

  const fullName = str(billing.fullName, 120);
  const email = str(billing.email, 160).toLowerCase();
  const companyName = str(billing.companyName, 160);
  const vat = str(billing.vat, 40);
  const addressLine1 = str(billing.addressLine1, 200);
  const city = str(billing.city, 80);
  const postalCode = str(billing.postalCode, 20);
  const country = str(billing.country, 60);

  if (!fullName || !email || !isEmail(email) || !addressLine1 || !city || !postalCode || !country) {
    return NextResponse.json({ error: 'billing_incomplete' }, { status: 400 });
  }

  try {
    const quote = buildPricingQuote({
      planId: typeof raw.planId === 'string' ? raw.planId : '',
      customerType: raw.customerType === 'company' ? 'company' : 'private',
      operatorCount: typeof raw.operatorCount === 'number' ? raw.operatorCount : 1,
      kitQuantity: typeof raw.kitQuantity === 'number' ? raw.kitQuantity : 1,
    });

    if (raw.customerType === 'company' && !companyName) {
      return NextResponse.json({ error: 'company_required' }, { status: 400 });
    }

    const id = randomUUID();
    const record = {
      id,
      createdAt: new Date().toISOString(),
      planId: quote.planId,
      customerType: raw.customerType === 'company' ? 'company' : 'private',
      operatorCount: quote.operatorCount,
      kitQuantity: quote.kitQuantity,
      subscriptionCents: quote.subscriptionCents,
      kitTotalCents: quote.kitTotalCents,
      initialTotalCents: quote.initialTotalCents,
      recurringCents: quote.recurringCents,
      interval: quote.interval,
      isQuoteOnly: quote.isQuoteOnly,
      billing: {
        fullName,
        email,
        companyName,
        vat,
        addressLine1,
        city,
        postalCode,
        country,
      },
      status: quote.isQuoteOnly ? 'contact' : 'awaiting_payment',
      paymentNote: 'payment_not_active' as const,
      paymentActive: false,
    };

    serverDemoRequests.set(id, record);

    return NextResponse.json({
      ok: true,
      requestId: id,
      paymentActive: false,
      message: 'payment_not_active',
      quote: {
        planId: quote.planId,
        isQuoteOnly: quote.isQuoteOnly,
        operatorCount: quote.operatorCount,
        kitQuantity: quote.kitQuantity,
        subscriptionCents: quote.subscriptionCents,
        kitTotalCents: quote.kitTotalCents,
        initialTotalCents: quote.initialTotalCents,
        recurringCents: quote.recurringCents,
        interval: quote.interval,
        kitIncluded: quote.plan.kitIncluded,
      },
      record,
    });
  } catch (err) {
    if (err instanceof QuoteValidationError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 400 });
    }
    console.error('[pricing/checkout]', err);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
  }
}
