# POST-PREBETA — START HERE

If you only read one new file besides this: `DRONETAG_DEVELOPER_HANDOVER_FINAL.md`.

## What changed since `b72f843`

Signup works through `/api/account/provision`. Public snapshots are server-built.
Storage rules no longer grant world read on private files **in this repo**.
`/admin` is gated in `src/proxy.ts` and `src/app/admin/layout.tsx`. Support is
live. Found-drone and verification can email via Resend. Pricing is one badge.
Every mutation now reports success and failure through a toast. Tests:
`npm test` (106 passing) plus two security-rules suites that have **never been
run**. CI does not deploy.

## What will bite you

1. **Rules in git ≠ rules in Firebase** until you deploy. This is now the *only*
   thing standing between the verified rules and production: the suites pass
   against the working tree, and nobody has read what is actually deployed.
1a. **The rules suites now run and pass** — 60 assertions, `npm run test:rules`.
   They need a JVM; if the command dies at startup with
   `Process 'java -version' has exited with code 1`, install one
   (`brew install openjdk`, then put `/opt/homebrew/opt/openjdk/bin` on PATH).
2. **`DEMO_MODE` still exists.** A production build without Firebase env vars
   still fails on purpose (`next.config.ts`).
3. **Deprecated Cloud Functions `create*`** must not get new clients.
4. **Do not rewrite git history** unless the owner explicitly asks.
5. **Do not run create-admin / grant-admin against production** without asking.

## Commands

```bash
npm ci
npm run dev
npm run typecheck
npm test              # 106 passing
npm run lint          # clean: 0 errors, 11 warnings
npm run build         # needs NEXT_PUBLIC_FIREBASE_*
npm run test:rules    # 60 passing; needs a JVM on PATH
```

## If `tsc` reports `TS2688`, `TS2300` or `TS2428` in files with " 2" in the name

This should no longer happen, and it is worth knowing why in case it returns.

The working copy used to sit at `~/Desktop/dronetag`. macOS syncs Desktop to
iCloud, and iCloud resolves what it thinks are conflicts by creating duplicates
named `"<name> 2"` — empty directories inside `node_modules`, copied files
inside `.next`. Anything landing in `node_modules/@types/` is then read by
TypeScript as an implicit type library, and a copied `.next/types/routes.d 2.ts`
produces duplicate declarations. Deleting them worked, but they came back within
minutes.

The repository now lives at `~/Developer/dronetag`, which is not synced, and the
symptom is gone. **Do not move it back under `~/Desktop` or `~/Documents`** — on
a Mac with "Desktop & Documents Folders" enabled, both are iCloud volumes.

If you ever do see it again, the clean-up is:

```bash
find node_modules -depth -type d -name "* 2" -exec rmdir {} \;
find .next -type f -regex '.* [0-9]\..*' -delete
```
