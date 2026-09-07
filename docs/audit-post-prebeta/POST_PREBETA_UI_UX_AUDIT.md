# POST-PREBETA UI / UX AUDIT

| Finding | Status |
|---|---|
| UX-001 NFC contradiction | **FIXED** |
| UX-002 Support dead-end | **FIXED** |
| UX-003 Checkout no payment | **OPEN** (honest Preview) |
| UX-004 Signup broken | **FIXED** |
| UX-005 DE/ES/FR offered as complete | **FIXED** (hidden) |
| UX-006 No onboarding | **FIXED** |
| UX-007 Modal focus trap | **FIXED** |
| UX-008 No toast | **FIXED** for create / update / delete / publish / admin decisions |
| UX-009 No tablet layout | **PARTIALLY FIXED** (sidebar ≥768) |
| UX-010 Terminology | **PARTIALLY FIXED** (see below) |
| UX-011 Publish without notice | **FIXED** on drone publish |
| UX-013 Admin reports/drones missing | **FIXED** |

DE/ES/FR files remain for a future translation pass.

## UX-008 — what toast now covers

Every mutation that previously succeeded or failed silently now reports. The
delete handlers on certificates, insurances, documents, permits, operators and
drones had a `try/finally` with no `catch`, so a rejected write left the row in
place with no message; each now has an error branch as well as a success toast.
Same for the five admin verification handlers in `src/app/admin/verify/page.tsx`,
which share a new `runDecision()` wrapper.

Not covered, deliberately: form validation and save errors, which stay inline
next to the field they concern.

## UX-010 — glossary applied, and what was left

Applied from `DRONETAG_GLOSSARY.md` §3:

| Glossary item | Action |
|---|---|
| §3.2 admin card mixes pilot and operator | Card retitled "Remote pilot identity"; the two operator inputs now carry a note saying they describe the UAS operator, not the pilot |
| §3.3 public page heading "Operator / pilot" | Heading now names the actual role; the row is labelled "Name". `holderRoleKey()` is exhaustive with a `never` guard, so an unknown `holderKind` is a compile error instead of silently reading "Pilot" |
| §3.4 dead keys | `dashboard.name` and `account.section.pilot` deleted from all five files |
| §3.7 checkout copy | Was factually wrong — it promised a "public pilot profile" that does not exist. Now says the badge is applied to a drone and opens that drone's page |
| §3.5 `home.preview.operatorRole` | Mock labelled a person with a company's role; now "Remote pilot" |

Deliberately not applied, with reasons:

- **§3.1 schema.** `Pilot.operatorCode` and `Pilot.operatorLicense` are
  operator-level identifiers on the pilot record. Moving them is a Firestore
  migration plus rules changes, not a rename. The labels were corrected and the
  admin card now warns about it; the schema is untouched.
- **§3.6 billing unit.** "Charged once per operator" is ambiguous between the
  operator entity (up to three per account) and the person. That is a pricing
  decision, not an editorial one, and needs the client.
