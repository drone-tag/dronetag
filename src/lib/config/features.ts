/**
 * Public signup is enabled by default for the landing page.
 * Set NEXT_PUBLIC_ALLOW_SIGNUP=false to require admin-provisioned accounts only.
 */
export const ALLOW_PUBLIC_SIGNUP = process.env.NEXT_PUBLIC_ALLOW_SIGNUP !== 'false';

/**
 * Coverdrone EU B2C quote flow (IT). Used when a policy is expiring/expired
 * so users can renew or buy coverage. Affiliate source is fixed in the URL.
 */
export const COVERDRONE_QUOTE_URL =
  'https://quoteseur.coverdrone.com/AWE/Container.aspx?Culture=it-IT&ProductTarget=Coverdrone&CurrentStep=ClientDetails&CurrentWorkflow=StandardB2C&RefererWorkflow=StandardB2C&RefererStep=GetNewQuote&Source=72573343';
