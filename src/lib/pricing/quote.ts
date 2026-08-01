/**
 * Server-trusted quote calculator — amounts always from `src/config/pricing.ts`.
 */

import {
  getPlanById,
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

  let kitQuantity: number;
  if (plan.kitIncluded) {
    kitQuantity = Math.max(1, operatorCount);
  } else if (plan.requiresOperators) {
    // Business: one kit per operator by default; allow explicit quantity ≥ operators.
    kitQuantity = assertPositiveInt(raw.kitQuantity, 'kitQuantity', operatorCount, Math.max(operatorCount, plan.maxOperators ?? 500));
  } else {
    kitQuantity = assertPositiveInt(raw.kitQuantity, 'kitQuantity', 1, 20);
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
