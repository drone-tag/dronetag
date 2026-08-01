# DroneTag — Documentazione tecnica di passaggio (handover)

> Documento generato dall’analisi della repository. **Non sostituisce** accessi, segreti o decisioni operative del proprietario.  
> Data analisi: 31 luglio 2026.  
> Progetto Firebase di default in `.firebaserc`: `dronetag-e905d`.

---

## 1. Panoramica del progetto

### Che tipo di applicazione è

**DroneTag** è una **web application full-stack** per la gestione dell’identità digitale di operatori UAS (droni): profilo, operatori, flotta, certificati, assicurazioni, documenti, verifica admin e scheda pubblica raggiungibile via QR/NFC.

### Funzione principale

1. **Area utente (`/account`)** — gestione flotta, documenti, operatori, inbox “drone trovato”, branding, supporto (in demo), fatturazione (placeholder).
2. **Area admin (`/admin`)** — utenti, verifica documenti, droni, piani, report, NFC CSV, supporto.
3. **Scheda pubblica (`/u/[slug]`)** — pagina anonima con dati sanitizzati (holder, drone, stato attestati, assicurazione) + form “ho trovato questo drone”.
4. **Landing / marketing (`/`)** — acquisizione e ingresso a login/signup.
5. **Demo mode** — se mancano le variabili Firebase client, l’app gira con store in-memory/localStorage e switch di persona (utile per demo cliente senza Firebase).

### Statico / SPA / full-stack

| Aspetto | Valutazione |
|---|---|
| Rendering | **Next.js App Router** (SSR/RSC dove applicabile + pagine client-heavy) |
| Backend app | **Route Handler** Next.js (`src/app/api/**`) con Firebase Admin SDK |
| Backend Firebase | **Cloud Functions** callable + trigger `bootstrapSlots` |
| Dati | **Cloud Firestore** + **Cloud Storage** |
| Auth | **Firebase Authentication** |

Non è un sito statico puro né una SPA isolata: è un’**applicazione full-stack** Next.js + Firebase.

### CMS / page builder

**Nessun CMS né page builder.** UI e contenuti di marketing sono **codice custom** (React + i18n in `src/lib/i18n/*`).

---

## 2. Stack tecnologico

| Elemento | Dettaglio |
|---|---|
| Framework | **Next.js** `^16.2.12` (`package.json`) |
| UI library | **React** `19.2.4` + **react-dom** `19.2.4` |
| Linguaggio | **TypeScript** `^5` |
| CSS | **Tailwind CSS v4** (`tailwindcss` + `@tailwindcss/postcss`) + CSS variables in `src/app/globals.css` |
| Altri UI kit | Nessun Bootstrap / MUI / Chakra; componenti custom in `src/components/ui/` |
| Firebase client | `firebase` `^12.11.0` |
| Firebase server | `firebase-admin` `^14.2.0` |
| PDF / OCR | `pdfjs-dist`, `tesseract.js` (+ file `eng.traineddata` in root) |
| Auth helper | `react-firebase-hooks` (presente nelle dipendenze) |
| ID | `uuid` |
| Package manager | **npm** (`package-lock.json`; non yarn/pnpm) |
| Node raccomandato | **`.nvmrc` → `22`**; `package.json` engines `>=20.9.0`; Cloud Functions engines **`20`**; Netlify `NODE_VERSION=20` |
| Lint | ESLint 9 + `eslint-config-next` |

**Nota:** il README parla ancora di “Next.js 14+” e Node 18; la fonte di verità è `package.json` / `.nvmrc`.

---

## 3. Struttura della repository

### Cartelle principali

```
dronetag/
├── src/                    # Applicazione Next.js
│   ├── app/                # App Router (pagine + API)
│   ├── components/         # UI (account, admin, auth, landing, layout, profile, pwa, ui)
│   ├── contexts/           # Auth, Language, Theme
│   └── lib/                # Firebase, server, demo, i18n, parser, types, utils…
├── functions/              # Cloud Functions (TypeScript → lib/)
├── public/                 # Asset statici, PWA, demo images/PDF
├── scripts/                # Seed, grant-admin, backfill, migrate
├── docs/                   # Deploy staging/prod, device testing, signoff
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json
├── .firebaserc
├── netlify.toml
├── next.config.ts
└── .env.local.example
```

### Dove si trova cosa

| Cosa | Percorso |
|---|---|
| Pagine | `src/app/**/page.tsx` |
| Layout | `src/app/layout.tsx`, `account/layout.tsx`, `admin/layout.tsx`, `u/layout.tsx` |
| API | `src/app/api/**/route.ts` |
| Componenti | `src/components/**` |
| Stili globali | `src/app/globals.css`, `postcss.config.mjs` |
| Immagini / PWA | `public/` (`logo.png`, icone, `sw.js`, `demo/*`) |
| Config Firebase client | `src/lib/firebase/config.ts` |
| Config Admin SDK | `src/lib/server/firebaseAdmin.ts` |
| Tipi dominio | `src/lib/types/entities.ts`, `account.ts`, `index.ts` |
| Demo seed | `src/lib/demo/*` |
| NFC helpers | `src/lib/nfc/payload.ts` |
| Deploy docs | `docs/DEPLOY_*.md` |

### App Router vs Pages Router

Si usa esclusivamente l’**App Router** (`src/app/`). Non esiste `pages/`.

### File di avvio / configurazione

| File | Ruolo |
|---|---|
| `package.json` | Script `dev` / `build` / `start` / `lint` |
| `next.config.ts` | Guard produzione su env Firebase, header di sicurezza, CSP opzionale, redirect legacy |
| `tsconfig.json` | Path `@/*` → `src/*` |
| `netlify.toml` | Build Netlify + plugin Next.js |
| `firebase.json` | Rules, indexes, functions |
| `src/app/layout.tsx` | Root layout, provider, theme boot script |

**Assenza rilevante:** non risulta presente `middleware.ts` né `src/proxy.ts` (citato in README/`next.config` come hardening futuro). La protezione delle route `/admin` e `/account` è **client-side** nei rispettivi layout.

---

## 4. Firebase e backend

### Servizi utilizzati

| Servizio | Uso |
|---|---|
| **Authentication** | Email/password, Google popup, OTP telefono (link credential), custom claim `admin` |
| **Cloud Firestore** | Modello multi-entity + legacy `profiles` |
| **Cloud Storage** | Upload utente sotto `users/{uid}/…` |
| **Cloud Functions** | Create privilegiati + `submitReport` + `bootstrapSlots` (onCreate user) |
| **App Check** | Init client con reCAPTCHA Enterprise o v3; enforce lato Functions via `APP_CHECK_ENFORCE` |
| **Hosting Firebase** | **Non** usato come host primario dell’app Next (deploy previsto su Netlify/Vercel) |
| **Analytics Firebase** | Non integrato; esiste astrazione vendor-neutral in `src/lib/analytics` (console in dev) |
| **Remote Config / FCM / Crashlytics** | Non presenti nel codice |

### Inizializzazione

| Layer | File |
|---|---|
| Client Firebase | `src/lib/firebase/config.ts` |
| Auth helpers | `src/lib/firebase/auth.ts`, `phoneAuth.ts` |
| Firestore data layer | `src/lib/firebase/{account,drones,operators,certificates,insurances,documents,dronesPublic,slots,orders,plans,reports,pilots,storage,support}.ts` |
| Callable wrappers | `src/lib/firebase/callable.ts` |
| Admin SDK | `src/lib/server/firebaseAdmin.ts` |
| Functions entry | `functions/src/index.ts` |

### Variabili di configurazione

- Client: `NEXT_PUBLIC_FIREBASE_*` (inline a build time).
- Se mancano `NEXT_PUBLIC_FIREBASE_API_KEY` o `PROJECT_ID` → **`DEMO_MODE = true`**.
- Server: `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON one-line) o `FIREBASE_SERVICE_ACCOUNT_PATH` (path a file fuori repo).
- Template ufficiale: `.env.local.example` (nessun valore segreto nel template).

### Dual path create (importante)

- **Firestore rules** negano `create` client su drone/operator/cert/doc/insurance/report → obbligano Admin SDK o Functions.
- Il **client attuale** crea entity tramite **Next.js API** (`/api/entities/*` + Admin SDK), non tramite i callable di create.
- I **callable** in `functions/` restano nel codice e sono usati almeno per **`submitReport`**; i create callable esistono come percorso parallelo/documentato ma il data-layer punta alle API Next.

---

## 5. Autenticazione e ruoli

### Come funziona il login

1. Pagine `/login` e `/signup`.
2. Provider: **Email/Password**, **Google** (`signInWithPopup`), telefono per **verifica contatto** (link a utente già loggato).
3. Signup con **OTP email** (Resend) via `/api/auth/otp/email/*`.
4. Dopo login, `AuthContext` ottiene l’ID token, legge claim `admin`, setta cookie `__dronetag_idt` e tenta sessione HttpOnly via `POST /api/session`.
5. Redirect: admin → `/admin`; utente → `/account`.

### Ruoli

| Ruolo | Come è determinato | Accesso |
|---|---|---|
| **Utente** | Auth Firebase senza claim admin | `/account/**` |
| **Admin (staff)** | Custom claim JWT `admin == true` (script `npm run grant-admin`) | `/admin/**` — **non** `/account` |
| **Anonimo** | Nessuna auth | Landing, `/u/[slug]`, submit report via Function |

Tipi account business: `private` | `company` su documento `users/{uid}` (non sono ruoli di autorizzazione).

### Controlli permessi

| Livello | Dove |
|---|---|
| UI | `src/app/admin/layout.tsx`, `src/app/account/layout.tsx` |
| API | `requireUserFromRequest` / `requireAdminFromRequest` |
| Firestore | `isAdmin()` = `request.auth.token.admin == true` |
| Storage | owner path `users/{uid}` + admin |

**File residuo:** `src/lib/auth/adminAllowlist.ts` (email hardcodata + parser `NEXT_PUBLIC_ADMIN_EMAILS`) — **non risulta importato** altrove; README afferma che l’allowlist client è stata rimossa. Il claim Firebase è la fonte di verità.

### Route protette / middleware

- **Nessun middleware Edge** attivo per gate `/admin`.
- Protezione UI: redirect client-side.
- Protezione dati: Firestore rules + API Admin SDK.
- Rischio: HTML/JS admin può essere scaricato da non-admin, ma le mutazioni privilegiate devono fallire senza claim (dipende da corretta configurazione Admin SDK e rules deployate).

### DEMO_MODE

In demo, ogni “persona” ha `isAdmin` fisso; non c’è Firebase reale. Build di produzione **rifiuta** bundle senza `NEXT_PUBLIC_FIREBASE_*` (`next.config.ts`). Su HTTPS non-localhost con DEMO_MODE l’app **lancia errore** a runtime.

---

## 6. Database

### Collezioni Firestore individuate

| Collezione | Ruolo |
|---|---|
| `users` | Account (anagrafica, branding, tipo private/company) |
| `pilots` | Pilota 1:1 con uid |
| `operators` | Fino a N operatori (privato/azienda) per utente |
| `drones` | Unità di flotta; ha `slug`, status, visibility, verification |
| `dronesPublic` | Snapshot sanitizzato pubblico (doc id = slug) |
| `insurances` | Polizze collegate a drone e/o operator |
| `certificates` | Attestati (A1/A3, A2, STS, custom) |
| `documents` | Documenti generici uploadati |
| `slots` | Quote piano (drone, operator, certificate, …) |
| `plans` | Catalogo piani (read pubblico, write admin) |
| `reports` | Segnalazioni “drone trovato” |
| `rateLimits` | Bucket rate-limit Functions |
| `orders` | Ordini (legacy / NFC badge ordering UI) |
| `signupOtp` | Challenge OTP signup (solo Admin SDK) |
| `profiles` | **Legacy** admin-only (migrazione in corso) |

**Support chat:** implementata in **demo** (`supportThreads` in store); in live `src/lib/firebase/support.ts` restituisce empty / throw — **nessuna rule Firestore** per support.

**Billing/subscriptions:** tipi/placeholder; nessuna collezione `subscriptions` attiva nel codice di produzione.

### Relazioni principali

```
users/{uid}
  ├── pilots/{uid}
  ├── slots/{uid}
  ├── operators/{opId}          (userId)
  ├── drones/{droneId}          (userId, slug, defaultOperatorId, insuranceId, linkedPilotId)
  │     └── dronesPublic/{slug} (proiezione)
  ├── certificates/{id}         (userId)  → influenzano badge “attestati” pubblici
  ├── documents/{id}            (userId)
  ├── insurances/{id}           (userId, droneIds[], operatorId?)
  ├── reports/{id}              (ownerUserId, droneId, droneSlug)
  └── orders/{id}               (userId)
```

**Badge NFC/QR:** non è un documento separato. Il “badge” fisico punta a **`/u/{slug}`** dove `slug` è proprietà del **drone**.

### Operazioni principali

| Operazione | Percorso tipico |
|---|---|
| Create entity | `POST /api/entities/*` (Admin SDK + quota) |
| Upload PDF | `POST /api/entities/.../pdf|file` → Storage + eventuale auto-verify |
| Update entity | Client Firestore `updateDoc` entro allow-list rules |
| Verifica admin | Client `update*` di `verificationStatus` (admin) + notify support (demo) |
| Sync pubblico | `syncDronePublicSnapshot` / `resyncUserPublicDrones` / API admin resync |
| Report trovato | Callable `submitReport` |
| Bootstrap quote | Function `bootstrapSlots` su create user |

### Regole di sicurezza (sintesi)

- Default deny.
- Owner non può auto-impostare `verificationStatus` (escluso dalle `hasOnly`).
- Create privilegiate deny-from-client.
- `dronesPublic` read anonimo; write solo owner del drone referenziato (o admin).
- Storage: write solo su `users/{uid}` con MIME allowlist e max 20 MB; read ampio (URL con token).
- TODO nel codice rules: App Check Firestore-side non ancora forzato.

---

## 7. Badge NFC e profili pubblici

### Associazione badge ↔ drone/utente

- Il badge (NFC/QR) **non contiene PII**: contiene un’**URI HTTPS** verso `/u/<slug>`.
- Lo **slug** identifica il **drone** (non l’utente). L’holder mostrato deriva da operator effettivo o pilot.
- Admin tool: `/admin/nfc` + helper `src/lib/nfc/payload.ts` (`buildPublicUrl`, `validateNfcUrl`, `exportNfcCsv`) per export CSV verso writer esterni (NXP/Zebra). **Nessuna scrittura hardware nel repo.**

### Identificativi

| ID | Generazione / uso |
|---|---|
| `drone.slug` | Mint lato create (API/Function); immutabile per owner nelle rules |
| URL pubblico | `{origin}/u/{slug}` (`getPublicProfileUrl`) |
| Validazione NFC | https + host atteso + path `/u/<slug>` + slug `[a-z0-9-]` |

### Pagine aperte da NFC/QR

- **`/u/[slug]`** — unica pagina pubblica del badge.
- Dati da `dronesPublic/{slug}` (in demo: re-proiezione live da entity).

### Privacy / dati pubblici

Proiezione (`projectSnapshot` / `toPublicDroneCard`):

- **Esposti:** nome holder (operator/pilot), manufacturer/model/class/serial drone, stato verifica attestati (derivato dai certificati), stato polizza, provider, scadenza, policy mascherata, PDF polizza URL se presente, branding (foto/logo/banner).
- **Non esposti:** telefono, indirizzo, DOB, VAT, controller serial, uid, ID interni, documenti certificato grezzi, ecc.
- Download URL Storage restano **token longevi** una volta emessi (by design, documentato in `storage.rules`).

Stato “Utente verificato” / “Attestati” sulla card pubblica usa `verificationStatus` dello snapshot, derivato da **`deriveCertificateVerification(certificates)`**, non dal solo `drone.verificationStatus`.

---

## 8. Variabili d’ambiente e credenziali

### Nomi richiesti / usati (solo nomi, nessun valore)

**Client (`NEXT_PUBLIC_*`):**

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION`
- `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN`
- `NEXT_PUBLIC_TRUSTED_PDF_HOSTS`
- `NEXT_PUBLIC_ALLOW_SIGNUP`
- `NEXT_PUBLIC_GIT_COMMIT_SHA` (opzionale; fallback Vercel/GitHub)

**Server / build:**

- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `FIREBASE_SERVICE_ACCOUNT_PATH`
- `GOOGLE_APPLICATION_CREDENTIALS` (fallback Admin)
- `APP_CHECK_ENFORCE`
- `CSP_ENFORCE`
- `TRUSTED_PDF_HOSTS`
- `RESEND_API_KEY`
- `OTP_EMAIL_FROM`
- `SEED_AUTH_EMAIL` / `SEED_AUTH_PASSWORD` (solo script)
- `NODE_ENV`, `VERCEL_GIT_COMMIT_SHA`, `GITHUB_SHA`

**Documentate in docs ma naming leggermente diverso:** `NEXT_PUBLIC_APP_CHECK_SITE_KEY` (docs staging) vs chiavi reCAPTCHA effettive in `.env.local.example`.

**File di riferimento utilizzo:**  
`.env.local.example`, `src/lib/firebase/config.ts`, `src/lib/server/firebaseAdmin.ts`, `src/lib/server/otp.ts`, `src/lib/config/features.ts`, `next.config.ts`, `src/app/api/health/route.ts`, `functions/src/util.ts`, `scripts/*`.

### Credenziali / segreti scritti nel codice (CRITICO)

| File | Problema |
|---|---|
| **`scripts/create-admin.ts`** | Config Firebase web **hardcodata** + **email/password admin in chiaro**. Va **ruotata la password**, invalidato l’utente se esposto, e lo script va riscritto per usare solo env. **Non rieseguire in produzione così com’è.** |
| `src/lib/auth/adminAllowlist.ts` | Email super-admin hardcodata (`info@3dmakes.ch`) — codice apparentemente dead |
| `src/lib/config/features.ts` | URL affiliato Coverdrone con parametro `Source=…` (non segreto ma business-sensitive) |
| `.firebaserc` | Project ID `dronetag-e905d` (non segreto) |

`.gitignore` esclude correttamente `.env*`; **non** esclude però il contenuto pericoloso di `scripts/create-admin.ts` se già tracciato da git.

---

## 9. Sicurezza

### Vulnerabilità / rischi evidenti

1. **Password e config Firebase committate** in `scripts/create-admin.ts` → priorità massima: rotazione + rimozione dalla history se il repo è o sarà pubblico.
2. **Nessun middleware server** su `/admin` → difesa principalmente claim + rules + API (OK se rules deployate; debole se qualcuno si affida solo all’UI).
3. **`proxy.ts` assente** rispetto a documentazione PR-SEC → gap rispetto al design documentato.
4. **DEMO_MODE** locale: UX admin completa senza backend; pericoloso solo se si deployasse senza env (mitigato da build guard + throw HTTPS).
5. **Storage `allow read: if true`** su path utente → chiunque con URL/token scarica; accettato per QR pubblici ma attenzione a PDF sensibili linkati.
6. **CSP** non attivo di default (`CSP_ENFORCE`); con enforce usa ancora `'unsafe-inline'` su script/style.
7. **App Check** Firestore/Storage: TODO enforce nelle rules; Functions toggle tramite env.
8. **Owner update insurance/certificate** può cambiare `pdfUrl`/`fileUrl` (allow-list) — mitigato da allowlist host lato server su upload API; URL paste va monitorato.
9. **Billing webhook** `/api/billing/webhook` è placeholder (Noop) — non verificare firme Stripe finché non implementato.
10. **Support live** non wired → notifiche verifica admin in produzione possono non funzionare come in demo.
11. **Dual create path** (Functions vs Next API) → rischio drift di validazione/quota se entrambi restano deployati e usati in modo misto.
12. **`adminAllowlist` / email hardcodate** — igiene e possibili false aspettative.
13. **Analisi dipendenze CVE:** non eseguita in questo handover (`npm audit` non lanciato per vincolo “non installare/modificare”); da fare in onboarding.

### Controlli solo frontend

- Gate layout admin/account.
- Validazioni form UX (parser match, ecc.).
- Slot caps: enforce reale su create API/Functions; commento rules ancora menziona rischi storici.

### Dati personali

- PII in `users`, `pilots`, `operators`, `reports` (finder email/name).
- Pubblico: proiezione ridotta; branding può includere foto.
- OTP e service account solo server.

### Endpoint

| Endpoint | Protezione |
|---|---|
| `/api/entities/*`, `/api/account/branding`, OTP, contact-verification, files/proxy | Bearer/session + ownership |
| `/api/admin/*` | Claim admin |
| `/api/health` | Pubblico (info config, non segreti) |
| `/api/session` | Scambio token |
| `/api/billing/webhook` | Placeholder |

---

## 10. Avvio locale

### Prerequisiti

- Node **20.9+** (ideale **22** via `nvm use`)
- npm
- (Opzionale Firebase) progetto con Auth, Firestore, Storage, Functions (Blaze), service account
- Per OTP email: Resend
- Per App Check locale: debug token o chiavi reCAPTCHA

### Comandi

```bash
# Dipendenze app
npm install

# (Opzionale) Functions
cd functions && npm install && cd ..

# Env
cp .env.local.example .env.local
# Compilare le variabili; oppure lasciare vuoto → DEMO_MODE

# Sviluppo
npm run dev
# → http://localhost:3000

# Lint
npm run lint

# Build produzione (richiede NEXT_PUBLIC_FIREBASE_* minimi)
npm run build

# Avvio build
npm run start
```

### Script utili

```bash
npm run grant-admin -- <email>
npm run grant-admin -- <email> --revoke
npm run backfill-public
```

Altri script in `scripts/` via `tsx --env-file=.env.local` (vedi `scripts/README.md`).

---

## 11. Deploy

### Dove sembra ospitata l’app

- **Frontend/SSR Next:** **Netlify** (`netlify.toml`, `.netlify/`, plugin `@netlify/plugin-nextjs`) e/o **Vercel** (documentato in `docs/DEPLOY_*.md`).
- **Firebase:** rules, indexes, storage rules, Cloud Functions sul progetto (default locale `dronetag-e905d`; docs menzionano `dronetag-staging` / `dronetag-prod`).
- **Non** risulta Firebase Hosting come host dell’app Next.

### Procedura indicativa

1. Configurare env sul host (matrice in `docs/DEPLOY_STAGING.md`).
2. `firebase use <alias>`
3. Deploy indexes → rules Firestore/Storage → functions.
4. `npm run backfill-public` se necessario.
5. Deploy Netlify/Vercel (`netlify deploy --build --prod` o `vercel --prod`).
6. Verificare `/api/health`.
7. Grant admin, soak CSP/App Check secondo checklist.

### Dominio / DNS

- Contatti UI: `info@drone-tag.com`, OTP from di default `noreply@drone-tag.com`.
- Domini effettivi di staging/prod **non** sono fissati nel codice (placeholder `dronetag.example` in docs/NFC).
- DNS, certificati e custom domain: **da richiedere al proprietario / al pannello Netlify|Vercel**.

---

## 12. Dipendenze esterne

### Pacchetti principali (app)

| Pacchetto | Scopo | Criticità |
|---|---|---|
| `next` / `react` / `react-dom` | Runtime UI | Critico |
| `firebase` / `firebase-admin` | Backend BaaS | Critico |
| `tailwindcss` | Stile | Alto |
| `pdfjs-dist` | Estrazione testo PDF | Alto (parser) |
| `tesseract.js` | OCR certificati | Medio |
| `uuid` | ID | Medio |
| `react-firebase-hooks` | Hook auth (se usato) | Basso/verificare uso effettivo |
| `tsx` (dev) | Script | Dev |
| `eslint*` / `typescript` | Qualità | Dev |

### Functions

| Pacchetto | Scopo |
|---|---|
| `firebase-functions` / `firebase-admin` | Callables + trigger |

### Servizi terzi

- **Resend** (email OTP)
- **reCAPTCHA** / App Check
- **Coverdrone** (CTA rinnovo polizza, URL affiliato)
- Stripe (solo astrazione futura)
- PostHog/GA (solo hook analytics futuro)

### Apparentemente inutilizzati / obsoleti / duali

- Callable **create*** Functions vs API Next (duplicazione).
- `adminAllowlist.ts` non referenziato.
- Legacy `profiles` + script di migrazione.
- `eng.traineddata` binario grande in root (OCR).
- README parzialmente outdated (Next 14, Node 18, struttura admin profiles).

---

## 13. Stato di completamento

| Area | Stato | Note |
|---|---|---|
| Landing multilanguage | Completata | en/it/de/es/fr |
| Auth email/Google/signup OTP | Completata / parziale | Dipende Resend + Firebase |
| Account multi-entity (operatori, droni, cert, ins, doc) | Completata | Create via API Admin |
| Scheda pubblica + report trovato | Completata | Report via Function |
| Verifica admin coda/archivio | Completata (UX) | Notifiche support complete in demo |
| Parser PDF + auto-verify | Completata / parziale | Server `parserAutoVerify`; OCR best-effort |
| Snapshot `dronesPublic` + privacy | Completata | |
| Security rules PR-SEC | Completata / parziale | App Check Firestore TODO; CSP off default |
| PWA (manifest, SW, install prompt) | Completata | |
| Demo mode + seed persona | Completata | Per pitch cliente |
| Admin NFC CSV | Completata (tooling) | Nessuna scrittura tag hardware |
| Billing / Stripe | **Simulata / placeholder** | CTA disabled, webhook noop |
| Support chat live | **Solo demo** | `support_unavailable` in live |
| Pay-to-edit identity locked | **Mancante** | Copy “contatta supporto” |
| OTP su accept documento | **Mancante** | Solo signup OTP |
| Multi-tenant org avanzato | **Mancante** | Roadmap README |
| Middleware/proxy admin Edge | **Mancante** | Documentato ma assente |
| Analytics vendor | **Mancante** | Solo console dev |
| Hosting Firebase app | Non usato | |
| Pubblicazione drone da utente | Limitata | Commento: publication admin-only |

### Problemi tecnici noti ricavabili dal codice

- Segreto in `scripts/create-admin.ts`.
- Drift documentazione (README vs Next 16 / Node 22 / API create).
- Support e billing incompleti in produzione.
- Enforce App Check/CSP ancora staged.
- Seed revision demo richiede hard refresh dopo bump.
- Possible stale `dronesPublic` se sync fallisce (log + backfill).

---

## 14. Procedura di consegna (checklist)

### Repository

- [ ] Accesso Git (GitHub/GitLab) con permessi admin
- [ ] Branch di default, protezione `main`, CI se presente
- [ ] Rimuovere/ruotare segreti da `scripts/create-admin.ts` e history se necessario
- [ ] Confermare se il remote contiene già `.env` o chiavi (non dovrebbe)

### Accessi persone

- [ ] Elenco sviluppatori + offboarding
- [ ] Account Firebase Console (ruoli IAM)
- [ ] Account Netlify e/o Vercel
- [ ] Google Cloud (Functions, reCAPTCHA Enterprise)
- [ ] Resend
- [ ] Eventuale 1Password/Bitwarden vault

### Firebase

- [ ] Progetti: staging vs prod (alias `firebase use`)
- [ ] Auth providers abilitati (Email, Google, Phone)
- [ ] Custom claims admin esistenti
- [ ] Rules/indexes/functions allineati al commit consegnato
- [ ] Service account dedicati (staging ≠ prod), rotazione

### Hosting

- [ ] Site Netlify / project Vercel
- [ ] Env vars per environment
- [ ] Deploy hooks / preview
- [ ] Rollback procedure

### Dominio / DNS / email

- [ ] Dominio produzione e staging
- [ ] Record DNS (A/CNAME), SSL
- [ ] Caselle `info@drone-tag.com` / mittente OTP
- [ ] Dominio verificato su Resend

### Variabili d’ambiente

- [ ] Copiare matrice da `.env.local.example` + docs deploy
- [ ] Nessun segreto in chat; solo vault
- [ ] Allineare `TRUSTED_PDF_HOSTS` ↔ `NEXT_PUBLIC_TRUSTED_PDF_HOSTS`

### Backup

- [ ] Export Firestore / schedule backup GCP
- [ ] Backup Storage
- [ ] Procedura restore

### Documentazione

- [ ] Questo file `TECHNICAL_HANDOVER.md`
- [ ] `docs/DEPLOY_STAGING.md`, `DEPLOY_PRODUCTION.md`, `STAGING-SIGNOFF.md`, `DEVICE_TESTING.md`
- [ ] Aggiornare README obsoleto (task post-consegna)

### Terze parti

- [ ] Coverdrone affiliate source
- [ ] reCAPTCHA keys bound agli origin reali
- [ ] Future Stripe account (se in roadmap)

---

## 15. Domande aperte (da chiedere al proprietario)

1. Qual è il **remote Git ufficiale** e chi ha ownership?
2. Quali sono gli URL reali di **staging** e **produzione**?
3. L’hosting attivo è **Netlify, Vercel, entrambi o altro**?
4. Il progetto Firebase `dronetag-e905d` è staging, prod o sandbox? Esistono già `dronetag-staging` / `dronetag-prod`?
5. La password in `scripts/create-admin.ts` è ancora valida? È già stata ruotata?
6. Chi sono gli admin con claim `admin` oggi (lista email/uid)?
7. Resend: dominio e API key dove sono custoditi? OTP in prod è attivo?
8. App Check: monitor o enforce su Firestore/Storage/Functions in ciascun ambiente?
9. CSP: è mai stato messo `CSP_ENFORCE=true` in un ambiente?
10. Google Sign-In: OAuth client IDs e authorized domains configurati?
11. Phone Auth: abilitato? Quali country codes?
12. Support chat: è in roadmap il wiring Firestore, o resta fuori scope?
13. Billing/Stripe: priorità e account?
14. Dominio `drone-tag.com` / brand DroneTag: registrar, DNS panel, scadenze?
15. Esistono dati reali di clienti già in Firestore da migrare/backupare?
16. Processo di **pubblicazione drone** (admin-only): è intenzionale per la demo di domani/go-live?
17. Hardware NFC: fornitore, encoding process, chi scrive i tag?
18. Accordi Coverdrone / compliance assicurativa?
19. Requisiti legali (GDPR DPA Firebase/Resend, retention report finder)?
20. Esiste un canale di monitoring (uptime su `/api/health`, Sentry, log)?
21. Budget Blaze Firebase e alert?
22. Preferenza Node 20 (Netlify/Functions) vs 22 (`.nvmrc`) in CI?
23. Il file `eng.traineddata` deve restare in repo o spostarsi su CDN/CI artifact?
24. Accesso al design Figma / brand assets oltre `public/`?
25. Contatto escalation prodotto (product owner) vs tech owner?

---

## Appendice A — Mappa route (sintesi)

**Pubbliche:** `/`, `/login`, `/signup`, `/u/[slug]`  

**Account:** `/account`, `profile`, `operators`, `drones`, `drones/[id]`, `certificates`, `insurances`, `documents`, `inbox`, `orders`, `billing`, `support`, `settings`, `archive` (se presente)  

**Admin:** `/admin`, `users`, `users/new`, `users/[uid]`, `verify`, `drones`, `drones/[id]`, `plans`, `reports`, `nfc`, `support`  

**API:** sotto `src/app/api/**` come elencato nelle sezioni 4–5–9.

---

## Appendice B — Comandi deploy Firebase (da docs)

```bash
firebase use <staging|prod>
firebase deploy --only firestore:indexes
firebase deploy --only firestore:rules,storage:rules
cd functions && npm ci && npm run build && cd -
firebase deploy --only functions
```

---

*Fine del report di handover. Nessuna modifica al comportamento runtime è stata necessaria oltre alla creazione di questo file.*
