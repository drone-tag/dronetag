# DroneTag Developer Handover

Technical source of truth for engineers taking over DroneTag. Verified against
the working tree at `4bb18cb` and a read-only production smoke test on
2026-09-08. No secrets, tokens, key material, personal data, or environment
values are recorded here.

Companion docs (not duplicated):

- [README.md](./README.md) — short landing page and quick start
- [DRONETAG_STAGING_SETUP.md](./DRONETAG_STAGING_SETUP.md) — how to create staging
- [docs/DEPLOY_PRODUCTION.md](./docs/DEPLOY_PRODUCTION.md) — production promotion recipe
- [DRONETAG_MANUAL_QA.md](./DRONETAG_MANUAL_QA.md) — functional checklist
- [docs/DEVICE_TESTING.md](./docs/DEVICE_TESTING.md) — real-device checklist
- [DRONETAG_GLOSSARY.md](./DRONETAG_GLOSSARY.md) — pilot vs operator vocabulary
- [DRONETAG_ACCOUNT_DELETION_DESIGN.md](./DRONETAG_ACCOUNT_DELETION_DESIGN.md) — deletion cascade (not implemented)
- [scripts/README.md](./scripts/README.md) — admin / backfill scripts

---

## 1. Executive Technical Summary

DroneTag is a Next.js web application for UAS (drone) identification.

An operator stores identity, aircraft, remote-pilot certificates, insurance
and permits. An administrator reviews documents. A published drone gets a
public card at `/u/{slug}` — the URL written on a physical NFC badge. Anyone
who taps the badge can see who is responsible for the aircraft and file a
“found drone” report.

The product is **pre-beta**. Core identity, public profile, admin review and
found-drone notification work. Payments, team tenancy, automated account
erasure and a verified backup/restore runbook are not implemented.

Three write paths exist:

1. Browser → Next.js Route Handler → Firebase Admin SDK (privileged creates
   and server-owned writes).
2. Browser Firebase client SDK → Firestore / Storage, constrained by rules
   (owner reads, some updates, some deletes, some uploads).
3. Browser callable → Cloud Function `submitReport` (anonymous found-drone).

Hosting is **Netlify**, not Firebase Hosting. Firebase provides Auth,
Firestore, Storage and Cloud Functions.

---

## 2. Current Delivery Status

| Area | Status |
|---|---|
| Production site | Live at `https://drone-tag.com` |
| GitHub | Private (`https://github.com/wepopagani/dronetag.git`) |
| Branch | `main` @ `4bb18cbed927e4b55d9e90fe3d7c1a921b1a992a` |
| Firebase Admin on Netlify | Working (Node 22 Lambda + jose CJS override) |
| Service-account rotation | Complete (old user-managed keys revoked) |
| Automated tests | 166 / 166 locally (106 unit + 60 rules) |
| Lint | 0 errors, 11 warnings |
| Production smoke | `/` 200, `/login` 200, `/admin` 307 login, `/api/health` 200, session/admin APIs 400/401 |

**Invited beta** is plausible after staging, Resend, Auth providers and a
rules/functions deploy confirmation.

**Commercial production** is not ready: no payment provider, no lawyer-reviewed
legal texts, no automatic erasure, no verified backups, App Check not enforced
on Next.js APIs, no dedicated staging Firebase project in repo config.

---

## 3. Repository & Deployment

| Item | Value |
|---|---|
| Remote | `https://github.com/wepopagani/dronetag.git` |
| Default branch | `main` |
| Web host | Netlify site → `https://drone-tag.com` |
| Netlify build | `npm run build` via `@netlify/plugin-nextjs` |
| Netlify Node | `NODE_VERSION=22` (`netlify.toml`) |
| Production function | `___netlify-server-handler` on AWS Lambda `nodejs22.x` |
| Firebase project alias | `dronetag-e905d` (`.firebaserc`) |
| Cloud Functions | Separate package `functions/`, runtime `nodejs20`, region `us-central1` |
| CI | `.github/workflows/ci.yml` — lint, typecheck, unit tests, Next build (Node 22) + Functions build (Node 20). **No deploy.** Rules tests are **not** in CI (need Java). |

Git hygiene:

- `.env`, `.env.*` ignored except `.env.local.example` / `.env.example`
- Service-account JSON filenames ignored (`*firebase-adminsdk*.json`)
- `.next/`, `.netlify/`, `node_modules/`, `public/vendor/`, `coverage/` ignored
- Current tree does not track env values or service-account JSON

Historical git objects may still contain old env *paths* or a former admin
password string. Those credentials are **not active** (see §15). Do not rewrite
history unless the owner explicitly requests it.

---

## 4. Technology Stack

Lockfile versions at handover time. Caret ranges may resolve differently after
a later `npm install`.

| Layer | Version | Notes |
|---|---|---|
| Next.js | 16.2.12 | App Router. `dev` / `build` use Webpack (`--webpack`). |
| React | 19.2.4 | |
| TypeScript | 5.x (`strict`) | |
| Tailwind CSS | 4.x | Custom UI in `src/components/ui/` |
| Firebase client | ^12.11.0 | Auth, Firestore, Storage, Functions, App Check init |
| Firebase Admin | 14.2.0 | Next Route Handlers + scripts |
| firebase-functions | ^7.3.2 | `functions/`, Node 20 |
| Hosting | Netlify | `netlify.toml` + `@netlify/plugin-nextjs` |
| Email | Resend HTTP (`fetch`) | No `resend` npm package |
| PDF / OCR | pdfjs-dist, tesseract.js | Workers staged into `public/vendor/` (gitignored) |
| Validation | zod ^4 | Newer Route Handlers |
| Tests | Vitest 3 + Firebase rules emulator | |
| Payments | None | `NoopBillingProvider` |

Root `engines.node` is `>=20.9.0`. Prefer **Node 22** for the Next.js app
(matches `.nvmrc`, CI web job, Netlify). Use **Node 20** only for `functions/`.

---

## 5. System Architecture

```
Browser / PWA
  ├─ Firebase client SDK ──► Firestore / Storage (rules)
  ├─ fetch ────────────────► Next.js Route Handlers (Admin SDK) ──► Firestore / Storage / Resend
  └─ httpsCallable ────────► Cloud Function submitReport ──────────► Firestore / Resend

Next.js on Netlify
  ├─ src/proxy.ts          optimistic cookie presence check for /admin pages
  ├─ src/app/admin/layout  real admin gate (verifyIdToken + claim)
  └─ ___netlify-server-handler (Node 22 Lambda)
```

`DEMO_MODE` (`src/lib/firebase/config.ts`) activates when
`NEXT_PUBLIC_FIREBASE_API_KEY` or `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is missing
and uses an in-memory store. In that mode the UI can treat the signed-in
persona as admin. `next.config.ts` **refuses a production build** without those
vars. A runtime guard throws if `DEMO_MODE` loads over HTTPS on a non-localhost
host.

The app does **not** use Firebase emulators for local development. The emulator
is used only by `npm run test:rules`.

---

## 6. Authentication & Authorization

### Client auth

- Email/password signup and login (`signupWithEmail`, `loginWithEmail`).
- Google popup (`loginWithGoogle`). Must be enabled in the Firebase Auth console.
- Optional Firebase Phone Auth for contact verification (not a login substitute).
- Forgot password: `/forgot-password` → `sendPasswordResetEmail`.
  `auth/user-not-found` is swallowed so the form does not reveal whether an
  address is registered.
- After signup: email OTP via `POST /api/auth/otp/email/send` + `/verify`.
  Codes are stored hashed in `signupOtp/{uid}` (Admin SDK only).

Public signup is on unless `NEXT_PUBLIC_ALLOW_SIGNUP=false`.

### Session

1. Client holds a Firebase ID token.
2. `POST /api/session` with `{ idToken }` verifies it (`checkRevoked: true`)
   and sets HttpOnly `__dronetag_session` (1 hour).
3. `AuthContext` also sets JS-readable `__dronetag_idt` (same token).
4. Route Handlers accept `Authorization: Bearer` **or** either cookie
   (`src/lib/server/requestAuth.ts`).

The JS-readable cookie is a convenience / fallback, not the security model.
Hardening = HttpOnly-only.

If Admin SDK is not configured, `/api/session` returns 204 and does not set
the HttpOnly cookie.

### Account provision

`POST /api/account/provision` creates `users/{uid}`, `pilots/{uid}`,
`slots/{uid}` from the **verified token** (never from a client-supplied uid).
Idempotent; repairs half-provisioned accounts. Firestore `allow create: if false`
on those collections is intentional.

### Admin model

Admin is **only** Firebase custom claim `admin === true`.

- Grant: `npm run grant-admin -- <email>`
- First admin: `npm run create-admin -- <email>` (random password + reset link;
  **no password in source**)
- Unused leftover: `src/lib/auth/adminAllowlist.ts` (not imported).
  `NEXT_PUBLIC_ADMIN_EMAILS` is not read. Do not wire an email allowlist.

### Authorization layers (what is real vs optimistic)

| Layer | File | What it does | Security boundary? |
|---|---|---|---|
| Proxy | `src/proxy.ts` | If neither cookie exists, redirect `/admin` → login | **No.** Cookie presence only. A forged cookie passes. Netlify compiles this to Edge; it must stay free of `firebase-admin`. |
| Admin layout | `src/app/admin/layout.tsx` | `verifyAdminSession` + `checkRevoked: true` before any admin markup | **Yes** for HTML pages. |
| Admin APIs | `requireAdminFromRequest` on every `/api/admin/*` | Token + `admin === true` | **Yes** for data. |
| Account layout | `src/app/account/layout.tsx` | Client `useEffect` redirect | **No.** UX only. Data sits behind rules/APIs. |
| Firestore / Storage rules | `firestore.rules`, `storage.rules` | Default deny; claim-aware `isAdmin()` | **Yes** for client SDK access. |

If Admin SDK is missing locally, the admin layout falls through
(`status === 'unavailable'`). APIs still return 503.

---

## 7. Firebase Architecture

| Product | Role |
|---|---|
| Auth | Email/password, Google, optional phone; custom claims |
| Firestore | Application data (see §8) |
| Storage | Uploaded PDFs/images; branding |
| Cloud Functions | `submitReport` (live), `bootstrapSlots` (Auth onCreate), deprecated `create*` callables |
| App Check | Client init if reCAPTCHA env is set. Functions can enforce. Next.js Route Handlers **do not** verify App Check. Rules do **not** require `request.app`. |
| Hosting | Not used. Web is Netlify. |

Rules files in git are tested by `npm run test:rules`. Live project behaviour
equals those files **only after** `firebase deploy --only firestore:rules,storage`
(and functions separately). Do not assume production already matches git.

Deprecated callables (`createDrone`, `createOperator`, …) remain exported so
old clients do not 404. The Next.js app creates entities through
`/api/entities/*`. Do not add new callers in `src/lib/firebase/callable.ts`.

---

## 8. Data Model

Ownership is `userId` or document id = Auth uid unless noted. No personal
production data is listed here.

| Collection | Purpose | Ownership / relations | Public? | Who may write |
|---|---|---|---|---|
| `users/{uid}` | Account profile, branding URLs, terms, contact verification | Doc id = uid | Private | Create: server. Update: owner allow-list or admin. |
| `pilots/{uid}` | Remote-pilot identity (one per account) | Doc id = uid. `Drone.linkedPilotId` | Private | Create: server. |
| `operators/{id}` | UAS operator (private or company), quota-limited | `userId`. Drone `defaultOperatorId` / `activeOperatorId` | Private | Create: `/api/entities/operators`. |
| `drones/{id}` | Aircraft; slug, visibility, 24h active-operator override | `userId`. Links operator, insurance, pilot | Private | Create: `/api/entities/drones`. Owner cannot self-verify or rewrite slug. |
| `dronesPublic/{slug}` | Sanitised public card | `droneId` → `drones` | **Anonymous read** | Server only (`/publish`). Client create/update/delete denied. |
| `certificates/{id}` | Remote-pilot attestations | `userId` | Private (badge on public card is derived) | `/api/entities/certificates` |
| `insurances/{id}` | Policies + private `pdfUrl` | `userId` | Private. PDF is **not** on the public card. | `/api/entities/insurances` |
| `documents/{id}` | Other files (ID, etc.) | `userId` | Private | `/api/entities/documents` |
| `authorizations/{id}` | Operational permits | `userId` | Private | `/api/entities/authorizations` |
| `slots/{uid}` | Quotas (drone, operator, cert, pdf, permit, archive, nfc_badge, …) | Doc id = uid | Private | Provision, `bootstrapSlots`, or admin. Client create denied. |
| `plans/{planId}` | Legacy admin slot-price docs | Public read, admin write | **Not** the commercial catalogue (`src/config/pricing.ts`) | Admin |
| `reports/{id}` | Found-drone inbox | `ownerUserId` derived by `submitReport` | Owner + admin | Function write. Owner may only flip `read`. |
| `rateLimits/{key}` | Function-side buckets (found-drone) | Server | No client access | Functions |
| `orders/{id}` | Legacy order documents on `/account/orders` | `userId` | Private | **Checkout does not write here.** |
| `signupOtp/{uid}` | Hashed email OTP | Server | No client access | Admin SDK |
| `supportThreads/{uid}` + `messages` | One thread per user | Path id = uid | Owner + admin | APIs set `sender`. Client writes denied. |
| `profiles/{id}` | Legacy single-profile model | Admin only | Unused by `/u/{slug}` | Keep until migration is confirmed |

**Not implemented as live products:** `companies`, `badges`, `subscriptions`,
`deletionRequests`.

### Storage prefixes

| Prefix | Audience | Content |
|---|---|---|
| `public/users/{uid}/**` | World-readable images ≤ 5 MB | Reserved branding/QR namespace. Live branding API does **not** write here. |
| `users/{uid}/**` | Owner + admin; images/PDF ≤ 20 MB | Live uploads and account branding. |
| `profiles/**` | Admin only | Legacy. Do not write new files here. |

Live branding (`POST /api/account/branding`) writes the **private** prefix and
returns a Firebase download URL with a token. The public card shows those
images because **download tokens bypass Storage rules**, not because the object
is world-listable. Unauthenticated path enumeration of private PDFs is still
denied.

There is no object lifecycle / cascade delete.

---

## 9. Public NFC Profile

- One slug per published drone. URL: `/u/{slug}`.
- Physical NFC badge is programmed with that URL. There is **no chip-UID
  registry** in the data model.
- Snapshot is built only by `POST|DELETE /api/entities/drones/[id]/publish` →
  `syncDronePublicSnapshotAdmin`. The client cannot choose `verificationStatus`
  or `holderDisplayName`.
- Anonymous visitors read **only** `dronesPublic/{slug}` (and `plans`).
- Insurance PDFs are not on the public card. Authenticated preview uses
  `GET /api/files/proxy` (owner prefix or admin).
- Found-drone form calls Cloud Function `submitReport`. Owner uid is derived
  server-side. Rate limit: 3 reports / 10 minutes per IP+slug (Functions).

---

## 10. Admin System

Routes under `/admin` (users, drones, verify, reports, support, NFC tooling,
legacy plans).

Security:

1. Proxy bounces requests with no cookies (UX).
2. Layout verifies token + `admin === true`.
3. Every `/api/admin/*` handler calls `requireAdminFromRequest`.

Admin APIs: list accounts, provision a user, notify verification, support
reply, resync public snapshots.

---

## 11. Environment Variables

Names only. Never commit values.

`FIREBASE_SERVICE_ACCOUNT_KEY` must be the **complete service-account JSON**
(one line on Netlify). It must **never** be committed. Local laptops may use
`FIREBASE_SERVICE_ACCOUNT_PATH` pointing at a JSON file **outside** the repo
instead.

### Client (`NEXT_PUBLIC_*` — bundled)

| Name | Use | Required |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web config | Required (else DEMO_MODE; production build refused) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth | Required for production build |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project | Required |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage | Required for uploads |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Web config | Required for a complete client |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web config | Required for a complete client |
| `NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION` | Callables (default `us-central1`) | Optional |
| `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` | App Check (preferred) | Optional |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | App Check v3 fallback | Optional |
| `NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN` | Local App Check debug | Local only |
| `NEXT_PUBLIC_TRUSTED_PDF_HOSTS` | Extra PDF/image hosts | Optional |
| `NEXT_PUBLIC_ALLOW_SIGNUP` | `false` disables public signup | Optional (default on) |
| `NEXT_PUBLIC_APP_URL` | Absolute links in Next.js emails | Recommended in production |
| `NEXT_PUBLIC_GIT_COMMIT_SHA` | Health/build stamp | Optional |

### Server — Next.js / Netlify

| Name | Use | Required |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Admin SDK JSON | Required in production |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Local file alternative | Local optional |
| `GOOGLE_APPLICATION_CREDENTIALS` | ADC fallback | Optional |
| `RESEND_API_KEY` | Transactional email | Required for OTP / notify |
| `OTP_EMAIL_FROM` | From-address | Recommended |
| `TRUSTED_PDF_HOSTS` | Server host allowlist | Optional; keep in sync with public list |
| `CSP_ENFORCE` | `true` emits CSP | Optional (unset = no CSP header) |
| `LOG_LEVEL` | Logger | Optional |
| `NODE_VERSION` | Netlify build/runtime pin | Set to `22` in `netlify.toml` |

### Cloud Functions

| Name | Use |
|---|---|
| `RESEND_API_KEY` | Found-drone owner email |
| `APP_URL` | Links in Function emails (sibling of `NEXT_PUBLIC_APP_URL`) |
| `APP_CHECK_ENFORCE` | Function App Check (code default true; use `false` in monitor) |

### Scripts only (never commit)

`SEED_AUTH_EMAIL`, `SEED_AUTH_PASSWORD`, `ADMIN_BOOTSTRAP_EMAIL`

### CI

Fake `NEXT_PUBLIC_FIREBASE_*` placeholders only. CI must never receive a real
service-account JSON.

**Netlify contexts:** production, deploy-preview and branch-deploys must all
have the same Admin JSON if those contexts run `/api/*`.

---

## 12. Local Development

Clone **outside** iCloud Desktop/Documents (Finder “duplicate ` 2`” files
break TypeScript if `.next/types` is copied). Prefer `~/Developer/dronetag`.

Use Node 22 for the web app (`nvm use` / `.nvmrc`).

```bash
npm ci
cp .env.local.example .env.local
# Fill NEXT_PUBLIC_FIREBASE_* from a STAGING project, not production.
# For /api/* and admin: FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY.

npm run dev
```

Without Firebase env vars the app runs in `DEMO_MODE`. Do not point a laptop
`.env.local` at production unless you intend to mutate live data.

Do not run against production:

```bash
npm run create-admin
npm run grant-admin
npm run backfill-public
firebase deploy
```

---

## 13. Tests & QA

| Command | What | Baseline (2026-09-08) |
|---|---|---|
| `npx tsc --noEmit` | Types | PASS |
| `cd functions && npm run build` | Functions compile | PASS |
| `npm test` | Unit + integration | **106 / 106** |
| `npm run test:rules` | Firestore + Storage rules (needs Java) | **60 / 60** (44 + 16) |
| `npm run lint` | ESLint | **0 errors, 11 warnings** |
| `npm run build` | Production Next build | PASS (needs the three `NEXT_PUBLIC_FIREBASE_*` vars) |

Total automated tests when Java is available: **166 / 166**.

CI runs lint, typecheck, `npm test`, Next build (Node 22) and Functions build
(Node 20). It does **not** run `test:rules` and does **not** deploy.

Manual QA: `DRONETAG_MANUAL_QA.md`. There are no E2E tests.

---

## 14. Production Deployment

Web (Netlify):

1. Push to `main` (or trigger a production rebuild of the current commit).
2. Netlify runs `npm run build` on Node 22 with `@netlify/plugin-nextjs`.
3. Env changes (especially `FIREBASE_SERVICE_ACCOUNT_KEY`) require a **redeploy**
   before Functions/Route Handlers see them.
4. CI does not deploy.

Firebase (separate CLI, not Netlify):

```bash
firebase use <project>
firebase deploy --only firestore:indexes
firebase deploy --only firestore:rules,storage
cd functions && npm ci && npm run build && cd -
firebase deploy --only functions
```

After first rules deploy on a project that already has public drones:
`npm run backfill-public` (Admin credentials; staging first).

Promote admins with `npm run grant-admin -- <email>` against the intended
project only.

---

## 15. Security Status

Distinguish **history exposure** (old git objects / artifacts) from **active
credential exposure**. Revoked keys and removed source passwords are not
active vulnerabilities.

### Resolved

| Item | Notes |
|---|---|
| Hardcoded admin password in source | Removed from the working tree. Treat the old password string in git history as **historical exposure**; rotate that Auth user password if it was ever used. |
| Service-account JSON in the live host | Production Admin JSON rotated. Previous user-managed keys revoked. Active exposure closed. |
| Historical `.env.local` / SA **path** in old Netlify artifacts | Filename/path only in history; not an active key. |
| GitHub visibility | Repository is private. |
| ERR_REQUIRE_ESM on Netlify | Fixed via jose 4.15.9 override + Node 22 (see §16). |
| `/admin` HTML leak | Server layout verifies token + claim. |
| Admin APIs | `requireAdminFromRequest`; unauthenticated → 401. |
| Privileged Firestore creates | Denied from the client; go through Route Handlers. |
| `dronesPublic` client writes | Denied; snapshot is server-built. |
| Public card insurance PDF | Removed. |
| Support `sender` forgery | Server sets sender. |
| Found-drone owner uid | Derived server-side. |
| Health reconnaissance | `/api/health` no longer advertises CSP/App Check flags. |
| Production DEMO_MODE | Build refused without Firebase public env. |

### Open — handover

| Item | Why it remains |
|---|---|
| Live rules/functions vs git | Repo tests prove files. Production equality is unconfirmed until `firebase deploy` is verified. |
| Browser API key HTTP-referrer restrictions | Console setting; not verified from this audit. |
| App Check on Next.js Route Handlers | Client init exists; APIs do not verify tokens. |
| App Check in Firestore/Storage rules | `request.app` not required. |
| Rate limits on Next.js APIs | Only Functions rate-limit found-drone. |
| JS-readable `__dronetag_idt` | Still accepted as a session source. |
| OTP TTL / IP binding | Not implemented. |
| Account deletion cascade | Support ticket only. Design doc exists. |
| Staging Firebase project | Documented, not created in `.firebaserc`. |
| Backups | None implemented or drilled. |
| Resend domain / production keys | Must be confirmed in Resend + Netlify + Functions. |
| Rules tests in CI | Need `actions/setup-java`. |
| Storage orphans | No garbage collection on entity delete. |
| `/account/*` server gate | Client-only layout. |

### Accepted risks

| Item | Why accepted for now |
|---|---|
| Historical git objects | May still contain old password text, env paths, or filenames. Keys those referred to are revoked or unused. History rewrite is an owner decision. |
| Firebase download-URL tokens | By design they bypass Storage rules. Public branding images use them. Do not put insurance PDFs behind public tokens. |
| Browser `NEXT_PUBLIC_*` Firebase keys | Expected for the client SDK. Restrict by HTTP referrer in Google Cloud. |
| Temporary jose override | Compatibility only; see §16. |
| Admin layout fall-through without Admin SDK | Local-dev convenience; APIs return 503. |

### Not applicable as active product gaps

Payments, subscriptions and team tenancy are **unimplemented features**, not
failed security controls.

---

## 16. Known Compatibility Workaround

### Firebase Admin / jwks-rsa / jose on Netlify AWS Lambda

**Symptom (before the fix):** every Route Handler that imported Firebase Admin
returned HTTP 500:

```
ERR_REQUIRE_ESM
require() of ES Module .../jose/dist/webapi/index.js
from .../jwks-rsa/src/utils.js
```

**Chain:** `firebase-admin@14.2.0` → `jwks-rsa@4.1.0` (CommonJS
`require('jose')`) → `jose@6` (ESM-only).

Auth0 designed jwks-rsa 4 to use Node’s `require(esm)` on stock
Node 20.19+ / 22.12+. AWS Lambda `nodejs22.x` disables that feature
(`--no-experimental-require-module`). Pinning `NODE_VERSION` /
`AWS_LAMBDA_JS_RUNTIME` alone does **not** fix it.

**Current workaround** (root `package.json`):

```json
"overrides": {
  "jwks-rsa": {
    "jose": "4.15.9"
  }
}
```

jose 4.15.9 ships a CommonJS build (`exports.require`). Firebase Admin’s
JWKS path uses `importJWK` / `exportSPKI`, which exist on that release.
This is the consumer workaround endorsed on
[firebase-admin-node#3181](https://github.com/firebase/firebase-admin-node/issues/3181)
until Auth0 ships [node-jwks-rsa#508](https://github.com/auth0/node-jwks-rsa/pull/508)
(or firebase-admin stops depending on jwks-rsa 4 + jose 6).

**Do not** bundle `firebase-admin` (it is on Next’s default
`serverExternalPackages` list). `next.config.ts` lists `firebase-admin` only.

**When to remove the override**

1. Upstream jwks-rsa loads jose via dynamic `import()` (or firebase-admin
   no longer uses that CJS `require('jose')` path).
2. Rebuild and confirm locally: `npm ls firebase-admin jwks-rsa jose`.
3. Deploy to Netlify and confirm `/api/health` = 200 and
   `POST /api/session` with a garbage token = 401, with **no**
   `ERR_REQUIRE_ESM` in function logs.

Until then, keep the override.

`functions/` is a separate lockfile on Node 20 (Cloud Functions). It is not
the Netlify Lambda handler. Do not assume the override is applied there
unless you add it.

---

## 17. Known Limitations

- No real payments or subscription lifecycle. Checkout persists **in process
  memory** and sets `paymentActive: false`.
- Team / Business multi-tenancy is not built (prices exist only).
- Account deletion is a support email, not a cascade. Public pages stay up
  until a human unpublishes.
- No self-service data export.
- `/privacy`, `/terms`, `/cookies` are drafts. No cookie-consent banner.
- No production backup / restore runbook.
- No chip UID / badge entity.
- DE / ES / FR translation files exist but are hidden (~35% coverage). UI
  languages: IT, EN.
- Functions region is `us-central1`, not EU.
- Email deep links still mention `/dashboard/*`, which is not a route.
- Two pricing systems: `src/config/pricing.ts` vs Firestore `plans`.
- No E2E tests.
- Functions `lint` script is broken under ESLint 9 (eslint not installed there).
- Large account pages; 11 lint warnings (`exhaustive-deps`, unused imports).

---

## 18. Handover Backlog

### P0 — before broader production rollout

| Title | Why | Area | Done when |
|---|---|---|---|
| Confirm live Firebase rules + Functions match this tree | Git tests do not prove production rules | Firebase CLI | Staging then production `firebase deploy` verified; public publish and found-drone still work |
| Stand up a staging Firebase project | Laptop/CI must not share production data | Firebase + Netlify preview | Separate project in `.firebaserc`; preview env points at it |
| Confirm Resend domain and keys | OTP and found-drone mail otherwise silently skip | Resend + Netlify + Functions | Test OTP and a found-drone email arrive from the branded domain |
| Enable intended Auth providers | Google/phone fail closed if the console is off | Firebase Auth | Email (+ Google if required) sign-in works on staging |
| Fix email CTA paths | Mail points at `/dashboard/*` | Email templates | Links open `/account/…` |
| Add Java + `test:rules` to CI | Rules regressions can merge unseen | GitHub Actions | PR fails if a rule test fails |
| Restrict browser API keys | Public Firebase keys should be HTTP-referrer limited | Google Cloud | Unauthorized hosts rejected |
| Confirm historical Auth password unused | Old `create-admin` password lived in git history | Firebase Auth | That user password rotated or user disabled |

### P1 — production completion

| Title | Why | Area | Done when |
|---|---|---|---|
| Payment provider or explicit “request only” | Checkout is a no-op | Billing | Money moves, or UI states request-only and does not imply payment |
| App Check monitor → enforce | Bots can call Next APIs today | App Check + Route Handlers | Functions clean, then Next verifies tokens |
| HttpOnly-only session | `__dronetag_idt` is JS-readable | Auth | APIs accept only HttpOnly cookie or Bearer |
| Rate-limit OTP / provision / support | Abuse surface | Route Handlers | Documented limits + tests |
| Lawyer-reviewed legal pages | Current texts are drafts | Legal | Counsel sign-off |
| Backup + restore drill | No runbook | Ops | Restore tested on staging |
| Account deletion cascade | GDPR/erasure is manual | Auth + data | Design doc implemented after retention rules |
| Persist checkout if kits are sold | In-memory only today | Orders | Firestore (or provider) record |
| Remove jose override after upstream fix | Temporary compatibility | Dependencies | §16 removal checklist green |

### P2 — product evolution

| Title | Why | Area | Done when |
|---|---|---|---|
| Team/Business tenancy or remove SKUs | Prices without tenancy | Product | Multi-account or SKUs gone |
| Badge / chip UID registry | Logistics if needed | NFC | Entity + admin tooling |
| EU Functions region | Data residency | Functions | Decision recorded and applied |
| DE/ES/FR or keep hidden | Incomplete i18n | i18n | Switcher honest |
| E2E signup → publish → found-drone | No browser tests | QA | One happy-path E2E in CI |
| CSP enforce after soak | Header off by default | Hosting | `CSP_ENFORCE=true` with no console breaks |
| Error monitoring | Logger only | Ops | Provider wired, no PII |

---

## 19. Operational Checklist

First week for a new team:

1. Clone outside iCloud Desktop/Documents. Node 22. `npm ci`.
2. Create **staging** Firebase. Copy `.env.local.example` → `.env.local` with
   staging values + a staging service-account **file outside the repo**.
3. Run the test table in §13. Confirm 166/166 if Java is installed.
4. Deploy staging rules, indexes, functions. Walk `DRONETAG_MANUAL_QA.md`.
5. Confirm Resend on staging.
6. Grant one staging admin with `grant-admin`. Never reuse production keys
   on a laptop.
7. Production: change env only in Netlify UI; **redeploy** after Admin JSON
   changes. Do not commit JSON.
8. Keep the jose override until §16 says otherwise.
9. Do not force-push `main`. Do not rewrite history for old secrets unless
   legal requires it — those keys are already revoked.

---

## 20. Appendix — Key Routes

### Pages

| Path | Auth | Notes |
|---|---|---|
| `/` | Public | Marketing |
| `/login`, `/signup`, `/forgot-password` | Public | |
| `/u/{slug}` | Public | NFC / public card |
| `/pricing`, `/checkout` | Public | No real payment |
| `/privacy`, `/terms`, `/cookies` | Public | Drafts |
| `/account/*` | Client-gated | Profile, drones, operators, certificates, insurance, documents, permits, inbox, support, orders, billing, archive |
| `/admin/*` | Server-gated | Users, drones, verify, reports, support, NFC, plans |

### Route Handlers

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/session` | idToken in body | Set HttpOnly session. 204 if Admin missing. |
| DELETE | `/api/session` | — | Clear cookie |
| GET | `/api/health` | Public | `{ status, version, commit, now }`. 503 if Admin missing. |
| POST | `/api/account/provision` | User | Create/repair users, pilots, slots |
| POST | `/api/account/branding` | User | Upload branding to private Storage |
| POST | `/api/auth/otp/email/send` + `/verify` | User | Email OTP |
| POST | `/api/auth/contact-verification/*` | User | Email/phone verification |
| POST | `/api/entities/operators` | User | Create operator |
| POST | `/api/entities/drones` | User | Create drone + slug |
| POST, DELETE | `/api/entities/drones/[id]/publish` | User | Public snapshot |
| POST | `/api/entities/certificates` + `[id]/pdf` | User | Certificate + file |
| POST | `/api/entities/insurances` + `[id]/pdf` | User | Insurance + file |
| POST | `/api/entities/documents` + `[id]/file` | User | Document + file |
| POST | `/api/entities/authorizations` + `[id]/file` | User | Permit + file |
| GET | `/api/files/proxy` | User | Same-origin PDF stream |
| POST | `/api/pricing/quote` | Public | Recompute amounts from `pricing.ts` |
| POST | `/api/pricing/checkout` | Public | In-memory only |
| POST | `/api/billing/webhook` | Public | No-op provider |
| GET/POST/PATCH/PUT | `/api/support/thread` | User | Caller thread |
| GET | `/api/admin/accounts` | Admin | List users |
| POST | `/api/admin/users` | Admin | Provision user |
| POST | `/api/admin/notify-verification` | Admin | Approval/rejection email |
| GET/POST/PATCH | `/api/admin/support` | Admin | Support desk |
| POST | `/api/admin/resync-public-drones` | Admin | Rebuild snapshots |

### Cloud Functions

| Name | Type | Status |
|---|---|---|
| `submitReport` | Callable | Live found-drone path |
| `bootstrapSlots` | Auth `onCreate` | Live if deployed |
| `createDrone` / `createOperator` / `createCertificate` / `createDocument` / `createInsurance` | Callable | Deprecated; Next.js does not call them |

---

## Feature status matrix

| Module | Status |
|---|---|
| Authentication (email, Google, OTP, reset) | **WORKING / IMPLEMENTED** |
| Profiles / pilots | **WORKING / IMPLEMENTED** |
| Operators | **WORKING / IMPLEMENTED** |
| Drones | **WORKING / IMPLEMENTED** |
| Insurances | **WORKING / IMPLEMENTED** |
| Certificates / documents / permits | **WORKING / IMPLEMENTED** |
| NFC / public profile `/u/{slug}` | **WORKING / IMPLEMENTED** (URL badge; no chip registry) |
| Found-drone flow | **WORKING / IMPLEMENTED** (needs Functions + Resend in the target project) |
| Admin | **WORKING / IMPLEMENTED** |
| Reports inbox | **WORKING / IMPLEMENTED** |
| Support | **WORKING / IMPLEMENTED** |
| Orders UI | **PARTIAL** (legacy docs; checkout does not persist) |
| Payments | **NOT IMPLEMENTED** |
| Subscriptions | **NOT IMPLEMENTED** |
| Teams / business multi-tenancy | **NOT IMPLEMENTED** |
| Email | **PARTIAL** (code complete; domain/keys are ops) |
| Privacy / account deletion | **PARTIAL** (draft legal pages; deletion is manual) |
| Analytics | **PARTIAL** (dev console allow-list; no vendor in production) |
| Staging environment | **NEEDS PRODUCTION COMPLETION** (docs only) |
| Backups | **NOT IMPLEMENTED** |
