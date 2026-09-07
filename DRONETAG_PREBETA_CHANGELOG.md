# DRONETAG — PRE-BETA CHANGELOG

Baseline commit: `b72f843`. Branch: `main`. No production deploy. No git history rewrite.

Each row is a logical change in the working tree. There is no new git commit unless
the owner creates one.

| Area | Problem | Solution | Files | Risk | Test | Rollback |
|---|---|---|---|---|---|---|
| Admin password | Hardcoded credential in `scripts/create-admin.ts` | Script now takes email from argv/env; random throwaway password; reset link only | `scripts/create-admin.ts` | Low | Manual dry-run | Restore file |
| `.netlify/` | 21 MB artefact + `.env.local` tracked | Unstaged from git index; `.gitignore` already listed `.netlify/` | git index | Low | `git ls-files .netlify` empty after commit | `git reset` |
| Storage | `allow read: if true` on `users/{uid}/**` | Owner/admin only; public images under `public/users/{uid}/**` | `storage.rules`, `src/lib/firebase/storage.ts` | High until **deployed** | `tests/rules/storage.rules.test.ts` | Restore rules + redeploy |
| Public PDF | `insurancePdfUrl` on anonymous snapshot | Removed from projection and types | `publicProjection.ts`, `dronesPublic.ts`, `entities.ts` | Medium (legacy docs may still contain the field; readers ignore it) | `tests/unit/publicProjection.test.ts` | Restore files |
| Snapshot writes | Client could set `verificationStatus` | Server-only publish route + rules deny client writes | `api/entities/drones/[id]/publish`, `syncPublicDrones.ts`, `firestore.rules` | High until rules deployed | integration via publish path | Restore rules |
| Signup | Client `setDoc` denied by rules | `POST /api/account/provision` Admin SDK, uid from token | `api/account/provision`, `provisionAccount.ts`, `account.ts`, `signup/page.tsx` | Medium | `tests/integration/accountProvision.test.ts` | Restore files |
| Terms | Checkbox not recorded | `acceptedTerms` → `acceptedTermsAt`; Google gated | signup, GoogleAuthButton, provision | Low | provision test | Restore |
| Password reset | Missing | `/forgot-password` + `sendPasswordResetEmail` | `forgot-password/page.tsx`, `auth.ts`, login link | Low | Manual | Delete page |
| Pricing | Two-badge kit + wrong € | One badge; 2490/1990/0/1790/1590 | `pricing.ts`, i18n, kit UI, `quote.ts` | Low | `tests/unit/pricing.test.ts` | Restore config |
| NFC copy | “Future release” | Badge = public URL `/u/{slug}` | `VerificationLinksPanel.tsx`, i18n | Low | Visual | Restore copy |
| Found drone | Report saved, no email | Resend from Cloud Function; `emailNotified` | `functions/src/submit-report.ts`, `notify-owner.ts` | Medium (needs Functions deploy + Resend) | Unit templates | Restore function |
| Admin notify | Silent approve/reject | Shared email + `/api/admin/notify-verification` | `src/lib/server/email/*`, verify page | Medium | `tests/unit/email*.test.ts` | Restore |
| Admin gate | Client-only | `src/proxy.ts` + `admin/layout.tsx` `verifyAdminSession` | proxy, layout, `adminSession.ts` | Medium | Manual 403 | Delete proxy |
| Support | `support_unavailable` | API + Admin SDK; client writes denied | `lib/server/support.ts`, API routes, rules | Medium | `tests/integration/support.test.ts` | Restore |
| Onboarding | Empty dashboard | Checklist from live entities | `OnboardingChecklist.tsx` | Low | Visual | Remove component |
| Toast | No global feedback | `ToastContext` + profile, links, support, drone publish | `ToastContext.tsx`, layout | Low | Visual | Remove provider |
| Toast coverage | Deletes had `try/finally` with no `catch`: a failed delete looked identical to a successful one | Success + error toast on every create/update/delete across certificates, insurances, documents, permits, operators, drones, archive | six `src/app/account/*/page.tsx`, i18n ×5 | Low | Visual | Revert pages |
| Admin decisions | Same silent-failure shape on the five approve/reject handlers | Shared `runDecision()` wrapper; toast reports the decision, `notifyWarning` still reports email failure separately | `src/app/admin/verify/page.tsx`, i18n ×5 | Low | Visual | Revert page |
| Modal a11y | No focus trap | `useFocusTrap` | `Modal.tsx`, hook | Low | Keyboard | Restore Modal |
| Nav IA | 12 flat items; admin missing reports/drones | Grouped account nav; admin subnav complete; billing Preview | `accountNavConfig.tsx`, `AdminSubNav.tsx` | Low | Visual | Restore |
| Languages | DE/ES/FR 62% English | Selector IT+EN only; files kept | `i18n/index.ts` | Low | Visual | Restore LANGUAGES |
| Tablet | `md:` unused | Sidebar from `md:` (768px) | AppShell, sidebar, bottom nav | Low | Viewport | Restore `lg:` |
| Publication | No consent | `PublicationConsent` + drone publish/unpublish | drone `[id]` page, consent component | Medium (rules allow visibility after lock) | Manual | Restore page |
| Legal | No pages | Draft `/privacy` `/terms` `/cookies` | `src/app/{privacy,terms,cookies}` | Low | Visual | Delete pages |
| Deletion | None | Request via support + design doc | profile page, `DRONETAG_ACCOUNT_DELETION_DESIGN.md` | Low | Manual | Remove card |
| Validation | Ad-hoc | Zod on new endpoints | `validation.ts`, provision/support | Low | Integration tests | Keep |
| Terminology | Public page heading read "Operator / pilot"; checkout promised a public *pilot* profile that does not exist; admin card titled "Pilot" held operator fields | Glossary §3.2/§3.3/§3.4/§3.5/§3.7 applied; `holderRoleKey()` made exhaustive; 2 dead keys deleted | `PublicDroneCard.tsx`, `admin/users/[uid]/page.tsx`, i18n ×5 | Low | Typecheck + visual | Revert i18n + components |
| Tests / CI | None | Vitest + GitHub Actions (no deploy) | `tests/`, `.github/workflows/ci.yml` | Low | `npm test` 106 passed | Delete workflow |
| Rules tests | Storage rules had a suite, Firestore rules had none — the `dronesPublic` deny and the publish carve-out were untested | Added `tests/rules/firestore.rules.test.ts` | `tests/rules/firestore.rules.test.ts` | Low | **44 passing** (60 with the storage suite) | Delete file |
| Rules `isAdmin()` | `request.auth.token.admin` raises an evaluation error for accounts without the claim instead of returning false — denied either way, but it filled the rules log and would have become a denial bug if ever placed left of an `||` | `request.auth.token.get('admin', false)` | `firestore.rules`, `storage.rules` | None — 60 assertions pass before and after | `npm run test:rules`, zero `EvaluationException` after | Revert two lines |
| Lint errors | 8 × `react-hooks/set-state-in-effect` | 0 — state derived during render, `useSyncExternalStore` for the two localStorage-backed contexts, `key` for the permit form reset | `Navbar.tsx`, `InboxBellButton.tsx`, `useAccountAvatar.ts`, `permits/page.tsx`, `DemoPersonaSwitcher.tsx`, `LanguageContext.tsx`, `ThemeContext.tsx` | Medium — touches two root providers | `npm run lint` 0 errors; tsc; build; 106 tests | Revert per file |
| Logger / health | Verbose health | Structured logger; health stripped of CSP/App Check flags | `logger.ts`, `health/route.ts` | Low | Unit | Restore |
| pdf.js CVE | GHSA-hq66-cqwq-w95j | `pdfjs-dist@6.3.289` + self-hosted worker | `package.json`, `stage-vendor-assets.mjs` | Medium (OCR/preview) | Build | Pin previous |
| Staging prep | One Firebase project | Example alias + setup doc + emulator ports | `.firebaserc.example`, `firebase.json`, `DRONETAG_STAGING_SETUP.md` | None until used | — | — |
| Legacy callables | Duplicate create path | Marked deprecated, **not deleted** | `functions/src/index.ts` | Low | — | Unmark |

## Verification actually performed

| Check | Command | Result |
|---|---|---|
| Typecheck (web) | `npx tsc --noEmit` | Clean |
| Typecheck (functions) | `cd functions && npm run build` | Clean |
| Unit + integration | `npm test` | 106 passed, 6 files |
| Lint | `npm run lint` | **0 errors, 11 warnings** — the 8 `react-hooks/set-state-in-effect` errors were fixed in the final verification round |
| Production build | `npm run build` with placeholder `NEXT_PUBLIC_FIREBASE_*` | Succeeded; 38 static pages, all routes and the proxy middleware emitted |
| Security rules | `npm run test:rules` | **60 passing** (44 Firestore + 16 Storage) against the emulator |

The build used obviously fake public Firebase values passed inline for one
command. No `.env.local` was created, no real project was contacted, and no
Firebase data was read or written at any point in this pass.

## MANUAL ACTION REQUIRED (not done in this worktree)

1. Rotate the historical admin password and service-account key in Firebase Console.
2. Deploy `firestore.rules` and `storage.rules`.
2a. **Before deploying them, install a JDK and run `npm run test:rules`.** Both
   rules suites are unverified; they are the only automated check on three of
   the P0 fixes.
3. Deploy Cloud Functions (`submitReport` + `notify-owner`).
4. Create a staging Firebase project and wire Netlify contexts.
5. Set `RESEND_API_KEY` / verify sending domain.
6. Set `CSP_ENFORCE=true` only after confirming PDF worker is same-origin.
7. Do **not** rewrite git history automatically; treat historical `.netlify` zip as compromised if the repo was ever public.
