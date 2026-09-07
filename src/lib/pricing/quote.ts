/**
 * Server-trusted quote calculator — amounts always from `src/config/pricing.ts`.
 */

import {
  getPlanById,
  KIT_BADGES_PER_PILOT,
  type PlanId,
  type PricingPlan,
} from '@/config/pricing';

export type CheckoutCustomerType = 'private' | 'company';

export interface QuoteInput {
  planId: string;
  customerType: CheckoutCustomerType;
  operatorCount: number;
  kitQuantity: number;
}

export interface PricingQuote {
  planId: PlanId;
  plan: PricingPlan;
  isQuoteOnly: boolean;
  operatorCount: number;
  kitQuantity: number;
  /** First billing period subscription (0 if free / quote). */
  subscriptionCents: number;
  /** One-shot NFC kit total. */
  kitTotalCents: number;
  /** subscription + kit (what customer pays now, excluding quote plans). */
  initialTotalCents: number;
  /** Recurring amount after the first period. */
  recurringCents: number;
  interval: PricingPlan['interval'];
}

export class QuoteValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'QuoteValidationError';
  }
}

function assertPositiveInt(value: unknown, field: string, min = 1, max = 10_000): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new QuoteValidationError(`Invalid ${field}`, `invalid_${field}`);
  }
  return value;
}

export function buildPricingQuote(raw: QuoteInput): PricingQuote {
  const plan = getPlanById(raw.planId);
  if (!plan) {
    throw new QuoteValidationError('Unknown or inactive plan', 'unknown_plan');
  }

  if (plan.target === 'individual' && raw.customerType !== 'private') {
    throw new QuoteValidationError('Individual plan requires private customer type', 'customer_type_mismatch');
  }
  if (plan.target === 'business' && raw.customerType !== 'company') {
    throw new QuoteValidationError('Business plan requires company customer type', 'customer_type_mismatch');
  }

  const isQuoteOnly = plan.interval === 'quote' || plan.priceCents === null;

  let operatorCount = 1;
  if (plan.requiresOperators) {
    const max = plan.maxOperators ?? 500;
    operatorCount = assertPositiveInt(raw.operatorCount, 'operatorCount', 1, max);
  } else {
    operatorCount = 1;
  }

  // Exactly one badge per pilot / profile — the commercial rule, enforced
  // here rather than trusted from the checkout form.
  //
  // The previous logic let an individual order up to 20 kits and a business
  // order any quantity at or above its operator count, which was a leftover
  // from the superseded two-badge model. Quantity is now derived, and a
  // request that disagrees with the derived value is rejected rather than
  // silently corrected: a mismatch means the client is out of sync with the
  // catalogue, and quietly charging a different amount than the page showed
  // would be worse than failing.
  const kitQuantity = plan.requiresOperators
    ? operatorCount * KIT_BADGES_PER_PILOT
    : KIT_BADGES_PER_PILOT;

  const requestedKits = raw.kitQuantity;
  if (typeof requestedKits === 'number' && requestedKits > 0 && requestedKits !== kitQuantity) {
    throw new QuoteValidationError(
      `This plan includes exactly ${kitQuantity} badge(s)`,
      'invalid_kitQuantity',
    );
  }

  if (isQuoteOnly) {
    return {
      planId: plan.id,
      plan,
      isQuoteOnly: true,
      operatorCount,
      kitQuantity,
      subscriptionCents: 0,
      kitTotalCents: 0,
      initialTotalCents: 0,
      recurringCents: 0,
      interval: plan.interval,
    };
  }

  const subscriptionCents = plan.priceCents ?? 0;
  const unitKit = plan.kitIncluded ? 0 : (plan.kitPriceCents ?? 0);
  const kitTotalCents = unitKit * kitQuantity;

  return {
    planId: plan.id,
    plan,
    isQuoteOnly: false,
    operatorCount,
    kitQuantity,
    subscriptionCents,
    kitTotalCents,
    initialTotalCents: subscriptionCents + kitTotalCents,
    recurringCents: subscriptionCents,
    interval: plan.interval,
  };
}
