# DRONETAG — DATA MODEL (Firestore + Storage)

> Audit read-only, commit `b72f843`. Nessun dato o regola è stato modificato.
> Il modello è ricostruito da: `src/lib/types/entities.ts`, `src/lib/types/account.ts`,
> `src/lib/types/contactVerification.ts`, `firestore.rules`, `firestore.indexes.json`,
> `storage.rules`, `src/lib/firebase/*.ts`, `src/app/api/**`, `functions/src/**`.
>
> **Attenzione:** Firestore è schemaless. Quanto segue è lo schema *atteso dal codice*,
> non necessariamente quello *presente nel database*. Documenti creati da script di seed
> o versioni precedenti possono avere forme diverse. **UNKNOWN**: lo stato reale dei dati.

---

## 1. Panoramica delle collection

Progetto Firebase: **`dronetag-e905d`** (unico, vedi `.firebaserc`).

| # | Collection | Doc ID | Scopo | Ha PII? | Client può scrivere? |
|---|---|---|---|---|---|
| 1 | `users` | `{uid}` | Account applicativo | **SÌ (alto)** | update sì, create **no** |
| 2 | `pilots` | `{uid}` | Identità pilota | **SÌ (alto)** | update sì, create **no** |
| 3 | `operators` | auto-id | Operatore UAS (max 3/utente) | **SÌ (alto)** | update/delete sì, create no |
| 4 | `drones` | auto-id | Aeromobile | Sì (seriali) | update/delete sì, create no |
| 5 | `dronesPublic` | `{slug}` | Proiezione pubblica | Sì (nome + PDF polizza) | **SÌ (create/update/delete)** |
| 6 | `insurances` | auto-id | Polizza assicurativa | **SÌ** | update/delete sì, create no |
| 7 | `certificates` | auto-id | Attestato/certificato | **SÌ** | update/delete sì, create no |
| 8 | `documents` | auto-id | Documento generico (incl. identità) | **SÌ (molto alto)** | update/delete sì, create no |
| 9 | `authorizations` | auto-id | Permesso/autorizzazione | Sì | update/delete sì, create no |
| 10 | `slots` | `{uid}` | Quote per utente | No | **no** (solo admin) |
| 11 | `plans` | auto-id | Listino add-on (admin) | No | no (read pubblico) |
| 12 | `reports` | auto-id | Segnalazione drone ritrovato | **SÌ (email + IP finder)** | solo campo `read` |
| 13 | `rateLimits` | `{bucket:key}` | Token bucket | IP (indiretto) | **no** |
| 14 | `orders` | auto-id | Ordine badge/kit | Sì (indirizzo) | **no** (solo admin) |
| 15 | `signupOtp` | `{uid}` | Challenge OTP | Sì (email) | **no** (server-only) |
| 16 | `profiles` | auto-id | **LEGACY** — modello mono-profilo | **SÌ** | no (solo admin) |

**Collection referenziate dalla UI ma NON presenti nelle rules** → bloccate dal catch-all `allow read, write: if false` (`firestore.rules:357-359`):
- Support: `supportThreads` / `supportMessages` — **non esistono nelle rules e non esistono nel codice live**. `src/lib/firebase/support.ts` non tenta nemmeno di scrivere su Firestore: restituisce `null`/`[]` o lancia `support_unavailable`. Vedi § 6.
- Billing: `subscriptions/{uid}`, `products/{id}` — citate in `src/lib/billing/types.ts:6-9` come contratto futuro. **Non implementate.**
- Pricing: `pricingRequests` — citata come commento in `src/app/api/pricing/checkout/route.ts:33`. **Non implementata**: i dati vanno in una `Map` in memoria.

---

## 2. Diagramma ER (testuale)

```
                        Firebase Auth user (uid)
                                 │
        ┌────────────────┬───────┴────────┬──────────────────┐
        │                │                │                  │
        ▼ 1:1            ▼ 1:1            ▼ 1:1              ▼ 1:1
   users/{uid}      pilots/{uid}      slots/{uid}      signupOtp/{uid}
   (account)        (identità)        (quote)          (temporaneo, TTL 10m)
        │                │
        │                │  linkedPilotId
        │                └───────────────────────┐
        │ userId                                 │
        ├──────────────► operators/{opId}        │
        │                (max 3, kind:            │
        │                 private|company)        │
        │                     ▲                   │
        │                     │ defaultOperatorId │
        │                     │ activeOperatorId  │
        │                     │                   │
        ├──────────────► drones/{droneId} ◄───────┘
        │                     │  slug (unico, base32 8 char)
        │                     │  insuranceId ──────┐
        │                     │                    ▼
        │                     │              insurances/{insId}
        │                     │                    │  droneIds[]  (n:n inverso)
        │                     │                    │  operatorId
        │                     │                    │  pdfUrl ──► Storage
        │                     │
        │                     │  syncDronePublicSnapshot()  [scritto DAL CLIENT]
        │                     ▼
        │              dronesPublic/{slug}   ◄── LETTURA ANONIMA (allow read: if true)
        │                     ▲
        │                     │ droneSlug / droneId
        │                     │
        │              reports/{reportId}    ◄── creato SOLO da Cloud Function submitReport
        │                        ownerUserId (derivato server-side)
        │                        _origin.ip, contactEmail   ⚠ PII
        │
        ├──────────────► certificates/{certId}   fileUrl ──► Storage
        ├──────────────► documents/{docId}       fileUrl ──► Storage
        └──────────────► authorizations/{authId} fileUrl ──► Storage

   orders/{orderId} ──userId──► users/{uid}      ⚠ nessun codice crea ordini

   plans/{planId}       (globale, lettura pubblica)
   rateLimits/{key}     (solo Cloud Functions)
   profiles/{id}        LEGACY — orfana, solo admin
```

**Nessuna subcollection.** Tutte le collection sono di primo livello. Nessuna query `collectionGroup` nel codice.

---

## 3. Schema per collection

### 3.1 `users/{uid}` — account applicativo

Sorgente: `src/lib/types/account.ts:38-71`, mapping `src/lib/firebase/account.ts:22-65`.

| Campo | Tipo | Req. | Note |
|---|---|---|---|
| `uid` | string | sì | = doc id (ridondante) |
| `email` | string | sì | **PII** |
| `accountType` | `'private' \| 'company'` | sì | default `'private'` |
| `firstName`, `lastName` | string | sì | **PII** |
| `dateOfBirth` | string ISO `YYYY-MM-DD` | sì | **PII sensibile** |
| `phone` | string | sì | **PII** |
| `address` | `{line1,line2,city,postalCode,country}` | sì | **PII** |
| `companyName`, `companyContactPerson`, `companyVat`, `companyUniqueNumber` | string | sì | stringa vuota se privato |
| `profilePhotoUrl`, `logoUrl`, `bannerUrl` | string | sì | URL Storage → copiati in `dronesPublic` |
| `contactVerification` | `{channels[], emailVerifiedAt, phoneVerifiedAt}` | sì | scritto da `/api/auth/*` |
| `createdAt`, `updatedAt` | string ISO | sì | **stringhe, non Timestamp** |

**Rules** (`firestore.rules:82-97`):
- `read`: owner o admin
- `create`: **`if false`** ← blocca la registrazione self-service (vedi § 7.1)
- `update`: owner, limitato a una allow-list di 14 campi. `contactVerification` **non** è nella allow-list → l'utente non può auto-verificarsi. ✔
- admin: read/write totale

**Chi scrive davvero:** `POST /api/admin/users` (Admin SDK), `POST /api/account/branding`, `/api/auth/contact-verification/*`, `/api/auth/otp/email/verify`, e `ensureAccount()` client-side (che **fallisce**).

---

### 3.2 `pilots/{uid}` — identità pilota

Sorgente: `src/lib/types/entities.ts:20-34`.

| Campo | Tipo | Note |
|---|---|---|
| `userId` | string | = doc id |
| `firstName`, `lastName`, `dateOfBirth`, `nationality` | string | **PII** |
| `email`, `phone`, `address` | string / Address | **PII duplicata da `users`** |
| `operatorCode` | string | codice operatore UAS (es. ENAC) |
| `operatorLicense` | string | numero licenza |
| `emergencyContact` | string | **PII di terzi** |
| `createdAt`, `updatedAt` | string ISO | |

**Rules** (`firestore.rules:100-111`): come `users`. `create: if false`.
**Problema:** `ensurePilot()` (`src/lib/firebase/pilots.ts:88`) fa `setDoc()` client-side → violato dalle rules per utenti nuovi. Solo `/api/admin/users` crea `pilots/{uid}`.

**Duplicazione:** `firstName`, `lastName`, `dateOfBirth`, `email`, `phone`, `address` esistono sia in `users` sia in `pilots`, senza sincronizzazione automatica. Fonte di verità ambigua.

---

### 3.3 `operators/{opId}` — operatore UAS

Sorgente: `src/lib/types/entities.ts:58-70`.

| Campo | Tipo | Note |
|---|---|---|
| `id`, `userId` | string | |
| `kind` | `'private' \| 'company'` | |
| `label` | string | etichetta libera |
| `isDefault` | boolean | un solo default per utente (demote in batch nell'API) |
| `private` | `{firstName,lastName,dateOfBirth,email,phone,address}` | **PII** |
| `company` | `{companyName,contactPerson,vatNumber,uniqueCompanyNumber,email,address}` | **PII aziendale** |
| `createdAt`, `updatedAt` | string ISO | |

**Entrambi** i sotto-oggetti `private` e `company` sono sempre persistiti; solo quello che corrisponde a `kind` è significativo (commento a `entities.ts:64-65`). Denormalizzazione volontaria che raddoppia lo spazio PII.

**Cap:** `MAX_OPERATORS = 3` (`entities.ts`), ribadito in `src/lib/server/quota.ts:10` e `functions/src/util.ts`.

**Rules** (`firestore.rules:117-132`): read owner/admin; `create: if false`; update owner limitato a `kind, label, isDefault, private, company, updatedAt`; delete owner.

---

### 3.4 `drones/{droneId}` — aeromobile

Sorgente: `src/lib/types/entities.ts:78-118`.

| Campo | Tipo | Note |
|---|---|---|
| `id`, `userId` | string | |
| `slug` | string | **chiave pubblica** — base32 Crockford 8 char |
| `status` | `'draft'\|'active'\|'suspended'\|'archived'` | |
| `visibility` | `'private'\|'public'` | |
| `verificationStatus` | `'unverified'\|'pending'\|'verified'\|'rejected'` | **solo admin** |
| `manufacturer`, `model` | string | |
| `classMarking` | `'C0'..'C4'\|'unknown'` | |
| `droneSerialNumber` | string | **pubblico** nello snapshot |
| `controllerSerialNumber` | string | **mai pubblico** |
| `linkedPilotId` | string | → `pilots/{uid}` |
| `defaultOperatorId` | string | → `operators` |
| `activeOperatorId` | string\|null | override temporaneo |
| `activeOperatorUntil` | string ISO \| null | TTL 24h |
| `activeOperatorSetAt/SetBy/Reason` | string | **audit trail** (unico presente) |
| `insuranceId` | string\|null | → `insurances` |
| `createdAt`, `updatedAt`, `publishedAt`, `lastVerifiedAt`, `dataLockedAt` | string ISO | |

**Rules** (`firestore.rules:140-185`) — le più elaborate del file:
- `create: if false`
- `update`: owner, `userId` e `slug` immutabili, `activeOperatorUpdateValid()` clampa la finestra a ≤ 24h+2min e impone `activeOperatorSetBy == request.auth.uid`.
- Due allow-list distinte in base a `droneDataLocked(resource.data)`: prima del lock si possono cambiare i campi identità; dopo il lock **solo** il quartetto active-operator + `updatedAt`.
- `verificationStatus`, `lastVerifiedAt`, `migration`, `userId`, `slug`, `createdAt` **sempre esclusi** → l'owner non può auto-verificarsi. ✔

**Nota su `dataLockedAt`:** `entityDataLocked()` (`firestore.rules:56-61`) considera "locked" anche un documento in cui `updatedAt != createdAt`. Cioè: **al primo salvataggio successivo alla creazione, i campi identità si congelano**, anche senza `dataLockedAt`. L'API `/api/entities/drones` imposta `dataLockedAt` già alla creazione, la Cloud Function `createDrone` **no** — divergenza documentata in `DRONETAG_BACKEND_AUDIT.md`.

---

### 3.5 `dronesPublic/{slug}` — proiezione pubblica ⚠

Sorgente: `src/lib/types/entities.ts` (`DronePublicSnapshot`), proiezione in `src/lib/firebase/dronesPublic.ts:164-209`.

| Campo | Tipo | Esposto anonimamente |
|---|---|---|
| `slug`, `droneId` | string | sì |
| `verificationStatus`, `lastVerifiedAt`, `publishedAt` | string | sì |
| `holderKind` | `'pilot'\|'operator-private'\|'operator-company'` | sì |
| `holderDisplayName` | string | **sì — nome e cognome reale o ragione sociale** |
| `manufacturer`, `model`, `classMarking`, `droneSerialNumber` | string | sì |
| `insuranceStatus`, `insuranceProvider`, `insuranceValidUntil` | string | sì |
| `insuranceMaskedPolicyNumber` | string | sì (mascherato: primi 3 + ultimi 3) |
| **`insurancePdfUrl`** | string | **sì — link diretto al PDF completo della polizza** ⚠ |
| `profilePhotoUrl`, `logoUrl`, `bannerUrl` | string | sì |
| `updatedAt` | string ISO | sì |

**Rules** (`firestore.rules:193-213`):
```
allow read: if true;   ← unica collection pubblicamente leggibile
allow create/update/delete: if isSignedIn() && <writer possiede il drone referenziato>
```

Le rules verificano **l'autorizzazione a scrivere**, non **la correttezza del contenuto**. Il proprietario di un drone può scrivere qualunque valore nello snapshot, incluso `verificationStatus: 'verified'`. Vedi `DRONETAG_SECURITY_AUDIT.md` § SEC-009.

`ownerUserId` è stato correttamente **rimosso** da questo snapshot (commento `entities.ts`), e `submitReport` lo ricava server-side. ✔

**Sanitizzazione mancante in lettura:** `snapshotFromRaw()` (`dronesPublic.ts:64-96`) legge i campi con coercizione di tipo ma non valida `insurancePdfUrl` contro l'allow-list host. Un URL arbitrario scritto nello snapshot verrebbe reso come link nella pagina pubblica.

---

### 3.6 `insurances/{insId}`

Sorgente: `src/lib/types/entities.ts:124-163`.

Campi rilevanti: `link` (`'drone'|'operator'`), `droneId` (**deprecato**, vedi commento riga 133), `operatorId`, `droneIds: string[]`, `provider`, `policyNumber`, `holderName` (**PII**), `issueDate`, `expiryDate`, `notes`, `pdfUrl`, `verificationStatus`, `dataLockedAt`.

**Debito:** coesistono tre modi di legare polizza↔drone: `Insurance.droneId` (deprecato), `Insurance.droneIds[]`, `Drone.insuranceId`. Il codice mantiene `Drone.insuranceId` come reverse-ref (l'API `/api/entities/insurances` aggiorna i drone). Rischio di disallineamento.

**Rules** (`firestore.rules:219-236`): update owner con `!entityDataLocked(resource.data)` — quindi dopo il primo update la polizza **non è più modificabile dall'owner**, nemmeno per correggere un errore. Solo l'admin può intervenire.

---

### 3.7 `certificates/{certId}`

Campi: `kind` (`A1_A3|A2|STS_THEORETICAL|STS_01|STS_02|custom`), `label`, `registrationNumber`, `issuedBy`, `issuedAt`, `expiresAt`, `fileUrl`, `verificationStatus`, `notes`, `dataLockedAt`.

`verificationStatus` dei certificati alimenta `DronePublicSnapshot.verificationStatus` tramite `deriveCertificateVerification()` (`src/lib/utils/entities.ts`).

**Divergenza schema:** l'API `/api/entities/certificates` accetta e scrive `registrationNumber`; la Cloud Function `createCertificate` **no**. Documenti creati dai due path hanno forme diverse.

---

### 3.8 `documents/{docId}`

Campi: `kind` (`insurance_policy|operator_license|drone_registration|training_certificate|**identity**|other`), `label`, `fileUrl`, `fileName`, `fileSize`, `mimeType`, `verificationStatus`, `notes`.

⚠ Il kind `identity` implica **documenti d'identità** (carta d'identità, passaporto) — categoria a rischio elevato. Vedi `DRONETAG_PRIVACY_AUDIT.md`.

**Divergenza:** API con `fileUrl` opzionale, Cloud Function con `fileUrl` obbligatorio.

---

### 3.9 `authorizations/{authId}`

Campi: `kind` (`daily|nullaosta|hourly_nullaosta|temporary|other`), `label`, `issuedBy`, `area`, `validFrom`, `validTo`, `fileUrl`, `fileName`, `fileSize`, `mimeType`, `verificationStatus`, `notes`.

Unica entità **senza** controparte Cloud Function: esiste solo `POST /api/entities/authorizations`.

---

### 3.10 `slots/{uid}` — quote

Sorgente: `src/lib/types/entities.ts` (`Slots`, `BASE_SLOTS`).

```
BASE_SLOTS = { certificate: 1, drone: 1, operator: 1, pdf: 1,
               permit: 3, archive: 0, nfc_badge: 0, personalization: 0 }
```

**Rules** (`firestore.rules:306-309`): read owner + admin; write **solo admin**.

**Tre implementazioni parallele dei default**, che devono restare allineate a mano:
| Sorgente | drone | operator | certificate | pdf | permit |
|---|---|---|---|---|---|
| `BASE_SLOTS` (`entities.ts`) | 1 | 1 | 1 | 1 | 3 |
| `SLOT_DEFAULTS` (`src/lib/server/quota.ts:22-28`) | 1 | 1 | 1 | 1 | 3 |
| `functions/src/util.ts` | (mirror) | | | | |
| `slotsFromRaw()` (`src/lib/firebase/slots.ts:41-42`) | — | — | — | — | fallback **3** e archive **0** hardcoded |

Il doc viene creato dal trigger `bootstrapSlots` (`auth.user().onCreate`) e da `/api/admin/users`. Se manca, `ensureSlots` restituisce `BASE_SLOTS` in memoria senza scrivere.

`nfc_badge` e `personalization` sono slot definiti ma **nessun codice li consuma**: `QuotaSlot` (`quota.ts:12`) copre solo `drone|operator|certificate|pdf|permit`.

---

### 3.11 `plans/{planId}` — listino add-on

Campi: `slotKind`, `priceCents`, `currency` (default `'CHF'`), `active`, `label`, `description`.

**Rules** (`firestore.rules:311-314`): `read: if true` (pubblico), write admin.

⚠ **Doppio sistema di prezzi non collegato:**
- `plans` (Firestore, valuta **CHF**, gestito da `/admin/plans`) → vende *slot* aggiuntivi, mostrato in `PlanSlotsSummary`.
- `src/config/pricing.ts` (statico, valuta **EUR**) → vende *abbonamenti* Free/Pilot/Pilot Pro/Team/Business/Enterprise, mostrato su `/pricing` e `/checkout`.

Non c'è alcun collegamento fra i due. Vedi `DRONETAG_FEATURE_MATRIX.md` § Pricing.

---

### 3.12 `reports/{reportId}` — segnalazione drone ritrovato

Campi scritti da `functions/src/submit-report.ts:103-120`:

| Campo | Origine | PII |
|---|---|---|
| `droneId`, `droneSlug` | client (validati contro il drone) | no |
| `ownerUserId` | **derivato server-side dal drone** ✔ | — |
| `finderName` | client, max 200 char | **sì** |
| `message` | client, max 4000 char | possibile |
| `locationText` | client, max 500 char | possibile |
| `contactEmail` | client, validata | **sì** |
| `location` | client `{lat,lng,accuracy}`, range-checked | **sì (geolocalizzazione)** |
| `read`, `emailNotified`, `pushNotified` | server, `false` | no |
| `createdAt` | server ISO | no |
| `_serverTs` | `FieldValue.serverTimestamp()` | no |
| **`_origin: { ip }`** | server, IP del segnalante | **sì — dato personale** ⚠ |

**Rules** (`firestore.rules:324-335`): `create: if false` (solo Cloud Function via Admin SDK); read owner o admin; update owner **solo** su `read`.

`_origin.ip` non è documentato in nessuna informativa presente in repo e non ha policy di retention. `emailNotified`/`pushNotified` restano `false` per sempre: la fan-out non esiste (`TODO` a `submit-report.ts:122`).

Nota: `_serverTs` è l'**unico** campo Timestamp Firestore dell'intero database. Tutti gli altri timestamp sono stringhe ISO.

---

### 3.13 `rateLimits/{bucket:key}`

Scritto solo da `functions/src/util.ts` (`applyRateLimit`). Bucket usato: `submitReport`, chiave `${droneSlug}:${ip}`, max 3 / 10 min.

**Rules** (`firestore.rules:340-343`):
```
allow read, write: if false;
allow read: if isAdmin();
```
Contiene indirizzi IP nella *chiave del documento* → PII nell'ID. Nessuna scadenza automatica configurata (nessuna TTL policy in `firestore.indexes.json`).

---

### 3.14 `orders/{orderId}` — ordini

Sorgente: `src/lib/types/account.ts:83+`. Schema ricco: `number`, `status` (10 stati), `items[]` con `OrderItemTrace` (serial number, batch, stampante 3D, materiale, operatore assemblaggio, QC), `timeline[]`, `shipping{address,carrier,trackingNumber,trackingUrl,estimatedDelivery}`, `totals{subtotal,shipping,total,currency:'CHF'}`.

**Rules** (`firestore.rules:346-349`): read owner, read/write admin.

⚠ **Nessuna riga di codice crea un ordine.** Verificato: le uniche referenze a `orders` sono `getOrdersForUser` e `getOrderForUser` (`src/lib/firebase/orders.ts:65,78`) — entrambe in sola lettura. Il checkout **non** scrive qui. Gli ordini possono esistere solo se inseriti manualmente dalla console Firebase.

---

### 3.15 `signupOtp/{uid}`

Scritto solo da `src/lib/server/otp.ts:31-38` (Admin SDK).

Campi: `channel: 'email'`, `email` (**PII**), `codeHash` (SHA-256 del codice a 6 cifre), `expiresAt` (epoch ms, TTL 10 min), `lastSentAt` (cooldown 60 s), `attempts` (max 5).

**Rules** (`firestore.rules:352-354`): `allow read, write: if false` — corretto, server-only. ✔

Il documento viene cancellato al primo verify riuscito (`otp.ts:74`). Se l'utente **non** completa la verifica, il documento **resta per sempre** con l'email in chiaro: nessuna TTL policy Firestore configurata.

---

### 3.16 `profiles/{id}` — LEGACY

Modello mono-profilo pre-migrazione. Tipi in `src/lib/types/index.ts` (`Profile`), accesso in `src/lib/firebase/firestore.ts`.

**Rules** (`firestore.rules:77-79`): `allow read, write: if isAdmin()` — chiuso agli anonimi. ✔

**Stato:** codice morto. `src/lib/firebase/firestore.ts` è importato solo da `src/components/profile/ProfileForm.tsx` e `src/lib/seed.ts`, **entrambi non referenziati da nessuna pagina** (verificato). La rotta `/admin/profiles` è redirezionata a `/admin/users` (`next.config.ts:197-207`).

Restano però attivi: 4 riferimenti in `firestore.indexes.json` e `storage.rules:66-71` (namespace `profiles/**` con `read: if true`).

`scripts/migrate-profiles-to-entities.ts` (14 KB) esiste per la migrazione. **UNKNOWN**: se sia già stato eseguito e se esistano ancora documenti `profiles` reali.

---

## 4. Indici Firestore (`firestore.indexes.json`)

11 indici compositi, `fieldOverrides: []`.

| Collection | Campi | Usato da |
|---|---|---|
| `profiles` | slug, visibility, status | **legacy — non più usato** |
| `drones` | slug, visibility, status | **legacy** (il pubblico ora usa `dronesPublic`) |
| `drones` | userId, updatedAt DESC | `listDronesByUser` |
| `drones` | status, visibility | `/admin/nfc` |
| `operators` | userId, createdAt ASC | `listOperators` |
| `insurances` | userId, updatedAt DESC | `listInsurances` |
| `certificates` | userId, createdAt ASC | `listCertificates` |
| `documents` | userId, updatedAt DESC | `listDocuments` |
| `documents` | userId, kind | filtro |
| `reports` | ownerUserId, createdAt DESC | inbox |
| `reports` | droneId, createdAt DESC | `listReportsForDrone` |

**Mancanti:** nessun indice per `authorizations` (query `where('userId','==',...)` + ordinamento), né per `dronesPublic`, `slots`, `plans`, `orders`. Le query semplici a campo singolo usano gli indici automatici, quindi non è bloccante, ma `listReportsForOwner` (`src/lib/firebase/reports.ts:60-65`) fa `where` **senza** `orderBy` e ordina in JavaScript — l'indice `reports(ownerUserId, createdAt DESC)` è quindi inutilizzato.

**Nessuna TTL policy** configurata per `signupOtp` o `rateLimits`.

---

## 5. Firebase Storage

### Layout dei path (FACT)

| Path | Scritto da |
|---|---|
| `users/{uid}/profiles/account/{photo\|logo\|banner}.{ext}` | `POST /api/account/branding` (Admin SDK) |
| `users/{uid}/certificates/{id}/certificate.pdf` | `POST /api/entities/certificates/[id]/pdf` |
| `users/{uid}/insurances/{id}/policy.pdf` | `POST /api/entities/insurances/[id]/pdf` |
| `users/{uid}/documents/{id}/file.{ext}` | `POST /api/entities/documents/[id]/file` |
| `users/{uid}/authorizations/{id}/file.{ext}` | `POST /api/entities/authorizations/[id]/file` |
| `users/{uid}/profiles/{profileId}/...` | `src/lib/firebase/storage.ts` (legacy, client SDK) |
| `profiles/{...}` | **legacy**, solo admin |

### Rules (`storage.rules`)

```
match /users/{uid}/{allPaths=**} {
  allow read: if true;                     ← ⚠ LETTURA PUBBLICA
  allow write: if isSignedIn() && request.auth.uid == uid
                  && isAllowedContentType() && isWithinSizeLimit();
  allow write: if isAdmin() && ...;
  allow delete: if isSignedIn() && request.auth.uid == uid;
  allow delete: if isAdmin();
}
match /profiles/{path=**} {
  allow read: if true;
  allow write, delete: if isAdmin();
}
match /{path=**} { allow read, write: if false; }
```

- Content-type allow-list: `application/pdf|image/png|image/jpeg|image/webp`. **SVG escluso** ✔
- Size cap: **20 MB** server-side; il client limita a 5 MB per immagini e 20 MB per PDF (`src/lib/firebase/storage.ts:34-35`).
- `allow read: if true` è una scelta **deliberata e documentata** (`storage.rules:14-19`): serve a far caricare PDF e immagini sulla pagina pubblica senza autenticazione.

**Conseguenza:** ogni file caricato da ogni utente — inclusi documenti d'identità sotto `documents/kind='identity'` — è leggibile da chiunque conosca il path. Il path è deterministico: `users/{uid}/documents/{docId}/file.pdf`. Il `docId` è un auto-id Firestore (20 char) e l'`uid` è un uid Firebase (28 char), quindi non sono banalmente indovinabili, ma **la sicurezza dipende dall'oscurità del path, non da un controllo di accesso**. Vedi `DRONETAG_SECURITY_AUDIT.md` § SEC-006 e `DRONETAG_PRIVACY_AUDIT.md`.

**Nessuna verifica di estensione oltre il content-type**, nessun controllo di sovrascrittura: un path fisso come `certificate.pdf` viene sovrascritto senza versioning.

---

## 6. Support: schema definito ma nessuna persistenza

`src/lib/types/entities.ts` definisce completamente `SupportThread` e `SupportMessage`.
`src/lib/firebase/support.ts` **non contiene alcuna chiamata Firestore**:

```ts
export async function getSupportThread(userId) {
  if (DEMO_MODE) return demo.getSupportThread(userId);
  return null;                                   // live → sempre null
}
export async function ensureSupportThread(userId, subject = '') {
  if (DEMO_MODE) return demo.ensureSupportThread(userId, subject);
  throw new Error('support_unavailable');        // live → eccezione
}
```

Non esistono collection `supportThreads`/`supportMessages` nelle rules → sarebbero comunque negate dal catch-all.

Impatto a catena: `/admin/verify` chiama `ensureSupportThread` + `sendSupportMessage` per notificare l'utente dell'esito della verifica → **in produzione lancia un'eccezione**.

---

## 7. Problemi strutturali del modello dati

### 7.1 Le rules bloccano la creazione self-service (P0)

`users/{uid}` e `pilots/{uid}` hanno `allow create: if false`, ma il client tenta comunque di crearli:

| Funzione | File:riga | Operazione | Esito atteso in live |
|---|---|---|---|
| `ensureAccount()` | `src/lib/firebase/account.ts:120` | `setDoc(users/{uid})` | `permission-denied` |
| `ensurePilot()` | `src/lib/firebase/pilots.ts:88` | `setDoc(pilots/{uid})` | `permission-denied` |

`ensureAccount` è chiamata da `src/app/signup/page.tsx:99` subito dopo `signupWithEmail`. `ALLOW_PUBLIC_SIGNUP` è `true` per default (`src/lib/config/features.ts:5`).

**Effetto:** l'utente viene creato in Firebase Auth ma non ha un documento `users/{uid}`; `AccountProvisionGate` (`src/components/account/AccountProvisionGate.tsx:59`) mostra "account non provisionato" con solo il pulsante logout. **Registrazione pubblica non funzionante.** Non esiste una route API di provisioning self-service (esiste solo `/api/admin/users`, admin-only).

### 7.2 Timestamp non tipizzati

Tutti i campi data sono **stringhe ISO**, non `Timestamp` Firestore. Unica eccezione: `reports._serverTs`.
Conseguenze: nessun ordinamento server-side affidabile su fusi orari misti; `updatedAt` è generato dal **client** (`new Date().toISOString()`) in tutte le `update*` di `src/lib/firebase/*.ts` → **manipolabile e non affidabile per audit**. Le rules stesse si basano su `updatedAt != createdAt` per il data-lock (`firestore.rules:56-61`), quindi un client può ritardare il lock non toccando `updatedAt`.

### 7.3 Campi ridondanti con il doc id
`users.uid`, `pilots.userId`, `operators.id`, `drones.id`, `slots.userId` duplicano il doc id.

### 7.4 Record orfani possibili
Non esiste cascading delete. Cancellare un drone lascia: `insurances.droneIds` con id morti, `reports.droneId` orfani, file in Storage. Cancellare un utente (funzione peraltro **inesistente**) lascerebbe tutto. Vedi `DRONETAG_PRIVACY_AUDIT.md`.

`deleteDrone` chiama `deleteDronePublicBySlug` (buono), ma non pulisce reports né Storage.

### 7.5 Naming e convenzioni incoerenti
- `documents` usa il tipo `DocumentRef` (per non collidere con il DOM `Document`).
- `pdf` come `SlotKind` mappa sulla collection `documents`; `permit` mappa su `authorizations` (`quota.ts:14-20`).
- `users` vs `pilots` vs `operators` — tre entità sovrapposte per la stessa persona fisica.
- `plans` in CHF vs `config/pricing.ts` in EUR.

### 7.6 Campi legacy da non toccare senza analisi
`Insurance.droneId` (deprecato ma letto), `drones.migration` (citato nelle rules, assente dai tipi), collection `profiles`, indici `profiles`/`drones(slug,visibility,status)`.

---

## 8. Chi può leggere/scrivere cosa — matrice sintetica

| Collection | Anonimo | Utente (owner) | Utente (altro) | Admin | Admin SDK (API/Functions) |
|---|---|---|---|---|---|
| `users` | — | R, U(14 campi) | — | RW | RW |
| `pilots` | — | R, U(10 campi) | — | RW | RW |
| `operators` | — | R, U(6), D | — | RW | RW |
| `drones` | — | R, U(vincolata), D | — | RW | RW |
| `dronesPublic` | **R** | RW/D (se possiede) | — | RW | RW |
| `insurances` | — | R, U(pre-lock), D | — | RW | RW |
| `certificates` | — | R, U(pre-lock), D | — | RW | RW |
| `documents` | — | R, U(7 campi), D | — | RW | RW |
| `authorizations` | — | R, U(9 campi), D | — | RW | RW |
| `slots` | — | R | — | RW | RW |
| `plans` | **R** | R | R | RW | RW |
| `reports` | — | R(propri), U(`read`) | — | RW | RW |
| `rateLimits` | — | — | — | R | RW |
| `orders` | — | R(propri) | — | RW | RW |
| `signupOtp` | — | — | — | — | RW |
| `profiles` | — | — | — | RW | RW |
| **Storage `users/**`** | **R** | W/D (propri) | **R** | RW | RW |

Legenda: R=read, U=update, W=write, D=delete.

**Valutazione complessiva delle rules:** sono scritte con cura, con default-deny finale, allow-list per campo e blocco dell'auto-verifica. I due punti deboli sono `dronesPublic` (contenuto non validato) e Storage (`read: if true`).
