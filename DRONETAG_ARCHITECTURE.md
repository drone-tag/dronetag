# DRONETAG — ARCHITECTURE

> Audit read-only eseguito il 2026-09-07 sul commit `b72f843` ("prebeta"), branch `main`.
> Nessun file applicativo è stato modificato.
>
> Convenzioni usate in questo documento:
> **FACT** = verificato leggendo il codice. **INFERENCE** = deduzione motivata dal codice.
> **UNKNOWN** = non determinabile dalla sola repository.

---

## 1. Sintesi dello stack (FACT)

| Livello | Tecnologia | Versione installata (`package-lock.json`) | File di riferimento |
|---|---|---|---|
| Framework | Next.js **App Router** | `16.2.12` | `next.config.ts`, `src/app/**` |
| UI runtime | React | `19.2.4` | `package.json` |
| React DOM | react-dom | `19.2.4` | — |
| Linguaggio | TypeScript (`strict: true`) | `5.9.3` | `tsconfig.json` |
| CSS | Tailwind CSS v4 (PostCSS plugin) | `4.2.2` | `postcss.config.mjs`, `src/app/globals.css` |
| Firebase client SDK | `firebase` | `12.11.0` | `src/lib/firebase/config.ts` |
| Firebase Admin SDK | `firebase-admin` | `14.2.0` | `src/lib/server/firebaseAdmin.ts` |
| Cloud Functions SDK | `firebase-functions` | `^7.3.2` | `functions/package.json` |
| PDF | `pdfjs-dist` | `6.0.227` | `src/lib/insurance/extractPdfText.ts`, `src/lib/pdf/loadPdfBytes.ts` |
| OCR | `tesseract.js` | `7.0.0` | `src/lib/certificate/ocrCertificatePdf.ts` |
| ID | `uuid` | `13.0.2` | — |
| Hook Firebase | `react-firebase-hooks` | `5.1.1` | dipendenza dichiarata |
| Lint | ESLint + `eslint-config-next` | `9.39.4` / `16.2.12` | `eslint.config.mjs` |
| Runner script | `tsx` | `4.22.4` | `scripts/**` |

### Dipendenze notevolmente ASSENTI (FACT)

Non esiste **alcuna** dipendenza per: test (Jest/Vitest/Playwright/Cypress), validazione schema (zod/yup/valibot), form (react-hook-form/formik), state management (redux/zustand/jotai), UI kit (shadcn/radix/mui), grafici, email SDK, pagamenti (Stripe), error monitoring (Sentry), analytics vendor.

Conseguenze dirette:
- La validazione è **manuale** in ogni route handler (vedi `DRONETAG_BACKEND_AUDIT.md`).
- Non esiste alcun test automatico (vedi §10).
- L'email OTP usa `fetch()` diretto verso l'API REST di Resend (`src/lib/server/otp.ts:83`), non un SDK.

### Incoerenze di versione Node (FACT)

| Sorgente | Valore |
|---|---|
| `package.json` → `engines.node` | `>=20.9.0` |
| `.nvmrc` | `22` |
| `netlify.toml` → `NODE_VERSION` | `20` |
| `firebase.json` → functions runtime | `nodejs20` |
| `functions/package.json` → `engines.node` | `20` |
| Node presente sulla macchina di audit | `v24.12.0` |

Quattro valori diversi (20 / 22 / 24 / `>=20.9.0`). **INFERENCE**: il build di produzione gira su Node 20 (Netlify), lo sviluppo locale su 22 o 24. Da uniformare.

---

## 2. Struttura della repository (FACT)

```
dronetag/
├── AGENTS.md / CLAUDE.md          # istruzioni per agenti AI (non applicativo)
├── README.md                      # setup (contiene riferimenti obsoleti, §12)
├── TECHNICAL_HANDOVER.md          # handover precedente (in italiano)
├── PRICING_IMPLEMENTATION.md      # note sul pricing
├── package.json / package-lock.json
├── tsconfig.json                  # paths: @/* → ./src/*  ; exclude: functions, scripts
├── next.config.ts                 # security headers, CSP, redirects, guard env di build
├── eslint.config.mjs
├── postcss.config.mjs
├── netlify.toml                   # build Netlify + @netlify/plugin-nextjs
├── firebase.json                  # rules + indexes + functions codebase
├── .firebaserc                    # UN SOLO progetto: dronetag-e905d
├── firestore.rules                # 361 righe
├── firestore.indexes.json         # 11 indici compositi
├── storage.rules                  # 79 righe
├── .env.local.example             # nomi env documentati
├── .nvmrc                         # 22
├── eng.traineddata                # ⚠ 5,2 MB — dati Tesseract committati in root
├── .netlify/                      # ⚠ ARTEFATTO DI BUILD COMMITTATO (§11)
├── docs/                          # 4 runbook di deploy/test
├── functions/                     # Cloud Functions (codebase separata)
│   ├── package.json / tsconfig.json
│   └── src/  (9 file)
├── scripts/                       # 9 script amministrativi + README
├── public/                        # asset statici + public/demo (immagini demo, 2 MB)
└── src/
    ├── app/          # App Router: 43 file pagina/layout/error + 24 route handler
    ├── components/   # 84 componenti
    ├── contexts/     # 3 provider globali
    ├── config/       # pricing.ts (catalogo commerciale)
    └── lib/          # 100+ moduli: firebase/, server/, utils/, i18n/, demo/, ...
```

### Cosa NON esiste (FACT, verificato con `find`)

| Elemento atteso | Stato |
|---|---|
| `src/middleware.ts` / `middleware.ts` | **ASSENTE** |
| `src/proxy.ts` | **ASSENTE** |
| `vercel.json` | **ASSENTE** |
| `pages/` (Pages Router) | **ASSENTE** — 100% App Router |
| Server Actions (`'use server'`) | **ASSENTE** (0 occorrenze) |
| `not-found.tsx` | **ASSENTE** |
| Qualsiasi file di test o config di test | **ASSENTE** |
| File `.env` reali versionati | **ASSENTE** (solo `.env.local.example`) — ma vedi §11 |

> ⚠ **Discrepanza documentazione ↔ codice.** `src/proxy.ts` è citato come gate server-side di `/admin` in `.env.local.example:27`, `README.md:102`, `docs/DEPLOY_STAGING.md:155`, `docs/STAGING-SIGNOFF.md:21`, `next.config.ts:56` e `src/lib/server/firebaseAdmin.ts:4`. **Il file non esiste.** Non c'è nessuna protezione server-side su `/admin`. Vedi `DRONETAG_SECURITY_AUDIT.md` § SEC-004.

---

## 3. Pattern architetturale

### 3.1 Server vs Client Components (FACT)

Solo **3 file** sono Server Component:

| File | Ruolo |
|---|---|
| `src/app/layout.tsx` | root layout, monta i provider |
| `src/app/u/layout.tsx` | wrapper del profilo pubblico (5 righe) |
| `src/app/manifest.ts` | manifest PWA |

**Tutte le altre 40 pagine e layout dichiarano `'use client'`**, inclusi `src/app/account/layout.tsx` e `src/app/admin/layout.tsx`.

Nessuna pagina esporta `generateMetadata`, `generateStaticParams`, `export const dynamic`, `revalidate` o `runtime`. I parametri dinamici (`[slug]`, `[id]`, `[uid]`) si leggono con `useParams()` lato client.

**Conseguenza architetturale (INFERENCE):** il progetto usa l'App Router come se fosse una SPA. Non sfrutta RSC, streaming, caching server, né rendering server dei dati. Ogni pagina scarica il Firebase client SDK e fa fetch dopo l'idratazione. Questo ha impatto su performance (`DRONETAG_UI_UX_AUDIT.md` §Performance) e SEO del profilo pubblico `/u/[slug]`, che è **client-rendered** e quindi vuoto per crawler senza JS.

### 3.2 Provider globali (FACT)

`src/app/layout.tsx:57-73`:

```
<html lang="it" data-demo={DEMO_MODE ? 'true' : undefined}>
  <head><script (theme boot inline) /></head>
  <body>
    <ServiceWorkerCleanup />
    <ThemeProvider>            → src/contexts/ThemeContext.tsx    (light|dark|system, localStorage)
      <AuthProvider>           → src/contexts/AuthContext.tsx     (Firebase Auth + claim admin)
        <LanguageProvider>     → src/contexts/LanguageContext.tsx (it default, localStorage)
          <AuthRoutePrefetch />
          <AppShell>{children}</AppShell>
```

`lang="it"` è **hardcoded** nel tag `<html>` anche se l'utente cambia lingua (`LanguageContext` aggiorna poi `document.documentElement.lang` lato client).

### 3.3 Layering dei dati (FACT)

```
Pagina (client component)
   └── src/lib/firebase/<entity>.ts        ← unico data-access layer
         ├── if (DEMO_MODE) → src/lib/demo/*Store.ts     (in-memory + localStorage)
         └── else:
               ├── READ   → Firebase client SDK diretto (getDoc/getDocs/query)
               ├── CREATE → adminFetch('/api/entities/<x>')  → Route Handler → Admin SDK
               ├── UPDATE → Firebase client SDK diretto (updateDoc)
               └── DELETE → Firebase client SDK diretto (deleteDoc)
```

Non esiste un repository pattern formale né un ORM. `src/lib/firebase/*.ts` (19 moduli) è il confine unico fra UI e persistenza — questa parte è coerente e ben fatta.

Ogni modulo `src/lib/firebase/*.ts` contiene un branch `if (DEMO_MODE)` che devia su uno store in memoria. **17 moduli** importano `@/lib/demo/*`. Questo raddoppia la superficie logica: ogni funzionalità ha due implementazioni (demo e live) che possono divergere — ed è esattamente ciò che è successo per il support (§ `DRONETAG_FEATURE_MATRIX.md`).

### 3.4 DEMO_MODE (FACT — importante)

`src/lib/firebase/config.ts:34`:

```ts
export const DEMO_MODE = !apiKey || !projectId;
```

DEMO_MODE si attiva **automaticamente** se mancano `NEXT_PUBLIC_FIREBASE_API_KEY` o `NEXT_PUBLIC_FIREBASE_PROJECT_ID`. In DEMO_MODE:
- `AuthContext` deriva `isAdmin` da `getDemoPersona().isAdmin` (`src/contexts/AuthContext.tsx:83-87, 152`) → **ogni visitatore può diventare admin scegliendo la persona**.
- Tutti i dati sono finti.

Sono presenti **due guardrail** che impediscono che ciò arrivi in produzione:
1. **Build-time** — `next.config.ts:15-42`: se `NODE_ENV === 'production'` e manca una delle 3 var Firebase, il build **fallisce** con un banner esplicito.
2. **Runtime** — `src/lib/firebase/config.ts:36-45`: se il browser è su HTTPS e non è localhost mentre DEMO_MODE è attivo, viene lanciata un'eccezione che blocca l'app.

**Valutazione:** i guardrail sono corretti e ben scritti. Il rischio residuo è un host che serva su HTTP in chiaro, o un build con `NODE_ENV` non impostato a `production`. Vedi `DRONETAG_SECURITY_AUDIT.md` § SEC-011.

---

## 4. Diagramma dei flussi

### 4.1 Flusso generale

```
┌───────────────────────────────────────────────────────────────────────────┐
│ BROWSER                                                                   │
│                                                                           │
│  src/app/layout.tsx (RSC)                                                 │
│    └─ ThemeProvider → AuthProvider → LanguageProvider → AppShell          │
│                                                                           │
│  Pagine ('use client')                                                    │
│    /              src/app/page.tsx                                        │
│    /login         src/app/login/page.tsx                                  │
│    /account/*     src/app/account/**            gate: layout client-side  │
│    /admin/*       src/app/admin/**              gate: layout client-side  │
│    /u/[slug]      src/app/u/[slug]/page.tsx     nessun gate (pubblico)    │
└───────────────┬───────────────────────────────────────────────────────────┘
                │
    ┌───────────┴──────────────────────────────────────────────┐
    │                          │                               │
    ▼                          ▼                               ▼
┌─────────────────┐  ┌──────────────────────┐  ┌───────────────────────────┐
│ AUTH            │  │ NEXT.JS ROUTE        │  │ FIREBASE CLIENT SDK       │
│ Firebase Auth   │  │ HANDLERS (24)        │  │ (accesso DIRETTO)         │
│ (email/pwd,     │  │ src/app/api/**       │  │ src/lib/firebase/*.ts     │
│  Google popup)  │  │ runtime: nodejs      │  │                           │
│                 │  │                      │  │ READ  : getDoc/getDocs    │
│ src/lib/firebase│  │ auth:                │  │ UPDATE: updateDoc         │
│   /auth.ts      │  │  requireUserFrom     │  │ DELETE: deleteDoc         │
│                 │  │   Request()          │  │ WRITE : setDoc            │
│ Claims: admin   │  │  requireAdminFrom    │  │   (users, pilots,         │
│ Cookie:         │  │   Request()          │  │    dronesPublic)          │
│  __dronetag_idt │  │                      │  │                           │
│   (JS-readable) │  │ → firebase-admin     │  │ soggetto a firestore.rules│
│  __dronetag_    │  │   BYPASSA le rules   │  │                           │
│   session       │  └──────────┬───────────┘  └────────────┬──────────────┘
│   (HttpOnly)    │             │                           │
└────────┬────────┘             │                           │
         │                      ▼                           ▼
         │            ┌──────────────────────────────────────────────┐
         └───────────▶│ FIRESTORE  (progetto dronetag-e905d)         │
                      │ users, pilots, operators, drones,            │
                      │ dronesPublic, insurances, certificates,      │
                      │ documents, authorizations, slots, plans,     │
                      │ reports, rateLimits, orders, signupOtp,      │
                      │ profiles (legacy)                            │
                      └──────────────────────────────────────────────┘
                      ┌──────────────────────────────────────────────┐
                      │ FIREBASE STORAGE                             │
                      │ users/{uid}/...   (read: if true ⚠)          │
                      │ profiles/**       (legacy, read: if true)    │
                      └──────────────────────────────────────────────┘
                      ┌──────────────────────────────────────────────┐
                      │ CLOUD FUNCTIONS (us-central1) — 7 funzioni   │
                      │ submitReport      ← USATA dal client         │
                      │ createDrone       ← NON usata (dead path)    │
                      │ createOperator    ← NON usata                │
                      │ createCertificate ← NON usata                │
                      │ createDocument    ← NON usata                │
                      │ createInsurance   ← NON usata                │
                      │ bootstrapSlots    ← trigger auth.onCreate    │
                      └──────────────────────────────────────────────┘
                      ┌──────────────────────────────────────────────┐
                      │ SERVIZI ESTERNI                              │
                      │ Resend (email OTP)  api.resend.com           │
                      │ reCAPTCHA / App Check (opzionale)            │
                      │ Coverdrone (link affiliato, solo link)       │
                      │ Pagamenti: NESSUNO                           │
                      └──────────────────────────────────────────────┘
```

### 4.2 Flusso: creazione di un drone (FACT)

```
src/app/account/drones/page.tsx           (form "Nuovo drone")
  → createDrone()                          src/lib/firebase/drones.ts:174
      → adminFetch('/api/entities/drones') src/lib/client/adminApi.ts
          header Authorization: Bearer <idToken>   (getIdToken(true))
  → POST src/app/api/entities/drones/route.ts
      1. requireUserFromRequest(request)   verifica token, checkRevoked=true
      2. enforceQuota(uid, 'drone')        src/lib/server/quota.ts
      3. verifica ownership di defaultOperatorId e insuranceId
      4. genera slug unico (Crockford base32, 8 char, retry su collisione)
      5. adminFirestore().collection('drones').add({... userId: auth.uid })
  → risposta { id, slug }
  → il client poi chiama syncDronePublicSnapshot()  src/lib/firebase/dronesPublic.ts
      → setDoc(dronesPublic/{slug})        SCRITTURA CLIENT-SIDE
```

Nota: **la proiezione pubblica è scritta dal client**, non dal server. Le rules verificano solo che chi scrive possieda il drone referenziato (`firestore.rules:196-207`), non che il *contenuto* dello snapshot sia corretto. Vedi `DRONETAG_SECURITY_AUDIT.md` § SEC-009.

### 4.3 Flusso: segnalazione drone ritrovato (FACT)

```
/u/[slug]  →  ReportFoundDroneForm  →  createReport()   src/lib/firebase/reports.ts:101
  → callSubmitReport()                                   src/lib/firebase/callable.ts
  → httpsCallable 'submitReport'  (Cloud Function, us-central1)
      functions/src/submit-report.ts
        1. requireAppCheck()      (enforce se APP_CHECK_ENFORCE=true)
        2. rate limit 3 / 10 min per (slug + IP)  → collection rateLimits
        3. lookup drones/{droneId}; verifica slug, visibility=public, status=active
        4. ownerUserId DERIVATO dal drone (mai dal client)  ✔
        5. sanitizza campi, valida lat/lng
        6. scrive reports/{autoId} con _origin.ip  ⚠ (privacy)
        7. TODO: notifica email/push  ← NON IMPLEMENTATA
```

Questo è **l'unico** flusso che usa davvero una Cloud Function ed è anche il più solido dal punto di vista di sicurezza.

---

## 5. Mappa completa delle route

### 5.1 Route pubbliche

| URL | File | Tipo | Auth | Legge | Scrive | Stato |
|---|---|---|---|---|---|---|
| `/` | `src/app/page.tsx` | client | nessuna | array `FEATURES` statico + i18n | — | COMPLETA (marketing) |
| `/login` | `src/app/login/page.tsx` | client | redirect se loggato | `useAuth()` | Firebase Auth (email/pwd, Google) | COMPLETA |
| `/signup` | `src/app/signup/page.tsx` | client | redirect se loggato | `useAuth()` | Firebase Auth → `ensureAccount()` → `users/{uid}` → `/api/auth/contact-verification/init` | **ROTTA in live** (§ SEC-002) |
| `/pricing` | `src/app/pricing/page.tsx` | client | nessuna | `@/config/pricing` (statico) | — | COMPLETA (vetrina) |
| `/checkout` | `src/app/checkout/page.tsx` | client | **nessuna** | `@/config/pricing` | `POST /api/pricing/checkout` → **Map in memoria** | DEMO / MOCK |
| `/u/[slug]` | `src/app/u/[slug]/page.tsx` | client | nessuna | `dronesPublic/{slug}` | report via Cloud Function | FUNZIONALE MA DA HARDENING |
| `/manifest.webmanifest` | `src/app/manifest.ts` | server | — | statico | — | COMPLETA |

**Redirect configurati** (`next.config.ts:195-208`): `/admin/profiles` → `/admin/users`, `/admin/profiles/:path*` → `/admin/users` (entrambi `permanent: false`).

### 5.2 Route account (gate client-side in `src/app/account/layout.tsx`)

Il gate (`src/app/account/layout.tsx:15-34`): se `!user` → `/login?redirect=/account`; se `isAdmin` → `/admin`. Poi `AccountProvisionGate` richiede l'esistenza di `users/{uid}`.

| URL | File | Legge | Scrive | Stato |
|---|---|---|---|---|
| `/account` | `page.tsx` → `AccountDashboard` | operators, drones, certificates, insurances, documents, account | — | COMPLETA |
| `/account/profile` | `profile/page.tsx` | `users/{uid}`, `pilots/{uid}`, slots | branding via `/api/account/branding`; `updateAccount` | PARZIALE (solo media; campi identità bloccati) |
| `/account/drones` | `drones/page.tsx` | drones, operators, slots | create via API, update/delete client SDK | COMPLETA |
| `/account/drones/[id]` | `drones/[id]/page.tsx` | drone, pilot, operators, insurances | updateDrone, setActiveOperator | COMPLETA |
| `/account/certificates` | `certificates/page.tsx` | certificates, slots | create API + upload PDF API + update/delete | COMPLETA |
| `/account/insurances` | `insurances/page.tsx` | insurances, drones, operators, slots | create API + upload PDF API + update/delete | COMPLETA |
| `/account/documents` | `documents/page.tsx` | documents, slots | create API + upload file API | COMPLETA |
| `/account/permits` | `permits/page.tsx` | authorizations, slots | create API + upload file API | COMPLETA |
| `/account/operators` | `operators/page.tsx` | operators, drones, slots | create API + update/delete | COMPLETA |
| `/account/inbox` | `inbox/page.tsx` | `reports` (ownerUserId) | `markReportRead` | COMPLETA |
| `/account/archive` | `archive/page.tsx` | certificates, insurances, authorizations scaduti | delete | COMPLETA |
| `/account/orders` | `orders/page.tsx` | `orders` (userId) | — | **SOLO LETTURA — nessun codice crea ordini** |
| `/account/orders/[id]` | `orders/[id]/page.tsx` | `orders/{id}` | — | idem |
| `/account/billing` | `billing/page.tsx` | slots/plans via `PlanSlotsSummary` | — | **SOLO UI** — bottone `disabled` senza handler |
| `/account/support` | `support/page.tsx` | `getSupportThread`, `listSupportMessages` | `sendSupportMessage` | **SOLO UI in live** — backend non cablato |
| `/account/settings` | `settings/page.tsx` | Theme/Language (localStorage) | localStorage | COMPLETA |

### 5.3 Route admin (gate client-side in `src/app/admin/layout.tsx`)

Il gate (`src/app/admin/layout.tsx:15-22`): se `!user` → `/login`; se `!isAdmin` → `/account`. **Nessun controllo server-side.**

| URL | File | Legge | Scrive | Stato |
|---|---|---|---|---|
| `/admin` | `page.tsx` | tutte le collection + `/api/health` | — | COMPLETA |
| `/admin/users` | `users/page.tsx` | `/api/admin/accounts`, drones | — | COMPLETA |
| `/admin/users/new` | `users/new/page.tsx` | — | `POST /api/admin/users` (Auth + users + pilots + slots) | COMPLETA |
| `/admin/users/[uid]` | `users/[uid]/page.tsx` | tutte le entità dell'utente | update account/pilot/entità, `setSlots` | COMPLETA (940 righe) |
| `/admin/drones` | `drones/page.tsx` | drones, accounts | `clearActiveOperator` | COMPLETA |
| `/admin/drones/[id]` | `drones/[id]/page.tsx` | drone + correlate | updateDrone, deleteDrone | COMPLETA |
| `/admin/verify` | `verify/page.tsx` | coda di verifica di tutte le entità | update `verificationStatus` **+ `ensureSupportThread`/`sendSupportMessage`** | **PARZIALE** — la notifica al utente lancia `support_unavailable` in live |
| `/admin/reports` | `reports/page.tsx` | reports, accounts | `markReportRead` | COMPLETA |
| `/admin/support` | `support/page.tsx` | thread e messaggi | invio messaggi | **SOLO UI in live** |
| `/admin/plans` | `plans/page.tsx` | `plans` | create/update/delete | COMPLETA (CRUD Firestore reale) |
| `/admin/nfc` | `nfc/page.tsx` | drones pubblici, accounts | export CSV client-side | PARZIALE (nessun hardware) |

### 5.4 Route API (Route Handlers) — 24 endpoint

Tutti dichiarano `export const runtime = 'nodejs'` e `dynamic = 'force-dynamic'`.
Dettaglio completo in `DRONETAG_BACKEND_AUDIT.md`. Sintesi dell'autenticazione:

| Endpoint | Metodo | Auth |
|---|---|---|
| `/api/health` | GET | **nessuna** (espone build info + flag di sicurezza) |
| `/api/session` | POST, DELETE | verifica idToken, setta cookie HttpOnly |
| `/api/account/branding` | POST | `requireUserFromRequest` |
| `/api/admin/accounts` | GET | `requireAdminFromRequest` |
| `/api/admin/users` | POST | `requireAdminFromRequest` |
| `/api/admin/resync-public-drones` | POST | `requireAdminFromRequest` |
| `/api/auth/contact-verification/init` | POST | `requireUserFromRequest` |
| `/api/auth/contact-verification/phone` | POST | `requireUserFromRequest` |
| `/api/auth/otp/email/send` | POST | `requireUserFromRequest` |
| `/api/auth/otp/email/verify` | POST | `requireUserFromRequest` |
| `/api/entities/operators` | POST | `requireUserFromRequest` + quota |
| `/api/entities/drones` | POST | `requireUserFromRequest` + quota + ownership |
| `/api/entities/certificates` | POST | `requireUserFromRequest` + quota |
| `/api/entities/certificates/[id]/pdf` | POST | `requireUserFromRequest` + ownership |
| `/api/entities/insurances` | POST | `requireUserFromRequest` + ownership (nessuna quota) |
| `/api/entities/insurances/[id]/pdf` | POST | `requireUserFromRequest` + ownership |
| `/api/entities/documents` | POST | `requireUserFromRequest` + quota |
| `/api/entities/documents/[id]/file` | POST | `requireUserFromRequest` + ownership |
| `/api/entities/authorizations` | POST | `requireUserFromRequest` + quota |
| `/api/entities/authorizations/[id]/file` | POST | `requireUserFromRequest` + ownership |
| `/api/files/proxy` | GET | `requireUserFromRequest` + prefisso `users/{uid}/` |
| `/api/pricing/quote` | POST | **nessuna** |
| `/api/pricing/checkout` | POST | **nessuna** |
| `/api/billing/webhook` | POST | **nessuna** — restituisce 501 |

---

## 6. Autenticazione e sessione

### 6.1 Provider attivi (FACT)

`src/lib/firebase/auth.ts`:
- Email + password (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`)
- Google (`signInWithPopup` con `prompt: 'select_account'`)
- Telefono: `src/lib/firebase/phoneAuth.ts`, usato solo da `SignupOtpVerification.tsx` come canale di verifica opzionale

**Non esiste** alcun flusso di reset password: `sendPasswordResetEmail` non compare in `src/`. Nessuna route `/forgot-password` o `/reset-password`.

### 6.2 Gestione token e cookie (FACT)

`src/contexts/AuthContext.tsx` mantiene **due** cookie:

| Cookie | Impostato da | HttpOnly | TTL | Scopo |
|---|---|---|---|---|
| `__dronetag_idt` | `document.cookie` lato client (`AuthContext.tsx:34`) | **NO** | 55 min | Leggibile da JS |
| `__dronetag_session` | `POST /api/session` (`src/app/api/session/route.ts:61-69`) | **SÌ** | 60 min | Doveva essere letto da `proxy.ts` (inesistente) |

`SameSite=Strict` su entrambi; `Secure` solo su HTTPS.

`src/lib/server/requestAuth.ts:30` preferisce il cookie di sessione, poi quello JS:
```ts
return readCookie(cookie, SESSION_COOKIE) ?? readCookie(cookie, ID_TOKEN_COOKIE);
```
Entrambi contengono un **ID token grezzo** (non una session cookie Firebase), quindi `verifyIdToken()` funziona su entrambi. Nota: non viene usato `createSessionCookie()` dell'Admin SDK, quindi la sessione dura al massimo 1 ora e non è revocabile in modo indipendente.

Il refresh avviene ogni 5 minuti (`REFRESH_INTERVAL_MS`, `AuthContext.tsx:10,126`).

`adminFetch` (`src/lib/client/adminApi.ts:17`) chiama `getIdToken(true)` — **force refresh a ogni singola richiesta API**. Funzionalmente corretto (Safari-safe), ma costoso: ogni create/upload genera una chiamata extra a `securetoken.googleapis.com`.

### 6.3 Risoluzione dei ruoli (FACT)

Esiste **un solo ruolo privilegiato**: il custom claim `admin: true`.

- Assegnato da `scripts/grant-admin.ts` (usa Admin SDK + `revokeRefreshTokens`).
- Letto lato client in `AuthContext.tsx:93`: `tokenResult.claims.admin === true`.
- Verificato lato server in `src/lib/server/adminAuth.ts:28`.
- Verificato nelle rules: `firestore.rules:45-47` e `storage.rules:32-34`.

`src/lib/auth/adminAllowlist.ts` definisce `SUPER_ADMIN_EMAILS_LOWER = new Set(['info@3dmakes.ch'])` ma **il modulo non è importato da nessuna parte** (dead code verificato). Non c'è più alcun gate admin basato su email.

**Non esistono** i ruoli: company admin, pilot, operator, viewer. Non c'è multi-tenancy: ogni risorsa è legata a un singolo `userId`.

---

## 7. Multi-tenancy e modello "azienda"

**FACT:** non esiste un'entità azienda autonoma. "Azienda" è rappresentata in due modi indipendenti:
1. `UserAccount.accountType: 'private' | 'company'` + campi `companyName`, `companyVat`, `companyUniqueNumber`, `companyContactPerson` (`src/lib/types/account.ts`).
2. `Operator.kind: 'private' | 'company'` + sotto-oggetto `Operator.company` (`src/lib/types/entities.ts:49-70`).

**Conseguenze (FACT):**
- Non esistono collection `companies`, `members`, `invitations`, `teams`.
- Non esiste il concetto di "membro di un'azienda": nessun campo `companyId` in nessun tipo.
- Un'azienda con 10 piloti **non è modellabile**: servirebbero 10 account separati e non condividerebbero nulla.
- I piani commerciali Team/Business (`src/config/pricing.ts:133-173`) vendono `maxOperators: 25` e `200`, ma il codice impone `MAX_OPERATORS_PER_USER = 3` (`src/lib/server/quota.ts:10`) e le rules non conoscono le aziende.

Questo è il **gap più grande fra modello commerciale e modello dati**. Vedi `DRONETAG_PRODUCT_READINESS.md`.

---

## 8. Sicurezza a livello di piattaforma configurata

### 8.1 Security headers (`next.config.ts:163-185`) — FACT

Applicati a `/:path*`:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(self), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()`
- `Content-Security-Policy`: **emesso solo se `CSP_ENFORCE === 'true'`**. Il commento nel file dice "Report-Only" ma il codice non emette alcun header report-only: o è enforce, o è assente.

La CSP definita include `'unsafe-inline'` su `script-src` e `style-src` (scelta documentata e motivata alle righe 51-59).

### 8.2 App Check (FACT)

- Client: inizializzato in `src/lib/firebase/config.ts:81-108` solo se è presente `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` o `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`. Fallisce in silenzio (`console.warn`).
- Cloud Functions: `functions/src/util.ts:44-51`, `requireAppCheck()` con toggle `APP_CHECK_ENFORCE`.
- Firestore rules: **non** verificano `request.app` (TODO esplicito a `firestore.rules:33-36`).
- **Route Handlers Next.js: nessuna verifica App Check.**

**INFERENCE critica:** poiché il client usa i Route Handlers (non le callable) per tutte le create, App Check non protegge di fatto nessuna operazione di scrittura, tranne `submitReport`.

---

## 9. Cloud Functions

`functions/src/index.ts:29-33`: `setGlobalOptions({ region: 'us-central1', maxInstances: 20, timeoutSeconds: 30 })`.

| Funzione | Tipo | Auth | Usata dal client? |
|---|---|---|---|
| `submitReport` | `onCall` v2, `cors: true` | anonima + App Check + rate limit | **SÌ** |
| `createDrone` | `onCall` v2 | `requireAuth` + App Check + quota | **NO** |
| `createOperator` | `onCall` v2 | idem | **NO** |
| `createCertificate` | `onCall` v2 | idem | **NO** |
| `createDocument` | `onCall` v2 | idem | **NO** |
| `createInsurance` | `onCall` v2 | `requireAuth` + App Check (no quota) | **NO** |
| `bootstrapSlots` | trigger v1 `auth.user().onCreate` | sistema | n/a |

I wrapper `callCreateDrone`, `callCreateOperator`, `callCreateCertificate`, `callCreateDocument`, `callCreateInsurance` sono definiti in `src/lib/firebase/callable.ts:47-93` e **non sono importati da nessun file**. Solo `callSubmitReport` è usato.

Non esistono trigger Firestore, trigger Storage, o scheduled job.

---

## 10. Testing, logging, monitoring

### Testing (FACT)
**Zero.** Nessun file `*.test.*`, `*.spec.*`, nessuna directory `tests/`, `e2e/`, `__tests__/`, `cypress/`. Nessuna dipendenza di test in `package.json`. Nessun test delle Firestore rules (`@firebase/rules-unit-testing` assente).

### Logging (FACT)
- 51 chiamate `console.*` in `src/` (34 `error`, 14 `warn`, 2 `info`, 1 `log`).
- 0 chiamate `console.*` in `functions/src/` — usa correttamente `firebase-functions/logger`.
- Nessun logging strutturato lato Next.js.
- Nessun error monitoring (no Sentry / Bugsnag / Rollbar).
- `src/lib/analytics/index.ts` è un'astrazione ben progettata con allow-list di eventi e sanitizzazione PII, ma il client attivo è `ConsoleAnalyticsClient`, che in produzione **non fa nulla** (`return` immediato se `NODE_ENV === 'production'`). Nessun vendor è cablato.

### Audit trail (FACT)
- Nessuna collection `auditLog` / `adminActions`.
- L'unico audit è parziale: `Drone.activeOperatorSetAt/SetBy/Reason` e `reports._origin.ip` + `reports._serverTs`.
- Le azioni admin (verifica documenti, modifica slot, modifica dati utente, cancellazione drone) **non lasciano traccia**.

### Health check (FACT)
`GET /api/health` restituisce build info, `firebase.adminConfigured`, `security.appCheckEnforce`, `security.cspMode`. Non richiede autenticazione — espone informazioni di configurazione a chiunque.

---

## 11. Artefatti e file sospetti in repository (FACT)

| Percorso | Dimensione | Problema |
|---|---|---|
| `.netlify/functions/___netlify-server-handler.zip` | **21,2 MB** | Artefatto di build Netlify **committato in git**. Contiene un file `.env.local` (26 righe) e l'intero bundle server + `node_modules`. Vedi `DRONETAG_SECURITY_AUDIT.md` § SEC-003. |
| `.netlify/**` (resto) | ~5 MB | `deploy/v1/blobs`, `static/`, `edge-functions/`. Tutto artefatto di build. |
| `eng.traineddata` | **5,2 MB** | Modello linguistico Tesseract nella root. Dovrebbe stare in `public/` o essere scaricato a runtime. |
| `public/demo/*` | ~2 MB | 10 immagini demo + `sample-doc.pdf`, servite in produzione. |
| `scripts/create-admin.ts` | 1,6 KB | **Password admin hardcoded.** Vedi § SEC-001. |

`.gitignore` contiene `.netlify/` (riga finale), quindi la directory è stata committata **prima** che la regola fosse aggiunta e non è mai stata rimossa dall'indice.

---

## 12. Deriva documentazione ↔ codice (FACT)

| Documento | Afferma | Realtà |
|---|---|---|
| `README.md:102`, `.env.local.example:27` | `src/proxy.ts` verifica i token e gatea `/admin` | Il file non esiste |
| `docs/STAGING-SIGNOFF.md:21` | Admin "locked behind custom-claim + `proxy.ts`" | Solo claim + gate client-side |
| `scripts/grant-admin.ts:4-6` | "replaces the **deleted** `scripts/create-admin.ts`" | Il file **non è stato cancellato** ed è ancora tracciato |
| `docs/DEPLOY_PRODUCTION.md:37-47` | Progetto Firebase `dronetag-prod` separato | `.firebaserc` ha un solo progetto: `dronetag-e905d` |
| `docs/DEPLOY_PRODUCTION.md:40` | env `NEXT_PUBLIC_APP_CHECK_SITE_KEY` | Il codice legge `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` / `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` |
| `next.config.ts:48` | "CSP is OFF by default (no header)" — corretto | ma il commento a riga 165 e `docs/` parlano di Report-Only, mai emesso |
| `src/lib/firebase/support.ts:5` | "Live: not wired yet" | Corretto — ma l'UI di support è completa e sembra funzionante |
| `firestore.rules:120,144,...` | "→ see functions/src/create-*.ts" | Le create passano dai Route Handler, non dalle functions |

Il file `TECHNICAL_HANDOVER.md` già presente in repo è invece **accurato** su questi punti (righe 120, 196-198, 365-366).

---

## 13. Architettura target raccomandata (proposta, NON implementata)

```
CLIENT (React)
  │  legge:  Firebase client SDK  (solo read, protetto da rules)
  │  scrive: SEMPRE via /api/*    (mai write diretto)
  ▼
NEXT.JS ROUTE HANDLERS  (runtime nodejs)
  │  + middleware.ts o proxy.ts   ← gate server-side /admin e /account
  │  + validazione schema (zod)   ← oggi manuale
  │  + rate limiting              ← oggi assente
  │  + App Check verification     ← oggi assente
  │  + audit log                  ← oggi assente
  ▼
FIREBASE ADMIN SDK  →  Firestore / Storage
  │
  └─ firestore.rules = ultima linea di difesa (write client = deny quasi ovunque)

CLOUD FUNCTIONS  →  SOLO eventi asincroni:
  • bootstrapSlots           (auth.onCreate)              ← già corretto
  • notifiche email/push su reports (trigger Firestore)   ← DA IMPLEMENTARE
  • alert scadenze (scheduled job)                        ← DA IMPLEMENTARE
  • webhook pagamenti                                     ← DA IMPLEMENTARE
  • submitReport                                          ← può restare callable
                                (oppure diventare route handler con rate limit)
```

Motivazione della scelta e piano di migrazione dettagliato con benefici, rischi, complessità e priorità: vedi **`DRONETAG_BACKEND_AUDIT.md` § 7**.

---

## 14. Cosa NON è stato possibile determinare dal codice (UNKNOWN)

1. Se le `firestore.rules` e `storage.rules` presenti in repo siano **effettivamente deployate** sul progetto `dronetag-e905d`.
2. Se le 7 Cloud Functions siano effettivamente deployate e attive.
3. Se App Check sia in modalità enforce o monitor nella console Firebase.
4. Quali variabili d'ambiente siano realmente configurate su Netlify.
5. Il dominio di produzione reale (i doc usano `dronetag.example` come segnaposto; l'email di contatto è `info@drone-tag.com`).
6. Se esista traffico/dati reali in produzione.
7. Se esista un progetto Firebase di staging separato.
8. Se `RESEND_API_KEY` sia configurata (senza di essa la verifica email in signup fallisce).
