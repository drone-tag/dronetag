# DRONETAG — MANUAL QA CHECKLIST (PRE-BETA)

Use a **staging** Firebase project. Do not run these flows against production
user data. Do not send found-drone emails to strangers.

**Environment:** Node ≥ 20.9 · `npm run dev` · rules **deployed to the project you are testing**
(repo rules have no effect until `firebase deploy --only firestore:rules,storage`).

---

## 1. Signup email → OTP → dashboard → onboarding

- [ ] Open `/signup`
- [ ] Terms checkbox is required; Google is disabled until checked
- [ ] Submit valid form → OTP step
- [ ] After OTP, `/account` shows onboarding checklist derived from real data
- [ ] Refresh: account still exists (provisioning is idempotent)
- [ ] Second signup with same email shows “already in use”

**Expected failure if rules are not deployed:** none of the above (old rules also
blocked client creates; new path uses Admin SDK).

## 2. Login → forgot password

- [ ] `/login` → “Forgot your password?”
- [ ] `/forgot-password` accepts any well-formed email
- [ ] Success copy is **neutral** (does not say whether the account exists)
- [ ] Real inbox (own test account only) receives Firebase reset mail

## 3. Operator → drone → certificate → insurance → public profile

- [ ] Create UAS operator
- [ ] Create drone (starts private)
- [ ] Upload certificate and insurance
- [ ] On drone detail, **Publish profile** opens consent listing public vs withheld fields
- [ ] After confirm, `/u/{slug}` loads without login
- [ ] Public page shows insurer / expiry / masked policy
- [ ] Public page does **not** offer the insurance PDF

## 4. Admin verify → email user

- [ ] Non-admin `/admin` redirects to login
- [ ] Admin can open Users, Verify, Drones, Reports, Plans, NFC, Support
- [ ] Approve/reject a document
- [ ] Decision is saved even if Resend fails
- [ ] With `RESEND_API_KEY` set, the owner receives a verification email

## 5. NFC URL → public profile

- [ ] Copy public URL from Verification / drone page
- [ ] Open URL in a private window
- [ ] Copy explains: badge contains the public DroneTag link
- [ ] No “NFC coming in a future release” copy

## 6. Found drone → report → owner email

- [ ] On `/u/{slug}`, submit found-drone form with your **own** test owner
- [ ] Report appears in `/admin/reports` and owner inbox
- [ ] Owner email is **not** shown to the finder
- [ ] With Resend configured, owner receives mail; without it, report still saves

## 7. Support → ticket → admin reply

- [ ] `/account/support` send a message (no `support_unavailable`)
- [ ] Admin `/admin/support` sees the thread and can reply
- [ ] User sees the reply
- [ ] Profile “Request account deletion” opens support with that subject

## 8. Pricing → one badge → checkout demo

- [ ] `/pricing` shows one NFC badge, not CERT+INS pair
- [ ] Free kit €24.90 · Pilot €19.90 · Pilot Pro included · Team €17.90 · Business €15.90
- [ ] Checkout creates a pending request; **no card is collected**
- [ ] Billing nav item is marked Preview

## 9–11. Viewports

| | Mobile &lt;768 | Tablet 768–1023 | Desktop ≥1024 |
|---|---|---|---|
| Account nav | Bottom bar | **Sidebar** (md+) | Sidebar |
| Modal | Bottom sheet | Centered | Centered |
| Public profile | Readable, tap targets ≥44 | Same | Same |
| Pricing / checkout | Stacked | Two-column where designed | Full |

- [ ] Keyboard: Tab stays inside an open Modal; Escape closes; focus returns
- [ ] Toast appears on publish / support send; can be dismissed

## 12. Feedback on every mutation

Each row should show a toast on success **and** an error toast on failure. The
failure half is the point: these handlers previously swallowed errors silently.
To force one, go offline in devtools before confirming.

| Screen | Actions to check |
|---|---|
| `/account/certificates` | create, delete |
| `/account/insurances` | create, delete |
| `/account/documents` | create, edit, delete |
| `/account/permits` | create, edit, delete |
| `/account/operators` | create, edit, delete, "set as current" |
| `/account/drones` | create, delete |
| `/account/drones/{id}` | save-and-lock, publish, unpublish, delete |
| `/account/archive` | permanent delete |
| `/admin/verify` | approve and reject on each of the five tabs |

- [ ] Offline delete shows an error toast rather than doing nothing
- [ ] Deleting the drone you are viewing navigates to the list and the toast
      survives the route change

## 13. Terminology

- [ ] `/u/{slug}` heading names one role — "UAS operator", "UAS operator
      (company)" or "Remote pilot" — never "Operator / pilot"
- [ ] The row under it is labelled "Name"
- [ ] `/checkout` badge hint says the badge opens the **drone's** public page,
      not a "pilot profile"
- [ ] `/admin/users/{uid}` pilot card is titled "Remote pilot identity" and
      carries the note that the two operator fields describe the operator

## 14. Security rules — EXECUTED, 60 passing

**Status: PASSING.** `npm run test:rules` runs both suites against the Firebase
emulator: 44 assertions in `tests/rules/firestore.rules.test.ts`, 16 in
`tests/rules/storage.rules.test.ts`. Recorded 2026-09-07, both suites green on
the first run.

This closes the caveat on SEC-006 and SEC-008, which now read **FIXED,
VERIFIED (emulator)**. Between them the suites assert anonymous read,
cross-account read, owner self-verification, slug rewriting, client-side
creation, server-only account provisioning, report and support-message
forgery, the public/private storage split, SVG rejection and the size caps.

The suites need a JVM. If the command dies at startup with
`Process 'java -version' has exited with code 1`, install one —
`brew install openjdk`, then put `/opt/homebrew/opt/openjdk/bin` on PATH.

- [x] JDK installed and `java -version` works
- [x] `npm run test:rules` — 60 passed, 0 failed
- [ ] Re-run after **any** edit to `firestore.rules` or `storage.rules`
- [ ] Treat any failure as a live P0 and re-check the rule before deploying

### What this still does not prove

It exercises the rules **in this working tree**. The rules deployed to the live
Firebase project have not been read and may differ, so after
`firebase deploy --only firestore:rules,storage` reproduce by hand on
**staging** the two cases that matter most: an anonymous read of
`users/{uid}/…/policy.pdf` must fail, and a signed-in owner writing
`dronesPublic/{slug}` must fail.

## Known gaps (do not fail the run)

- Payments / Stripe
- Automatic account wipe
- DE/ES/FR (hidden from selector)
- App Check / CSP enforce (env flags, not on by default)
- Team/Business membership
