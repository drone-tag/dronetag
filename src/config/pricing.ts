/**
 * Central commercial pricing catalogue.
 *
 * All UI and server quote logic MUST read from this file.
 * Never trust client-submitted euro amounts.
 */

export type PricingTarget = 'individual' | 'business';
export type PricingInterval = 'year' | 'month' | 'quote';

export type PlanId =
  | 'free'
  | 'pilot'
  | 'pilot-pro'
  | 'team'
  | 'business'
  | 'enterprise';

export interface PricingPlan {
  id: PlanId;
  /** i18n key for display name */
  nameKey: string;
  target: PricingTarget;
  /**
   * Subscription amount in euro cents.
   * `null` = custom quote (Enterprise).
   */
  priceCents: number | null;
  interval: PricingInterval;
  /**
   * NFC kit unit price in euro cents (per kit / per operator on business plans).
   * `null` = custom quote. `0` when included in subscription.
   */
  kitPriceCents: number | null;
  kitIncluded: boolean;
  /** i18n feature bullet keys */
  featureKeys: readonly string[];
  ctaKey: string;
  recommended: boolean;
  /**
   * Soft / configurable operator ceiling for business plans.
   * UI shows audience copy, not this number as a hard marketed limit.
   */
  maxOperators: number | null;
  /** i18n audience hint (e.g. “for small teams”) */
  audienceKey: string;
  active: boolean;
  /** Whether checkout asks for operator count */
  requiresOperators: boolean;
}

/**
 * Configurable soft caps — change here without touching UI copy.
 * Not displayed as definitive commercial limits on the pricing page.
 */
export const PRICING_OPERATOR_LIMITS = {
  team: 25,
  business: 200,
} as const;

/** Default operator count when opening business checkout. */
export const DEFAULT_BUSINESS_OPERATORS = 1;

export const NFC_KIT_CONTENTS_KEYS = [
  'pricing.kit.item.certBadge',
  'pricing.kit.item.insuranceBadge',
] as const;

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: 'free',
    nameKey: 'pricing.plan.free.name',
    target: 'individual',
    priceCents: 0,
    interval: 'year',
    kitPriceCents: 3990,
    kitIncluded: false,
    featureKeys: [
      'pricing.plan.free.f1',
      'pricing.plan.free.f2',
      'pricing.plan.free.f3',
    ],
    ctaKey: 'pricing.plan.free.cta',
    recommended: false,
    maxOperators: null,
    audienceKey: 'pricing.plan.free.audience',
    active: true,
    requiresOperators: false,
  },
  {
    id: 'pilot',
    nameKey: 'pricing.plan.pilot.name',
    target: 'individual',
    priceCents: 9900,
    interval: 'year',
    kitPriceCents: 3490,
    kitIncluded: false,
    featureKeys: [
      'pricing.plan.pilot.f1',
      'pricing.plan.pilot.f2',
      'pricing.plan.pilot.f3',
      'pricing.plan.pilot.f4',
    ],
    ctaKey: 'pricing.plan.pilot.cta',
    recommended: false,
    maxOperators: null,
    audienceKey: 'pricing.plan.pilot.audience',
    active: true,
    requiresOperators: false,
  },
  {
    id: 'pilot-pro',
    nameKey: 'pricing.plan.pilotPro.name',
    target: 'individual',
    priceCents: 13900,
    interval: 'year',
    kitPriceCents: 0,
    kitIncluded: true,
    featureKeys: [
      'pricing.plan.pilotPro.f1',
      'pricing.plan.pilotPro.f2',
      'pricing.plan.pilotPro.f3',
      'pricing.plan.pilotPro.f4',
    ],
    ctaKey: 'pricing.plan.pilotPro.cta',
    recommended: true,
    maxOperators: null,
    audienceKey: 'pricing.plan.pilotPro.audience',
    active: true,
    requiresOperators: false,
  },
  {
    id: 'team',
    nameKey: 'pricing.plan.team.name',
    target: 'business',
    priceCents: 4900,
    interval: 'month',
    kitPriceCents: 2990,
    kitIncluded: false,
    featureKeys: [
      'pricing.plan.team.f1',
      'pricing.plan.team.f2',
      'pricing.plan.team.f3',
      'pricing.plan.team.f4',
    ],
    ctaKey: 'pricing.plan.team.cta',
    recommended: false,
    maxOperators: PRICING_OPERATOR_LIMITS.team,
    audienceKey: 'pricing.plan.team.audience',
    active: true,
    requiresOperators: true,
  },
  {
    id: 'business',
    nameKey: 'pricing.plan.business.name',
    target: 'business',
    priceCents: 14900,
    interval: 'month',
    kitPriceCents: 2790,
    kitIncluded: false,
    featureKeys: [
      'pricing.plan.business.f1',
      'pricing.plan.business.f2',
      'pricing.plan.business.f3',
      'pricing.plan.business.f4',
    ],
    ctaKey: 'pricing.plan.business.cta',
    recommended: false,
    maxOperators: PRICING_OPERATOR_LIMITS.business,
    audienceKey: 'pricing.plan.business.audience',
    active: true,
    requiresOperators: true,
  },
  {
    id: 'enterprise',
    nameKey: 'pricing.plan.enterprise.name',
    target: 'business',
    priceCents: null,
    interval: 'quote',
    kitPriceCents: null,
    kitIncluded: false,
    featureKeys: [
      'pricing.plan.enterprise.f1',
      'pricing.plan.enterprise.f2',
      'pricing.plan.enterprise.f3',
    ],
    ctaKey: 'pricing.plan.enterprise.cta',
    recommended: false,
    maxOperators: null,
    audienceKey: 'pricing.plan.enterprise.audience',
    active: true,
    requiresOperators: true,
  },
] as const;

export function getPlanById(id: string): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.id === id && p.active);
}

export function listPlansByTarget(target: PricingTarget): PricingPlan[] {
  return PRICING_PLANS.filter((p) => p.active && p.target === target);
}

export function formatEuroFromCents(cents: number, locale = 'it-IT'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}
