# DroneTag — Staging Environment Setup

This guide explains how to stand up a staging environment for DroneTag from
nothing. It assumes you have never seen this project before.

**Scope and honesty notes.** Everything below was verified against the code in
this repository at the time of writing. Where a claim could not be verified from
the code, it is called out explicitly rather than guessed at. This document does
not assert that the resulting environment is production-ready, nor that it is
GDPR compliant; it describes how to get a working staging deployment and nothing
more. No step here has been executed against a real Firebase project by the
author of this document — every external action is marked **MANUAL ACTION
REQUIRED** and must be carried out by a human with console access.

There is an older `docs/DEPLOY_STAGING.md` in this repository. It is partly
stale: it references an environment variable called
`NEXT_PUBLIC_APP_CHECK_SITE_KEY` that does not exist anywhere in the code, and a
session cookie named `__session` that is actually called `__dronetag_session`.
Prefer the variable table in this document, which was produced by searching the
source tree.

---

## 1. The three environments

DroneTag does not have an environment-name variable. There is no `APP_ENV` or
`ENVIRONMENT` switch anywhere in the code. Which environment you are in is a
consequence of **which environment variables are set**, and the single most
important consequence is a flag called `DEMO_MODE`.

`DEMO_MODE` is computed in `src/lib/firebase/config.ts`:

```18:34:src/lib/firebase/config.ts
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '';
// ...
export const DEMO_MODE = !apiKey || !projectId;
```

When `DEMO_MODE` is true, the Firebase SDK is never initialised and the whole
data layer is served from an in-memory mock store under `src/lib/demo/`. Every
data module (`src/lib/firebase/drones.ts`, `certificates.ts`, `documents.ts`,
and so on) begins its functions with an `if (DEMO_MODE) return demo.…` branch.
Critically, `src/contexts/AuthContext.tsx` also resolves the admin flag from a
hardcoded demo persona rather than from a Firebase custom claim, which means
that in demo mode the signed-in user can be an administrator without any
server-side check.

**Development.** You run `npm run dev` with no Firebase variables set. The app
boots in `DEMO_MODE` against the in-memory store.

There is an important correction to make here, because other project documents
imply otherwise: **the application does not connect to the Firebase emulators.**
There is no `connectFirestoreEmulator`, `connectAuthEmulator`,
`connectStorageEmulator` or `connectFunctionsEmulator` call anywhere in `src/`,
and `firebase.json` has no `emulators` block. The emulator is used by exactly
one thing in this repository — the security-rules test suite described in
section 5 — and nothing else. Local development against real data therefore
means pointing `.env.local` at a real Firebase project, which in practice should
be the staging project, never production.

**Staging.** A separate Firebase project with its own credentials, deployed to
its own host URL. `DEMO_MODE` is false. This is what the rest of this document
sets up.

**Production.** Structurally identical to staging but a different Firebase
project and different secrets. The only behavioural difference the code makes
between the two is via `NODE_ENV`, which the framework sets, not you. `NODE_ENV`
being `production` affects the default log level in `src/lib/server/logger.ts`
(`info` rather than `debug`), suppresses the development OTP code echo in
`src/lib/server/otp.ts`, and activates the build-time guard described next.

### The build-time guard

`next.config.ts` refuses to complete a production build if
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` or
`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is missing. This exists precisely so that a
misconfigured deploy cannot silently ship a `DEMO_MODE` bundle in which every
visitor is an admin. There is a matching runtime guard in
`src/lib/firebase/config.ts` that throws if a `DEMO_MODE` bundle is ever loaded
in a browser over HTTPS on a non-localhost hostname.

If your staging build fails with `[next.config] Production build refused`, this
guard is what you have hit, and the fix is to set the missing variable rather
than to remove the guard.

---

## 2. Environment variables

These were collected by searching for `process.env.` across `src/`,
`functions/`, `scripts/` and `next.config.ts`. Variables that the runtime or the
host sets for you (`NODE_ENV`, `VERCEL_GIT_COMMIT_SHA`, `GITHUB_SHA`) are listed
at the end for completeness but are not things you configure by hand.

There is an existing `.env.local.example` in the repository root. It is broadly
accurate and is a good starting point, but it does not list every variable
below.

### 2.1 Public variables

Anything prefixed `NEXT_PUBLIC_` is inlined into the JavaScript bundle at build
time and is readable by anyone who visits the site. Do not put a secret behind
this prefix. Because the substitution happens at build time, changing one of
these on the host requires a rebuild, not just a restart.

| Variable | Where it is used | Effect if missing |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `src/lib/firebase/config.ts`; required by `next.config.ts`; used by the seed/backfill scripts | `DEMO_MODE` turns on and the production build is refused. This is the single most important variable. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `src/lib/firebase/config.ts`; required by `next.config.ts`; seed scripts | `DEMO_MODE` turns on and the production build is refused. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `src/lib/firebase/config.ts`; required by `next.config.ts`; seed scripts | The production build is refused. It does not trigger `DEMO_MODE`, but Google sign-in cannot complete without it. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `src/lib/firebase/config.ts` and, server-side, `src/lib/server/storage.ts` | Client uploads are misconfigured. Server-side uploads fall back to the Admin SDK's default bucket, which this codebase never configures (`initializeApp` is called with only a `credential`), so PDF and image uploads fail. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `src/lib/firebase/config.ts`; seed scripts | Passed to the SDK as an empty string. Not in the build guard's required list. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `src/lib/firebase/config.ts`; seed scripts | Passed to the SDK as an empty string. App Check registration is tied to the app ID, so leave it set. |
| `NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION` | `src/lib/firebase/config.ts` | Defaults to `us-central1`, which already matches the region hardcoded by `setGlobalOptions` in `functions/src/index.ts`. Leave it unset unless you change both together; a mismatch makes every callable fail to resolve. |
| `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` | `src/lib/firebase/config.ts` | App Check is not initialised. Preferred over the v3 key when both are present. |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | `src/lib/firebase/config.ts` | Fallback App Check provider. If neither key is set, App Check initialisation is skipped silently and callables will be rejected once enforcement is on. |
| `NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN` | `src/lib/firebase/config.ts` | Local development only. Without it, a developer machine cannot pass App Check enforcement. Never set this on a deployed environment. |
| `NEXT_PUBLIC_TRUSTED_PDF_HOSTS` | `next.config.ts` (CSP and `images.remotePatterns`) and `src/lib/utils/urlAllowlist.ts` | Only the two Firebase Storage hostnames are allowed. Comma-separated hostnames, no protocol. Optional. |
| `NEXT_PUBLIC_ALLOW_SIGNUP` | `src/lib/config/features.ts` | Public signup stays enabled. Only the exact string `false` disables it. |
| `NEXT_PUBLIC_APP_URL` | `src/lib/server/email/notifications.ts` | Links in notification emails fall back to `https://drone-tag.com`, which on staging means emails point at production. Set this. |
| `NEXT_PUBLIC_GIT_COMMIT_SHA` | `src/lib/server/buildInfo.ts` | The `commit` field of `/api/health` is empty. Cosmetic. |

### 2.2 Server-side variables

These are read only on the server and are never bundled. Set them in the host's
environment variable UI, not in `netlify.toml`.

| Variable | Secret? | Where it is used | Effect if missing |
|---|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | **Yes — highly sensitive** | `src/lib/server/firebaseAdmin.ts`, `scripts/create-admin.ts`, `scripts/grant-admin.ts`, `scripts/backfill-slots-permit-archive.ts` | The Admin SDK is unconfigured. `/api/health` returns HTTP 503 with `status: "degraded"`, `/api/session` returns 204 without setting the HttpOnly cookie, and all server-side entity routes fail. Expects the whole service-account JSON on one line. |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Yes (path to a secret) | `src/lib/server/firebaseAdmin.ts` | Alternative to the above, for local development where you can keep the JSON file on disk outside the repo. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes (path to a secret) | `src/lib/server/firebaseAdmin.ts` | Last-resort Application Default Credentials path. Useful on Google-hosted runtimes. |
| `RESEND_API_KEY` | **Yes** | `src/lib/server/email/client.ts`, `src/lib/server/otp.ts`, `functions/src/notify-owner.ts` | Email is skipped rather than failed. See section 6 — this degradation is intentional, but it does mean signup OTP delivery does not work. |
| `OTP_EMAIL_FROM` | No | `src/lib/server/email/client.ts`, `src/lib/server/otp.ts`, `functions/src/notify-owner.ts` | Defaults to `DroneTag <noreply@drone-tag.com>`. On staging this default is wrong, because that domain belongs to production. |
| `APP_CHECK_ENFORCE` | No | `functions/src/util.ts`, `src/app/api/health/route.ts` | **Defaults to `true`.** This is a fail-closed default: if you have not finished wiring App Check, callables will reject requests. Set it explicitly to `false` while you are in monitor mode. |
| `CSP_ENFORCE` | No | `next.config.ts`, `src/app/api/health/route.ts` | No `Content-Security-Policy` header is sent at all. Note this is not report-only — the header is simply omitted unless the value is exactly `true`. The other security headers are always sent. |
| `TRUSTED_PDF_HOSTS` | No | `src/lib/server/urls.ts` and `functions/src/util.ts` | Only the two Firebase Storage hostnames are accepted for user-supplied file URLs. Must be kept in sync by hand with `NEXT_PUBLIC_TRUSTED_PDF_HOSTS`. |
| `LOG_LEVEL` | No | `src/lib/server/logger.ts` | Defaults to `info` when `NODE_ENV=production`, `debug` otherwise. Accepts `debug`, `info`, `warn`, `error`. |
| `APP_URL` | No | `functions/src/notify-owner.ts` | Falls back to `https://drone-tag.com`. This is the Cloud Functions runtime's own variable and is separate from `NEXT_PUBLIC_APP_URL`; both must be set, in two different places. |

### 2.3 Script-only variables

Used by the one-off scripts in `scripts/`, which load `.env.local` via
`tsx --env-file=.env.local`. They are never needed by the deployed app.

| Variable | Secret? | Where it is used | Effect if missing |
|---|---|---|---|
| `SEED_AUTH_EMAIL` | No | `scripts/seed-minimal-profile.ts`, `seed-multientity.ts`, `migrate-profiles-to-entities.ts`, `backfill-drones-public.ts`, `upload-qr.ts` | The script cannot sign in and exits. These scripts authenticate as an existing user through the client SDK. |
| `SEED_AUTH_PASSWORD` | **Yes** | Same as above | Same as above. Never commit this. |
| `ADMIN_BOOTSTRAP_EMAIL` | No | `scripts/create-admin.ts` | Only a convenience; you can pass the email as a command-line argument instead. |

### 2.4 Set for you by the platform

`NODE_ENV` (set by Next.js and by the test runner), `VERCEL_GIT_COMMIT_SHA` and
`GITHUB_SHA` (injected by the respective CI platform, read by
`src/lib/server/buildInfo.ts` to populate the commit in `/api/health`).

---

## 3. MANUAL ACTION REQUIRED — create the staging Firebase project

Every step in this section happens in the Firebase and Google Cloud consoles.
None of it can be done from this repository, and none of it has been done for
you.

1. **Create the project.** In the Firebase console, create a new project — for
   example `dronetag-staging`. It must be a genuinely separate project from
   production, not another app inside the production project, so that a mistake
   on staging cannot touch production data.

2. **Register a Web app** inside that project and copy the SDK configuration
   snippet. Those six values become the `NEXT_PUBLIC_FIREBASE_*` variables in
   section 2.1.

3. **Enable Authentication providers.** The code uses exactly three, and you
   should enable exactly three:

   - *Email/Password* — `createUserWithEmailAndPassword` and
     `signInWithEmailAndPassword` in `src/lib/firebase/auth.ts`. This also
     covers the password-reset flow (`sendPasswordResetEmail`), which the
     `/forgot-password` page and `scripts/create-admin.ts` both depend on.
   - *Google* — `signInWithPopup` with a `GoogleAuthProvider`, same file.
   - *Phone* — `src/lib/firebase/phoneAuth.ts`. Note that phone is **not** a
     sign-in method here: it is used by `SignupOtpVerification.tsx` to link a
     phone credential to an already signed-in account for contact verification.
     It relies on Firebase's own invisible reCAPTCHA verifier.

   Add your staging hostname to the list of authorised domains under
   Authentication → Settings, otherwise Google sign-in will be rejected.

4. **Create the Firestore database** in Native mode. Choose a region close to
   your users and be aware that the region cannot be changed later.

5. **Create the default Cloud Storage bucket.** Its name becomes
   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`.

6. **Enable Cloud Functions.** This requires the Blaze (pay-as-you-go) billing
   plan even for a staging project that stays within the free tier. Set a low
   budget alert. The functions in `functions/src/` are callables —
   `submitReport`, `createDrone`, `createOperator`, `createCertificate`,
   `createDocument`, `createInsurance` and `bootstrapSlots`.

7. **Register App Check.** Create either a reCAPTCHA Enterprise key
   (preferred) or a reCAPTCHA v3 key, register the web app against it, and add
   your staging hostname to the key's allowed domains. Then set the
   corresponding `NEXT_PUBLIC_RECAPTCHA_*` variable.

   Be careful with the enforcement sequencing. `APP_CHECK_ENFORCE` defaults to
   `true` in `functions/src/util.ts`, so the Cloud Functions will start
   rejecting calls as soon as they are deployed unless a valid App Check token
   is arriving. Set `APP_CHECK_ENFORCE=false` while you confirm in the console
   that tokens are being produced, then flip it to `true`.

8. **Generate a service-account key** under Project settings → Service accounts.
   Store it in a password manager. It becomes
   `FIREBASE_SERVICE_ACCOUNT_KEY`, flattened to a single line — `jq -c
   < service-account.json` will do that. Never commit it, and never reuse the
   production key on staging.

### Project aliases

`.firebaserc` currently pins a single project:

```1:5:.firebaserc
{
  "projects": {
    "default": "dronetag-e905d"
  }
}
```

A `.firebaserc.example` file now sits alongside it showing the structure with
placeholder ids and a `staging` alias. Copy it over your local `.firebaserc`, or
add the alias with the CLI:

```bash
firebase use --add        # select the staging project, name the alias "staging"
firebase use staging      # switch to it
```

Always run `firebase use` and check the output before any deploy command. The
Firebase CLI is not a project dependency; install it globally with
`npm i -g firebase-tools`.

---

## 4. Deploying the security rules to staging

The rules files are `firestore.rules` and `storage.rules` in the repository
root, wired up by `firebase.json`. Deploy them explicitly and separately from
anything else:

```bash
firebase use staging
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

Deploy the Firestore indexes too, since queries that need a composite index will
fail without them:

```bash
firebase deploy --only firestore:indexes
```

The Cloud Functions are a separate npm package and are built before deploy by
the `predeploy` hook in `firebase.json`:

```bash
firebase deploy --only functions
```

If a rules deploy fails, stop and fix it before deploying functions. The
functions assume the rules that ship alongside them.

---

## 5. Running the security-rules test suite

The rules have their own test suite in `tests/rules/`, which is deliberately
excluded from the normal `npm test` run because it needs the Firebase emulator.

```bash
npm run test:rules
```

That script expands to `firebase emulators:exec --only firestore,storage
"vitest run --config vitest.rules.config.mts"`. It runs entirely against the
local emulator and never touches a real project, so it is safe to run at any
time.

**Prerequisite: Java must be installed, and you must install it yourself.** The
Firestore and Storage emulators are Java programs. This is a genuine blocker
rather than a warning — on a machine without a Java runtime the command fails
immediately, before any test executes. Verified on the development machine used
to write this document, where the exact output was:

```
Error: Process `java -version` has exited with code 1. Please make sure Java is
installed and on your system PATH.
```

**MANUAL ACTION REQUIRED:** install a JDK (any recent LTS, for example
Temurin 21) and confirm that `java -version` succeeds before running the suite.

Because Java is not installed on that machine, **the rules test suite has not
been executed and this document makes no claim about whether it passes.** The
other suites were run and did pass: `npm test` reported 106 tests across 6 files
passing, and `npx tsc --noEmit` completed with no errors.

There are now two files under `tests/rules/`, and neither has ever run:

| File | Guards |
|---|---|
| `storage.rules.test.ts` | SEC-006 — private files owner-or-admin, public namespace images-only, size caps |
| `firestore.rules.test.ts` | SEC-004/SEC-008 — `dronesPublic` denied to clients, the owner publish/unpublish carve-out on locked drones, server-only account provisioning, report and support-message forgery |

The Firestore file was added later than the Storage one and, like it, was
written without ever being executed. Budget time for the first run to fail on a
seeded field or an over-strict assertion rather than on a real rules defect.
Read a first-run failure as "this test needs a look", not as "the rules are
broken", until you have checked which.

The CI workflow in `.github/workflows/ci.yml` does not run this suite, for the
same reason — it would need a Java toolchain installed on the runner. Adding
that is a reasonable improvement and is noted in the workflow comments.

---

## 6. Resend (transactional email)

All outbound email goes through Resend over plain HTTPS; there is no SDK
dependency. Three call sites exist: `src/lib/server/email/client.ts` (the shared
client used for document-approval and similar notifications),
`src/lib/server/otp.ts` (the signup email OTP) and
`functions/src/notify-owner.ts` (the "someone found your drone" email, which
lives in the functions package because it cannot import from `src/`).

**MANUAL ACTION REQUIRED:**

1. Create a Resend account and verify a sending domain. A staging environment
   should use its own subdomain, for example `mail-staging.example.com`, so that
   staging traffic cannot damage the production domain's sending reputation.
2. Create an API key and set it as `RESEND_API_KEY` on the host, and in the
   Cloud Functions runtime configuration as well — the functions package reads
   its own copy of the variable.
3. Set `OTP_EMAIL_FROM` to an address on the verified domain, in the format
   `DroneTag Staging <noreply@mail-staging.example.com>`. If you leave it unset
   it falls back to `DroneTag <noreply@drone-tag.com>`, which is the production
   domain and will not be verified for your staging key.

### The "skipped" degradation is intentional

With no `RESEND_API_KEY` configured, `sendEmail` in
`src/lib/server/email/client.ts` returns `{ status: 'skipped', reason:
'email_not_configured' }` and logs an `email.skipped` event. It does not throw.
`notifyOwnerOfReport` in the functions package behaves the same way, logging
`[notifyOwner] skipped: no RESEND_API_KEY configured`.

This is a deliberate design decision, documented in the source: every email in
this product is a side effect of an action that has already succeeded, so
failing the whole operation because a notification bounced would destroy real
work in order to report a cosmetic problem. The `skipped` status exists
specifically to keep that case distinguishable from a genuine delivery failure
in the logs.

The one place where this is not merely cosmetic is signup. `sendEmailOtp` in
`src/lib/server/otp.ts` throws `otp_email_delivery_failed` when delivery does not
happen — except when `NODE_ENV` is `development`, in which case it logs the code
to the server console and returns it as `devCode` so a developer can complete
the flow without a mail provider. On a staging deployment `NODE_ENV` is
`production`, so **signup by email OTP will not work on staging until
`RESEND_API_KEY` is set.**

---

## 7. Netlify configuration

The repository already targets Netlify. The current `netlify.toml` is minimal:

```1:8:netlify.toml
[build]
  command = "npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
```

Netlify distinguishes three deploy contexts: `production` (your production
branch), `branch-deploy` (any other tracked branch) and `deploy-preview` (pull
requests). A reasonable staging model is to treat a long-lived `staging` branch
as a branch deploy.

Below is a template you can extend `netlify.toml` with. It contains only
non-secret toggles by design — `netlify.toml` is committed to git, so every
secret and every `NEXT_PUBLIC_FIREBASE_*` value must be set in the Netlify UI
under Site configuration → Environment variables, scoped to the appropriate
context, and never written into this file.

```toml
# Production context: the production branch only.
[context.production.environment]
  APP_CHECK_ENFORCE = "true"
  CSP_ENFORCE = "true"
  LOG_LEVEL = "info"

# Branch deploys — used here for the long-lived `staging` branch.
[context.branch-deploy.environment]
  APP_CHECK_ENFORCE = "false"   # flip to "true" once App Check tokens are observed
  CSP_ENFORCE = "false"
  LOG_LEVEL = "debug"

# Per-branch overrides are also possible, e.g. only the `staging` branch:
[context.staging.environment]
  NEXT_PUBLIC_ALLOW_SIGNUP = "true"

# Pull-request previews.
[context.deploy-preview.environment]
  APP_CHECK_ENFORCE = "false"
  CSP_ENFORCE = "false"
```

Two practical points. First, `NEXT_PUBLIC_*` variables are baked in at build
time, so changing one requires triggering a rebuild rather than restarting the
site. Second, `FIREBASE_SERVICE_ACCOUNT_KEY` must be pasted as single-line JSON
and marked as a secret value in the Netlify UI.

This template has not been applied to a live Netlify site, because that
requires console access. The syntax follows Netlify's documented context model,
but treat it as a starting point to validate rather than a tested
configuration.

---

## 8. Seeding and bootstrapping

All scripts in `scripts/` are run through `tsx` and read `.env.local`. Note that
`scripts/README.md` is stale on one point: it says `scripts/create-admin.ts` was
deleted, but the file exists and has been rewritten.

### Creating the first administrator

Admin access is driven entirely by a Firebase custom claim, `admin: true`.
There is no admin flag in Firestore and no hardcoded admin list.

```bash
npm run create-admin -- someone@example.com
```

`scripts/create-admin.ts` promotes an existing Auth user, or creates one if the
email is not registered yet. It is worth understanding what it does and does not
do, because an earlier version of this file was a security problem:

- It **does not** contain or set any known password. If it has to create the
  user, it generates a random 48-byte password in memory purely to satisfy the
  Auth API, never logs it, and discards it.
- It sets the `admin: true` custom claim, merging with any existing claims.
- It calls `revokeRefreshTokens`, so sessions minted before the change are
  invalidated.
- It prints a **one-time password-reset link** to stdout. The operator uses that
  link to choose their own password. Treat that link as a credential: do not
  paste it into a ticket or a chat channel.

Once a user already exists, `npm run grant-admin -- <email>` is the better tool,
and it supports `--revoke`.

Both scripts need `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env.local`, or
Application Default Credentials via `gcloud auth application-default login`.

### Other scripts

The remaining scripts are one-off migrations and seeders. Most of them
authenticate as an existing user through the client SDK using `SEED_AUTH_EMAIL`
and `SEED_AUTH_PASSWORD`, which means they are subject to the same security
rules as a normal user; the two that use the Admin SDK instead are marked in the
table below.

> **Warning about `scripts/seed-caffagni.ts`.** Unlike every other script, it
> does not read its configuration from the environment at all. It hardcodes a
> Firebase web config for the project `dronetag-e905d` — the project currently
> named as `default` in `.firebaserc` — directly in the source file. Running it
> on a machine configured for staging would still write to that hardcoded
> project. It also reads PDFs from an absolute path inside one specific
> developer's home directory, so it cannot work anywhere else without editing.
> Do not run it as part of staging setup.

| Script | Purpose |
|---|---|
| `scripts/grant-admin.ts` | Grant or revoke the `admin` custom claim. Uses the Admin SDK. |
| `scripts/seed-minimal-profile.ts` | Create a small public profile so `/u/<slug>` can be smoke-tested. |
| `scripts/seed-multientity.ts` | Seed one demo user with the full multi-entity data model. |
| `scripts/seed-caffagni.ts` | A named-customer seed script. **Hardcodes the `dronetag-e905d` project config and a developer-specific absolute file path. Ignores your environment entirely. Do not run it.** |
| `scripts/migrate-profiles-to-entities.ts` | Idempotent migration of the legacy `profiles/*` collection into the current collections. |
| `scripts/backfill-drones-public.ts` | Populate the `dronesPublic/{slug}` public projection documents for drones that already exist. |
| `scripts/backfill-slots-permit-archive.ts` | Backfill the `permit` and `archive` slot fields. Supports `--dry-run`; use it first. Uses the Admin SDK. |
| `scripts/upload-qr.ts` | Upload a QR PNG and attach it to a legacy profile. |
| `scripts/stage-vendor-assets.mjs` | Not a seeding script. Runs automatically on install, dev and build to copy the pdf.js and tesseract.js assets from `node_modules` into `public/vendor/`. You never run it by hand. |
| `scripts/add-i18n-keys.mjs` | Developer utility, unrelated to staging. Appends translation keys to all five language files at once so the typed `TranslationKey` union stays complete. |

A sensible bootstrap order on a fresh staging project is: deploy rules, indexes
and functions; create the first admin with `create-admin`; sign in through the
UI and set a password via the emitted reset link; then optionally run a seed
script to get some data on screen.

---

## 9. Verifying the deployment

Hit the health endpoint, which is public and exposes no secrets:

```bash
curl -sS https://<your-staging-host>/api/health
```

It returns HTTP 200 with `"status": "ok"` when the Admin SDK has credentials,
and HTTP 503 with `"status": "degraded"` when it does not. The response also
reports `security.appCheckEnforce` and `security.cspMode`, where `cspMode` is
either `enforce` or `disabled` — there is no report-only mode in the current
code, despite what older documents suggest.

A 503 here almost always means `FIREBASE_SERVICE_ACCOUNT_KEY` is missing or is
not valid JSON.

Then check in a browser that the app is not in demo mode. If `DEMO_MODE` were
active on an HTTPS host, `src/lib/firebase/config.ts` would throw on load, so a
page that renders at all is already evidence the Firebase variables arrived.

---

## 10. MANUAL ACTION REQUIRED — summary

Everything a human must do outside this repository, collected in one place.
None of it has been done.

**Firebase console**

1. Create a staging Firebase project, separate from production.
2. Register a Web app and copy the six SDK config values.
3. Enable the Email/Password, Google and Phone authentication providers.
4. Add the staging hostname to Authentication → Settings → Authorised domains.
5. Create the Firestore database in Native mode and choose a region.
6. Create the default Cloud Storage bucket.
7. Upgrade the project to the Blaze plan so Cloud Functions can be deployed, and
   set a budget alert.
8. Register an App Check provider (reCAPTCHA Enterprise or v3) and add the
   staging hostname to the key's allowed domains.
9. Generate a service-account key, store it in a password manager, and flatten
   it to one line.

**Developer workstation**

10. Install a Java runtime so the Firebase emulators can start. Without it,
    `npm run test:rules` cannot run at all.
11. Install the Firebase CLI globally (`npm i -g firebase-tools`); it is not a
    project dependency.
12. Add a `staging` alias to `.firebaserc` (see `.firebaserc.example`) and
    confirm with `firebase use` before every deploy.

**Resend**

13. Create the account, verify a dedicated staging sending domain, and issue an
    API key.
14. Set `RESEND_API_KEY` and `OTP_EMAIL_FROM` on the web host *and* in the Cloud
    Functions runtime configuration — these are two separate places.

**Netlify**

15. Create the staging site and connect it to the `staging` branch.
16. Enter every variable from section 2 in the Netlify UI, scoped to the correct
    deploy context. Nothing secret goes into `netlify.toml`.
17. Mark `FIREBASE_SERVICE_ACCOUNT_KEY` and `RESEND_API_KEY` as secret values.

**Sequencing note**

18. Deploy with `APP_CHECK_ENFORCE=false`, confirm in the App Check dashboard
    that valid tokens are arriving, and only then set it to `true`. The code
    defaults to `true`, so an unset variable is the enforcing configuration.

---

## 11. Things this document could not verify

Stated plainly, so that nobody mistakes these for tested facts.

- **The rules test suite has not been run.** Java is not installed on the
  machine used to write this document. Whether `tests/rules/` passes against the
  current `firestore.rules` and `storage.rules` is unknown.
- **No deployment was performed.** No Firebase project was created or modified,
  no rules were deployed, and no Netlify site was configured. Every console
  instruction here is derived from the code and from Firebase's documented
  behaviour, not from having executed it.
- **The Netlify context template is unvalidated.** It has not been applied to a
  real site.
- **Firestore and Storage region choices are not prescribed** because the code
  does not depend on them. The Cloud Functions region is a different matter and
  is not free to choose: `functions/src/index.ts` hardcodes `us-central1` in
  `setGlobalOptions`, and the client defaults to the same value, so the two are
  consistent today. Whether `us-central1` is the right region for this
  product's users is a product decision that has not been made here.
- **`scripts/seed-caffagni.ts` was only skim-read.** Enough of it was read to
  establish that it hardcodes the `dronetag-e905d` Firebase config and a local
  absolute path, but its full behaviour was not audited. Whether
  `dronetag-e905d` is the production project or an old development one was not
  confirmed; `.firebaserc` lists it as `default`.
- **Node version is inconsistent within the repository.** `.nvmrc` specifies 22,
  while `package.json` engines requires `>=20.9.0`, `netlify.toml` pins
  `NODE_VERSION = "20"`, and `firebase.json` runs the functions on `nodejs20`.
  The CI workflow uses 20 to match the deploy targets. Which one is intended has
  not been established.
