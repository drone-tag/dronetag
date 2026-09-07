# DRONETAG — DEPLOYMENT & INFRASTRUCTURE HANDOVER

> Stato del repository al commit `b72f843` ("prebeta"), branch `main`.
> Remote: `https://github.com/wepopagani/dronetag.git`.
> **Nessun deploy è stato eseguito durante questo audit. Nessuna configurazione è stata modificata.**
> Nessun valore di credenziale è riportato in questo documento.

---

## 1. Sintesi

| Domanda | Risposta |
|---|---|
| Hosting dell'app | **Netlify** (`netlify.toml` + `@netlify/plugin-nextjs`). Nessun `vercel.json`. |
| Backend serverless | Netlify Functions (l'handler Next.js) **+** Firebase Cloud Functions |
| Database / Storage / Auth | Firebase, progetto **`dronetag-e905d`** |
| Regione Cloud Functions | **`us-central1`** — hardcoded in `functions/src/index.ts:30` |
| Ambienti separati | ❌ **NO.** `.firebaserc` contiene un solo progetto. |
| CI/CD | ❌ **Nessuno.** Nessuna directory `.github/workflows`, nessun `.gitlab-ci.yml`. |
| Test in pipeline | ❌ Nessun framework di test installato |
| Runbook di rollback | ❌ Assente |

---

## 2. Configurazione di hosting

### 2.1 `netlify.toml` — l'intera configurazione è 8 righe

```toml
[build]
  command = "npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
```

**Osservazioni:**
- Nessun `publish` esplicito: gestito dal plugin Next.js.
- Nessun contesto `[context.deploy-preview]` / `[context.branch-deploy]`: **ogni branch e ogni
  pull request, se il deploy automatico è attivo su Netlify, verrebbe costruito con le stesse
  variabili d'ambiente di produzione** e quindi punterebbe al database di produzione.
  **Verifica prioritaria in Netlify Console.**
- Nessun header definito qui: gli header di sicurezza arrivano da `next.config.ts` (§4).
- `NODE_VERSION = "20"`; `package.json` richiede `node >= 20.9.0`; le Cloud Functions
  dichiarano `"node": "20"`. **Le tre versioni sono coerenti** ✔

### 2.2 Vercel

Nessun `vercel.json`. `next.config.ts:34` menziona Vercel solo in un messaggio di errore, e
il codice legge `VERCEL_GIT_COMMIT_SHA` come fallback per il commit SHA. **Inferenza:** il
supporto Vercel è previsto ma non configurato. Il deploy attuale è Netlify.

### 2.3 Firebase — `firebase.json`

```json
{
  "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  "storage":   { "rules": "storage.rules" },
  "functions": [{ "source": "functions", "codebase": "default", "runtime": "nodejs20",
                  "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"] }]
}
```

**Non è configurato Firebase Hosting** — coerente con l'uso di Netlify.

### 2.4 `.firebaserc` — problema di ambiente

```json
{ "projects": { "default": "dronetag-e905d" } }
```

**Un solo progetto Firebase.** Non esiste un alias `staging` o `dev`.
`.gitignore` prevede `.firebaserc.local`, quindi il progetto era pensato per supportare alias
locali, ma nessuno è versionato.

**Conseguenze:**
- Lo sviluppo locale (`npm run dev`) punta allo stesso Firestore, allo stesso Storage e agli
  stessi utenti Auth della produzione, salvo che lo sviluppatore usi gli emulatori — e
  **nel codice non c'è alcuna configurazione di emulatore** (nessun `connectFirestoreEmulator`).
- Un errore in sviluppo modifica dati reali di utenti reali.
- Rilevanza privacy: vedi `PRV-011` in `DRONETAG_PRIVACY_AUDIT.md`.

**Raccomandazione P0 prima della beta:** creare un secondo progetto Firebase
(`dronetag-staging`), aggiungere l'alias in `.firebaserc`, e collegare i deploy preview di
Netlify a quel progetto.

---

## 3. Ambienti

| Ambiente | Esiste | Come | Dati |
|---|---|---|---|
| **Local dev** | ✔ | `npm run dev` (Webpack, non Turbopack) | **produzione** ⚠️ |
| **Emulator suite** | ❌ | `firebase.json` non ha la sezione `emulators`; nessun `connect*Emulator()` nel codice | — |
| **Deploy preview** | UNKNOWN | dipende dalla configurazione Netlify, non deducibile dal repo | **probabilmente produzione** ⚠️ |
| **Staging** | ❌ | `docs/DEPLOY_STAGING.md` esiste e descrive una procedura, ma `.firebaserc` non ha un progetto staging | — |
| **Production** | ✔ | Netlify + `dronetag-e905d` | reali |

`docs/DEPLOY_STAGING.md` (9.7 KB) e `docs/DEPLOY_PRODUCTION.md` (8.1 KB) contengono
istruzioni scritte dal precedente sviluppatore. **Attenzione: queste guide contengono almeno
un riferimento a `proxy.ts`, file che non esiste nel repository** (vedi §8). Vanno lette con
scetticismo e verificate.

---

## 4. Header di sicurezza e configurazione Next.js

`next.config.ts` (226 righe) è il file di configurazione più importante del progetto. Contiene:

**(a) Guardia di build** (righe 15-42) — il build di produzione **fallisce** se mancano
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`. Il motivo è documentato nel commento:

> *"Without them, DEMO_MODE silently activates at runtime and treats every signed-in user as
> admin (see src/contexts/AuthContext.tsx). Fail the build instead of shipping a vulnerable
> bundle."*

**Questa guardia è l'unica cosa che impedisce di pubblicare un build in cui chiunque è admin.
Non va rimossa per nessun motivo.**

**(b) Header di sicurezza** (righe 163-185), applicati a `/:path*`:

| Header | Valore | Sempre attivo |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✔ |
| `X-Content-Type-Options` | `nosniff` | ✔ |
| `X-Frame-Options` | `DENY` | ✔ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✔ |
| `Permissions-Policy` | `geolocation=(self), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()` | ✔ |
| `Content-Security-Policy` | CSP completa | ⚠️ **solo se `CSP_ENFORCE=true`** |

**La CSP è disattivata per default.** Il commento alle righe 47-49 lo dichiara
esplicitamente: *"CSP is OFF by default (no header → no Report-Only console noise in Safari).
Set CSP_ENFORCE=true in the build environment when ready to enforce."*

La CSP definita è di buona qualità (`default-src 'self'`, `frame-ancestors 'none'`,
`base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`), con `'unsafe-inline'`
su `script-src` e `style-src` — limitazione documentata e motivata alle righe 51-59.

**Azione richiesta prima della produzione: impostare `CSP_ENFORCE=true` in Netlify.**
**Verificare in Netlify Console se è già impostata** — dal repository non è deducibile.

**(c) Redirect** (righe 195-208): `/admin/profiles` e `/admin/profiles/*` → `/admin/users`
(temporanei, `permanent: false`). Traccia di una route legacy.

**(d) `images.remotePatterns`**: `firebasestorage.googleapis.com`, `storage.googleapis.com`
più gli host in `NEXT_PUBLIC_TRUSTED_PDF_HOSTS`. Il commento alle righe 209-213 chiarisce che
`/u/[slug]` usa ancora `<img>` grezzo e non `next/image`.

---

## 5. Variabili d'ambiente

**Nessun valore è riportato. Solo i nomi.**

### 5.1 Client (`NEXT_PUBLIC_*` — finiscono nel bundle, quindi pubbliche per definizione)

| Nome | Obbligatoria | Servizio | File consumatore | Note |
|---|---|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | **SÌ** (build fallisce) | Firebase | `src/lib/firebase/config.ts` | Non è un segreto: è un identificativo pubblico |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | **SÌ** (build fallisce) | Firebase | idem | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | **SÌ** (build fallisce) | Firebase | idem | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | sì (di fatto) | Firebase | idem | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | sì (di fatto) | Firebase | idem | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | sì (di fatto) | Firebase | idem | |
| `NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION` | no (default `us-central1`) | Firebase | client callable | |
| `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` | no | App Check | init App Check | **Senza questa, App Check non si attiva** |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | no | App Check | idem | alternativa alla precedente |
| `NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN` | no | App Check | dev locale | **NON impostare in produzione** |
| `NEXT_PUBLIC_TRUSTED_PDF_HOSTS` | no | CSP / immagini | `next.config.ts:94,218` | CSV di hostname |
| `NEXT_PUBLIC_ALLOW_SIGNUP` | no (default: **true**) | feature flag | `src/lib/config/features.ts` | Controlla la registrazione pubblica |
| `NEXT_PUBLIC_GIT_COMMIT_SHA` | no | versioning | UI "version" | |

### 5.2 Server (segrete — mai nel bundle)

| Nome | Obbligatoria | Servizio | File consumatore | Rischio se esposta |
|---|---|---|---|---|
| **`FIREBASE_SERVICE_ACCOUNT_KEY`** | **SÌ in produzione** | Firebase Admin | `src/lib/server/firebaseAdmin.ts` | **CRITICO — accesso totale al progetto Firebase, bypass di tutte le rules** |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | alternativa alla precedente | Firebase Admin | idem | Solo dev locale; **inutilizzabile su Netlify** (nessun filesystem persistente) |
| `GOOGLE_APPLICATION_CREDENTIALS` | no | Firebase Admin | fallback ADC | Critico |
| **`RESEND_API_KEY`** | **SÌ in produzione** | Resend | `src/lib/server/otp.ts` | **ALTO — invio email a nome del dominio.** Senza di essa **la registrazione non funziona** (l'OTP non parte) |
| `OTP_EMAIL_FROM` | sì | Resend | idem | Basso |
| `TRUSTED_PDF_HOSTS` | no | validazione URL | server-side | Deve rispecchiare `NEXT_PUBLIC_TRUSTED_PDF_HOSTS` |
| `CSP_ENFORCE` | **da impostare a `true`** | header | `next.config.ts:164` | Se assente, nessuna CSP |
| `APP_CHECK_ENFORCE` | default `true` | Cloud Functions | `functions/src/*` | Se `false`, App Check non blocca |
| `SEED_AUTH_EMAIL` | solo script | script locali | `scripts/*` | **ALTO — credenziali di un account admin** |
| `SEED_AUTH_PASSWORD` | solo script | script locali | `scripts/*` | **CRITICO — password in chiaro** |
| `NODE_ENV`, `GITHUB_SHA`, `VERCEL_GIT_COMMIT_SHA` | ambiente | — | — | — |

### 5.3 Problemi rilevati sulle variabili

1. **`.env.local.example` documenta `proxy.ts`** come consumatore di
   `FIREBASE_SERVICE_ACCOUNT_KEY` ("proxy.ts (admin route gate, V-029)"). **Il file `proxy.ts`
   non esiste nel repository.** Chi legge la documentazione crede che esista un gate
   server-side sull'area admin. **Non esiste.** Vedi `DRONETAG_SECURITY_AUDIT.md`.
2. **`SEED_AUTH_PASSWORD` è documentata come variabile d'ambiente**, il che è corretto, ma
   `scripts/create-admin.ts` contiene comunque una password in chiaro nel codice.
3. **`FIREBASE_SERVICE_ACCOUNT_PATH` non funziona su Netlify** — va usata
   `FIREBASE_SERVICE_ACCOUNT_KEY` con il JSON su una riga. Il commento nel file lo dice, ma
   **il `.env.local` incapsulato nell'artefatto committato usa la variante PATH**, il che
   suggerisce che chi ha buildato lo abbia fatto in locale.
4. **`CSP_ENFORCE` e `APP_CHECK_ENFORCE` sono i due interruttori di sicurezza del sistema.**
   Il loro stato attuale in Netlify e Firebase è **UNKNOWN** e deve essere verificato al
   primo accesso alle console.

---

## 6. Artefatti di build committati — problema serio

**51 file sotto `.netlify/` sono tracciati in git**, nonostante `.gitignore` contenga
`.netlify/`. La regola di gitignore **non ha effetto sui file già tracciati**: sono stati
aggiunti prima che la regola esistesse.

| File | Dimensione | Contenuto rilevante |
|---|---|---|
| **`.netlify/functions/___netlify-server-handler.zip`** | **21.175.479 byte (21 MB)** | **Contiene un file `.env.local` di 1126 byte** |
| `.netlify/state.json` | 53 byte | Contiene il `siteId` Netlify |
| `.netlify/deploy/v1/blobs/deploy/*` | ~1,4 MB | 29 file: HTML pre-renderizzato di tutte le pagine |
| `.netlify/functions-internal/…/run-config.json` | 6.336 byte | Copia della configurazione Next (verificato: **nessuna variabile d'ambiente**) |
| `.netlify/static/*` | ~430 KB | Asset statici duplicati da `public/` |

### Cosa è stato verificato sul `.env.local` dentro lo zip

**Il file è stato ispezionato durante l'audit senza riportarne i valori.** Contiene:
- le sei variabili `NEXT_PUBLIC_FIREBASE_*` — **non sono segreti**: identificano il progetto
  Firebase e sono comunque presenti nel bundle JavaScript pubblico;
- `FIREBASE_SERVICE_ACCOUNT_PATH` valorizzata con un **percorso del filesystem locale dello
  sviluppatore** — rivela la struttura della sua macchina, ma **non contiene la chiave**;
- `FIREBASE_SERVICE_ACCOUNT_KEY` **vuota**.

**Valutazione onesta:** in questo specifico artefatto **non è stata trovata alcuna chiave
privata né password**. Il rischio immediato è quindi **medio, non critico**.

**Ma il problema strutturale resta grave:** il repository ha dimostrato di poter contenere
build locali completi di `.env.local`. Se un domani lo sviluppatore avesse usato
`FIREBASE_SERVICE_ACCOUNT_KEY` invece di `PATH`, la chiave del service account sarebbe oggi
nella storia di git. **La visibilità del repository GitHub non è verificabile da questo
ambiente (UNKNOWN) — è la prima cosa da controllare.**

**Azione raccomandata (non eseguita):**
1. Verificare la visibilità del repo su GitHub.
2. `git rm -r --cached .netlify` e commit (la regola `.gitignore` diventa allora efficace).
3. Valutare la riscrittura della storia (`git filter-repo`) per rimuovere i 21 MB: è
   un'operazione distruttiva che richiede il coordinamento di tutti i cloni.
4. Per prudenza, **ruotare comunque** la chiave del service account e la `RESEND_API_KEY`
   prima della beta.

**Altro artefatto committato:** `eng.traineddata` (**5.199.098 byte**, 5,2 MB) — dati di
addestramento Tesseract per l'OCR. Funzionalmente necessario, ma andrebbe servito da CDN o
Git LFS anziché stare nella storia del repository.

Il repository pesa oltre **26 MB di soli artefatti binari**, su un codice sorgente che ne pesa
meno di 2.

---

## 7. Account e servizi esterni necessari

| # | Servizio | Necessario | A cosa serve | Stato oggi | Costo |
|---|---|---|---|---|---|
| 1 | **GitHub** | ✔ obbligatorio | Codice sorgente — `wepopagani/dronetag` | Attivo. **Visibilità: UNKNOWN** | Gratis / a pagamento |
| 2 | **Firebase / Google Cloud** | ✔ obbligatorio | Auth, Firestore, Storage, Functions. Progetto `dronetag-e905d` | Attivo | Piano **Blaze richiesto** (le Cloud Functions non sono disponibili su Spark) |
| 3 | **Netlify** | ✔ obbligatorio | Hosting + SSR | Attivo (`siteId` in `.netlify/state.json`) | Gratis fino a soglia |
| 4 | **Resend** | ✔ obbligatorio | Email OTP di registrazione | **UNKNOWN — da verificare.** Senza, il signup non funziona | Gratis fino a 3.000 email/mese |
| 5 | **Registrar del dominio** | ✔ obbligatorio | `drone-tag.com` (dedotto da `OTP_EMAIL_FROM` e dal footer) | **UNKNOWN — registrar non identificabile dal codice** | annuale |
| 6 | **Google reCAPTCHA (Enterprise o v3)** | ⚠️ fortemente consigliato | Firebase App Check | **UNKNOWN — probabilmente non configurato** (nessun riferimento a chiavi) | Gratis / a consumo |
| 7 | **Provider di pagamento** | ❌ **non esiste** | Necessario per la vendita | **Nessuna integrazione nel codice.** Nessun `stripe`, `paypal`, `adyen` fra le dipendenze | — |
| 8 | **Error monitoring** (Sentry o simile) | ❌ non presente | Diagnostica di produzione | Assente | — |
| 9 | **Analytics** | ❌ non presente | `src/lib/analytics/index.ts` è pronto ma **senza vendor collegato** | Assente | — |
| 10 | **Uptime monitoring** | ❌ non presente | — | Assente | — |

**Da chiedere al proprietario / sviluppatore precedente:**
- credenziali di accesso a Firebase Console (ruolo Owner sul progetto `dronetag-e905d`);
- credenziali Netlify e conferma del `siteId`;
- se esiste un account Resend, e con quale dominio verificato;
- presso quale registrar è `drone-tag.com` e dove sono i record DNS;
- se il repository GitHub è pubblico o privato, e chi vi ha accesso;
- se il piano Firebase è Blaze e su quale account di fatturazione;
- se App Check è stato registrato (e in che modalità: Monitor o Enforce);
- se `CSP_ENFORCE` è impostata in Netlify.

---

## 8. Documentazione esistente — attenzione

Il repository contiene già documentazione scritta dal precedente sviluppatore:

| File | Dimensione | Affidabilità |
|---|---|---|
| `README.md` | 8,4 KB | ⚠️ **contiene riferimenti a `proxy.ts`, file inesistente** |
| `TECHNICAL_HANDOVER.md` | 28,8 KB | ⚠️ da verificare punto per punto |
| `PRICING_IMPLEMENTATION.md` | 4,8 KB | ⚠️ da confrontare con `src/config/pricing.ts` |
| `docs/DEPLOY_PRODUCTION.md` | 8,1 KB | ⚠️ da verificare |
| `docs/DEPLOY_STAGING.md` | 9,7 KB | ⚠️ descrive uno staging che `.firebaserc` non prevede |
| `docs/DEVICE_TESTING.md` | 8,5 KB | non verificato |
| `docs/STAGING-SIGNOFF.md` | 9,1 KB | non verificato |

**Regola operativa per il nuovo team: trattare questa documentazione come una descrizione
delle *intenzioni*, non dello stato attuale.** Almeno tre affermazioni verificabili sono
risultate false (esistenza di `proxy.ts`, cancellazione di `scripts/create-admin.ts`,
esistenza di uno staging). I documenti prodotti da questo audit citano sempre file e righe
proprio per consentire la verifica indipendente.

---

## 9. Procedure operative

> Le procedure sono riportate come riferimento. **Nessuna è stata eseguita durante l'audit.**

### 9.1 INSTALL

```bash
git clone https://github.com/wepopagani/dronetag.git
cd dronetag

node --version          # deve essere >= 20.9.0
npm install

cd functions && npm install && cd ..

cp .env.local.example .env.local
# compilare .env.local — vedi §5. Come minimo:
#   NEXT_PUBLIC_FIREBASE_API_KEY, _AUTH_DOMAIN, _PROJECT_ID,
#   _STORAGE_BUCKET, _MESSAGING_SENDER_ID, _APP_ID
#   FIREBASE_SERVICE_ACCOUNT_PATH=/percorso/fuori/dal/repo/chiave.json
#   RESEND_API_KEY (necessaria per testare il signup)
```

> **Salvare la chiave del service account FUORI dalla cartella del repository.**

### 9.2 DEV

```bash
npm run dev             # next dev --webpack  →  http://localhost:3000
```

> ⚠️ **Senza emulatori configurati, questo comando lavora sui dati di produzione.**
> Fino a quando non esiste un progetto Firebase di staging, evitare operazioni di scrittura
> in sviluppo.

Il progetto usa **Webpack, non Turbopack**, sia in `dev` sia in `build` (flag `--webpack`
espliciti in `package.json`), pur avendo una sezione `turbopack.root` in `next.config.ts:188`.

### 9.3 BUILD

```bash
npm run build           # next build --webpack
```

Il build **fallisce di proposito** se mancano le tre variabili Firebase obbligatorie
(`next.config.ts:15-42`). È il comportamento voluto.

Per abilitare la CSP nel build di produzione:

```bash
CSP_ENFORCE=true npm run build
```

### 9.4 TEST

```
Nessun comando disponibile.
```

Non esistono `test`, `test:e2e` né alcun framework di test in `package.json`.
L'unico controllo statico disponibile è:

```bash
npm run lint            # eslint
npx tsc --noEmit        # type-check (non presente come script)
```

### 9.5 DEPLOY — **non eseguire senza aver letto §10**

**App (Netlify).** Il deploy è presumibilmente automatico sul push a `main`
(**UNKNOWN — da confermare in Netlify Console**). In alternativa, manualmente:

```bash
npx netlify-cli deploy --build --prod
```

**Regole Firestore e Storage:**

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only firestore:indexes
```

**Cloud Functions:**

```bash
cd functions && npm run build && cd ..
firebase deploy --only functions
```

Il `predeploy` in `firebase.json` esegue già il build, quindi `firebase deploy --only functions`
è sufficiente.

**Deploy di una singola funzione:**

```bash
firebase deploy --only functions:submitReport
```

### 9.6 Script amministrativi

```bash
npm run grant-admin       # tsx --env-file=.env.local scripts/grant-admin.ts
npm run backfill-public   # tsx --env-file=.env.local scripts/backfill-drones-public.ts
```

`scripts/grant-admin.ts` usa l'Admin SDK, imposta il custom claim `admin` e **revoca
correttamente i refresh token** — è scritto bene.
`scripts/backfill-drones-public.ts` è uno script una tantum di migrazione.

**`scripts/create-admin.ts` NON deve essere eseguito.** Contiene un indirizzo email e una
password amministrativa in chiaro nel codice sorgente. Vedi `DRONETAG_SECURITY_AUDIT.md`.
(Il commento in testa a `grant-admin.ts` afferma che `create-admin.ts` sia stato eliminato:
**è falso, il file è presente**.)

---

## 10. Checklist prima di qualunque deploy di produzione

Ordinata per criticità. **Nessuna di queste voci è stata eseguita durante l'audit.**

### Bloccanti

- [ ] Verificare la **visibilità del repository GitHub**.
- [ ] Rimuovere `scripts/create-admin.ts` dal working tree **e ruotare la password
      dell'account amministrativo che vi compare**, se quell'account esiste davvero.
- [ ] `git rm -r --cached .netlify` e commit.
- [ ] Ruotare la chiave del service account Firebase e la `RESEND_API_KEY`.
- [ ] Correggere `storage.rules:49` (`allow read: if true`) — vedi `DRONETAG_SECURITY_AUDIT.md`.
- [ ] Rimuovere `insurancePdfUrl` dallo snapshot pubblico
      (`src/lib/firebase/dronesPublic.ts:203`).
- [ ] Introdurre un gate server-side sull'area `/admin` (oggi è solo client-side).
- [ ] Risolvere la rottura del signup (create client-side negati dalle rules).
- [ ] Impostare `CSP_ENFORCE=true` nell'ambiente Netlify.
- [ ] Pubblicare informativa privacy, termini di servizio e cookie policy.

### Prima della beta

- [ ] Creare il progetto Firebase di staging e aggiungere l'alias in `.firebaserc`.
- [ ] Configurare i contesti Netlify affinché i deploy preview **non** usino le env di produzione.
- [ ] Registrare App Check (reCAPTCHA Enterprise) e portarlo in modalità Monitor.
- [ ] Verificare che il dominio Resend sia validato (SPF, DKIM, DMARC).
- [ ] Configurare TTL su `signupOtp.expiresAt` e su `rateLimits`.
- [ ] Attivare un error monitoring (Sentry o equivalente).
- [ ] Verificare i backup Firestore (PITR o export programmato su GCS).
- [ ] Documentare una procedura di rollback.
- [ ] Introdurre almeno una pipeline CI con `lint` + `tsc --noEmit`.
- [ ] Verificare la regione di Firestore e valutare la migrazione delle Cloud Functions
      in UE (oggi `us-central1`).

### Prima del lancio commerciale

- [ ] Integrare un provider di pagamento (nessuno esiste oggi).
- [ ] Rendere operativi il support e il billing.
- [ ] Chiarire la contraddizione sul badge NFC (la UI dice "non ancora disponibile",
      il pricing lo vende come obbligatorio).
- [ ] Introdurre test automatici, in particolare sulle Firestore rules.
- [ ] Completare le traduzioni tedesca, spagnola e francese (oggi al 62% in inglese).

---

## 11. Rischi infrastrutturali sintetizzati

| ID | Rischio | Severità | Evidenza |
|---|---|---|---|
| INF-001 | Un solo progetto Firebase: dev e produzione condividono dati reali | **HIGH** | `.firebaserc` |
| INF-002 | Artefatti di build committati, uno contenente un `.env.local` | **HIGH** | 51 file `.netlify/` tracciati |
| INF-003 | CSP disattivata per default | **HIGH** | `next.config.ts:164` |
| INF-004 | Nessuna CI, nessun test, nessun gate qualità prima del deploy | **HIGH** | assenza di `.github/workflows` |
| INF-005 | Nessun error monitoring in produzione | **HIGH** | nessuna dipendenza |
| INF-006 | `netlify.toml` senza contesti: i preview potrebbero scrivere in produzione | **MEDIUM** | `netlify.toml` |
| INF-007 | Cloud Functions in `us-central1` (trasferimento extra-UE) | **MEDIUM** | `functions/src/index.ts:30` |
| INF-008 | Backup Firestore non verificabili | **MEDIUM** | UNKNOWN |
| INF-009 | Nessuna procedura di rollback documentata | **MEDIUM** | — |
| INF-010 | Documentazione esistente parzialmente falsa (`proxy.ts`, staging) | **MEDIUM** | `README.md`, `.env.local.example`, `docs/` |
| INF-011 | 26 MB di binari nella storia git | **LOW** | zip 21 MB + `eng.traineddata` 5,2 MB |
| INF-012 | Nessun uptime monitoring | **LOW** | — |
