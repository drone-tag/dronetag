# DroneTag — executive technical summary

*For the product owner / investor. No exploit detail.*

## What exists

DroneTag is a web platform where a drone operator stores identity, aircraft,
certificates and insurance, and can publish a **public profile page**. A
physical NFC badge is meant to open that page on a phone. An administrator can
review documents. Someone who finds a drone can send a report to the owner.

## What works today (pre-beta)

A test user can register, confirm contact, fill the account, add an operator
and a drone, upload documents, publish a profile after an explicit consent
screen, scan/open the public link, and file a “found drone” report. Support
tickets work. Password reset works. The public page shows status information
without exposing the insurance PDF or private contacts.

**Online payment is not active.** Checkout records a commercial request only.

## What was improved in this pass

The product can actually be used end-to-end by a small invited group, which
was not true before: registration previously created a login with no account
behind it. Private files are no longer world-readable in the security rules
checked into the repository. Public pages no longer carry the full insurance
document. Administration is checked on the server, not only in the browser.
Transactional email exists for found-drone and verification decisions (when
the email service is configured). Pricing now matches the one-badge commercial
model. Automated tests and a continuous-integration check (without deployment)
are in place.

## What remains

- Charging customers (no payment provider).
- Company/team accounts (Team and Business plans are priced but not built).
- Fully automatic account deletion (users can **request** it; staff handle it).
- Lawyer-reviewed legal documents (current pages are marked drafts).
- A separate staging environment (instructions exist; the project is not created here).
- Several operational tasks that only the owner can do: rotate old credentials,
  publish the new security rules to Firebase, connect the email domain.
- **Automated proof that the new privacy rules work.** Tests were written for
  them, but they need a piece of free software (a Java runtime) that was not
  installed on the machine used for this work, so they have never been run. The
  rules were rewritten carefully and reviewed, but "reviewed" is weaker than
  "tested". A developer should spend an hour installing it and running them
  before the first outside user is invited.

## Readiness

| | Previous audit | Now (this tree) |
|---|---|---|
| **Invited beta** | 34 / 100 | **69 / 100** |
| **Commercial production** | 21 / 100 | **36 / 100** |

Beta is plausible for a **named, small group** once rules and email are
configured on a non-production Firebase project. Production sale of
subscriptions and badges is **not** ready.

## Next steps (owner)

1. Treat any old administrator password that lived in the repository as
   compromised and change it in the Firebase console.
2. Create a staging Firebase project and test there, not on live users.
3. Publish the updated security rules and cloud functions to that staging
   project, then repeat the manual checklist. Ask the developer to run the
   security-rules tests as part of this — see "What remains" above.
4. Decide when to introduce payments and whether Team/Business will be real
   products or only individual plans for launch.
