# DRONETAG — START HERE

> Se hai appena ereditato questo progetto, leggi questo file per intero prima di scrivere
> una riga di codice. Dieci minuti qui te ne risparmiano molti dopo.
>
> Riferimento: commit `b72f843`, branch `main`.

---

# DroneTag in 2 minuti

**Cosa fa.** Un operatore di droni carica su DroneTag i propri dati, i droni, il certificato di
pilotaggio e la polizza assicurativa. Un amministratore verifica i documenti. Ogni drone
ottiene un indirizzo pubblico `/u/{slug}` che viene scritto su un **badge NFC** applicato al
drone. Chi avvicina lo smartphone al badge vede una scheda pubblica: chi è l'operatore, che
drone è, se l'assicurazione è valida, se i documenti sono verificati. Chi trova un drone
smarrito può compilare un modulo per avvisare il proprietario.

**Stack.** Next.js 16.2.12 (App Router, build con Webpack) · React 19.2.4 · TypeScript 5.9.3
(strict) · Tailwind CSS 4.2.2 · Firebase 12.11.0 (client) e Admin SDK 14.2.0.
**Nove dipendenze di produzione in tutto.** Niente zod, niente react-hook-form, niente UI kit,
niente test framework, niente Stripe.

**Backend.** Tre percorsi diversi, ed è la prima cosa che devi interiorizzare:
- i **create** passano da `client → fetch → Route Handler Next.js → Admin SDK → Firestore`
  (24 file in `src/app/api/**/route.ts`);
- **letture, update, delete e upload** vanno **direttamente dal client SDK** a Firestore e
  Storage, protetti solo da `firestore.rules` e `storage.rules`;
- una sola **Cloud Function** è realmente chiamata dal client: `submitReport`.

**Database.** Firestore, progetto `dronetag-e905d`. Collection principali: `users`, `pilots`,
`operators`, `drones`, `dronesPublic`, `certificates`, `insurances`, `documents`,
`authorizations`, `reports`, `orders`, `plans`, `slots`, `signupOtp`, `rateLimits`, `support`,
più `profiles` (legacy).

**Auth.** Firebase Auth email/password. Il ruolo admin è un **custom claim** `admin` sul token.
Due cookie: `__dronetag_session` (HttpOnly, impostato da `/api/session`) e `__dronetag_idt`
(**non** HttpOnly, quindi leggibile da JavaScript — è un problema noto).

**Deploy.** Netlify (`netlify.toml`, plugin `@netlify/plugin-nextjs`). Regole e Cloud Functions
si deployano separatamente con la CLI Firebase. **Un solo progetto Firebase**: non esiste
staging.

---

# Stato attuale

## Cosa funziona

Login e logout · verifica email con OTP · CRUD completo di operatori, droni, certificati,
assicurazioni, autorizzazioni e documenti · upload file con allow-list di content-type e limiti
dimensionali · OCR client-side per precompilare i metadati · archivio dei documenti scaduti ·
generazione dello slug e del QR code · **il profilo pubblico `/u/{slug}`** · l'area admin
(verifica documenti, gestione utenti, gestione piani) · il calcolo del preventivo, che gira
server-side e non si fida degli importi inviati dal client · PWA installabile con gestione
offline · interfaccia completa in italiano e inglese.

## Cosa è incompleto o rotto

| Cosa | Dettaglio |
|---|---|
| ❌ **Registrazione** | `src/app/signup/page.tsx` chiama `ensureAccount()` e `ensurePilot()`, che eseguono `create` client-side su `users` e `pilots`. **`firestore.rules` nega esplicitamente questi create.** Nessun nuovo utente può iscriversi in produzione. |
| ❌ **Notifica drone ritrovato** | `functions/src/submit-report.ts:122` — `// TODO V-006/V-035: enqueue push + email fanout. For now just log.` Il report finisce nel database, il proprietario non lo sa. |
| ❌ **Pagamenti** | Nessun provider. `POST /api/pricing/checkout` crea un `order` `pending` e si ferma. |
| ❌ **Support** | `src/lib/firebase/support.ts:36` lancia `support_unavailable` in modalità live, ma la UI è completa. |
| ❌ **Reset password** | Nessun `sendPasswordResetEmail` nel codice. |
| ❌ **Cancellazione account** | Nessun `deleteUser`, nessuna cascata, nessun trigger. |
| ❌ **Azienda / team** | Nessuna collection `companies`, nessun membro, nessun invito, nessun ruolo. I piani Team (€49/mese) e Business (€149/mese) non hanno funzionalità corrispondenti. |
| ❌ **Notifiche email** | Solo l'OTP di registrazione. Nessuna email su approvazione, rifiuto, scadenza o drone ritrovato. |
| ❌ **Test** | Zero. Nessun framework installato. |
| ⚠️ **de / es / fr** | Presenti nel selettore lingua ma **al 62% ancora in inglese** (798/796/804 chiavi su 1275). |

## Cosa è demo

`DEMO_MODE` compare in **161 punti** del codice. `src/lib/demo/` e `src/components/demo/`
sommano **3.381 righe**; `public/demo/` pesa **2,4 MB**. Praticamente ogni funzione in
`src/lib/firebase/*.ts` ha un ramo `if (DEMO_MODE) { … }` con un'implementazione parallela in
memoria.

**Attenzione critica:** in modalità demo, `src/contexts/AuthContext.tsx` tratta **ogni utente
autenticato come admin**. È esattamente il motivo per cui `next.config.ts:15-42` fa **fallire
il build di produzione** se mancano le variabili Firebase — senza quelle, `DEMO_MODE` si
attiva silenziosamente. Non toccare quella guardia.

---

# Top 10 problemi da conoscere

1. **`scripts/create-admin.ts` contiene una password amministrativa in chiaro**, committata in
   git. Non eseguirlo. Verifica subito se il repository GitHub è pubblico.
2. **`storage.rules:49` è `allow read: if true`** su `users/{uid}/**`. Tutti i file caricati
   dagli utenti — **inclusi i documenti d'identità** — sono scaricabili senza autenticazione da
   chiunque conosca il path.
3. **La registrazione è rotta** in produzione. Vedi sopra. È il blocker numero uno.
4. **L'area `/admin` non ha alcun gate server-side.** La protezione è `AuthContext.isAdmin`,
   che gira nel browser. Le API e le rules reggono, ma le pagine vengono servite a chiunque.
5. **La documentazione esistente contiene affermazioni false.** `README.md` e
   `.env.local.example` descrivono un file `proxy.ts` come gate admin: **non esiste**.
   `scripts/grant-admin.ts` dice che `create-admin.ts` è stato eliminato: **non è vero**.
   `docs/DEPLOY_STAGING.md` descrive uno staging che `.firebaserc` non prevede.
6. **`src/lib/firebase/dronesPublic.ts:203` pubblica il PDF integrale della polizza** sul
   profilo anonimo, tre righe dopo aver mascherato il numero di polizza. Il PDF contiene nome,
   indirizzo e numero in chiaro.
7. **Esistono 5 Cloud Functions callable che nessuno chiama.** `createDrone`, `createOperator`,
   `createCertificate`, `createDocument`, `createInsurance` duplicano le route Next.js, hanno
   validazioni divergenti, e sono le uniche a verificare App Check. Il client usa le route.
8. **Sviluppo e produzione condividono lo stesso progetto Firebase.** `npm run dev` scrive sui
   dati reali. Non ci sono emulatori configurati.
9. **Il pricing implementa ancora il modello a due badge NFC**, con prezzi €12-15 più alti del
   listino attuale. La pagina `/pricing` mostra pubblicamente "1 badge NFC per certificati" e
   "1 badge NFC per assicurazione", e in italiano dichiara *"Ogni kit include due badge."*
10. **La UI dichiara che l'NFC non è disponibile.** `links.nfcFuture`, mostrato in
    `src/components/profile/VerificationLinksPanel.tsx:179`: *"NFC integration will be available
    in a future release."* Mentre `/pricing` vende il badge come obbligatorio.

---

# Top 10 priorità

Nell'ordine in cui affrontarle.

1. **Verificare la visibilità del repo GitHub**, poi ruotare comunque: la password
   dell'account in `create-admin.ts`, la chiave del service account Firebase, la `RESEND_API_KEY`.
2. `git rm -r --cached .netlify` (51 file tracciati, fra cui uno zip da 21 MB con un
   `.env.local` dentro).
3. **Correggere `storage.rules:49`** e rimuovere `insurancePdfUrl` dallo snapshot pubblico.
4. **Riparare la registrazione**: spostare la creazione di `users` e `pilots` su una route
   server-side con l'Admin SDK.
5. **Gate server-side su `/admin`.**
6. **Creare il progetto Firebase di staging** e configurare i contesti Netlify.
7. **Reset password** — Firebase lo offre nativamente, sono poche ore e sblocca un caso d'uso
   critico. Nella stessa sessione: attivare la **TTL su `signupOtp.expiresAt`** (il campo
   esiste già, serve solo la policy in console).
8. **Error monitoring** (Sentry o equivalente) e una **CI minima** con `lint` + `tsc --noEmit`.
9. **Completare `submitReport`** con la notifica email al proprietario. Senza questo, il
   prodotto non mantiene la sua promessa.
10. **Impostare `CSP_ENFORCE=true`** in Netlify e registrare App Check.

---

# Come avviare il progetto

```bash
git clone https://github.com/wepopagani/dronetag.git
cd dronetag

node --version          # serve >= 20.9.0
npm install
cd functions && npm install && cd ..

cp .env.local.example .env.local
```

Compila `.env.local` con almeno:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_PATH=/percorso/FUORI/dal/repo/chiave.json
RESEND_API_KEY=            # necessaria per provare il signup
```

> **Salva la chiave del service account fuori dalla cartella del repository.**

```bash
npm run dev             # http://localhost:3000
npm run build           # fallisce di proposito senza le 3 env Firebase obbligatorie
npm run lint
npx tsc --noEmit
# npm test → NON ESISTE
```

> ⚠️ **`npm run dev` lavora sui dati di produzione.** Finché non esiste un progetto di staging,
> evita operazioni di scrittura in sviluppo.

**Script amministrativi:**

```bash
npm run grant-admin       # assegna il custom claim admin (scritto bene, revoca i refresh token)
npm run backfill-public   # migrazione una tantum di dronesPublic
```

**Deploy** (non farlo prima di aver letto `DRONETAG_DEPLOYMENT_HANDOVER.md` §10):

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only functions
```

---

# Dove guardare nel codice

| Se devi capire… | Apri… |
|---|---|
| **Come funziona l'autenticazione** | `src/contexts/AuthContext.tsx`, `src/app/api/session/route.ts` |
| **Come il server verifica un utente** | `src/lib/server/requestAuth.ts`, `src/lib/server/adminAuth.ts` |
| **Come si inizializza l'Admin SDK** | `src/lib/server/firebaseAdmin.ts` |
| **Chi può leggere e scrivere cosa** | `firestore.rules` (**leggilo per intero, è la vera autorizzazione del sistema**), `storage.rules` |
| **Le forme dei dati** | `src/lib/types/entities.ts` |
| **Come si accede ai dati dal client** | `src/lib/firebase/*.ts` (20 moduli, tutti con un ramo `DEMO_MODE`) |
| **Le API** | `src/app/api/**/route.ts` (24 route handler) |
| **Le Cloud Functions** | `functions/src/index.ts` — nota quali sono realmente usate |
| **Cosa diventa pubblico** | `src/lib/utils/publicProjection.ts` ← **il file più importante per la privacy** |
| **Lo snapshot pubblico** | `src/lib/firebase/dronesPublic.ts` |
| **Il profilo pubblico** | `src/app/u/[slug]/`, `src/components/profile/PublicDroneCard.tsx` |
| **Slug e NFC** | `src/lib/utils/entities.ts`, `src/lib/nfc/payload.ts` |
| **Prezzi** | `src/config/pricing.ts`, `src/lib/pricing/quote.ts` |
| **Il punto d'aggancio per i pagamenti** | `src/lib/billing/types.ts`, `src/app/api/billing/webhook/route.ts` |
| **OTP e invio email** | `src/lib/server/otp.ts` |
| **Header di sicurezza, CSP, guardia di build** | `next.config.ts` |
| **Traduzioni** | `src/lib/i18n/en.ts` è la fonte autoritativa; le altre sono tipizzate su di essa |
| **Il demo mode** | `src/lib/demo/`, `src/components/demo/` |

---

# Architettura backend attuale

```
CREATE (drone, operatore, certificato, documento, polizza)
   client
     └─► fetch POST /api/<entity>
            └─► src/lib/server/requestAuth.ts   (verifica ID token)
                 └─► validazione scritta a mano nella route
                      └─► Firebase Admin SDK ──► Firestore
   ⚠ Nessun App Check. Nessun rate limiting.

READ / UPDATE / DELETE / UPLOAD
   client ──► Firebase client SDK ──► Firestore / Storage
   ⚠ L'unica autorizzazione sono firestore.rules e storage.rules.

REPORT DRONE RITROVATO
   client ──► callable submitReport ──► Cloud Function (us-central1)
   ✔ App Check verificato · ✔ rate limit per IP · ❌ non notifica nessuno

CALLABLE MORTE (deployate, mai chiamate)
   createDrone · createOperator · createCertificate · createDocument · createInsurance
   ⚠ Validazione divergente da quella delle route Next.js.

GATE /admin
   src/contexts/AuthContext.tsx (client) — nient'altro.
```

**Il paradosso da tenere a mente:** le funzioni che verificano App Check non vengono mai
chiamate; quelle che vengono chiamate non lo verificano. La protezione che l'architettura
documenta non è quella che l'architettura esegue.

---

# Architettura raccomandata

Proposta, **non implementata**. Il dettaglio con benefici, rischi, complessità e priorità di
ogni migrazione è in `DRONETAG_BACKEND_AUDIT.md`.

```
TUTTO IL CRUD E LA LOGICA DI BUSINESS
   client ──► Route Handler Next.js ──► Admin SDK ──► Firestore
   con: verifica del token · schema zod condiviso · rate limiting · audit log

CLOUD FUNCTIONS — solo per ciò che non può stare in una richiesta HTTP
   trigger Firestore e Storage (cancellazione a cascata, file orfani)
   job schedulati (avvisi di scadenza, pulizia)
   webhook dei pagamenti
   notifiche asincrone
   → e in regione UE, non us-central1

CLIENT FIREBASE SDK — solo dove è realmente giustificato
   Auth · listener realtime · upload diretto a Storage
   Le rules restano come rete di sicurezza, non come unica difesa.
```

**Le tre mosse concrete:** (1) rimuovere le 5 callable morte, (2) spostare update, delete e la
scrittura di `dronesPublic` dietro le route, (3) introdurre `zod` con schemi condivisi in modo
che la validazione esista in un solo posto.

---

# Sicurezza urgente

Nell'ordine, e prima di qualunque altra cosa:

1. **`scripts/create-admin.ts`** — password admin in chiaro nel repository. Verifica la
   visibilità del repo, ruota la password, rimuovi il file.
2. **`storage.rules:49`** — `allow read: if true`. Documenti d'identità pubblicamente
   scaricabili.
3. **`.netlify/` committato** — 51 file, uno zip da 21 MB contenente un `.env.local`. Nel file
   trovato non ci sono chiavi private, ma il pattern è pericoloso: ruota comunque.
4. **`src/lib/firebase/dronesPublic.ts:203`** — PDF di polizza sul profilo pubblico.
5. **Nessun gate server-side su `/admin`.**
6. **Nessun rate limiting su alcuna delle 24 route API.**
7. **CSP disattivata** per default (`next.config.ts:164` — serve `CSP_ENFORCE=true`).
8. **App Check non applicato** sul percorso realmente usato.
9. **`dronesPublic` scrivibile dal client**: lo stato di verifica mostrato al pubblico è
   manipolabile dal proprietario del drone.
10. **`/api/health` pubblico** rivela se App Check e CSP sono attivi.

Tutti con scenario di abuso e remediation in `DRONETAG_SECURITY_AUDIT.md`.

---

# Domande da fare al precedente sviluppatore / proprietario

**Al proprietario — decisioni di prodotto:**
1. I badge NFC fisici sono già stati prodotti o distribuiti? A quanti clienti?
2. Il badge è uno o due? Il codice ne implementa due; il listino aggiornato ne prevede uno.
3. I prezzi dei kit nel codice (€39,90 / €34,90 / €29,90 / €27,90) sono superati: confermi il
   listino a €24,90 / €19,90 / incluso / €17,90 / €15,90?
4. I piani Team e Business sono già stati venduti? Le funzionalità aziendali non esistono.
5. Esistono utenti reali in produzione? Droni reali? Documenti d'identità già caricati?
6. Il demo mode serve ancora per le presentazioni commerciali?
7. Il prodotto opera nell'Unione Europea?
8. Esistono già informativa privacy e termini di servizio, magari su un sito vetrina separato?

**Allo sviluppatore precedente — tecnico:**
9. Il repository GitHub è pubblico o privato? Chi vi ha accesso?
10. `CSP_ENFORCE` è impostata in Netlify? E `APP_CHECK_ENFORCE`?
11. App Check è registrato in Firebase? In modalità Monitor o Enforce?
12. Le `firestore.rules` e `storage.rules` presenti nel repo sono quelle effettivamente
    deployate? (Se non lo fossero, la gravità di quasi ogni finding cambia.)
13. In quale regione si trova Firestore?
14. Il deploy su `main` è automatico? I deploy preview usano le env di produzione?
15. Sono attivi i backup Firestore (PITR o export su GCS)?
16. Chi sono gli admin attuali con il custom claim `admin`?
17. Esiste un account Resend? Con quale dominio verificato?
18. Le 5 callable non usate (`createDrone` ecc.) erano un lavoro in corso o un percorso
    abbandonato?
19. Perché il build usa `--webpack` invece di Turbopack? C'era un problema noto?
20. Cosa manca a `docs/STAGING-SIGNOFF.md` per essere considerato completato?

---

# Cosa NON modificare senza prima capirne l'impatto

| Non toccare | Perché |
|---|---|
| **`next.config.ts:15-42`** — la guardia che fa fallire il build senza le env Firebase | È l'unica cosa che impedisce di pubblicare un bundle in cui **ogni utente autenticato è admin**. Il commento nel file lo spiega. |
| **`firestore.rules`** | È la vera autorizzazione del sistema, non un complemento. Le allow-list per campo impediscono l'escalation di privilegi. **Non esistono test**: ogni modifica è un salto nel buio. Scrivi prima i test con l'emulatore. |
| **`src/lib/utils/publicProjection.ts`** | Determina cosa un anonimo vede di una persona reale. L'interfaccia `PublicDroneCard` funge da contratto: TypeScript impedisce di aggiungere campi per errore. **Non aggirarlo** aggiungendo campi allo snapshot direttamente. |
| **`entityDataLocked()` in `firestore.rules:56-61`** | Congela i campi identità dopo il primo aggiornamento. Sembra un ostacolo, ma è un controllo antifrode: senza, un utente potrebbe far verificare un drone e poi cambiarne il seriale. |
| **`maskPolicyNumber()` e le esclusioni in `publicProjection.ts`** | Rimuoverle espone dati personali. |
| **La rimozione di `ownerUserId` dallo snapshot pubblico** | È deliberata. `submitReport` ricava il proprietario lato server proprio per non esporlo. |
| **`scripts/grant-admin.ts`** | Revoca correttamente i refresh token dopo il cambio di claim. Se lo semplifichi, un ex-admin resta admin fino alla scadenza del token. |
| **Il flusso OTP in `src/lib/server/otp.ts`** | Hash SHA-256, cooldown 60 s, massimo 5 tentativi. È scritto bene. |
| **Le allow-list di content-type in `storage.rules`** | L'esclusione di SVG è deliberata: gli SVG possono contenere JavaScript. |
| **Il sistema di temi a variabili CSS** | Il tema scuro è un solo override su `[data-theme="dark"]` in `globals.css:66`. Introdurre classi `dark:` di Tailwind creerebbe due sistemi in conflitto. |
| **La derivazione dei tipi i18n da `en.ts`** | `TranslationKey = keyof typeof translations` impedisce chiavi mancanti. Non sostituirla con `Record<string, string>`. |
| **`src/config/pricing.ts` come unica fonte dei prezzi** | Il commento in testa lo prescrive e la regola è rispettata: nessun importo è hardcoded nella UI. I prezzi sono **da correggere**, ma il pattern è **da preservare**. |
| **`src/lib/pricing/quote.ts`** | Ricalcola tutto server-side dal `planId`. Non accettare mai importi dal client. |

---

# Una nota finale, e non è di circostanza

I punteggi di readiness in `DRONETAG_PRODUCT_READINESS.md` sono bassi — 34/100 per la beta,
21/100 per la produzione — e potresti concluderne che il progetto sia da rifare. **Sarebbe la
conclusione sbagliata.**

Il codice esistente è scritto bene: **un solo TODO** in tutte le 43.000 righe fra `src/` e
`functions/`, **quattro occorrenze di `any`**, zero `window.confirm`, tipizzazione forte,
commenti che spiegano il *perché* e non il *cosa*, e diverse scelte di sicurezza e privacy che
raramente si vedono in un prodotto a questo stadio.

Quello che manca, manca perché non è ancora stato scritto — non perché sia stato scritto male.
Pagamenti, notifiche, test, cancellazione account, gestione aziendale, entità badge: sono
funzioni **da aggiungere**, e l'aggiunta è più prevedibile della riparazione.

La conseguenza pratica è che il tuo lavoro sarà **prevalentemente additivo**. Con l'eccezione
della decisione sul `DEMO_MODE` e della duplicazione backend, non ci sono grovigli da districare
prima di poter procedere. Prima di riscrivere qualcosa, leggi il commento che lo accompagna:
in questo progetto, quasi sempre, c'è una ragione.
