# DRONETAG — FEATURE MATRIX

> Stato reale di ogni funzionalità. Audit read-only, commit `b72f843`.
>
> **Regola applicata:** la presenza di UI non implica funzionalità. Ogni riga distingue
> UI / logica client / logica server / persistenza / storage / auth / validazione / test.
>
> **Legenda colonne:** ✅ presente e funzionante · ⚠️ parziale o condizionato · ❌ assente · n/a non applicabile
>
> **Stati:** COMPLETA · FUNZIONALE MA DA HARDENING · PARZIALE · DEMO/MOCK · SOLO UI · ROTTA · NON IMPLEMENTATA · LEGACY · NON VERIFICABILE

---

## 0. Sintesi per stato

| Stato | Conteggio | Funzionalità |
|---|---|---|
| COMPLETA | 21 | login, logout, CRUD entità, admin users/drones/plans/reports, inbox, archive, slug/NFC URL, i18n IT/EN, tema |
| FUNZIONALE MA DA HARDENING | 6 | profilo pubblico, found-drone, upload file, verifica admin, sessione, quote |
| PARZIALE | 7 | profilo utente, verifica email, verifica telefono, NFC admin, pricing, dashboard, App Check |
| DEMO / MOCK | 3 | checkout, richieste checkout, analytics |
| SOLO UI | 3 | billing, support utente, support admin |
| ROTTA | 2 | registrazione pubblica (live), notifica esito verifica |
| NON IMPLEMENTATA | 14 | reset password, cancellazione account, export dati, pagamenti, webhook, email transazionali, alert scadenze, ordini, azienda/multi-tenant, inviti, entità badge, revoca badge, audit log, test |
| LEGACY | 3 | collection `profiles`, `ProfileForm`, `src/lib/seed.ts` |

---

## 1. ACCOUNT

| Funzionalità | UI | Client | Server | DB | Storage | Auth | Valid. | Test | Prod-ready | Stato | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Signup email/password** | ✅ | ✅ | ⚠️ | ❌ | n/a | ✅ | ⚠️ | ❌ | ❌ | **ROTTA** | `src/app/signup/page.tsx:99` chiama `ensureAccount()` → `setDoc(users/{uid})`, ma `firestore.rules:87` ha `allow create: if false`. L'utente nasce in Auth ma senza documento → `AccountProvisionGate` mostra "non provisionato". Nessuna API di provisioning self-service. |
| **Signup Google** | ✅ | ✅ | ⚠️ | ❌ | n/a | ✅ | n/a | ❌ | ❌ | **ROTTA** | Stesso problema: `GoogleAuthButton` porta allo stesso `ensureAccount`. |
| **Login email/password** | ✅ | ✅ | ✅ | n/a | n/a | ✅ | ✅ | ❌ | ✅ | **COMPLETA** | `src/app/login/page.tsx`, `signInWithEmailAndPassword`. |
| **Login Google** | ✅ | ✅ | ✅ | n/a | n/a | ✅ | n/a | ❌ | ✅ | **COMPLETA** | `signInWithPopup`, `prompt: select_account`. |
| **Logout** | ✅ | ✅ | ✅ | n/a | n/a | ✅ | n/a | ❌ | ✅ | **COMPLETA** | `signOut` + `DELETE /api/session` + clear cookie. |
| **Reset password** | ❌ | ❌ | ❌ | n/a | n/a | ❌ | ❌ | ❌ | ❌ | **NON IMPLEMENTATA** | `sendPasswordResetEmail` non compare in `src/`. Nessuna route `/forgot-password`. **Un utente che dimentica la password non ha alcun recupero.** |
| **Verifica email (OTP)** | ✅ | ✅ | ✅ | ✅ `signupOtp` | n/a | ✅ | ✅ | ❌ | ⚠️ | **PARZIALE** | `src/lib/server/otp.ts` ben fatto (SHA-256, TTL 10m, cooldown 60s, max 5 tentativi). Richiede `RESEND_API_KEY`: senza, lancia `otp_email_delivery_failed`. Nessun rate limit per IP. |
| **Verifica telefono** | ✅ | ✅ | ✅ | ✅ `users` | n/a | ✅ | ✅ | ❌ | ⚠️ | **PARZIALE** | `api/auth/contact-verification/phone` confronta con `userRecord.phoneNumber`. Richiede che il telefono sia già linkato in Firebase Auth via `src/lib/firebase/phoneAuth.ts` (reCAPTCHA). |
| **Persistenza sessione** | n/a | ✅ | ✅ | n/a | n/a | ✅ | ✅ | ❌ | ⚠️ | **FUNZIONALE MA DA HARDENING** | Doppio cookie: `__dronetag_idt` (**non HttpOnly**) + `__dronetag_session` (HttpOnly). Refresh ogni 5 min. Non usa `createSessionCookie` → durata max 1h, revoca non granulare. |
| **Cancellazione account** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **NON IMPLEMENTATA** | Nessun `deleteUser`, nessuna UI, nessun cascading delete. **Blocca la conformità GDPR art. 17.** |
| **Export dati personali** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **NON IMPLEMENTATA** | Nessun endpoint di portabilità (GDPR art. 20). |

---

## 2. PROFILO

| Funzionalità | UI | Client | Server | DB | Storage | Auth | Valid. | Test | Prod-ready | Stato | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Dati personali** | ✅ | ⚠️ | ✅ | ✅ `users`+`pilots` | n/a | ✅ | ⚠️ | ❌ | ⚠️ | **PARZIALE** | `/account/profile` è **solo media**. I campi identità sono in sola lettura: la UI rimanda a `/account/support` (che non funziona in live). L'utente **non può correggere i propri dati da solo**. |
| **Foto profilo / logo / banner** | ✅ | ✅ | ✅ | ✅ `users` | ✅ | ✅ | ✅ | ❌ | ✅ | **COMPLETA** | `POST /api/account/branding`, MIME allow-list immagini, cap 5 MB, path `users/{uid}/profiles/account/{kind}.{ext}`. |
| **Contatti (email/telefono)** | ⚠️ | ✅ | ✅ | ✅ | n/a | ✅ | ✅ | ❌ | ⚠️ | **PARZIALE** | Modificabili solo via allow-list rules (`firestore.rules:89-95`), non esposti nella UI profilo. |
| **Campi privacy / visibilità** | ❌ | ❌ | ❌ | ❌ | n/a | n/a | n/a | ❌ | ❌ | **NON IMPLEMENTATA** | Non esiste alcun controllo granulare di privacy sul profilo. L'unico switch è `Drone.visibility` (`private`/`public`) per singolo drone. |
| **Slug pubblico** | ✅ | ✅ | ✅ | ✅ `drones.slug` | n/a | ✅ | ✅ | ❌ | ✅ | **COMPLETA** | Base32 Crockford 8 char generato con `crypto.getRandomValues` (`src/lib/utils/entities.ts:21-40`), unicità verificata con retry. Lo slug è **per drone**, non per utente. |
| **Visibilità pubblica** | ✅ | ✅ | ⚠️ | ✅ `dronesPublic` | n/a | ✅ | ❌ | ❌ | ⚠️ | **FUNZIONALE MA DA HARDENING** | Lo snapshot pubblico è **scritto dal client** (`dronesPublic.ts:139`). Le rules verificano chi scrive, non cosa scrive. |
| **Stato di verifica** | ✅ | ✅ | ✅ | ✅ | n/a | ✅ | ✅ | ❌ | ✅ | **COMPLETA** | Owner **non** può modificarlo: escluso da tutte le allow-list delle rules. Corretto. |

---

## 3. PILOTI / OPERATORI

| Funzionalità | Stato | Note |
|---|---|---|
| **Distinzione pilota ↔ operatore UAS** | **COMPLETA (modello)** | `pilots/{uid}` = persona fisica (1 per utente). `operators/{opId}` = soggetto giuridico responsabile (max 3), con `kind: 'private'\|'company'`. Modello corretto rispetto al regolamento EASA. |
| **Account individuale** | **COMPLETA** | 1 utente Auth ↔ 1 `users` ↔ 1 `pilots`. |
| **CRUD operatori** | **COMPLETA** | `/account/operators`, create via `POST /api/entities/operators`, update/delete client SDK. Cap 3 (`MAX_OPERATORS_PER_USER`). Gestione `isDefault` con demote in batch. |
| **Operatore attivo temporaneo** | **COMPLETA** | Override 24h con audit (`activeOperatorSetAt/SetBy/Reason`), clampato dalle rules a ≤24h+2min (`firestore.rules:62-74`). Una delle parti meglio implementate. |
| **Relazione pilota ↔ azienda** | **NON IMPLEMENTATA** | Nessun campo `companyId`, nessuna collection azienda. Un'azienda con più piloti non è modellabile. |
| **Ownership** | **COMPLETA** | Ogni entità ha `userId`; verificato lato API e lato rules. |

---

## 4. AZIENDE

| Funzionalità | Stato | Note |
|---|---|---|
| **Creazione azienda** | **NON IMPLEMENTATA** | "Azienda" esiste solo come `UserAccount.accountType='company'` (campi anagrafici) e `Operator.kind='company'`. Nessuna entità. |
| **Modifica azienda** | PARZIALE | Solo i campi `companyName`, `companyVat`, `companyContactPerson`, `companyUniqueNumber` su `users`, e il sotto-oggetto `Operator.company`. |
| **Membri** | **NON IMPLEMENTATA** | Nessuna collection `members`. |
| **Ruoli aziendali** | **NON IMPLEMENTATA** | Esiste un solo ruolo nel sistema: `admin` (custom claim). |
| **Multi-tenant** | **NON IMPLEMENTATA** | Nessun `tenantId`/`companyId` in nessun tipo o rule. |
| **Inviti** | **NON IMPLEMENTATA** | Nessun flusso di invito. |
| **Accesso a dati aziendali condivisi** | **NON IMPLEMENTATA** | Ogni documento è legato a un singolo `userId`. |

> ⚠️ **Gap commerciale critico.** I piani Team (€49/mese, `maxOperators: 25`) e Business (€149/mese, `maxOperators: 200`) sono venduti su `/pricing`, ma il codice impone un cap di **3 operatori per utente** e non ha alcun concetto di team. Questi piani **non sono erogabili**.

---

## 5. DRONI

| Funzionalità | UI | Client | Server | DB | Auth | Valid. | Test | Stato | Note |
|---|---|---|---|---|---|---|---|---|---|
| **Create** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | **COMPLETA** | `POST /api/entities/drones`: quota, ownership operator+insurance, slug unico. |
| **Read** | ✅ | ✅ | n/a | ✅ | ✅ | n/a | ❌ | **COMPLETA** | Client SDK + rules owner/admin. |
| **Update** | ✅ | ✅ | ❌ | ✅ | ✅ | ⚠️ | ❌ | **FUNZIONALE MA DA HARDENING** | Client SDK diretto; autorizzazione solo dalle rules. Data-lock dopo il primo update. |
| **Delete** | ✅ | ✅ | ❌ | ✅ | ✅ | n/a | ❌ | **FUNZIONALE MA DA HARDENING** | Cancella anche `dronesPublic`. **Non** cancella reports collegati né file Storage. |
| **Immagini drone** | ❌ | ❌ | ❌ | ❌ | n/a | n/a | ❌ | **NON IMPLEMENTATA** | Nessun campo immagine sul drone. Il pubblico vede solo il branding dell'account. |
| **Catalogo modelli** | ✅ | ✅ | n/a | n/a | n/a | n/a | ❌ | **COMPLETA** | `src/lib/droneCatalog.ts` + `DroneCatalogPicker`. Dati statici. |
| **Assegnazione operatore** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | **COMPLETA** | Default + override 24h. |
| **Stato pubblico** | ✅ | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | **FUNZIONALE MA DA HARDENING** | Vedi `dronesPublic`. |
| **Conferma su delete** | ✅ | ✅ | n/a | n/a | n/a | n/a | ❌ | **COMPLETA** | `ConfirmDialog` usato su tutti i delete di entità. |

---

## 6. CERTIFICATI

| Funzionalità | Stato | Note |
|---|---|---|
| **Upload PDF** | **FUNZIONALE MA DA HARDENING** | `POST /api/entities/certificates/[id]/pdf`, ownership verificata, solo PDF, cap 20 MB. File in `users/{uid}/certificates/{id}/certificate.pdf` — **leggibile pubblicamente** (storage rules `read: if true`). |
| **Metadati** | **COMPLETA** | `kind` (A1_A3, A2, STS_THEORETICAL, STS_01, STS_02, custom), `registrationNumber`, `issuedBy`, `issuedAt`, `expiresAt`. |
| **Parsing automatico PDF** | **COMPLETA** | `src/lib/certificate/parseCertificatePdf.ts` + OCR fallback `ocrCertificatePdf.ts` (Tesseract, `eng.traineddata`). Estrazione campi in `extractCertificateFields.ts`. Funzionalità non banale e ben realizzata. |
| **Auto-verifica parser** | **PARZIALE** | `src/lib/parser/autoVerify.ts` + `src/lib/server/parserAutoVerify.ts`, con `holderMatch` per confrontare il nome. Il server accetta un flag `parserTrusted`. |
| **Scadenza** | **COMPLETA** | `expiresAt`; i certificati scaduti non consumano quota (`quota.ts:52-54`) e finiscono in `/account/archive`. |
| **Verifica admin** | **PARZIALE** | `/admin/verify` aggiorna `verificationStatus` (client SDK). Ma la **notifica all'utente lancia un'eccezione** (vedi §11). |
| **Visibilità pubblica** | **COMPLETA** | Non è esposto il PDF del certificato; solo lo stato aggregato via `deriveCertificateVerification()` in `dronesPublic.verificationStatus`. Buona minimizzazione. |

---

## 7. ASSICURAZIONI

| Funzionalità | Stato | Note |
|---|---|---|
| **Upload polizza PDF** | **FUNZIONALE MA DA HARDENING** | `POST /api/entities/insurances/[id]/pdf`. |
| **Numero polizza** | **COMPLETA** | `policyNumber`, mascherato nel pubblico (`maskPolicyNumber`, primi 3 + ultimi 3). |
| **Scadenza + stato** | **COMPLETA** | `computePolicyStatus()` → `valid` / `expiring` / `expired` / `missing`. |
| **Parsing PDF polizza** | **COMPLETA** | `src/lib/insurance/parsePolicyPdf.ts` + `extractPdfText.ts`. |
| **Verifica admin** | **PARZIALE** | Come i certificati. |
| **Visibilità pubblica** | ⚠️ **DA RIVEDERE** | Lo snapshot pubblico include `insurancePdfUrl` → **link diretto al PDF integrale della polizza**, accessibile senza autenticazione. Il PDF contiene tipicamente nome, indirizzo e numero polizza completo. Vedi `DRONETAG_PRIVACY_AUDIT.md`. |
| **CTA rinnovo (Coverdrone)** | **COMPLETA** | `CoverdroneCta` con link affiliato fisso (`src/lib/config/features.ts:12`). Solo link esterno. |
| **Quota** | ❌ | Le assicurazioni sono l'unica entità **senza limite di quota** (né API né Function). |
| **Multi-drone** | **PARZIALE** | `droneIds[]` + `Drone.insuranceId` + `droneId` deprecato: tre riferimenti da mantenere allineati a mano. |

---

## 8. DOCUMENTI

| Funzionalità | Stato | Note |
|---|---|---|
| **Upload** | **FUNZIONALE MA DA HARDENING** | `POST /api/entities/documents/[id]/file`. MIME: PDF/PNG/JPEG/WebP. Cap 20 MB (server rules) / 5 MB immagini (client). |
| **Download** | **COMPLETA** | Via `/api/files/proxy` (autenticato, ownership) oppure direttamente dall'URL Storage. |
| **Delete** | **COMPLETA** | Client SDK + `ConfirmDialog`. **Non cancella il file da Storage** → file orfani. |
| **ACL** | ⚠️ | Firestore: owner+admin. **Storage: `allow read: if true`** → chiunque conosca il path legge il file. |
| **Storage path** | **COMPLETA** | `users/{uid}/documents/{id}/file.{ext}`, scoped correttamente. |
| **MIME / size limit** | **COMPLETA** | Doppio livello (API + storage.rules). SVG escluso deliberatamente. |
| **Signed URL** | ❌ | Si usano download URL con token permanente, non signed URL a scadenza. |
| **Tipo `identity`** | ⚠️ | `DocumentKind` include `'identity'` → documenti d'identità in uno Storage pubblicamente leggibile. Rischio alto. |

---

## 9. BADGE NFC

| Funzionalità | Stato | Note |
|---|---|---|
| **Entità `badge` nel DB** | **NON IMPLEMENTATA** | Non esiste alcuna collection `badges`. **Il badge è solo un URL fisico che punta a `/u/{slug}` del drone.** |
| **Acquisto** | **DEMO/MOCK** | Il kit NFC è un `kitPriceCents` in `src/config/pricing.ts` e una riga nel quote di `/checkout`. Nessun ordine reale, nessun pagamento. |
| **Generazione URL** | **COMPLETA** | `buildPublicUrl(slug, baseUrl)` in `src/lib/nfc/payload.ts:35`. |
| **Validazione URL** | **COMPLETA** | `validateNfcUrl()` — https obbligatorio, host esatto, path `/u/<slug>`, slug valido. |
| **Export batch CSV** | **COMPLETA** | `exportNfcCsv()` RFC 4180 + `/admin/nfc`. Compatibile NXP TagWriter / Zebra. |
| **Encoding fisico** | **NON IMPLEMENTATA** | Nessuna integrazione hardware. Processo manuale via CSV → scrittore esterno. Documentato come scelta (`payload.ts:14-16`). |
| **Assegnazione badge → profilo** | **NON IMPLEMENTATA** | Implicita: il badge contiene lo slug del drone. Nessun record dell'associazione. |
| **Revoca badge** | **NON IMPLEMENTATA** | L'unico modo è impostare il drone a `visibility: private` o `status != active`, che cancella `dronesPublic/{slug}` → il badge punta a un 404. Non c'è distinzione fra "badge revocato" e "drone spento". |
| **Sostituzione / smarrimento** | **NON IMPLEMENTATA** | Nessun `replacementOf`, nessuno stato. Uno slug non è rigenerabile (`slug` è immutabile nelle rules). Un badge smarrito **non può essere invalidato senza rendere privato il drone**. |
| **Badge duplicati** | Non rilevabile | Nulla impedisce di scrivere lo stesso URL su N tag. |
| **Rischio enumerazione** | Basso | Slug 8 char su alfabeto 32 = 2^40 ≈ 1,1×10¹² combinazioni, generate con CSPRNG. **Ma nessun rate limit sulla lettura di `dronesPublic`** → enumerazione teoricamente possibile, praticamente costosa. |

### Proposta (NON implementata): entità `badges`

```
badges/{badgeId}
  badgeId          string   (id logico stampato sul badge)
  tagUid           string   (UID hardware del chip NFC, se leggibile)
  ownerId          string   → users/{uid}
  droneId          string   → drones/{id}     (nullable finché non assegnato)
  slug             string   (denormalizzato per lookup rapido)
  status           'stock' | 'assigned' | 'active' | 'lost' | 'revoked' | 'replaced'
  issuedAt         timestamp
  activatedAt      timestamp
  revokedAt        timestamp
  replacementOf    string   → badges/{badgeId}
  orderId          string   → orders/{id}
```
Benefici: revoca indipendente dal drone, tracciabilità del ciclo di vita, gestione smarrimenti, collegamento all'ordine, conteggio badge per fatturazione. Complessità: media. Priorità: **P2** (necessaria per il lancio commerciale, non per una beta tecnica).

---

## 10. PROFILO PUBBLICO `/u/{slug}`

| Aspetto | Stato | Dettaglio |
|---|---|---|
| **Dati visibili** | **COMPLETA** | Nome titolare, tipo (pilota/operatore), produttore, modello, classe, seriale drone, stato assicurazione, compagnia, validità, polizza mascherata, stato verifica, foto/logo/banner. |
| **Minimizzazione** | ⚠️ **PARZIALE** | `publicProjection.ts` è ben progettato ed esclude DOB, telefono, indirizzo, P.IVA, seriale radiocomando. **Ma include `insurancePdfUrl`**, che è un PDF integrale con PII. |
| **Documento accessibile?** | ⚠️ **SÌ** | Il PDF della polizza è linkato pubblicamente. |
| **noindex** | ❌ | Nessun `robots` meta, nessun `robots.txt`, nessun `X-Robots-Tag`. Le pagine `/u/*` sono indicizzabili. Attenuante: la pagina è client-rendered, quindi molti crawler vedono HTML vuoto — è una protezione accidentale, non una scelta. |
| **Rate limiting** | ❌ | Nessuno sulla lettura. |
| **Caching** | ❌ | Client component, nessun caching HTTP/CDN. Ogni scansione = round-trip Firestore. |
| **Scraping risk** | ⚠️ MEDIO | Slug non enumerabile facilmente, ma nessun limite. Un elenco di slug (es. da un lotto di badge) permette scraping massivo di nomi + PDF. |
| **Accessibilità** | ⚠️ | Vedi `DRONETAG_UI_UX_AUDIT.md`. |
| **Performance** | ⚠️ | Vedi ibidem: carica l'intero SDK Firebase client per una singola lettura. |
| **Stato complessivo** | **FUNZIONALE MA DA HARDENING** | |

---

## 11. FOUND DRONE (segnalazione ritrovamento)

| Aspetto | Stato | Dettaglio |
|---|---|---|
| **Workflow** | **COMPLETA** | `/u/{slug}` → `ReportFoundDroneForm` → `createReport()` → callable `submitReport`. |
| **Form** | **COMPLETA** | Nome, messaggio, email, posizione testuale, geolocalizzazione opzionale. Honeypot anti-bot. |
| **Submit** | **COMPLETA** | Cloud Function `submitReport`. |
| **Database** | **COMPLETA** | `reports/{autoId}`; `ownerUserId` derivato server-side. |
| **Anti-spam** | **COMPLETA** | Rate limit 3/10min per (slug + IP) via `rateLimits`. Honeypot. App Check (se attivo). |
| **Privacy** | ⚠️ | Salva `contactEmail` e **`_origin.ip`** del segnalante. Nessuna retention policy. `reportFound.privacy` informa che i dati vanno al proprietario, ma non menziona l'IP. |
| **Audit** | **COMPLETA** | `_serverTs`, `_origin.ip`, `createdAt`. |
| **Notifica al proprietario** | ❌ **NON IMPLEMENTATA** | `functions/src/submit-report.ts:122`: `// TODO V-006/V-035: enqueue push + email fanout. For now just log.` I campi `emailNotified`/`pushNotified` restano sempre `false`. **Il proprietario scopre la segnalazione solo se apre `/account/inbox`.** Questo svuota di valore il caso d'uso principale del prodotto. |
| **Inbox proprietario** | **COMPLETA** | `/account/inbox`, `listReportsForOwner`, `markReportRead`. |
| **Vista admin** | **COMPLETA** | `/admin/reports` con link Google Maps. |
| **Stato complessivo** | **FUNZIONALE MA DA HARDENING** — il flusso funziona ma **senza notifica** |

---

## 12. ADMIN

| Funzionalità | UI | Server | DB | Authz | Stato | Note |
|---|---|---|---|---|---|---|
| **Login admin** | ✅ | ✅ | n/a | ✅ | **COMPLETA** | Stesso login; il claim `admin` reindirizza a `/admin`. |
| **Authorization** | ✅ | ⚠️ | ✅ | ⚠️ | **FUNZIONALE MA DA HARDENING** | Gate `/admin` **solo client-side** (`src/app/admin/layout.tsx:15-22`). Nessun middleware. La difesa reale è: custom claim + firestore.rules + `requireAdminFromRequest` sulle API. Un utente non-admin che forza `/admin` vede il layout finché React non fa il redirect, ma **non ottiene dati** (tutte le query vengono negate). |
| **Custom claims** | n/a | ✅ | n/a | ✅ | **COMPLETA** | `scripts/grant-admin.ts` con Admin SDK + `revokeRefreshTokens`. Nessuna auto-promozione. |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | **COMPLETA** | `/admin` aggrega tutte le collection + `/api/health`. |
| **Users (lista)** | ✅ | ✅ | ✅ | ✅ | **COMPLETA** | `GET /api/admin/accounts`. |
| **Users (crea)** | ✅ | ✅ | ✅ | ✅ | **COMPLETA** | `POST /api/admin/users`: crea utente Auth + `users` + `pilots` + `slots` in batch. Con schema di validazione dedicato. |
| **Users (dettaglio/modifica)** | ✅ | ⚠️ | ✅ | ✅ | **COMPLETA** | 940 righe. Modifica account, pilota, tutte le entità, slot. Via client SDK. |
| **Companies** | ❌ | ❌ | ❌ | n/a | **NON IMPLEMENTATA** | Non esistono aziende. |
| **Drones** | ✅ | ⚠️ | ✅ | ✅ | **COMPLETA** | Lista, dettaglio, update, delete, clear override. |
| **Documents / verification** | ✅ | ⚠️ | ✅ | ✅ | **PARZIALE** | `/admin/verify` è una coda unificata su documenti, certificati, assicurazioni, permessi, droni. **Ma al cambio di stato chiama `ensureSupportThread()` + `sendSupportMessage()`, che in live lanciano `support_unavailable`.** L'aggiornamento dello stato avviene prima, quindi il dato si salva, ma l'admin vede un errore e l'utente non riceve nulla. Da verificare in ambiente reale. |
| **Badges** | ⚠️ | ❌ | ❌ | ✅ | **PARZIALE** | `/admin/nfc` genera URL ed esporta CSV. Nessuna entità badge, nessuna gestione ciclo di vita. |
| **Orders** | ❌ | ❌ | ⚠️ | ✅ | **NON IMPLEMENTATA** | Nessuna pagina admin ordini. La collection esiste ma nulla la popola. |
| **Reports** | ✅ | ✅ | ✅ | ✅ | **COMPLETA** | |
| **Plans** | ✅ | ⚠️ | ✅ | ✅ | **COMPLETA** | CRUD reale su `plans` (valuta CHF). Scollegato dal listino EUR di `/pricing`. |
| **Billing** | ❌ | ❌ | ❌ | n/a | **NON IMPLEMENTATA** | |
| **Support** | ✅ | ❌ | ❌ | ✅ | **SOLO UI** | `/admin/support` è un'interfaccia a due pannelli completa, ma `listSupportThreads()` restituisce `[]` in live e l'invio lancia un'eccezione. |
| **Audit log** | ❌ | ❌ | ❌ | n/a | **NON IMPLEMENTATA** | Nessuna traccia delle azioni admin. |

---

## 13. PRICING / CHECKOUT

### 13.1 Confronto con il modello commerciale dichiarato

| Voce | Atteso | In `src/config/pricing.ts` | Esito |
|---|---|---|---|
| Free — abbonamento | €0 | `priceCents: 0`, `interval: 'year'` | ✅ **CONFERMATO** |
| Pilot — abbonamento | €99/anno | `9900`, `'year'` | ✅ **CONFERMATO** |
| Pilot Pro — abbonamento | €139/anno | `13900`, `'year'` | ✅ **CONFERMATO** |
| Team — abbonamento | €49/mese | `4900`, `'month'` | ✅ **CONFERMATO** |
| Business — abbonamento | €149/mese | `14900`, `'month'` | ✅ **CONFERMATO** |
| Enterprise | preventivo | `priceCents: null`, `interval: 'quote'` | ✅ **CONFERMATO** |
| Badge Free | €24,90 | `kitPriceCents: 3990` = **€39,90** | ❌ **NON CORRISPONDE** |
| Badge Pilot | €19,90 | `kitPriceCents: 3490` = **€34,90** | ❌ **NON CORRISPONDE** |
| Badge Pilot Pro | incluso | `kitPriceCents: 0`, `kitIncluded: true` | ✅ **CONFERMATO** |
| Badge Team | €17,90/pilota | `kitPriceCents: 2990` = **€29,90** | ❌ **NON CORRISPONDE** |
| Badge Business | €15,90/pilota | `kitPriceCents: 2790` = **€27,90** | ❌ **NON CORRISPONDE** |
| Badge Enterprise | preventivo | `kitPriceCents: null` | ✅ **CONFERMATO** |
| **UN SOLO badge per profilo** | 1 badge | **2 badge** | ❌ **MODELLO LEGACY PRESENTE** |

### 13.2 Legacy "due badge" — confermato

```ts
// src/config/pricing.ts:64-67
export const NFC_KIT_CONTENTS_KEYS = [
  'pricing.kit.item.certBadge',
  'pricing.kit.item.insuranceBadge',
] as const;
```

Renderizzato da `src/components/pricing/PricingNfcKitSection.tsx:31`. Testi in **tutte e 5 le lingue**:

| File | Chiave | Testo |
|---|---|---|
| `src/lib/i18n/it.ts:1373` | `pricing.kit.mandatoryBody` | "…Ogni kit include **due badge**." |
| `src/lib/i18n/it.ts:1374` | `pricing.kit.item.certBadge` | "1 badge NFC per certificati" |
| `src/lib/i18n/it.ts:1375` | `pricing.kit.item.insuranceBadge` | "1 badge NFC per assicurazione" |
| `src/lib/i18n/it.ts:1377-1378` | `pricing.kit.visual.cert` / `.ins` | "CERT" / "ASS" |
| `en.ts:1411`, `de.ts:1362`, `es.ts:1362`, `fr.ts:1362` | `pricing.kit.mandatoryBody` | "…Each kit includes **two badges**." |

Inoltre `src/components/pricing/PricingVisuals.tsx` disegna i due badge.

### 13.3 Stato implementativo

| Aspetto | Stato | Note |
|---|---|---|
| Config centralizzata | ✅ **COMPLETA** | `src/config/pricing.ts` è l'unica fonte; nessun prezzo hardcoded nei componenti. Buona architettura. |
| UI pricing | ✅ **COMPLETA** | `/pricing` con toggle individual/business, card, FAQ, sezione kit. |
| Calcolo quote | ✅ **COMPLETA** | `buildPricingQuote()` (`src/lib/pricing/quote.ts`) valida piano, tipo cliente, numero operatori, quantità kit. Non si fida di importi dal client. Ben scritto. |
| Endpoint quote server | ⚠️ | `POST /api/pricing/quote` esiste ma **il client non lo chiama** (usa `buildPricingQuote` lato client). Endpoint orfano. |
| Checkout | ❌ **DEMO/MOCK** | `POST /api/pricing/checkout` valida e calcola, poi salva in `const serverDemoRequests = new Map()` (`route.ts:33`) — **memoria di processo**. Risposta: `paymentActive: false`, `paymentNote: 'payment_not_active'`. Il client salva anche in `localStorage` (`src/lib/pricing/demoRequests.ts`). |
| Creazione ordine | ❌ **NON IMPLEMENTATA** | Nessun documento `orders` viene creato. |
| Pagamento | ❌ **NON IMPLEMENTATA** | Nessun provider. |
| Quantità badge | ⚠️ | `kitQuantity` calcolata: se `kitIncluded` → `max(1, operatorCount)`; se business → ≥ `operatorCount`; altrimenti 1–20. Coerente con "1 kit per operatore", **ma il kit contiene 2 badge**. |
| Upgrade / downgrade | ❌ **NON IMPLEMENTATA** | |
| Rinnovo | ❌ **NON IMPLEMENTATA** | |
| Cancellazione | ❌ **NON IMPLEMENTATA** | |
| Piano Free | ⚠️ | Esiste nel listino ma non c'è alcun campo `plan` su `users`: **il piano dell'utente non è memorizzato da nessuna parte**. |
| Collegamento piano ↔ slot | ❌ | I piani commerciali (EUR) non concedono slot. Gli slot si comprano dal listino `plans` (CHF) gestito in `/admin/plans`. **Due sistemi commerciali scollegati.** |

---

## 14. PAGAMENTI E BILLING

| Aspetto | Stato |
|---|---|
| Provider | ❌ **NESSUNO**. Nessuna dipendenza Stripe/PayPal/Adyen in `package.json`. |
| Astrazione | ✅ `src/lib/billing/types.ts` definisce `BillingProvider`, `BillingProduct`, `UserSubscription`, `CheckoutSessionArgs`. Contratto ben progettato. |
| Implementazione attiva | `NoopBillingProvider` — ogni metodo lancia `BillingNotConfiguredError`; `handleWebhook` restituisce `501`. |
| Checkout session | ❌ NON IMPLEMENTATA |
| Webhook | ⚠️ Endpoint `POST /api/billing/webhook` esiste, **senza verifica di firma** (delegata al provider, che non c'è). Oggi innocuo (501); diventa critico appena si collega un provider. |
| Subscription lifecycle | ❌ Collection `subscriptions/{uid}` citata nei commenti, mai creata. |
| Invoice | ❌ |
| Portale cliente | ❌ `/account/billing` mostra un `<Button disabled>` senza handler (`billing/page.tsx:39`) e un badge "Coming soon". |
| Test/production mode | n/a |

**Dichiarazione esplicita: il billing NON è implementato.** L'infrastruttura di preparazione è presente e ben fatta, ma nessuna transazione è possibile.

---

## 15. SUPPORT

| Aspetto | Stato | Note |
|---|---|---|
| UI utente | ✅ | `/account/support`, 205 righe, thread + composer completi. |
| UI admin | ✅ | `/admin/support`, 303 righe, due pannelli, cambio stato. |
| Tipi | ✅ | `SupportThread`, `SupportMessage` completamente definiti. |
| **Backend live** | ❌ | `src/lib/firebase/support.ts`: `getSupportThread` → `null`; `listSupportThreads` → `[]`; `ensureSupportThread` / `sendSupportMessage` → `throw new Error('support_unavailable')`. Commento in testa al file: *"Live: not wired yet — callers get empty / no-op until Firestore rules land."* |
| Collection Firestore | ❌ | Nessuna regola per `supportThreads`/`supportMessages` → negate dal catch-all. |
| Notifiche | ❌ | |
| **Stato** | **SOLO UI** | In DEMO_MODE funziona perfettamente (store in memoria), il che rende l'illusione molto convincente in una demo. |
| **Effetto collaterale** | ⚠️ | `/admin/verify` e `/account/profile` rimandano al support come canale ufficiale per correggere i dati bloccati. Quel canale **non esiste** in produzione. |

---

## 16. NOTIFICHE

| Canale | Stato | Note |
|---|---|---|
| **Email OTP di registrazione** | ✅ **REALE** | Unico invio email del sistema. `src/lib/server/otp.ts:83` → `POST https://api.resend.com/emails`. Richiede `RESEND_API_KEY` e `OTP_EMAIL_FROM`. |
| Email verifica documento approvato/rifiutato | ❌ **NON IMPLEMENTATA** | Doveva passare dal support. |
| Email drone ritrovato | ❌ **NON IMPLEMENTATA** | `TODO` in `submit-report.ts:122`. |
| Email reset password | ❌ **NON IMPLEMENTATA** | |
| Alert scadenza certificati/polizze | ❌ **NON IMPLEMENTATA** | Nessuno scheduled job. Lo stato "expiring" è calcolato solo a video. |
| Email ordine / pagamento / abbonamento | ❌ **NON IMPLEMENTATA** | |
| Alert admin | ❌ **NON IMPLEMENTATA** | |
| Invito azienda | ❌ **NON IMPLEMENTATA** | |
| Push notification | ❌ | `pushNotified` è un campo predisposto ma nessun FCM. |
| Coda / retry | ❌ | Nessuna. |
| Firebase Extensions | ❌ | Nessuna (nessun riferimento in `firebase.json`). |

**Sintesi:** su ~10 notifiche attese dal prodotto, **1 è implementata**.

---

## 17. TRASVERSALI

| Funzionalità | Stato | Note |
|---|---|---|
| **i18n** | **PARZIALE** | 5 lingue, 1275 chiavi ciascuna, parità garantita a compile-time da `TranslationMap`. IT ed EN complete. **DE/ES/FR ~62% in inglese** (copia-incolla). Fallback su EN con `console.warn`, poi eco della chiave. |
| **Tema chiaro/scuro** | **COMPLETA** | `ThemeContext`, `light|dark|system`, boot script inline anti-FOUC, token CSS completi, `prefers-reduced-motion` rispettato. |
| **PWA** | **PARZIALE** | `manifest.ts` ✅, `public/sw.js` ✅, `ServiceWorkerCleanup` montato ✅. **Ma `PWAClient.tsx` (prompt di installazione, toast offline) non è montato da nessuna parte** → funzionalità di install prompt inattiva. |
| **Analytics** | **DEMO/MOCK** | Astrazione ottima (allow-list eventi, sanitizzazione PII), ma il client attivo è `ConsoleAnalyticsClient` che in produzione fa `return` immediato. Nessun vendor collegato. |
| **Error boundaries** | **COMPLETA** | `error.tsx` a livello root, account, admin, `/u/[slug]`, più `global-error.tsx`. |
| **Pagina 404** | ❌ **NON IMPLEMENTATA** | Nessun `not-found.tsx`. |
| **Pagine legali** | ❌ **NON IMPLEMENTATA** | Il footer etichetta "Privacy" e "Termini" ma i link puntano a `mailto:info@drone-tag.com` (`src/components/landing/PublicFooter.tsx:34-41`). Nessuna privacy policy, nessun ToS, nessuna cookie policy. |
| **Onboarding** | ❌ **NON IMPLEMENTATA** | Nessun wizard. Dopo il login l'utente atterra su una dashboard vuota. |
| **Test** | ❌ **NON IMPLEMENTATA** | Zero test, zero framework. |
| **Monitoring** | ❌ **NON IMPLEMENTATA** | Solo `/api/health`. Nessun Sentry, nessun uptime monitor configurato nel repo. |
| **Audit log** | ❌ **NON IMPLEMENTATA** | |

---

## 18. Codice legacy e morto

| Elemento | Tipo | Evidenza |
|---|---|---|
| Collection `profiles` | LEGACY | Rules admin-only; nessuna UI attiva |
| `src/lib/firebase/firestore.ts` | LEGACY | Importato solo da `ProfileForm` e `seed.ts`, entrambi morti |
| `src/components/profile/ProfileForm.tsx` | **MORTO** | Nessun import |
| `src/components/profile/PublicProfileCard.tsx` | **MORTO** | Nessun import |
| `src/lib/seed.ts` | **MORTO** | Nessun import |
| `src/lib/auth/adminAllowlist.ts` | **MORTO** | Nessun import (l'allowlist email è stata rimossa da `AuthContext`) |
| `src/lib/hooks/useAuth.ts` | **MORTO** | Le pagine usano `useAuth` da `@/contexts/AuthContext` |
| `src/lib/hooks/useTranslation.ts` | **MORTO** | Alias di `useLanguage`, non importato |
| `src/components/ui/StatsCard.tsx` | **MORTO** | |
| `src/components/ui/MetadataRow.tsx` | **MORTO** | |
| `src/components/landing/NfcBadgeSection.tsx` | **MORTO** | |
| `src/components/landing/AudienceCard.tsx` | **MORTO** | |
| `src/components/demo/DemoClientScenarios.tsx` | **MORTO** | |
| `src/components/pwa/PWAClient.tsx` | **MORTO** | PWA install prompt mai montato |
| `callCreateDrone/Operator/Certificate/Document/Insurance` | **MORTO** | `src/lib/firebase/callable.ts:47-93` |
| Cloud Functions `create*` (5) | **MORTE** (deployate) | Nessun caller |
| `POST /api/pricing/quote` | **ORFANO** | Nessun caller client |
| Indici `profiles(slug,visibility,status)` e `drones(slug,visibility,status)` | LEGACY | `firestore.indexes.json` |
| `Insurance.droneId` | DEPRECATO | Commento esplicito `entities.ts:133` |
| Slot `nfc_badge`, `personalization` | INUTILIZZATI | Definiti in `Slots`, non in `QuotaSlot` |
| `scripts/create-admin.ts` | **DA RIMUOVERE** | Password hardcoded; `grant-admin.ts` lo dichiara "deleted" ma esiste |
| `.netlify/**` | ARTEFATTO | 21 MB committati, `.gitignore` lo esclude ma è già tracciato |
| `eng.traineddata` | ASSET | 5,2 MB in root |

Marcatori `TODO`/`FIXME`/`HACK`: **1 solo** in tutto il codice sorgente (`functions/src/submit-report.ts:122`). Il codice è pulito da questo punto di vista; il debito è strutturale, non annotato.
