# POST-PREBETA FINAL VERIFICATION

Verification round run on 2026-09-07, after the pre-beta pass. No feature work,
no deploy, no change to any real Firebase project, no commit.

Commit baseline: `b72f843` on `main`, working tree uncommitted.

## Result matrix

| CHECK | RESULT | NOTES |
|---|---|---|
| TypeScript | **PASS** | `npx tsc --noEmit`, no diagnostics |
| Functions | **PASS** | `cd functions && npm run build` (tsc), no errors |
| Unit tests | **PASS** | `npm test` — 106 passed / 106, 6 files, 0 failed |
| Firestore rules | **PASS** | `tests/rules/firestore.rules.test.ts` — 44 passed / 44 |
| Storage rules | **PASS** | `tests/rules/storage.rules.test.ts` — 16 passed / 16 |
| Lint | **PASS** | `npm run lint` — 0 errors, 11 warnings (exit 0) |
| Production build | **PASS** | `npm run build` — compiled, 38 static pages, proxy middleware emitted |

Totals: **166 tests executed, 166 passed, 0 failed.**

The rules suites were run three additional times back to back and reported
60/60 each time, so the result is deterministic rather than a first-run fluke.

The build needs `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
and `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — `next.config.ts` refuses to build
without them, because a build that lacks them silently enables `DEMO_MODE` and
treats every signed-in visitor as an administrator. Obviously fake placeholders
were supplied inline for one command, matching what `.github/workflows/ci.yml`
already does. No `.env.local` was created and no Firebase project was contacted.

## Environment changes

Two prerequisites were unmet at the start of the round and both were fixed.

**The repository was still under iCloud sync.** It sat at `~/Desktop/dronetag`,
and `~/Library/Mobile Documents/com~apple~CloudDocs/Desktop` is a symlink to
`~/Desktop` — the signature of "Desktop & Documents Folders" being enabled. That
is the cause of the `"<name> 2"` duplicates that had been breaking `tsc`
throughout the previous pass. `node_modules` and `.next` were removed first
(both gitignored, zero tracked files), then the tree was moved to
`~/Developer/dronetag`, which is not synced. Git integrity was identical before
and after: same branch, same HEAD, 309 tracked / 71 modified / 55 untracked /
52 staged-deleted, `git fsck` clean.

A `next dev` server started before the move was still running against the old
path and recreating `.next/dev/` under the synced Desktop. Its working directory
no longer existed, so it could not function; it was stopped and the leftover
directory removed.

**No Java runtime was installed**, which is why the rules suites had never run.
OpenJDK 26.0.2.1 was installed with `brew install openjdk`. The formula is
keg-only, so `export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"` was appended to
`~/.zshrc` per the Homebrew caveat.

## Rules defect found while verifying

The suites passed on the first run, but the emulator log carried
`EvaluationException: Property admin is undefined on object` for most denied
requests.

Both rules files defined the admin check as `request.auth.token.admin == true`.
Reading a key absent from a token map is an **evaluation error** in Firebase
rules, not `false`, so every signed-in account without the custom claim raised
one.

It was not exploitable, and that was established rather than assumed:
`isAdmin()` never appears as the left operand of an `||` in either file, so it
can never short-circuit away a permission that should have been granted. Where
it sits to the right of an `||` (`storage.rules` 89, 96, 101) the error is only
reached after `isOwner()` has already returned false; where it opens an `&&`
(`storage.rules` 87, 99, 111) the rule is admin-only to begin with. Every path
denies either way.

What it did cost was an exception in the production rules log on essentially
every non-admin request, and a trap for the next edit: moving `isAdmin()` to the
left of an `||` would have converted the error into the denial of a legitimate
request. Both helpers now read `request.auth.token.get('admin', false) == true`.
After the change the suites still report 60/60 and the emulator logs zero
evaluation errors — the same behaviour, without the noise.

## The 8 lint errors

All 8 were `react-hooks/set-state-in-effect`. None was suppressed: the rule was
not disabled, no `eslint-disable` was added, and `eslint.config.mjs` is
unchanged.

| # | File:line | Cause | Fix |
|---|---|---|---|
| 1 | `src/app/account/permits/page.tsx:372` | Effect reset the form when the `initial` prop changed | `key={editing?.id ?? 'new'}` at the call site; React remounts and re-runs `useState(initial)` |
| 2 | `src/components/demo/DemoPersonaSwitcher.tsx:18` | Read localStorage after mount to avoid a hydration mismatch | `useSyncExternalStore` over the `DEMO_PERSONA_EVENT` the module already dispatched |
| 3 | `src/components/layout/InboxBellButton.tsx:34` | Effect zeroed the unread counts when `user` went away | Counts carry the scope they were fetched for; a mismatch derives to zero |
| 4 | `src/components/layout/InboxBellButton.tsx:62` | Effect closed the dropdown on navigation | Store the route the menu was opened on; `menuOpen` is `menuOpenAt === pathname` |
| 5 | `src/components/layout/Navbar.tsx:39` | Effect closed the drawer on navigation | Same derivation as #4 |
| 6 | `src/contexts/LanguageContext.tsx:48` | Read localStorage after mount | `useSyncExternalStore`; the `lang` attribute stays in an effect, where a DOM write belongs |
| 7 | `src/contexts/ThemeContext.tsx:63` | Read localStorage and subscribed to `matchMedia` | Two external stores; `resolved` becomes a derivation and the `ready` flag disappears |
| 8 | `src/lib/hooks/useAccountAvatar.ts:13` | Effect cleared the avatar when `uid` went away | Loaded values carry their uid; a mismatch derives to empty |

Three of these were also latent bugs, which is why the fixes are worth keeping
independently of the lint result:

* **#1** — `authzToForm(editing)` builds a new object on every parent render, so
  the effect keyed on `initial` fired on every parent render, not only when the
  edit target changed. A draft could be discarded while being typed.
* **#3** and **#8** — the reset only ran when the user or uid became falsy, not
  when it changed from one value to another. Switching accounts kept showing the
  previous account's unread count and avatar until the new request returned.

`ThemeContext` gained a `useMemo` around the context value. It now re-renders
when the OS theme flips even while the preference is an explicit light or dark,
and the memo keeps that from reaching consumers.

One warning was introduced and then removed: `setMenuOpen` became a
`useCallback` rather than a `useState` setter, so `exhaustive-deps` wanted it in
the dependency array of the document-listener effect, and it was added. The
warning count is 11 before and after.

## Findings promoted

| ID | Before | After |
|---|---|---|
| SEC-006 Storage public read | FIXED (repo), UNVERIFIED | **FIXED, VERIFIED (emulator)** |
| SEC-008 Client-written snapshot | FIXED (repo), UNVERIFIED | **FIXED, VERIFIED (emulator)** |

No other finding changed status. "Verified" here means verified against the
rules in this working tree; the rules deployed to the live project have not been
read and may differ.

## Readiness

- Beta: **69 → 73**. One of the five items previously listed as remaining for an
  invited beta is closed. The other four are deploy-and-credentials work that
  local testing cannot discharge.
- Production: **36 → 36**, unchanged. Payments, legal review, tenancy, account
  erasure, backups and App Check were all untouched. Nothing here justified
  moving it.

## Still open

**P0, operational** — rotate historical credentials; deploy rules and functions;
confirm GitHub repository visibility.

**P1** — App Check on Route Handlers; rate limiting; HttpOnly-only session;
staging Firebase project; Resend domain; **Java in CI** so `test:rules` can
block a pull request; IP/OTP TTL; account deletion cascade.

## Manual actions required

1. **Deploy the rules.** `firebase deploy --only firestore:rules,storage`. The
   suites verify this working tree; production behaviour stays unverified until
   this runs, and it is the last step between the verified rules and reality.
2. **Add a JVM to CI.** `actions/setup-java` plus a `npm run test:rules` step in
   `.github/workflows/ci.yml`. Lint is blocking as of this round, but the 60
   rules assertions are not, so a rule edit can still break them unnoticed.
3. **Reopen the project from `~/Developer/dronetag`.** The old path no longer
   exists; any editor window or terminal still pointing at `~/Desktop/dronetag`
   needs updating, and `npm run dev` must be restarted from the new location.
4. **Rotate credentials and deploy functions** — carried over, unchanged.
5. **`npm audit` reports 4 vulnerabilities** (1 moderate, 3 high) in
   `@humanfs/node`, `brace-expansion`, `js-yaml` and `nanoid`. All are
   CPU-exhaustion or DoS classes reachable at build and lint time rather than
   from application input, and all have patch-level fixes available. They were
   left alone because changing dependencies was out of scope for a verification
   round; `npm audit fix` is the intended follow-up.
