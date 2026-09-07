# POST-PREBETA FEATURE MATRIX

| Feature | Before | After | Status |
|---|---|---|---|
| Email signup | ROTTA | Provisioned server-side + OTP | FUNZIONALE MA DA HARDENING |
| Google signup | ROTTA (same create) | Provisioned; terms gated on `/signup` | FUNZIONALE MA DA HARDENING |
| Login / logout | OK | OK | FUNZIONALE MA DA HARDENING |
| Reset password | NON IMPLEMENTATA | `/forgot-password` | FUNZIONALE MA DA HARDENING |
| Account delete | NON IMPLEMENTATA | Request via support | PARZIALE |
| Entity CRUD | OK | OK | FUNZIONALE MA DA HARDENING |
| Public profile | PDF leak | Minimized card | FUNZIONALE MA DA HARDENING |
| NFC | Contradictory copy | URL-on-badge model | PARZIALE (no UID) |
| Found drone | Write only | Write + email | FUNZIONALE MA DA HARDENING |
| Admin | Client gate | Server gate | FUNZIONALE MA DA HARDENING |
| Support | DEMO/ROTTA | Live | FUNZIONALE MA DA HARDENING |
| Pricing display | Wrong kit | One badge, correct € | COMPLETA (display) |
| Checkout / pay | Stub | Stub + Preview badge | DEMO / MOCK |
| Notifications | OTP | OTP + verify + found + support | PARZIALE |
| Legal | Absent | Draft pages + checkbox | PARZIALE |
| Tests | None | 166 executed — 106 unit/integration + 60 rules, all passing | PARZIALE |
| Team/Business | UI only | Still no membership | NON IMPLEMENTATA |

## Note on the test figure

166 tests run and pass, in two commands:

* `npm test` — 106 tests, 6 files: pricing, the public projection, email
  templates and the support and provisioning endpoints.
* `npm run test:rules` — 60 tests, 2 files: `storage.rules.test.ts` (16) and
  `firestore.rules.test.ts` (44), against the Firebase emulator.

The rules figure was `NOT EXECUTED` in the previous revision of this document,
because the emulator needs a Java runtime and none was installed. A JDK has
since been installed and both suites pass.

They verify the rules **in this working tree**, not the rules deployed to the
live project, which nobody has read. Deploying remains an open manual action —
see `DRONETAG_MANUAL_QA.md`.
