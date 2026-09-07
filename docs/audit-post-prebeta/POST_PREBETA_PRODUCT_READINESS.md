# POST-PREBETA PRODUCT READINESS

Scores are evidence-based. They are higher because blockers were removed, not
because the product is finished.

| Area | Before | After | Why |
|---|---|---|---|
| UI/UX | 68 | 77 | Onboarding, nav, consent, NFC copy, toast on all mutations, glossary applied to public + checkout copy |
| Frontend | 72 | 74 | Modal a11y, tablet; large pages remain |
| Backend | 38 | 58 | Provision, publish, support, email; dual path leftover |
| Authentication | 55 | 70 | Reset + working signup; idt cookie remains |
| Authorization | 45 | 65 | Admin server gate + tighter rules, cross-account denial now asserted; App Check still off |
| Database | 62 | 64 | Additive fields only |
| Security | 28 | 55 | P0 in repo fixed **and now demonstrated on the emulator**; deploy/rotation/App Check open |
| Privacy | 22 | 42 | Projection + consent + drafts; no erasure/export |
| Admin | 58 | 70 | Gate + notify + nav |
| Public profile | 60 | 78 | No PDF; server snapshot |
| NFC | 15 | 40 | Honest URL model; no hardware entity |
| Billing | 8 | 12 | Prices correct; still no provider |
| Notifications | 12 | 48 | Three real mail types if Resend is set |
| Testing | 0 | 60 | 166 executed (106 unit/integration + 60 rules, **both suites now run**); no E2E, rules not yet blocking in CI |
| Monitoring | 5 | 18 | Logger + slim health; no Sentry |
| Deploy | 35 | 48 | CI + untrack artefacts; still one live project |
| Documentation | 30 | 70 | Baseline kept; this pack + handover |

**BETA READINESS: 73 / 100**  
Blockers removed: signup, support, silent found-drone, public PDF, client
admin — and, in the final verification round, the rules suites were executed
for the first time. Remaining for a real invited beta: deploy rules, Resend,
staging, credential rotation.

**PRODUCTION READINESS: 36 / 100** — *unchanged, deliberately*  
Still blocked by payments, legal review, tenancy, deletion, backups, App Check,
and commercial honesty on Team/Business. The final verification round touched
none of these: executing the rules suites raised confidence in work already
counted, and no production blocker was closed. Moving this number would have
meant inflating it.

## Why beta moved 69 → 73 and production did not move

Of the five items previously listed as remaining for an invited beta, one is now
closed: the rules suites have been run, 60 assertions, both passing. That is the
item the previous revision of this document singled out as the highest-value
one, so it is worth more than a rounding nudge — but it is one of five, and the
other four are deploy-and-credentials work that no amount of local testing can
discharge. Hence +4, not +15.

Production is a different list. Payments, legal sign-off, multi-tenancy,
account erasure, backups and App Check were untouched, so the score stays where
it was.

## Why testing is 60 and not higher

The two highest-severity fixes of the pre-beta pass — the storage namespace
split and the deny-from-client rules on `dronesPublic` — live entirely in rules
files, and rules cannot be verified by reading them. That gap is now closed:
`npm run test:rules` runs against the emulator and 60 assertions pass, covering
anonymous read, cross-account read, self-verification, slug rewriting,
server-only provisioning, report and support forgery, the public/private
storage split and the size caps.

What still holds the number down: no browser-level test of any journey, no
component tests, most Route Handlers exercised only indirectly, and CI does not
yet install a JVM — so `npm run test:rules` is green on a developer machine but
is not enforced on a pull request. Making it blocking in
`.github/workflows/ci.yml` is now the single change that would move this number
most.
