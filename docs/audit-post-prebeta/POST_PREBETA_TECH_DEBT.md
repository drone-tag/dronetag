# POST-PREBETA TECH DEBT

P0 closed in **code**: password file, storage rules, public PDF, signup, admin
gate, snapshot writes. They remain P0 **operationally** until deploy + rotation.

## Still P0 operational

- Rotate compromised historical credentials
- Deploy rules/functions
- Confirm GitHub visibility
- ~~**Run the security-rules suites once.**~~ **Done.** A JDK is installed and
  `npm run test:rules` passes 60 assertions (44 Firestore, 16 Storage), so the
  rules-level P0 fixes are verified against the emulator rather than merely
  asserted. Two follow-ups remain: the suites verify the rules in this working
  tree and not the deployed ones, and CI does not install a JVM, so they are
  not yet blocking on a pull request.

## P1 remaining

- App Check on Route Handlers
- Rate limiting
- HttpOnly-only session
- Staging Firebase project
- Resend domain
- ~~Lint errors (8) so CI lint can block~~ **Done.** All 8
  `react-hooks/set-state-in-effect` errors are fixed and `continue-on-error`
  has been removed from the lint step in `.github/workflows/ci.yml`, so lint is
  now blocking. 11 warnings remain and do not affect the exit code.
- Java in CI so `test:rules` can be a blocking job. Now the highest-value
  remaining CI change: the 60 rules assertions pass locally but nothing stops a
  pull request from breaking them.
- IP/OTP TTL
- Account deletion cascade (after legal)

## P2 remaining

- Stripe
- Team/Business tenancy
- Badge entity
- EU region
- Glossary §3.1: move `operatorCode` / `operatorLicense` off the pilot record
  (Firestore migration + rules + admin screen); labels and an admin warning are
  in place, the schema is not
- Glossary §3.6: decide what "charged once per operator" means before it
  reaches a customer
- Backup/rollback runbook
- ~~Move the working copy out of iCloud Desktop sync.~~ **Done.** The working
  copy was at `~/Desktop/dronetag`; macOS syncs Desktop to iCloud, which
  repeatedly created duplicates named `"<name> 2"` — around 490 empty
  directories in `node_modules` and 108 copied files in `.next`. Both break the
  type checker: anything under `node_modules/@types/` is read as an implicit
  type library (`TS2688`), and a copied `.next/types/routes.d 2.ts` produces
  duplicate declarations (`TS2300`, `TS2428`). Clearing them worked for a few
  minutes at a time.

  The repository now lives at `~/Developer/dronetag`, which is not synced, and
  the duplicates have not reappeared. Anyone cloning it should keep it out of
  `~/Desktop` and `~/Documents`, which are both iCloud volumes when "Desktop &
  Documents Folders" is enabled.
