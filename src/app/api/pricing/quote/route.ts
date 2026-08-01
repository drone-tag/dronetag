/**
 * POST /api/pricing/quote — recompute totals from server config (never trust client money fields).
 */

import { NextResponse } from 'next/server';
import { buildPricingQuote, QuoteValidationError } from '@/lib/pricing/quote';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  try {
    const quote = buildPricingQuote({
      planId: typeof raw.planId === 'string' ? raw.planId : '',
      customerType: raw.customerType === 'company' ? 'company' : 'private',
      operatorCount: typeof raw.operatorCount === 'number' ? raw.operatorCount : 1,
      kitQuantity: typeof raw.kitQuantity === 'number' ? raw.kitQuantity : 1,
    });

    return NextResponse.json({
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
      paymentActive: false,
    });
  } catch (err) {
    if (err instanceof QuoteValidationError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 400 });
    }
    console.error('[pricing/quote]', err);
    return NextResponse.json({ error: 'quote_failed' }, { status: 500 });
  }
}
