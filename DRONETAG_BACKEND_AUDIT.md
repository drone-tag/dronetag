# DRONETAG — BACKEND AUDIT

> Next.js Route Handlers vs Cloud Functions vs accesso diretto Firebase client.
> Audit read-only, commit `b72f843`. Nessuna modifica applicativa.

---

## 1. Risposta breve

Il backend è **triplicato**. Esistono tre implementazioni parallele dello stesso strato di persistenza:

| Path | Stato reale |
|---|---|
| **Next.js Route Handlers** (`src/app/api/**`, 24 endpoint, Admin SDK) | **È il path realmente usato** per tutte le `create` |
| **Cloud Functions callable** (`functions/src/create-*.ts`, 5 funzioni) | **Codice morto**: deployate ma mai invocate dal client |
| **Firebase client SDK diretto** (`src/lib/firebase/*.ts`) | **Attivo** per tutte le `read`, `update`, `delete` e per le scritture su `dronesPublic` |

La conseguenza più importante: le protezioni implementate **solo** sulle Cloud Functions (App Check, rate limiting) **non proteggono nulla**, perché quel path non viene percorso.

---

## 2. Classificazione di ogni operazione backend

Legenda tipi: **A** = Next.js Route Handler · **D** = Firebase Admin SDK · **E** = Callable Cloud Function · **G** = Firestore trigger · **I** = accesso diretto client SDK.
(Non esistono Server Actions, API Routes Pages-Router, HTTP Functions, né Storage trigger.)

### 2.1 Operazioni di CREATE

| Operazione | Tipo | Frontend caller | Backend handler | Authz | Validazione | Duplicata? |
|---|---|---|---|---|---|---|
| Crea drone | A+D | `createDrone()` `src/lib/firebase/drones.ts:174` | `src/app/api/entities/drones/route.ts` | `requireUserFromRequest` + ownership operator/insurance + quota | manuale | **SÌ** → `functions/src/create-drone.ts` (inutilizzata) |
| Crea operatore | A+D | `src/lib/firebase/operators.ts` | `api/entities/operators/route.ts` | user + quota (cap 3) | manuale | **SÌ** → `create-operator.ts` |
| Crea certificato | A+D | `src/lib/firebase/certificates.ts` | `api/entities/certificates/route.ts` | user + quota | manuale | **SÌ** → `create-certificate.ts` |
| Crea documento | A+D | `src/lib/firebase/documents.ts` | `api/entities/documents/route.ts` | user + quota | manuale | **SÌ** → `create-document.ts` |
| Crea assicurazione | A+D | `src/lib/firebase/insurances.ts` | `api/entities/insurances/route.ts` | user + ownership droni/operator, **nessuna quota** | manuale | **SÌ** → `create-insurance.ts` |
| Crea permesso | A+D | `src/lib/firebase/authorizations.ts` | `api/entities/authorizations/route.ts` | user + quota | manuale | no (solo API) |
| Crea utente (admin) | A+D | `/admin/users/new` | `api/admin/users/route.ts` | `requireAdminFromRequest` | `validateAdminCreateUser` (schema custom) | no |
| Crea report | **E** | `createReport()` `src/lib/firebase/reports.ts:121` | `functions/src/submit-report.ts` | anonimo + App Check + rate limit 3/10min | manuale, sanitizzata | no |
| Crea slots | **G** | — | `functions/src/bootstrap-slots.ts` (`auth.user().onCreate`) | sistema | — | parziale: anche `api/admin/users` scrive `slots` |
| Crea account (`users/{uid}`) | **I** | `ensureAccount()` `src/lib/firebase/account.ts:120` | client `setDoc` | rules | nessuna | — **ROTTA**: rules `create: if false` |
| Crea pilota (`pilots/{uid}`) | **I** | `ensurePilot()` `src/lib/firebase/pilots.ts:88` | client `setDoc` | rules | nessuna | — **ROTTA**: rules `create: if false` |
| Crea snapshot pubblico | **I** | `syncDronePublicSnapshot()` `src/lib/firebase/dronesPublic.ts:139` | client `setDoc` | rules (ownership) | **nessuna sul contenuto** | no |
| Crea piano | **I** | `/admin/plans` → `createPlan()` `src/lib/firebase/plans.ts:59` | client `addDoc` | rules (admin) | nessuna | no |
| Crea ordine | — | **nessun caller** | **nessun handler** | — | — | **NON IMPLEMENTATA** |
| Crea richiesta checkout | A | `/checkout` | `api/pricing/checkout/route.ts` | **nessuna** | manuale | scrive in `Map` in memoria |

### 2.2 Operazioni di UPDATE / DELETE

**Tutte** avvengono via **client SDK diretto** (tipo I), protette solo da `firestore.rules`:

| Operazione | File |
|---|---|
| `updateDrone`, `deleteDrone`, `setActiveOperator`, `clearActiveOperator` | `src/lib/firebase/drones.ts` |
| `updateOperator`, `deleteOperator` | `src/lib/firebase/operators.ts` |
| `updateCertificate`, `deleteCertificate` | `src/lib/firebase/certificates.ts` |
| `updateInsurance`, `deleteInsurance` | `src/lib/firebase/insurances.ts` |
| `updateDocument`, `deleteDocument` | `src/lib/firebase/documents.ts` |
| `updateAuthorization`, `deleteAuthorization` | `src/lib/firebase/authorizations.ts` |
| `updateAccount` | `src/lib/firebase/account.ts:132` |
| `updatePilot` | `src/lib/firebase/pilots.ts:103` |
| `markReportRead` | `src/lib/firebase/reports.ts:137` |
| `setSlots` (admin) | `src/lib/firebase/slots.ts` |
| `updatePlan`, `deletePlan` (admin) | `src/lib/firebase/plans.ts` |
| Verifica documenti (admin) | `/admin/verify` → `update*` client SDK |

**Implicazione:** l'intero flusso di **verifica amministrativa** — l'atto di business più delicato della piattaforma — passa da `updateDoc` client-side, autorizzato dalla sola clausola `allow update: if isAdmin()` delle rules. Nessun endpoint server, nessuna validazione delle transizioni di stato, nessun audit log.

### 2.3 Operazioni di UPLOAD

| Operazione | Tipo | Handler | Path Storage |
|---|---|---|---|
| Branding account | A+D | `api/account/branding` | `users/{uid}/profiles/account/{kind}.{ext}` |
| PDF certificato | A+D | `api/entities/certificates/[id]/pdf` | `users/{uid}/certificates/{id}/certificate.pdf` |
| PDF polizza | A+D | `api/entities/insurances/[id]/pdf` | `users/{uid}/insurances/{id}/policy.pdf` |
| File documento | A+D | `api/entities/documents/[id]/file` | `users/{uid}/documents/{id}/file.{ext}` |
| File permesso | A+D | `api/entities/authorizations/[id]/file` | `users/{uid}/authorizations/{id}/file.{ext}` |
| Upload legacy | **I** | `src/lib/firebase/storage.ts` | `users/{uid}/profiles/{profileId}/...` |

Gli upload via API verificano tutti l'ownership (`ownerId !== auth.uid → 403`) prima di scrivere. ✔

---

## 3. Duplicazione API ↔ Cloud Functions: differenze puntuali

Le 5 callable `create*` e le corrispondenti route API sono state scritte due volte. Sono già **divergenti**:

| Entità | Divergenza | File API | File Function |
|---|---|---|---|
| **Certificato** | API accetta e persiste `registrationNumber`; la Function **no**. Validazione: API richiede `registrationNumber \|\| label`; Function richiede solo `label`. | `api/entities/certificates/route.ts` | `functions/src/create-certificate.ts` |
| **Documento** | API: `fileUrl` **opzionale**. Function: `fileUrl` **obbligatorio**. | `api/entities/documents/route.ts` | `functions/src/create-document.ts` |
| **Drone** | API imposta `dataLockedAt = nowIso()` alla creazione. Function **non lo imposta**. Cambia il comportamento del data-lock nelle rules. | `api/entities/drones/route.ts` | `functions/src/create-drone.ts` |
| **Tutte** | Le Function applicano `requireAppCheck()`; le API **no**. | — | `functions/src/util.ts:44` |
| **Tutte** | Le Function usano `enforceQuota` da `functions/src/util.ts`; le API usano `src/lib/server/quota.ts`. **Due copie della stessa logica di quota.** | `src/lib/server/quota.ts` | `functions/src/util.ts` |
| **Assicurazione** | Nessuna delle due applica quota. | — | — |
| **Permesso** | Esiste **solo** l'API. Nessuna Function. | `api/entities/authorizations/route.ts` | — |

### Prova che le callable non sono usate

`src/lib/firebase/callable.ts:47-93` definisce `callCreateDrone`, `callCreateOperator`, `callCreateCertificate`, `callCreateDocument`, `callCreateInsurance`. Un grep su tutto `src/` trova questi simboli **solo** nel file che li definisce. L'unico export usato è `callSubmitReport`, importato da `src/lib/firebase/reports.ts`.

Il commento in testa a `callable.ts` afferma che "ALL privileged creates go through callables" — è **obsoleto**.

### Perché è un problema concreto

1. **App Check è inefficace.** È implementato solo sulle callable. Il path reale (Route Handlers) non lo verifica. `APP_CHECK_ENFORCE=true` dà una falsa sensazione di protezione: in pratica protegge solo `submitReport`.
2. **Nessun rate limiting sulle scritture reali.** `applyRateLimit` esiste solo in `functions/src/util.ts` e viene usato solo da `submitReport`. Le API di create non hanno alcun limite: un token valido può creare entità fino al limite di quota, e chiamare gli endpoint di upload senza restrizioni.
3. **Manutenzione doppia.** Ogni fix di validazione va applicato due volte; già oggi non lo è.
4. **Costo.** Cinque Cloud Functions deployate che non servono nessun traffico.

---

## 4. Audit endpoint per endpoint

### 4.1 Punti di forza (verificati)

- Tutti gli endpoint privilegiati usano `requireUserFromRequest` / `requireAdminFromRequest` con `verifyIdToken(idToken, true)` (**`checkRevoked = true`** — corretto: onora `revokeRefreshTokens` di `grant-admin.ts`).
- **Nessun endpoint accetta un `userId`/`uid` dal body per determinare la proprietà.** `userId` è sempre `auth.uid`. Niente mass-assignment su ownership.
- Gli endpoint che toccano un'entità esistente ricaricano il documento e confrontano `data.userId !== auth.uid → 403`.
- Gli endpoint che accettano riferimenti (`defaultOperatorId`, `insuranceId`, `droneIds`, `operatorId`) verificano che l'entità referenziata appartenga al chiamante → niente IDOR trasversale.
- Se l'Admin SDK non è configurato, restituiscono `503` invece di degradare in modo insicuro.
- `runtime = 'nodejs'` e `dynamic = 'force-dynamic'` ovunque: nessuna risposta autenticata finisce in cache.

### 4.2 `/api/files/proxy` — analisi SSRF

`src/app/api/files/proxy/route.ts`. Difese presenti:
1. `requireUserFromRequest`.
2. `sanitizeAllowedUrl` → solo `https:` e host in allow-list (`firebasestorage.googleapis.com`, `storage.googleapis.com`, + `TRUSTED_PDF_HOSTS`).
3. Parsing del path dell'oggetto Storage e verifica del prefisso `users/{auth.uid}/` per i non-admin.
4. Cap 20 MB.

**Valutazione:** la superficie SSRF è ridotta a host Google già raggiungibili. Il rischio residuo è che un **admin** possa proxare qualunque file di qualunque utente (comportamento voluto) e che l'URL con token finisca nei log del server.

**Manca:** nessun rate limit; nessuna validazione dell'estensione/content-type in risposta.

### 4.3 Endpoint senza autenticazione

| Endpoint | Rischio |
|---|---|
| `/api/health` | Espone versione build, commit, `adminConfigured`, `appCheckEnforce`, `cspMode`. Utile a un attaccante per profilare la configurazione. Rischio **LOW**, ma andrebbe protetto o ridotto. |
| `/api/pricing/quote` | Calcolatore puro, nessuno stato. Rischio **INFO**. Nota: **il client non lo chiama** — usa `buildPricingQuote()` direttamente lato client. Endpoint di fatto inutilizzato. |
| `/api/pricing/checkout` | Accetta submit anonimi illimitati con dati di fatturazione (nome, indirizzo, email). Nessun rate limit, nessun captcha. Rischio **MEDIUM** (spam/flood, e i dati sono PII). |
| `/api/billing/webhook` | Nessuna verifica di firma. Restituisce sempre 501 tramite `NoopBillingProvider`. Rischio attuale **INFO**; diventa **CRITICAL** nel momento in cui si collega un provider senza aggiungere la verifica. |

### 4.4 OTP email — `src/lib/server/otp.ts`

**Buono:** codice a 6 cifre generato con `crypto.randomInt`; salvato come **SHA-256**, mai in chiaro; TTL 10 min; cooldown 60 s sul reinvio; max 5 tentativi; documento cancellato al successo; l'endpoint verify imposta anche `emailVerified: true` su Firebase Auth.

**Debolezze:**
- Confronto **non a tempo costante** (`data.codeHash === hashCode(code)`). Impatto pratico trascurabile: 5 tentativi su 900.000 combinazioni.
- Il rate limit è per-utente (documento OTP), non per-IP. Un attaccante con molti account può generare molte email → costo Resend.
- In `NODE_ENV === 'development'` il codice viene **restituito nella risposta HTTP** e loggato (`otp.ts:41-44`). Corretto in dev; da verificare che il build di produzione abbia sempre `NODE_ENV=production`.
- Se `RESEND_API_KEY` non è configurata in produzione, `deliverEmailOtp` restituisce `false` e la funzione lancia `otp_email_delivery_failed`: **la registrazione si interrompe**.

### 4.5 Validazione input: assente come sistema

Non esiste alcuna libreria di validazione. Ogni route reimplementa a mano i controlli con helper come `cleanString`, `asEmail`, `sanitizeAllowedUrl`. La qualità è discreta ma:
- non c'è garanzia di copertura uniforme;
- i tipi TypeScript delle richieste sono `unknown` castati a mano;
- l'unico "schema" formale è `src/lib/validation/adminCreateUser.ts`, usato da un solo endpoint;
- nessuna sanitizzazione HTML/XSS sui campi di testo lunghi (`notes`, `message`, `label`). React esegue l'escape di default, quindi il rischio XSS è basso, ma i dati sporchi finiscono in Firestore e nei PDF/CSV export.

---

## 5. Cloud Functions — dettaglio

`functions/src/index.ts`: `setGlobalOptions({ region: 'us-central1', maxInstances: 20, timeoutSeconds: 30 })`.
Runtime `nodejs20`, `firebase-functions ^7.3.2`, `firebase-admin ^14.2.0`, TypeScript strict.
Logging corretto via `firebase-functions/logger` (zero `console.*`).

| Funzione | Tipo | Auth | App Check | Rate limit | Quota | Invocata? |
|---|---|---|---|---|---|---|
| `submitReport` | `onCall` v2, `cors: true`, `enforceAppCheck: false` (gestito in `util`) | anonima consentita | `requireAppCheck` | **3/10min per slug+IP** | — | **SÌ** |
| `createDrone` | `onCall` v2 | `requireAuth` | sì | no | sì | no |
| `createOperator` | `onCall` v2 | `requireAuth` | sì | no | sì (cap 3) | no |
| `createCertificate` | `onCall` v2 | `requireAuth` | sì | no | sì | no |
| `createDocument` | `onCall` v2 | `requireAuth` | sì | no | sì | no |
| `createInsurance` | `onCall` v2 | `requireAuth` | sì | no | **no** | no |
| `bootstrapSlots` | trigger v1 `auth.user().onCreate` | sistema | n/a | n/a | n/a | sì (automatica) |

`submitReport` è l'implementazione migliore del repository: deriva `ownerUserId` server-side, valida lo stato del drone, applica rate limit, sanitizza e limita ogni campo, valida i range geografici, scrive `_serverTs`.
Unico difetto: registra `_origin.ip` senza policy di retention (privacy) e il TODO alla riga 122 significa che **il proprietario non riceve alcuna notifica**.

`bootstrapSlots` usa l'API v1 (`auth.user().onCreate`) mentre tutto il resto è v2. Da tenere presente: l'API v1 dei trigger di autenticazione è in via di deprecazione presso Google. **UNKNOWN**: se sia già stata pianificata la migrazione a Blocking Functions / Identity Platform.

---

## 6. Riepilogo dei rischi backend

| ID | Rischio | Severità | File |
|---|---|---|---|
| B-01 | Nessun gate server-side su `/admin` (né middleware né proxy) | **HIGH** | assente |
| B-02 | App Check implementato solo sul path morto (callable) | **HIGH** | `functions/src/util.ts` vs `src/app/api/**` |
| B-03 | Nessun rate limit su alcun Route Handler | **HIGH** | `src/app/api/**` |
| B-04 | `dronesPublic` scritto dal client senza validazione del contenuto | **HIGH** | `src/lib/firebase/dronesPublic.ts:139` |
| B-05 | Registrazione self-service rotta (rules `create: if false`) | **HIGH** (funzionale) | `account.ts:120`, `pilots.ts:88` |
| B-06 | Webhook billing senza verifica di firma (stub) | MEDIUM (oggi) / CRITICAL (quando attivato) | `api/billing/webhook/route.ts` |
| B-07 | Checkout persistito in `Map` in memoria: dati persi a ogni cold start | MEDIUM | `api/pricing/checkout/route.ts:33` |
| B-08 | Duplicazione API/Functions già divergente | MEDIUM | vedi §3 |
| B-09 | Nessun audit log delle azioni admin | MEDIUM | tutto il progetto |
| B-10 | Update/delete e verifica admin solo via client SDK | MEDIUM | `src/lib/firebase/*.ts` |
| B-11 | `/api/pricing/checkout` anonimo e senza rate limit raccoglie PII | MEDIUM | idem |
| B-12 | Validazione manuale non uniforme, nessuno schema | MEDIUM | `src/app/api/**` |
| B-13 | `updatedAt` generato dal client, usato dalle rules per il data-lock | LOW/MEDIUM | `firestore.rules:56-61` |
| B-14 | `/api/health` pubblico espone configurazione | LOW | `api/health/route.ts` |
| B-15 | `adminFetch` forza `getIdToken(true)` a ogni chiamata | LOW (perf) | `src/lib/client/adminApi.ts:17` |
| B-16 | `requestPublicDroneResync()` chiamata da utenti non-admin → 403 silenzioso | LOW | `src/lib/client/resyncPublicDrones.ts` |
| B-17 | `bootstrapSlots` usa API trigger v1 in deprecazione | LOW | `functions/src/bootstrap-slots.ts` |

---

## 7. Architettura target proposta (NON implementata)

### 7.1 Principio

```
CLIENT
  ├── READ    → Firebase client SDK        (rules = autorizzazione)
  └── WRITE   → SEMPRE Next.js Route Handler → Admin SDK
                (nessuna write diretta dal client, rules = deny)

ROUTE HANDLER (nodejs)
  1. verifica token (già presente)
  2. verifica App Check                    ← DA AGGIUNGERE
  3. rate limit                            ← DA AGGIUNGERE
  4. validazione schema (zod)              ← DA AGGIUNGERE
  5. autorizzazione + ownership (già presente)
  6. mutazione via Admin SDK
  7. audit log                             ← DA AGGIUNGERE

middleware.ts / proxy.ts                   ← DA CREARE
  gate server-side su /admin/* e /account/*

CLOUD FUNCTIONS = solo asincrono
  • bootstrapSlots            (già corretto)
  • onReportCreated           → notifica email/push al proprietario   [nuovo]
  • scheduled: alert scadenze certificati/polizze                     [nuovo]
  • webhook pagamenti                                                 [nuovo]
  • onUserDelete              → cancellazione a cascata GDPR          [nuovo]
```

### 7.2 Piano di migrazione

| # | Intervento | Beneficio | Rischio | Complessità | Priorità |
|---|---|---|---|---|---|
| M1 | Aggiungere `middleware.ts` (o `proxy.ts`) che verifica il cookie di sessione e blocca `/admin/*` server-side | Chiude il gap più citato nei doc; difesa in profondità | Basso. Attenzione: `firebase-admin` non gira su Edge runtime → serve runtime Node o un edge-shim + verifica JWT con JWKS | Media | **P0** |
| M2 | Creare `POST /api/account/provision` (Admin SDK) e chiamarlo dal signup al posto di `ensureAccount`/`ensurePilot` | Ripristina la registrazione pubblica | Basso | Bassa | **P0** |
| M3 | Rimuovere le 5 callable `create*` e `callCreate*`; tenere `submitReport` e `bootstrapSlots` | Elimina la divergenza, riduce costi e superficie | Basso — ma **verificare prima** che nessun client esterno le chiami | Bassa | **P1** |
| M4 | Verificare App Check nei Route Handlers (header `X-Firebase-AppCheck` + `appCheck().verifyToken()`) | Rende reale la protezione anti-bot | Medio: rischio di bloccare traffico legittimo. Partire in monitor | Media | **P1** |
| M5 | Introdurre rate limiting sui Route Handlers (riusare il pattern token-bucket Firestore di `functions/src/util.ts`) | Anti-abuso su upload, OTP, checkout | Basso | Media | **P1** |
| M6 | Spostare update/delete e soprattutto la **verifica admin** su Route Handler dedicati; rules → `update: if false` per il client | Validazione delle transizioni di stato, audit log, niente logica di business nel browser | Medio: tocca molte pagine | Alta | **P1** |
| M7 | Introdurre `zod` e uno schema per ogni endpoint | Validazione uniforme, tipi derivati | Basso | Media | **P1** |
| M8 | Aggiungere collection `auditLog` scritta da tutti i Route Handler privilegiati | Tracciabilità, requisito di compliance | Basso | Media | **P1** |
| M9 | Spostare la generazione di `dronesPublic` server-side (dentro l'API drone/insurance/pilot) e negare la write client | Elimina B-04 | Medio: va coperto ogni punto che oggi chiama `syncDronePublicSnapshot` | Media | **P1** |
| M10 | Trigger Firestore `onReportCreated` → email al proprietario; scheduled job per gli alert di scadenza | Completa una funzionalità dichiarata ma assente | Basso | Media | **P2** |
| M11 | Persistere le richieste di checkout in Firestore (`pricingRequests`) invece che in `Map` | Nessuna perdita dati | Basso | Bassa | **P2** |
| M12 | Migrare i timestamp a `FieldValue.serverTimestamp()` lato Admin SDK | Audit affidabile, ordinamento corretto | **Alto**: rompe il data-lock delle rules e tutti i mapper `str('createdAt')`. Richiede backfill | Alta | **P3** |

### 7.3 Ordine consigliato

**Prima della beta:** M1, M2 (bloccanti funzionali/di sicurezza), poi M5, M7, M8.
**Prima del lancio commerciale:** M3, M4, M6, M9, M10, M11.
**Successivamente:** M12.

### 7.4 Cosa NON toccare senza analisi

- Le `firestore.rules`: sono l'unica autorizzazione reale su update/delete. Allentarle prima di M6 aprirebbe buchi.
- `submitReport`: è l'unico flusso end-to-end corretto; usarlo come riferimento.
- `dataLockedAt` / `entityDataLocked()`: la semantica "updatedAt != createdAt ⇒ locked" è sottile e già in produzione sui dati esistenti.
- Il branch `DEMO_MODE` in `src/lib/firebase/*.ts`: rimuoverlo rompe l'ambiente di demo e i guardrail di `next.config.ts`.
