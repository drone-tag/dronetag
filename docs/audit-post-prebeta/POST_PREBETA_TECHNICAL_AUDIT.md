# POST-PREBETA TECHNICAL AUDIT

Re-audit of the working tree after the pre-beta pass. **Baseline audit files in
the repo root are unchanged.** Commit baseline: `b72f843`.

## Finding status (security, from `DRONETAG_SECURITY_AUDIT.md`)

| ID | Status | Notes |
|---|---|---|
| SEC-001 hardcoded admin password | **FIXED** | Script no longer embeds a password |
| SEC-002 `.netlify` + `.env.local` | **PARTIALLY FIXED** | Removed from index; history not rewritten |
| SEC-003 `/admin` client-only | **FIXED** | `src/proxy.ts` + server layout |
| SEC-004 App Check unused path | **OPEN** | Still not on Route Handlers |
| SEC-005 No API rate limit | **OPEN** | |
| SEC-006 Storage public read | **FIXED, VERIFIED** (emulator) | Rules rewritten; 16 assertions in `storage.rules.test.ts` pass. **Deploy still required** |
| SEC-007 Public insurance PDF | **FIXED** | Covered by `publicProjection.test.ts`, which does run |
| SEC-008 Client-written snapshot | **FIXED, VERIFIED** (emulator) | Rules deny every client write to `dronesPublic`; 44 assertions in `firestore.rules.test.ts` pass. **Deploy still required** |
| SEC-009 JS-readable ID token cookie | **OPEN** | |
| SEC-010 No admin audit log | **OPEN** | |
| SEC-011 Verify entirely client | **PARTIALLY FIXED** | Email notify added |
| SEC-012 Client `updatedAt` | **OPEN** | |
| SEC-013 Billing webhook unsigned | **NOT APPLICABLE** | Still 501 / noop |
| SEC-014 Anonymous checkout PII | **OPEN** | |
| SEC-015 API vs Functions validation | **PARTIALLY FIXED** | Creates deprecated |
| SEC-016 No schema validation | **PARTIALLY FIXED** | Zod on new routes |
| SEC-017 IP retention | **OPEN** | |
| SEC-018 OTP orphans | **OPEN** | |
| SEC-019 Health leaks security flags | **FIXED** | Payload reduced |
| SEC-020 No cascade delete | **PARTIALLY FIXED** | Request UI + design |

**NEW-CRIT-01** (pdfjs JS execution): **FIXED** in lockfile (`pdfjs-dist@6.3.289`).

## What "FIXED, VERIFIED (emulator)" means — and what it still does not mean

SEC-006 and SEC-008 previously read *FIXED (repo), UNVERIFIED*. The reasoning
for that caveat was sound: a rules fix cannot be confirmed by reading the rules
file, because the semantics of `hasOnly`, `diff()` and path matching are subtle
enough that plausible-looking rules routinely do the opposite of what they read
like. Only the emulator settles it.

The emulator has now settled it. A JDK was installed, `npm run test:rules`
runs, and 60 assertions pass — 44 in `tests/rules/firestore.rules.test.ts`, 16
in `tests/rules/storage.rules.test.ts`. Between them they assert anonymous
read, cross-account read, owner self-verification, slug rewriting, client-side
creation, server-only account provisioning, report and support-message forgery,
the public/private storage namespace split, SVG rejection and the size caps.

Two limits on that claim, both of which keep a caveat attached to the rows:

* It verifies the rules **as they exist in this working tree**. The rules
  deployed to the live Firebase project have not been read and may differ.
  `firebase deploy --only firestore:rules,storage` remains a required manual
  action, and until it runs the production behaviour is unverified.
* It verifies the **rules layer** only. That publishing a drone must go through
  `POST /api/entities/drones/[id]/publish` is asserted, because the rules deny
  the client write; that the route itself authorises correctly is not covered
  by these suites.

SEC-007 stays plainly FIXED, because the projection is ordinary TypeScript and
`tests/unit/publicProjection.test.ts` covers it directly.

## Defect found while verifying: `isAdmin()` raised instead of returning false

Running the suites surfaced a latent problem the rules text does not show. Both
files defined the admin check as `request.auth.token.admin == true`. Reading a
key that is absent from a token map is an **evaluation error** in Firebase
rules, not `false`, so every signed-in account without the custom claim — that
is, nearly every account — raised `EvaluationException` on each such check.

It was not exploitable. `isAdmin()` is only ever used standalone or to the
right of an `||`, so the request was denied either way; the 60 assertions pass
both before and after the change. What it cost was noise in the production
rules log on every non-admin request, and a trap for the next edit: placing
`isAdmin()` to the *left* of an `||` would have converted the error into the
denial of a legitimate request. Both helpers now use
`request.auth.token.get('admin', false) == true`, after which the suites still
report 60 passing and the emulator logs zero evaluation errors.

## Readiness (recalculated, not inflated)

See `POST_PREBETA_PRODUCT_READINESS.md`.

- Beta: **34 → 69 → 73** (rules suites executed)
- Production: **21 → 36 → 36** (no production blocker was closed)

## Confirmation

No production deploy. No Firebase Console mutation. No real-user data changed.
No `.env.local` created. The one production build performed used obviously fake
placeholder `NEXT_PUBLIC_FIREBASE_*` values supplied inline for a single
command.
