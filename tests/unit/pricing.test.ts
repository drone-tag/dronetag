import { describe, expect, it } from 'vitest';

import { NFC_KIT_CONTENTS_KEYS, PRICING_PLANS, getPlanById } from '@/config/pricing';
import { QuoteValidationError, buildPricingQuote } from '@/lib/pricing/quote';

/**
 * The commercial model, encoded as tests.
 *
 * Two things went wrong before and are worth pinning down. First, the NFC kit
 * prices in the config had drifted from the agreed price list across every
 * plan. Second, the catalogue still described the superseded model in which a
 * kit contained two badges — one for the certificate, one for the insurance —
 * whereas the product now sells exactly one badge per pilot.
 *
 * Prices are asserted in cents against literal expected values rather than
 * derived from the config, so that changing the config alone cannot make these
 * tests agree with it.
 */

const EXPECTED_SUBSCRIPTION_CENTS: Record<string, number | null> = {
  free: 0,
  pilot: 9900,
  'pilot-pro': 13900,
  team: 4900,
  business: 14900,
  enterprise: null,
};

const EXPECTED_KIT_CENTS: Record<string, number | null> = {
  free: 2490,
  pilot: 1990,
  'pilot-pro': 0, // included in the subscription
  team: 1790,
  business: 1590,
  enterprise: null,
};

const EXPECTED_INTERVAL: Record<string, string> = {
  free: 'year',
  pilot: 'year',
  'pilot-pro': 'year',
  team: 'month',
  business: 'month',
  enterprise: 'quote',
};

describe('plan catalogue', () => {
  it('contains exactly the six commercial plans', () => {
    expect(PRICING_PLANS.map((p) => p.id).sort()).toEqual(
      ['business', 'enterprise', 'free', 'pilot', 'pilot-pro', 'team'].sort(),
    );
  });

  it.each(Object.entries(EXPECTED_SUBSCRIPTION_CENTS))(
    'prices the %s subscription correctly',
    (id, cents) => {
      expect(getPlanById(id)?.priceCents).toBe(cents);
    },
  );

  it.each(Object.entries(EXPECTED_KIT_CENTS))('prices the %s NFC kit correctly', (id, cents) => {
    expect(getPlanById(id)?.kitPriceCents).toBe(cents);
  });

  it.each(Object.entries(EXPECTED_INTERVAL))('bills %s on the right interval', (id, interval) => {
    expect(getPlanById(id)?.interval).toBe(interval);
  });

  it('includes the kit only on Pilot Pro', () => {
    const included = PRICING_PLANS.filter((p) => p.kitIncluded).map((p) => p.id);
    expect(included).toEqual(['pilot-pro']);
  });

  it('carries no trace of the superseded two-badge kit', () => {
    expect(NFC_KIT_CONTENTS_KEYS).toHaveLength(1);
    const joined = NFC_KIT_CONTENTS_KEYS.join(' ');
    expect(joined).not.toContain('certBadge');
    expect(joined).not.toContain('insuranceBadge');
  });

  it('carries no trace of the superseded price points', () => {
    const oldPrices = [3990, 3490, 2990, 2790];
    const configured = PRICING_PLANS.flatMap((p) => [p.priceCents, p.kitPriceCents]);
    for (const stale of oldPrices) {
      expect(configured).not.toContain(stale);
    }
  });
});

describe('quote — one badge per pilot', () => {
  it('bills a single badge on an individual plan', () => {
    const quote = buildPricingQuote({
      planId: 'pilot',
      customerType: 'private',
      operatorCount: 1,
      kitQuantity: 1,
    });
    expect(quote.kitQuantity).toBe(1);
    expect(quote.kitTotalCents).toBe(1990);
    expect(quote.initialTotalCents).toBe(9900 + 1990);
  });

  it('refuses to sell a second badge to an individual', () => {
    expect(() =>
      buildPricingQuote({
        planId: 'pilot',
        customerType: 'private',
        operatorCount: 1,
        kitQuantity: 2,
      }),
    ).toThrow(QuoteValidationError);
  });

  it('charges nothing for the Pilot Pro badge, which is included', () => {
    const quote = buildPricingQuote({
      planId: 'pilot-pro',
      customerType: 'private',
      operatorCount: 1,
      kitQuantity: 1,
    });
    expect(quote.kitQuantity).toBe(1);
    expect(quote.kitTotalCents).toBe(0);
    expect(quote.initialTotalCents).toBe(13900);
  });

  it('bills the Free plan badge without any subscription', () => {
    const quote = buildPricingQuote({
      planId: 'free',
      customerType: 'private',
      operatorCount: 1,
      kitQuantity: 1,
    });
    expect(quote.subscriptionCents).toBe(0);
    expect(quote.kitTotalCents).toBe(2490);
    expect(quote.initialTotalCents).toBe(2490);
  });

  it('bills exactly one badge per pilot on Team', () => {
    const quote = buildPricingQuote({
      planId: 'team',
      customerType: 'company',
      operatorCount: 5,
      kitQuantity: 5,
    });
    expect(quote.kitQuantity).toBe(5);
    expect(quote.kitTotalCents).toBe(5 * 1790);
    expect(quote.recurringCents).toBe(4900);
  });

  it('bills exactly one badge per pilot on Business', () => {
    const quote = buildPricingQuote({
      planId: 'business',
      customerType: 'company',
      operatorCount: 10,
      kitQuantity: 10,
    });
    expect(quote.kitTotalCents).toBe(10 * 1590);
  });

  it('refuses a badge count that does not match the pilot count', () => {
    expect(() =>
      buildPricingQuote({
        planId: 'team',
        customerType: 'company',
        operatorCount: 3,
        kitQuantity: 7,
      }),
    ).toThrow(QuoteValidationError);
  });

  it('normalises a business quote to one badge per pilot when none is supplied', () => {
    const quote = buildPricingQuote({
      planId: 'team',
      customerType: 'company',
      operatorCount: 4,
      kitQuantity: 0,
    });
    expect(quote.kitQuantity).toBe(4);
  });
});

describe('quote — validation', () => {
  it('rejects an unknown plan', () => {
    expect(() =>
      buildPricingQuote({
        planId: 'platinum',
        customerType: 'private',
        operatorCount: 1,
        kitQuantity: 1,
      }),
    ).toThrow(QuoteValidationError);
  });

  it('rejects a company buying an individual plan', () => {
    expect(() =>
      buildPricingQuote({
        planId: 'pilot',
        customerType: 'company',
        operatorCount: 1,
        kitQuantity: 1,
      }),
    ).toThrow(QuoteValidationError);
  });

  it('rejects a private customer buying a business plan', () => {
    expect(() =>
      buildPricingQuote({
        planId: 'team',
        customerType: 'private',
        operatorCount: 1,
        kitQuantity: 1,
      }),
    ).toThrow(QuoteValidationError);
  });

  it('charges nothing up front for Enterprise, which is quote-only', () => {
    const quote = buildPricingQuote({
      planId: 'enterprise',
      customerType: 'company',
      operatorCount: 50,
      kitQuantity: 50,
    });
    expect(quote.isQuoteOnly).toBe(true);
    expect(quote.initialTotalCents).toBe(0);
  });
});
