# DRONETAG — COMPREHENSIVE TECHNICAL AUDIT

**Repository:** `github.com/wepopagani/dronetag` · **Branch:** `main` · **Commit:** `b72f843` ("prebeta")
**Data audit:** 7 settembre 2026 · **Tipo:** read-only, statico

> **Nessun file applicativo è stato modificato.** Nessun deploy eseguito, nessun dato Firebase
> letto o alterato, nessuna security rule cambiata, nessun segreto ruotato, nessun pacchetto
> installato. Sono stati creati esclusivamente file Markdown di documentazione nella root.
>
> **Nessun valore di password, chiave privata, token o credenziale è riportato in questi
> documenti.** Dove sono stati trovati segreti, è indicato il file e il tipo, non il valore.

---

## Indice della documentazione prodotta

| # | File | Contenuto |
|---|---|---|
| 1 | **`DRONETAG_TECHNICAL_AUDIT.md`** (questo file) | Panoramica generale + executive handover summary |
| 2 | `DRONETAG_ARCHITECTURE.md` | Stack, struttura del repository, architettura, mappa delle route, flussi di dati |
| 3 | `DRONETAG_FEATURE_MATRIX.md` | Ogni funzionalità e il suo stato reale (completa / demo / rotta / non implementata) |
| 4 | `DRONETAG_SECURITY_AUDIT.md` | Finding di sicurezza con severità, scenari di abuso e remediation |
| 5 | `DRONETAG_PRIVACY_AUDIT.md` | Audit tecnico privacy/GDPR, dati personali, diritti dell'interessato |
| 6 | `DRONETAG_DATA_MODEL.md` | Collection Firestore, schemi, Storage, diagramma ER |
| 7 | `DRONETAG_BACKEND_AUDIT.md` | Route Next.js vs Cloud Functions vs client SDK, duplicazioni, architettura target |
| 8 | `DRONETAG_UI_UX_AUDIT.md` | UI, UX, responsive, terminologia, accessibilità, i18n |
| 9 | `DRONETAG_DEPLOYMENT_HANDOVER.md` | Deploy, ambienti, variabili, account esterni, checklist |
| 10 | `DRONETAG_TECH_DEBT.md` | Registro del debito tecnico P0-P4 (60 voci) |
| 11 | `DRONETAG_PRODUCT_READINESS.md` | Punteggi per area, beta/production readiness, verifica del modello commerciale |
| 12 | `DRONETAG_NEW_DEVELOPER_START_HERE.md` | Documento di ingresso per il nuovo programmatore |

**Convenzioni usate in tutti i documenti:**
`FACT` = verificato nel codice, con file e riga · `INFERENCE` = dedotto, con il ragionamento
esplicitato · `UNKNOWN` = non determinabile dal repository, richiede accesso a console esterne
o al proprietario.

---

## 1. Che cos'è DroneTag oggi

DroneTag è una piattaforma web per la **verifica pubblica della conformità di un drone e del
suo operatore**. Il modello di prodotto è:

1. un operatore registra sé stesso, i propri droni, i certificati di pilotaggio, la polizza
   assicurativa e altri documenti;
2. un amministratore della piattaforma verifica i documenti caricati;
3. ogni drone riceve uno **slug pubblico** che genera l'indirizzo `/u/{slug}`;
4. quell'indirizzo viene codificato su un **badge NFC fisico** applicato al drone e su un QR code;
5. chiunque avvicini uno smartphone al badge vede una **scheda pubblica** con il nome
   dell'operatore, il modello del drone, lo stato assicurativo e lo stato di verifica;
6. chi trova un drone smarrito può compilare un modulo che dovrebbe avvisare il proprietario.

Il modello di ricavo previsto è ad abbonamento (Free, Pilot €99/anno, Pilot Pro €139/anno,
Team €49/mese, Business €149/mese, Enterprise a preventivo) più la **vendita obbligatoria del
badge NFC**.

**Lo stato di realizzazione, in una frase:** i passi 1, 2, 3 e 5 funzionano; il passo 4 è
dichiarato non disponibile dalla stessa interfaccia dell'applicazione; il passo 6 scrive nel
database ma **non avvisa nessuno**; e non esiste alcun modo di incassare i pagamenti.

---

## 2. Stack tecnologico

Versioni risolte da `package-lock.json` (lockfileVersion 3, 701 pacchetti).
`node_modules` non era installato al momento dell'audit: le versioni sono quelle bloccate nel
lockfile, non quelle in esecuzione.

### 2.1 Nucleo

| Componente | Versione | Note |
|---|---|---|
| Node.js | `>= 20.9.0` (`package.json`), Netlify `NODE_VERSION=20`, Functions `nodejs20` | Le tre dichiarazioni sono **coerenti** ✔ |
| **Next.js** | **16.2.12** | App Router. Build e dev usano **Webpack**, non Turbopack (flag `--webpack` espliciti) |
| **React** | **19.2.4** | Versione fissa, non con caret |
| **TypeScript** | **5.9.3** | `strict` attivo. Solo **4 occorrenze di `any`** in 42.056 righe |
| **Tailwind CSS** | **4.2.2** | Via `@tailwindcss/postcss`. Theming con CSS custom properties, non con classi `dark:` |
| **Firebase (client SDK)** | **12.11.0** | Auth, Firestore, Storage, Functions callable, App Check |
| **Firebase Admin SDK** | **14.2.0** | Sia in `src/lib/server/` sia in `functions/` |
| firebase-functions | **7.3.2** | Solo in `functions/` |
| ESLint | 9.39.4 | `eslint-config-next` |
| tsx | 4.22.4 | Esecuzione degli script amministrativi |

### 2.2 Librerie applicative — l'elenco è volutamente corto

| Libreria | Versione | Uso | Criticità |
|---|---|---|---|
| `pdfjs-dist` | 6.0.227 | Rendering e parsing dei PDF lato client | Media |
| `tesseract.js` | 7.0.0 | OCR per precompilare i metadati dei documenti. Richiede `eng.traineddata` (5,2 MB, **committato nel repo**) | Media |
| `react-firebase-hooks` | 5.1.1 | Hook di comodo su Firebase | Bassa |
| `uuid` | 13.0.2 | Generazione ID | Bassa |

### 2.3 Cosa **non** è presente — è la parte più significativa

| Categoria | Libreria attesa | Presente | Conseguenza |
|---|---|---|---|
| **Validazione** | zod, yup, joi | ❌ **nessuna** | Validazione scritta a mano in ogni route handler. È fatta con cura, ma è codice duplicato e non condiviso fra route Next.js e Cloud Functions |
| **Form** | react-hook-form, formik | ❌ nessuna | Form gestiti con `useState` (394 occorrenze) |
| **State management** | redux, zustand, jotai | ❌ nessuna | Solo React Context (`AuthContext`, `ThemeContext`, `LanguageContext`). Scelta ragionevole per questa scala |
| **UI kit** | MUI, shadcn, Radix | ❌ nessuna | 21 componenti scritti a mano. Nessuna primitiva accessibile ereditata: da qui l'assenza di focus trap nel `Modal` |
| **Grafici** | recharts, chart.js | ❌ nessuna | Nessuna dashboard analitica |
| **Email** | `resend`, `nodemailer` | ❌ **nessun pacchetto** | Resend è invocato via `fetch` diretto: `src/lib/server/otp.ts:83` → `https://api.resend.com/emails`. Scelta legittima, zero dipendenze |
| **Pagamenti** | stripe, paypal | ❌ **nessuna** | **Non è possibile incassare.** Esiste però l'astrazione: `src/lib/billing/types.ts` definisce l'interfaccia `BillingProvider` e un `NoopBillingProvider` che risponde `501`, e `src/app/api/billing/webhook/route.ts` è il punto di aggancio. **La cucitura per il provider è già pronta**: è un vantaggio concreto per chi dovrà integrarlo |
| **Analytics** | GA, Plausible, PostHog | ❌ nessuna | `src/lib/analytics/index.ts` è pronto, con allow-list di eventi e sanitizzazione PII, **ma senza vendor collegato** |
| **Error monitoring** | Sentry | ❌ nessuna | 51 `console.*` sono l'unica osservabilità |
| **Testing** | vitest, jest, playwright | ❌ **nessuna** | Zero test. Nessuno script `test` |
| **Formatting** | prettier | ❌ nessuna | Solo ESLint |

**Lettura di questo elenco:** il progetto ha **9 dipendenze di produzione**. È una scelta
deliberata e in gran parte positiva: poca superficie di attacco, pochi aggiornamenti da
inseguire, nessuna dipendenza abbandonata. Il rovescio è che tutto — validazione, form,
componenti accessibili — è scritto a mano, e la qualità dipende dalla disciplina di chi scrive.
Nel codice esistente quella disciplina c'è; **il rischio è che si perda con un team nuovo e
senza test.**

**Nota sull'audit delle vulnerabilità:** non è stato eseguito `npm audit` né alcuna verifica
online sulle CVE, coerentemente col mandato read-only e offline. **UNKNOWN** — da eseguire come
prima attività.

---

## 3. Architettura in sintesi

```
BROWSER
  │
  ├─► UI  ·  Next.js 16 App Router · 33 pagine · 123 componenti .tsx
  │        src/app/**/page.tsx  +  src/components/**
  │        Quasi tutte 'use client' — Server Components poco sfruttati
  │
  ├─► AUTH  ·  src/contexts/AuthContext.tsx
  │        Firebase Auth (email/password) → custom claim `admin`
  │        Cookie: __dronetag_idt (NON HttpOnly) + __dronetag_session (HttpOnly)
  │        ⚠ Nessun middleware.ts · Nessun proxy.ts · Gate /admin solo client-side
  │
  ├─► SCRITTURE "CREATE"  ·  client → fetch → Next.js Route Handler → Admin SDK → Firestore
  │        src/app/api/**/route.ts (24 file)
  │        src/lib/server/requestAuth.ts  → verifica ID token
  │        src/lib/server/firebaseAdmin.ts → service account
  │
  ├─► LETTURE / UPDATE / DELETE / UPLOAD  ·  client SDK → Firestore / Storage
  │        src/lib/firebase/*.ts (20 moduli) — protetti solo da firestore.rules e storage.rules
  │
  ├─► CLOUD FUNCTIONS  ·  us-central1  ·  functions/src/ (992 righe)
  │        submitReport      ← USATA dal client
  │        bootstrapSlots    ← trigger auth onCreate
  │        createDrone, createOperator, createCertificate,
  │        createDocument, createInsurance  ← DEPLOYATE MA MAI CHIAMATE
  │
  ├─► DATABASE  ·  Firestore — progetto dronetag-e905d
  │        users · pilots · operators · drones · dronesPublic · certificates ·
  │        insurances · documents · authorizations · reports · orders · plans ·
  │        slots · signupOtp · rateLimits · support · profiles (legacy)
  │
  ├─► STORAGE  ·  Firebase Storage
  │        users/{uid}/**  ⚠ allow read: if true
  │
  └─► SERVIZI ESTERNI
           Resend (email OTP) — via fetch, src/lib/server/otp.ts
           reCAPTCHA / App Check — UNKNOWN se configurato
           Coverdrone — solo link in uscita
           Provider di pagamento — NESSUNO
```

Il dettaglio completo, con i file coinvolti in ogni percorso, è in
`DRONETAG_ARCHITECTURE.md` e `DRONETAG_BACKEND_AUDIT.md`.

### 3.1 La stranezza architetturale principale

Le operazioni di scrittura seguono **tre percorsi diversi** a seconda del tipo:

| Operazione | Percorso | Protetta da |
|---|---|---|
| **Create** di drone, operatore, certificato, documento, polizza | client → route Next.js → Admin SDK | Verifica ID token + validazione manuale nella route |
| **Update / Delete** delle stesse entità | client SDK → Firestore | **Solo `firestore.rules`** |
| **Upload** dei file | client SDK → Storage | **Solo `storage.rules`** |
| **Report di drone ritrovato** | client → Cloud Function callable | App Check + rate limiting nella function |

Contemporaneamente esistono **5 Cloud Functions callable** (`createDrone`, `createOperator`,
`createCertificate`, `createDocument`, `createInsurance`) che implementano gli stessi create
delle route Next.js, con validazione e controlli propri, **e non sono chiamate da nessuna parte
del client**. Il commento in testa a `functions/src/index.ts` afferma che *"Clients can no
longer call addDoc() … rules deny direct creates and force the client through these
functions"*: la prima metà è vera, la seconda no — il client passa dalle route Next.js.

**Conseguenza pratica:** le funzioni non usate applicano App Check, le route usate no. La
protezione che l'architettura documenta non è quella che l'architettura esegue.

---

## 4. Sintesi dei finding di sicurezza

Dettaglio completo con scenari di abuso e remediation in `DRONETAG_SECURITY_AUDIT.md`.

| Severità | Numero |
|---|---|
| **CRITICAL** | **2** |
| **HIGH** | **7** |
| **MEDIUM** | **11** |
| **LOW** | **8** |
| **INFO** | **4** |
| **Totale** | **32** |

### I due CRITICAL e i sette HIGH

| ID | Severità | Titolo | File |
|---|---|---|---|
| SEC-001 | **CRITICAL** | **Password amministrativa in chiaro committata in git** | `scripts/create-admin.ts` |
| SEC-002 | **CRITICAL** | **Artefatto di build Netlify committato contenente un `.env.local`** (per igiene dei segreti — vedi nota sotto) | `.netlify/functions/___netlify-server-handler.zip` |
| SEC-003 | HIGH | **Nessuna protezione server-side dell'area `/admin`**; la documentazione descrive un `proxy.ts` inesistente | assenza di `middleware.ts` / `proxy.ts` |
| SEC-004 | HIGH | **App Check non protegge alcuna scrittura reale**: è applicato solo sulle callable non usate | `firestore.rules:30-34`, `src/app/api/**` |
| SEC-005 | HIGH | **Nessun rate limiting su alcun Route Handler** | `src/app/api/**` (24 route) |
| SEC-006 | HIGH | **Firebase Storage con `allow read: if true`** — documenti d'identità scaricabili da chiunque conosca il path | `storage.rules:49` |
| SEC-007 | HIGH | **PDF integrale della polizza pubblicato sul profilo anonimo**, vanificando il mascheramento del numero di polizza applicato tre righe sopra | `src/lib/firebase/dronesPublic.ts:203` |
| SEC-008 | HIGH | **Lo snapshot pubblico è scritto dal client senza validazione del contenuto** | `firestore.rules`, `src/lib/firebase/dronesPublic.ts` |
| SEC-009 | HIGH | **ID token in un cookie leggibile da JavaScript** (`__dronetag_idt`), ancora accettato dal server | `src/contexts/AuthContext.tsx`, `src/lib/server/requestAuth.ts` |

I 23 finding MEDIUM, LOW e INFO — fra cui il webhook di billing senza verifica di firma, la
divergenza di validazione fra API e Cloud Functions, l'assenza di audit log e `/api/health`
che espone lo stato di App Check e CSP senza autenticazione — sono descritti per intero in
`DRONETAG_SECURITY_AUDIT.md`.

### Nota sull'artefatto Netlify committato

`.netlify/functions/___netlify-server-handler.zip` (**21 MB**) è tracciato in git e **contiene
un file `.env.local`**. Il file è stato ispezionato: contiene le chiavi pubbliche Firebase
(che non sono segreti) e un `FIREBASE_SERVICE_ACCOUNT_PATH` valorizzato con un percorso del
filesystem dello sviluppatore. **`FIREBASE_SERVICE_ACCOUNT_KEY` è vuota: nessuna chiave privata
è stata trovata.**

Il rischio immediato è quindi **medio, non critico**. Ma il pattern è pericoloso: se lo
sviluppatore avesse usato la variante `KEY` invece di `PATH`, oggi la chiave del service
account sarebbe nella storia pubblica del repository. **La visibilità del repo su GitHub non è
verificabile da questo ambiente (UNKNOWN) ed è la prima cosa da controllare.**

---

## 5. Sintesi privacy

Dettaglio in `DRONETAG_PRIVACY_AUDIT.md`. **21 finding**, di cui 2 CRITICAL e 7 HIGH.

| Requisito GDPR | Stato |
|---|---|
| Informativa, ToS, cookie policy | ❌ assenti |
| Raccolta del consenso | ❌ assente |
| Cancellazione account (art. 17) | ❌ non implementata, né esercitabile manualmente in modo affidabile |
| Rettifica (art. 16) | ⚠️ impedita: profilo in sola lettura + data-lock nelle rules + support non funzionante |
| Portabilità (art. 20) | ❌ non implementata |
| Retention | ❌ nessun TTL; `signupOtp` (email) e `rateLimits` (IP) crescono senza limite |
| Audit trail | ❌ assente |
| Minimizzazione | ⚠️ buona in progettazione, annullata da due eccezioni |
| Trasferimenti extra-UE | ⚠️ Cloud Functions in `us-central1` (`functions/src/index.ts:30`) |

**Punto a favore da preservare:** `src/lib/utils/publicProjection.ts` è un livello di
proiezione dedicato, con l'interfaccia TypeScript come contratto e commenti che elencano i
campi esclusi. `ownerUserId` è stato deliberatamente rimosso dallo snapshot pubblico. Non ci
sono tracker di terze parti, e `src/lib/analytics/index.ts` implementa sanitizzazione PII
**prima ancora** che esista un vendor. Sono scelte di qualità che vanno estese, non rimosse.

---

## 6. Stato reale delle funzionalità

Matrice completa in `DRONETAG_FEATURE_MATRIX.md`. Sintesi:

| Stato | Funzionalità |
|---|---|
| ✅ **Funzionanti** (con hardening da fare) | login, logout, verifica email OTP, CRUD operatori / droni / certificati / assicurazioni / autorizzazioni / documenti, upload file, OCR, archivio scaduti, generazione slug, QR code, profilo pubblico `/u/{slug}`, area admin (verifica documenti, utenti, piani), calcolo preventivo server-side, PWA installabile |
| ⚠️ **Parziali** | segnalazione drone ritrovato (**scrive ma non notifica**), verifica admin (**funziona ma è muta verso l'utente**), gestione ordini (crea ma non incassa) |
| ❌ **Rotte** | **registrazione** (create client-side negati dalle rules), **support** (`support_unavailable`), `/account/billing` |
| ❌ **Non implementate** | reset password, cancellazione account, export dati, pagamenti, ciclo di vita abbonamento, gestione azienda/team, inviti, ruoli aziendali, notifiche email (oltre all'OTP), entità badge NFC, test |
| 🔶 **Demo / mock** | `DEMO_MODE` in **161 punti**; `src/lib/demo/` + `src/components/demo/` = 3.381 righe; `public/demo/` = 2,4 MB. In demo, `AuthContext` tratta **ogni utente come admin** |
| 🕸 **Legacy** | collection `profiles`, redirect `/admin/profiles → /admin/users`, `src/lib/auth/adminAllowlist.ts` (codice morto), **modello a due badge NFC nel pricing** |

---

## 7. Il modello commerciale non corrisponde al listino

Verifica completa in `DRONETAG_PRODUCT_READINESS.md` §5.

**Gli abbonamenti sono tutti corretti** (Free €0, Pilot €99/anno, Pilot Pro €139/anno,
Team €49/mese, Business €149/mese, Enterprise a preventivo).

**I prezzi dei badge NFC sono tutti sbagliati:**

| Piano | Listino | Codice (`src/config/pricing.ts`) |
|---|---|---|
| Free | €24,90 | **€39,90** |
| Pilot | €19,90 | **€34,90** |
| Pilot Pro | incluso | incluso ✔ |
| Team | €17,90/pilota | **€29,90** |
| Business | €15,90/pilota | **€27,90** |

**E il modello a due badge è ancora vivo, visibile sulla pagina pubblica `/pricing`:**

```65:68:src/config/pricing.ts
export const NFC_KIT_CONTENTS_KEYS = [
  'pricing.kit.item.certBadge',
  'pricing.kit.item.insuranceBadge',
] as const;
```

Le stringhe corrispondenti — renderizzate da `src/components/pricing/PricingNfcKitSection.tsx:31`
— recitano *"1 badge NFC per certificati"* e *"1 badge NFC per assicurazione"*, e la chiave
`pricing.kit.mandatoryBody` in italiano dichiara testualmente: ***"Ogni kit include due
badge."*** Lo scarto di prezzo del §7 si spiega così: i valori nel codice sono il prezzo di un
kit da due badge.

**Contemporaneamente**, la sezione NFC del profilo utente mostra un banner di avviso che dice
*"NFC integration will be available in a future release"* (`links.nfcFuture`, reso da
`src/components/profile/VerificationLinksPanel.tsx:179`).

Il prodotto quindi, oggi, **vende come obbligatorio un kit di due badge a un prezzo errato,
mentre dichiara all'utente che l'NFC non è ancora disponibile.** È la contraddizione più
urgente da risolvere, e non è un bug: è una decisione di prodotto rimasta a metà.

---

## 8. Product readiness

| | Punteggio | Blocker principali |
|---|---|---|
| **BETA READINESS** | **34 / 100** | 12 blocker — su tutti: **la registrazione non funziona**, `submitReport` non notifica nessuno, nessun reset password, documenti d'identità pubblicamente leggibili, nessuna informativa privacy |
| **PRODUCTION READINESS** | **21 / 100** | I 12 precedenti più 12: nessun pagamento, nessun ciclo di vita abbonamento, nessuna funzionalità aziendale a fronte di piani Team/Business venduti, badge NFC inesistente come entità, prezzi errati, zero test |

Punteggi per singola area (UI/UX 68, frontend 72, backend 38, auth 55, authz 45, database 62,
security 28, privacy 22, admin 58, profilo pubblico 60, NFC 15, billing 8, notifiche 12,
testing 0, monitoring 5, deploy 35, documentazione 30) in `DRONETAG_PRODUCT_READINESS.md`.

---

## 9. Nota sulla documentazione preesistente

Il repository contiene già `README.md`, `TECHNICAL_HANDOVER.md` (28,8 KB),
`PRICING_IMPLEMENTATION.md` e quattro file in `docs/`. **Almeno tre affermazioni verificabili
in quei documenti sono false:**

1. `README.md` e `.env.local.example` descrivono un file **`proxy.ts`** come gate di
   autorizzazione dell'area admin. **Il file non esiste.** Chi si fida della documentazione
   conclude che `/admin` sia protetta lato server: non lo è.
2. Il commento in testa a `scripts/grant-admin.ts` afferma che `scripts/create-admin.ts` sia
   stato eliminato. **Il file è presente, con la password in chiaro.**
3. `docs/DEPLOY_STAGING.md` descrive una procedura di staging. **`.firebaserc` contiene un solo
   progetto**: lo staging non esiste.

**Raccomandazione operativa:** trattare la documentazione preesistente come una descrizione
delle *intenzioni* del precedente sviluppatore, non dello stato del sistema. I documenti
prodotti da questo audit citano sempre file e riga proprio perché ogni affermazione possa
essere verificata in autonomia.

---

## 10. Informazioni non ricavabili dal codice

Elenco esplicito di ciò che **non** è stato possibile determinare. Sono tutte domande da porre
al proprietario o da verificare accedendo alle console.

| # | Informazione | Perché serve |
|---|---|---|
| 1 | **Il repository GitHub è pubblico o privato?** | Determina se la password in `scripts/create-admin.ts` è già compromessa. **Domanda numero uno.** |
| 2 | Il progetto Firebase `dronetag-e905d` è su piano Blaze? | Le Cloud Functions non funzionano su Spark |
| 3 | In quale regione si trova Firestore? | Determina se c'è trasferimento extra-UE dei dati |
| 4 | `CSP_ENFORCE` è impostata a `true` in Netlify? | Determina se la CSP è attiva. Dal repo si vede solo il default: **disattivata** |
| 5 | App Check è registrato? In modalità Monitor o Enforce? | Nessuna chiave reCAPTCHA è deducibile dal repo |
| 6 | Esiste un account Resend con dominio verificato (SPF/DKIM/DMARC)? | Senza, la registrazione non funziona |
| 7 | I deploy preview di Netlify usano le variabili di produzione? | `netlify.toml` non definisce contesti: **probabilmente sì** |
| 8 | Il deploy su `main` è automatico? | Non deducibile dal repository |
| 9 | Sono attivi i backup Firestore (PITR o export su GCS)? | Nessuna evidenza nel repo |
| 10 | Presso quale registrar è `drone-tag.com` e dove sono i DNS? | Il dominio è dedotto da `OTP_EMAIL_FROM` e dal footer |
| 11 | Esistono utenti reali, droni reali, badge già distribuiti? | Determina se le correzioni richiedono una migrazione dati |
| 12 | Chi sono gli admin attuali (custom claim `admin`)? | Non deducibile dal codice |
| 13 | Esiste un fornitore per i badge NFC fisici? Sono già stati prodotti? | Determina se la contraddizione del §7 ha conseguenze già materializzate |
| 14 | Il listino con badge singolo è definitivo? | Condiziona la correzione dei prezzi |
| 15 | I piani Team e Business sono già stati venduti a qualcuno? | Le funzionalità corrispondenti non esistono |
| 16 | Il `DEMO_MODE` serve ancora (demo commerciali)? | Condiziona 161 punti nel codice |
| 17 | Esistono vulnerabilità note nelle dipendenze? | `npm audit` non eseguito (mandato offline) |
| 18 | Le pagine legali esistono altrove (sito vetrina separato)? | Nessuna nel repository |
| 19 | Sono stati firmati DPA con Google, Netlify e Resend? | Nessuna evidenza documentale nel repo |
| 20 | Esiste un'analisi di conformità ENAC/EASA per i dati pubblicati? | Fuori dal perimetro tecnico |

---

# Executive handover summary

## Che cosa è stato costruito

Una piattaforma web full-stack per la verifica pubblica della conformità di droni e operatori
UAS, con badge NFC e QR come punto di accesso fisico a una scheda pubblica. 42.056 righe di
TypeScript in `src/`, 992 in `functions/`, 33 pagine, 123 componenti React, 24 route handler
API, 7 Cloud Functions, 17 collection Firestore, interfaccia in 5 lingue, PWA installabile.

Il lavoro svolto è, sul piano della scrittura del codice, **di buona qualità**: un solo TODO in
tutto il progetto, quattro occorrenze di `any`, tipizzazione forte, commenti densi e motivati,
un design system coerente, e alcune scelte di sicurezza e privacy che raramente si trovano a
questo stadio — le Firestore rules con allow-list per campo, il livello di proiezione pubblica
con l'interfaccia come contratto, il calcolo dei preventivi che non si fida del client, la
guardia in `next.config.ts` che fa **fallire il build** se mancano le variabili Firebase per
impedire di pubblicare un bundle in cui ogni utente è admin.

## Quanto è realmente funzionante

Funzionano: autenticazione, gestione completa di operatori, droni, certificati, assicurazioni,
autorizzazioni e documenti, upload con validazione, OCR, archivio, generazione dello slug,
profilo pubblico `/u/{slug}`, area admin con verifica documenti, calcolo dei preventivi.

**Non funzionano tre cose, e sono le tre che contano:**

1. **La registrazione.** `signup/page.tsx` esegue create client-side su `users` e `pilots` che
   `firestore.rules` nega esplicitamente. Nessun nuovo utente può iscriversi in produzione.
2. **La notifica di drone ritrovato.** `functions/src/submit-report.ts:122` chiude con
   `// TODO V-006/V-035: enqueue push + email fanout. For now just log.` Il report finisce nel
   database; il proprietario non lo saprà mai. È la funzione che giustifica l'esistenza del
   badge.
3. **I pagamenti.** Nessun provider integrato. Il checkout crea un ordine `pending` e si ferma.

A queste si aggiungono: nessun reset password, nessuna cancellazione account, support che lancia
`support_unavailable`, nessuna notifica email oltre all'OTP, nessuna funzionalità aziendale a
fronte di piani Team e Business a listino, e zero test automatici.

## Quale stack viene utilizzato

Next.js 16.2.12 (App Router, Webpack), React 19.2.4, TypeScript 5.9.3, Tailwind CSS 4.2.2,
Firebase 12.11.0 client / 14.2.0 Admin, Cloud Functions su Node 20 in `us-central1`, hosting
Netlify, email via Resend chiamata con `fetch`. **Nove dipendenze di produzione in totale**:
nessuna libreria di validazione, form, UI kit, testing, pagamenti o monitoring.

## Dove sono i principali rischi

1. **Una password amministrativa in chiaro** in `scripts/create-admin.ts`, committata in git.
   Se il repository è pubblico — **circostanza da verificare immediatamente** — è già compromessa.
2. **Firebase Storage con `allow read: if true`** (`storage.rules:49`): i documenti d'identità
   caricati dagli utenti sono scaricabili senza autenticazione da chiunque conosca il path.
3. **Il PDF integrale della polizza è pubblicato sul profilo anonimo**
   (`src/lib/firebase/dronesPublic.ts:203`), vanificando il mascheramento del numero di polizza
   applicato tre righe più sopra.
4. **L'area `/admin` non ha alcun gate server-side**, e la documentazione del progetto descrive
   un `proxy.ts` che non esiste.
5. **Sviluppo e produzione condividono lo stesso progetto Firebase** (`.firebaserc`), senza
   emulatori configurati: ogni sessione di sviluppo tocca dati reali.
6. **Nessuna informativa privacy, nessun consenso, nessuna cancellazione account.**

## Cosa blocca una beta

La registrazione rotta, prima di tutto: senza di essa non esistono beta tester. Poi l'assenza
di reset password e di un support funzionante, il silenzio di `submitReport`, i tre problemi di
sicurezza sopra, l'assenza di informativa e consenso, la mancanza di un ambiente separato dalla
produzione e di qualunque error monitoring.

## Cosa blocca la produzione

Tutto quanto sopra, più: nessun sistema di pagamento, nessun ciclo di vita dell'abbonamento,
nessuna gestione azienda/team a fronte di piani venduti a €49 e €149 al mese, il badge NFC che
non esiste come entità nel database (impossibile gestire smarrimento, revoca, sostituzione),
i prezzi dei badge errati di €12-15 e ancora espressi secondo il modello a due badge, zero test
su un sistema che tratta documenti d'identità, e l'assenza di audit trail e backup verificati.

## Qual è il percorso tecnico raccomandato

**Non riscrivere.** Il codice esistente è buono; il problema è cosa non è stato scritto. Un
refactoring generalizzato distruggerebbe lavoro valido — in particolare
`src/lib/utils/publicProjection.ts`, le allow-list nelle Firestore rules, la guardia di build e
il sistema di temi a variabili CSS.

Il percorso è **additivo, in quattro fasi**: (1) contenimento del rischio di sicurezza in una
settimana; (2) sblocco del prodotto — registrazione, gate admin, staging, reset password — in
tre settimane; (3) completamento onesto — support, notifiche, adempimenti privacy, onboarding,
primi test — in due mesi; (4) monetizzazione — pagamenti, entità badge, multi-tenant — in
quattro mesi o più. Stima complessiva: **5-7 mesi/uomo**, condizionata alle decisioni di
prodotto ancora aperte.

Sul piano architetturale la raccomandazione è di **consolidare su Next.js Route Handler +
Admin SDK** per tutto il CRUD, riservando le Cloud Functions a ciò per cui servono davvero
(trigger, job schedulati, webhook, notifiche asincrone), e di rimuovere le 5 callable
duplicate e mai chiamate. Il dettaglio, con benefici, rischi e priorità di ogni migrazione, è
in `DRONETAG_BACKEND_AUDIT.md`.

## Le prime dieci attività del nuovo team

1. Verificare la **visibilità del repository GitHub** e, in ogni caso, **ruotare la password**
   dell'account in `scripts/create-admin.ts`, la chiave del service account Firebase e la
   `RESEND_API_KEY`.
2. `git rm -r --cached .netlify` e valutare la pulizia della storia (21 MB di artefatti con un
   `.env.local` dentro).
3. Correggere `storage.rules:49` e rimuovere `insurancePdfUrl` dallo snapshot pubblico.
4. **Riparare la registrazione**, spostando la creazione di `users` e `pilots` su una route
   server-side.
5. Introdurre un **gate server-side su `/admin`**.
6. Creare un **progetto Firebase di staging** e configurare i contesti Netlify.
7. Impostare `CSP_ENFORCE=true` e registrare App Check.
8. Implementare **reset password** (Firebase lo offre nativamente: poche ore, impatto grande) e
   attivare la **TTL su `signupOtp.expiresAt`**, che ha già il campo pronto.
9. Collegare un **error monitoring** e una **CI minima** con `lint` + `tsc --noEmit`.
10. Completare **`submitReport`**: senza la notifica al proprietario, il prodotto non mantiene
    la sua promessa.

## Quali decisioni architetturali devono essere prese

Sette decisioni bloccano la pianificazione, e nessuna è puramente tecnica:
**(a)** il `DEMO_MODE` resta o si rimuove (161 punti nel codice);
**(b)** Route Next.js o Cloud Functions come backend canonico;
**(c)** il badge NFC è programmabile oggi — la UI dice di no, il pricing lo vende;
**(d)** serve davvero il multi-tenant aziendale (i piani Team e Business lo presuppongono, il
data model no);
**(e)** quali dati devono essere pubblici sul profilo;
**(f)** il prodotto opera nell'UE, con le conseguenze su regione delle Functions e adempimenti;
**(g)** il listino è definitivo, e in particolare il badge è uno o due.

## Quali credenziali e account servono

Obbligatori e già esistenti: **GitHub**, **Firebase/Google Cloud** (progetto `dronetag-e905d`,
piano Blaze richiesto), **Netlify** (il `siteId` è in `.netlify/state.json`), **Resend** (da
confermare), **registrar del dominio** `drone-tag.com` (UNKNOWN).
Da attivare: **reCAPTCHA Enterprise** per App Check, un **provider di pagamento** (inesistente),
un **error monitoring**. La checklist completa, con cosa chiedere al proprietario, è in
`DRONETAG_DEPLOYMENT_HANDOVER.md` §7.

## Quali aspetti devono essere validati con il cliente

Il listino dei badge e il passaggio da due badge a uno; se i badge fisici siano già stati
prodotti o distribuiti; se esistano utenti reali (determina se le correzioni richiedono una
migrazione); quali dati l'operatore accetta di rendere pubblici, con particolare riguardo al
PDF di polizza e alla fotografia; se i piani Team e Business siano già stati venduti;
se il demo mode serva ancora per le presentazioni commerciali; e la validazione legale
dell'informativa, dei termini, dei periodi di conservazione e della probabile necessità di una
DPIA — il trattamento comprende documenti d'identità, geolocalizzazione e pubblicazione su
canale aperto.

---

**Nessun file applicativo è stato modificato.**
