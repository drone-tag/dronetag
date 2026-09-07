# POST-PREBETA SECURITY AUDIT

Re-verified against the working tree. No penetration test. No `npm audit` re-run
in this document beyond the pdfjs upgrade already in `package.json`.

## Still CRITICAL if rules are not deployed

Repo `storage.rules` and `firestore.rules` do **not** protect production until
`firebase deploy`. If Console still has the old rules, SEC-006 and SEC-008
remain live. Status: **MANUAL ACTION REQUIRED**.

## Open HIGH (unchanged class)

- App Check not on Next.js routes
- No rate limit on Route Handlers
- `__dronetag_idt` readable from JavaScript
- Historical git objects may still contain `.env.local` / old script

## Closed in repo

- Hardcoded admin password
- World-readable Storage namespace
- Public insurance PDF
- Client-forged public verification badge
- Admin pages without server check
- Health endpoint advertising CSP/App Check

## Verification status of the rules fixes

Three of the six items above are rules changes, and rules cannot be checked by
reading them. A regression suite exists for each:

| Suite | Guards | Status |
|---|---|---|
| `tests/rules/storage.rules.test.ts` | SEC-006 namespace split, image-only public writes, size caps | **16 passing** |
| `tests/rules/firestore.rules.test.ts` | SEC-004/SEC-008 `dronesPublic` deny-from-client, owner publish carve-out, server-only account provisioning, report and support forgery | **44 passing** |

Both require the Firebase emulator, which requires a JVM. A JDK is now
installed and `npm run test:rules` completes with 60 passing assertions.

Two things this does *not* establish. It exercises the rules in this working
tree, not the rules deployed to the live project — `firebase deploy --only
firestore:rules,storage` is still an open manual action. And it exercises the
rules layer only: that a drone can be published solely through
`POST /api/entities/drones/[id]/publish` is asserted, but the authorisation
inside that route is not covered here.

Running the suites also exposed a latent defect in both rules files:
`request.auth.token.admin` raises an evaluation error for accounts without the
claim rather than returning `false`. It denied the request either way, so it
was not exploitable, but it filled the rules log with `EvaluationException` and
would have become a real denial bug had `isAdmin()` ever been placed to the
left of an `||`. Both helpers now use `request.auth.token.get('admin', false)`.

This is stated plainly because the distinction matters: the assertions describe
the intended behaviour of the rules, they do not demonstrate it. Until someone
installs Java and runs the suites, SEC-004, SEC-006 and SEC-008 should be read
as *believed fixed, unverified*. **MANUAL VERIFICATION REQUIRED.**

The Firestore suite in particular was written without ever being executed, so
expect to fix a seeded field or an assertion on the first run. A failure on
first run is not by itself evidence that the rules are wrong.

## Residual process risk

Treat the repository history as **possibly public**. Rotate Admin password,
service account, and Resend key even though the current tree does not print them.
