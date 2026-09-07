# DroneTag

Web platform for UAS (drone) identification. Operators store identity, aircraft,
certificates and insurance. A published drone gets a public page at `/u/{slug}`
— the URL written on a single NFC badge. Administrators verify documents.
Anyone who finds a drone can notify the owner.

**Status:** pre-beta. Payments are not connected. See the developer handover
for what works, what does not, and what must be done before an invited beta.

**Full technical handover:** [DRONETAG_DEVELOPER_HANDOVER.md](./DRONETAG_DEVELOPER_HANDOVER.md)

## Stack

- Next.js 16 (App Router, Webpack) · React 19 · TypeScript 5 · Tailwind 4
- Firebase Auth, Firestore, Storage, Admin SDK, Cloud Functions (Node 20)
- Hosted on Netlify (Node 22; AWS Lambda `nodejs22.x` server handler)
- Resend (HTTP) for transactional email
- Vitest + Firebase emulator rules tests

## Quick start

Clone **outside** iCloud Desktop/Documents (prefer `~/Developer/dronetag`).
Use **Node 22** for the Next.js app (`.nvmrc`, CI web job, Netlify).
Use **Node 20** only inside `functions/` (Cloud Functions runtime).

```bash
npm ci
cp .env.local.example .env.local
# Fill NEXT_PUBLIC_FIREBASE_* from a staging Firebase project.
# For /api/* and admin: FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY.

npm run dev
```

Without Firebase env vars the app runs in `DEMO_MODE` (in-memory data). A
production build without those vars is refused on purpose.

## Test commands

```bash
npx tsc --noEmit          # types
npm test                  # unit + integration (106)
npm run test:rules        # Firestore + Storage rules (60); needs Java
npm run lint
npm run build             # needs NEXT_PUBLIC_FIREBASE_API_KEY, PROJECT_ID, AUTH_DOMAIN
cd functions && npm ci && npm run build
```

Baseline: **166 / 166** when the rules suites can run.

## More docs

| Doc | Use |
|---|---|
| [DRONETAG_DEVELOPER_HANDOVER.md](./DRONETAG_DEVELOPER_HANDOVER.md) | Architecture, auth, env, security, workaround, backlog |
| [DRONETAG_STAGING_SETUP.md](./DRONETAG_STAGING_SETUP.md) | How to create staging |
| [DRONETAG_MANUAL_QA.md](./DRONETAG_MANUAL_QA.md) | Functional QA |
| [DRONETAG_GLOSSARY.md](./DRONETAG_GLOSSARY.md) | Pilot vs operator vocabulary |
