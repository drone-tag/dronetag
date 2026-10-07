/**
 * Public signup is enabled by default for the landing page.
 * Set NEXT_PUBLIC_ALLOW_SIGNUP=false to require admin-provisioned accounts only.
 */
export const ALLOW_PUBLIC_SIGNUP = process.env.NEXT_PUBLIC_ALLOW_SIGNUP !== 'false';

/**
 * Per-plan slot caps (drones, operators, certificates, …). Off by default:
 * every account can add as many records as it needs. Set
 * NEXT_PUBLIC_ENFORCE_SLOT_QUOTAS=true at build time to apply the caps
 * stored in `slots/{uid}` again, in the UI and on the server.
 */
export const ENFORCE_SLOT_QUOTAS = process.env.NEXT_PUBLIC_ENFORCE_SLOT_QUOTAS === 'true';

/** The cap a page should apply: the granted one, or no cap at all. */
export function effectiveSlotCap(granted: number): number {
  return ENFORCE_SLOT_QUOTAS ? granted : Number.POSITIVE_INFINITY;
}

/**
 * Coverdrone EU B2C quote flow (IT). Used when a policy is expiring/expired
 * so users can renew or buy coverage. Affiliate source is fixed in the URL.
 */
export const COVERDRONE_QUOTE_URL =
  'https://quoteseur.coverdrone.com/AWE/Container.aspx?Culture=it-IT&ProductTarget=Coverdrone&CurrentStep=ClientDetails&CurrentWorkflow=StandardB2C&RefererWorkflow=StandardB2C&RefererStep=GetNewQuote&Source=72573343';
