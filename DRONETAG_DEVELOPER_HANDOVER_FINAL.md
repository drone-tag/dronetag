# DroneTag — developer handover (post pre-beta)

Read this first, then `DRONETAG_NEW_DEVELOPER_START_HERE.md` (baseline audit)
and `docs/audit-post-prebeta/POST_PREBETA_NEW_DEVELOPER_START_HERE.md`.

## 1. What it is

DroneTag stores UAS operator / remote-pilot paperwork and, if the owner
publishes a drone, shows a short public card at `/u/{slug}`. An NFC badge is
a physical tag programmed with that URL.

## 2. Stack

Next.js 16.2 (App Router, Webpack) · React 19 · TypeScript 5 · Tailwind 4 ·
Firebase Auth/Firestore/Storage · Admin SDK on Route Handlers · Cloud Functions
v2 (`us-central1`) · Resend via `fetch` · Zod on new endpoints · Vitest ·
Netlify hosting.

## 3. Architecture

```
Browser Auth → cookie / ID token
  CREATE / privilege  → Route Handler → Admin SDK → Firestore
  READ / some UPDATE  → client SDK → rules
  Found-drone         → callable submitReport → Functions → Resend
Admin pages           → proxy.ts (cookie) + layout verifyAdminSession
Public profile        → dronesPublic/{slug} written only by server
```

## 4. Current state

Pre-beta: a controlled group can sign up, provision, manage entities, publish
a profile, file a found-drone report, use support, and receive transactional
email **if** Resend and Functions are configured. Payments are not live.

## 5. Just completed (this pass)

P0 security (password script, storage rules, public PDF, server snapshot),
working signup, reset password, one-badge pricing, NFC copy, found-drone email,
admin emails, admin gate, support, onboarding, toast, modal a11y, nav, IT/EN
selector, tablet sidebar, publication consent, legal drafts, deletion *request*,
Vitest, CI, logger, staging docs. `pdfjs-dist` upgraded for GHSA-hq66-cqwq-w95j.

## 6. Operational

Signup + OTP · login / logout / reset · CRUD operators/drones/certs/insurance/
docs · publish/unpublish with consent · public `/u/{slug}` · found-drone write
+ owner mail · admin verify + mail · support · pricing quote (no charge).

## 7. Incomplete

Stripe and subscription lifecycle · Team/Business membership · automatic
account deletion · data export · App Check on the Next.js path · CSP enforce ·
Firestore TTL · DE/ES/FR · toast on every mutation · chip UID registry.

## 8. Production blockers

No payments · no legal-reviewed ToS/privacy · no staging project in use ·
rules/functions must be **deployed** · secrets historically in git must be
**rotated** · no verified backups · Cloud Functions still US region.

## 9. Security (honest)

Better than `b72f843`, not done. Storage public-read is gone **in repo**.
Admin has a server gate. Snapshots are server-built. Remaining: rotate
credentials, deploy rules, App Check, HttpOnly-only session, CSP, rate limits.

## 10. Privacy

Public card is minimized (no policy PDF). Consent checkbox + publication
modal. Deletion is a ticket, not a wipe. Draft legal pages only.

## 11. Data model

Unchanged collections. Added fields: `acceptedTermsAt` on users; report
`emailNotified` / `notificationError`. `dronesPublic` client writes denied.

## 12. Backend rule

New privileged writes: Route Handler + Admin SDK + Zod. Keep Functions for
`submitReport`, `bootstrapSlots`, async mail. Do not add callers to the five
deprecated `create*` callables.

## 13. Deploy

Netlify for the app. `firebase deploy --only firestore:rules,storage,functions`
separately. CI does **not** deploy. See `DRONETAG_STAGING_SETUP.md`.

## 14. Accounts needed

GitHub · Firebase Blaze (`dronetag-e905d` + **new staging**) · Netlify ·
Resend domain · registrar `drone-tag.com` · later Stripe · later monitoring.

## 15. First week for a new programmer

1. Confirm GitHub visibility and rotate admin password + service account + Resend key.
2. ~~Install a JDK and run `npm run test:rules`.~~ **Done** — 60 assertions
   pass (44 Firestore, 16 Storage). They are the only automated check on the
   storage namespace split and the `dronesPublic` write denial, so keep them
   green. They need a JVM on PATH; `brew install openjdk` and add
   `/opt/homebrew/opt/openjdk/bin`. Wiring them into
   `.github/workflows/ci.yml` is still open, since the runner installs no JVM.
3. Deploy rules to staging, then re-run the suites against it. The suites
   verify the rules in this repository; what is deployed to the live project
   has not been read and may differ.
4. Walk `DRONETAG_MANUAL_QA.md` on staging.
5. Do not run `scripts/create-admin.ts` against production casually.

## 16. 30 / 60 / 90 days

- **30:** staging live, secrets rotated, rules/functions deployed, rules suites
  actually run, Resend verified, App Check monitor.
- **60:** Stripe test mode, deletion cascade (after legal), Java in CI so
  `test:rules` blocks, lint gate green.
- **90:** production legal texts, EU Functions region decision, Team/Business or remove those SKUs.

## 17. Open questions

Are there real users and badges already? Was the repo ever public? Is Firestore
in the EU? Who owns `drone-tag.com` DNS? Is the one-badge list final?
