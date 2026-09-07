# DRONETAG — PRE-BETA BEFORE / AFTER

Baseline: audit at `b72f843`. After: this working tree.

| AREA | BEFORE | AFTER | FILES | TEST | OPEN ISSUE |
|---|---|---|---|---|---|
| Signup | Auth user created; `users`/`pilots` create denied | Server provision, idempotent, uid from token | `api/account/provision`, `account.ts` | `accountProvision.test.ts` | Needs live rules + Auth |
| Security password | Hardcoded admin password in git | Env/argv email; reset link | `scripts/create-admin.ts` | Manual | **Rotate credential in Console** |
| Storage | Public read on all user files | Owner/admin; public images isolated | `storage.rules` | `storage.rules.test.ts` — **16 passing** | **Deploy rules** (suite covers the tree, not the live project) |
| Admin | Client `isAdmin` only | Proxy cookie check + server layout verify | `proxy.ts`, `admin/layout.tsx` | Manual | `__dronetag_idt` still JS-readable |
| NFC | UI said “future release” while pricing sold kits | UI: badge holds `/u/{slug}` | `VerificationLinksPanel.tsx` | Manual | No chip UID registry |
| Pricing | Two badges; kit €39.90/34.90/29.90/27.90 | One badge; €24.90/19.90/included/17.90/15.90 | `pricing.ts`, i18n | `pricing.test.ts` | No Stripe |
| Found-drone | Saved, no email | Resend to owner; report kept on mail failure | `submit-report.ts`, `notify-owner.ts` | email unit tests | **Deploy functions + Resend** |
| Support | `support_unavailable` | Live threads user/admin | `lib/server/support.ts` | `support.test.ts` | No attachments/SLA |
| Notifications | OTP only | Verification + found-drone + support reply | `src/lib/server/email/*` | email tests | Duplicate transport in Functions |
| Onboarding | None | 7-step derived checklist | `OnboardingChecklist.tsx` | Manual | Badge step = published slug |
| Tablet | Mobile chrome until 1024px | Sidebar from 768px | layout shells | Manual | Some tables still dense |
| Accessibility | Modal no trap | Trap, restore, backdrop not tabbable | `Modal.tsx`, `useFocusTrap.ts` | Keyboard | Pre-existing lint a11y debt |
| Feedback | Deletes failed silently — no `catch`, no message | Success + error toast on every create/update/delete and on admin approve/reject | 6 account pages, `admin/verify/page.tsx` | Manual | Form errors stay inline, by design |
| Terminology | Public heading "Operator / pilot"; checkout promised a nonexistent pilot profile | Heading names one role; checkout describes the drone page; 2 dead keys removed | `PublicDroneCard.tsx`, i18n ×5 | Typecheck | Schema still stores operator ids on the pilot record |
| Testing | 0 tests | **166 executed** — 106 unit/integration + 60 rules | `tests/` | `npm test`, `npm run test:rules` | No E2E; CI has no JVM so rules are not blocking |
| CI | None | lint (non-blocking) + tsc + test + build | `.github/workflows/ci.yml` | CI | Lint is now clean (0 errors); rules suite not wired into CI |
| Lint | 8 `set-state-in-effect` errors | 0 errors, 11 warnings | 7 components/contexts | `npm run lint` | Warnings are pre-existing `exhaustive-deps` and unused imports |
| Privacy | No legal pages; PDF public | Draft legal pages; PDF withheld; consent UX | legal pages, projection, consent | projection tests | No DPA; no auto-delete |
| Backend | Dual create paths | Next.js is live path; Functions create marked deprecated | `functions/src/index.ts` | — | Callables still deployed |
| Deploy | `.netlify` committed; one Firebase project | Artefacts untracked; staging docs | `.gitignore`, `DRONETAG_STAGING_SETUP.md` | — | Staging project not created |
| pdf.js | 6.0.227 (JS exec CVE) | 6.3.289 + self-hosted worker | `package.json`, `public/vendor/` | build | CSP still off by default |
