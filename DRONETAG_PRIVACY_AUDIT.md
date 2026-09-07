# DRONETAG — PRIVACY / GDPR / DATA GOVERNANCE AUDIT

> **Questo documento NON è una consulenza legale.** È un audit tecnico orientato alla privacy,
> basato esclusivamente sulla lettura del codice al commit `b72f843`. Ogni valutazione di
> conformità normativa deve essere validata da un consulente legale o da un DPO.
>
> Audit read-only: nessun dato personale è stato letto, esportato o modificato. Nessun accesso
> al database reale è stato effettuato.

---

## 1. Sintesi esecutiva

DroneTag tratta **dati personali di categoria ordinaria in volume significativo** (identità,
contatti, indirizzi, data di nascita, documenti d'identità, dati assicurativi) e li espone in
parte su un **canale pubblico non autenticato** (`/u/{slug}`, raggiungibile tramite badge NFC).

Il codice mostra un'attenzione **esplicita e non banale** alla minimizzazione dei dati: esiste
un livello di proiezione pubblica dedicato (`src/lib/utils/publicProjection.ts`) con commenti
che elencano puntualmente i campi ammessi e quelli esclusi, il numero di polizza è mascherato,
e `ownerUserId` è stato deliberatamente rimosso dallo snapshot pubblico.

Tuttavia mancano **quasi tutti gli strumenti operativi** richiesti dal GDPR:

| Requisito | Stato |
|---|---|
| Informativa privacy | ❌ **assente** |
| Termini di servizio | ❌ **assente** |
| Cookie policy / banner | ❌ **assente** |
| Raccolta del consenso | ❌ **assente** |
| Cancellazione account (art. 17) | ❌ **non implementata** |
| Export / portabilità (art. 20) | ❌ **non implementata** |
| Rettifica (art. 16) | ⚠️ **impedita dalla UI** |
| Retention policy | ❌ **assente** |
| Audit trail degli accessi | ❌ **assente** |
| Registro dei trattamenti | ❌ assente dal repo |
| DPA con i responsabili | ❌ assente dal repo (Google, Netlify, Resend) |
| Minimizzazione | ⚠️ **parziale** — buona in progettazione, con due eccezioni gravi |

**Conclusione tecnica:** la piattaforma **non è pronta** per trattare dati personali di utenti
reali in produzione nell'UE senza interventi. I due problemi tecnici più seri sono
l'esposizione pubblica del PDF di polizza e la lettura pubblica su Firebase Storage.

---

## 2. Inventario dei dati personali trattati

### 2.1 Dati identificativi diretti

| Dato | Dove | Categoria | Esposto pubblicamente |
|---|---|---|---|
| Email | `users.email`, `pilots.email`, `operators.private.email`, `operators.company.email`, `reports.contactEmail`, `signupOtp.email`, Firebase Auth | Ordinaria | No |
| Nome e cognome | `users.firstName/lastName`, `pilots.*`, `operators.private.*`, `insurances.holderName`, `reports.finderName` | Ordinaria | **SÌ** — `dronesPublic.holderDisplayName` |
| Data di nascita | `users.dateOfBirth`, `pilots.dateOfBirth`, `operators.private.dateOfBirth` | Ordinaria (sensibile in pratica) | No |
| Nazionalità | `pilots.nationality` | Ordinaria | No |
| Telefono | `users.phone`, `pilots.phone`, `operators.private.phone`, Firebase Auth | Ordinaria | No |
| Indirizzo di residenza | `users.address`, `pilots.address`, `operators.*.address` | Ordinaria | No |
| Contatto di emergenza | `pilots.emergencyContact` | **Dato di terzi** | No |
| Fotografia personale | `users.profilePhotoUrl` → Storage | **Dato biometrico-adiacente** | **SÌ** — `dronesPublic.profilePhotoUrl` |

### 2.2 Documenti e identificativi ufficiali

| Dato | Dove | Rischio |
|---|---|---|
| **Documento d'identità** | `documents` con `kind: 'identity'` → Storage | **MOLTO ALTO** |
| Attestato/certificato di pilotaggio (PDF) | `certificates.fileUrl` → Storage | Alto |
| Numero registrazione operatore UAS | `certificates.registrationNumber`, `pilots.operatorCode`, `pilots.operatorLicense` | Medio |
| Polizza assicurativa (PDF integrale) | `insurances.pdfUrl` → Storage | **MOLTO ALTO** — **pubblico** |
| Numero di polizza | `insurances.policyNumber` | Alto (mascherato nel pubblico) |
| Autorizzazioni/permessi (PDF) | `authorizations.fileUrl` → Storage | Medio |
| Testo estratto dai PDF via OCR | elaborato client-side, campi salvati in Firestore | Medio |

### 2.3 Dati aziendali

`users.companyName`, `companyVat`, `companyUniqueNumber`, `companyContactPerson`;
`operators.company.*`. La P.IVA di una ditta individuale è un dato personale.
**Non** esposti pubblicamente (correttamente esclusi da `publicProjection.ts:96-100`).

### 2.4 Identificativi dei droni

`drones.droneSerialNumber` (**pubblico**), `controllerSerialNumber` (privato, correttamente
escluso), `slug` (pubblico per progettazione). Il seriale di un drone, associato a un nome,
consente il tracciamento di una persona fisica.

### 2.5 Dati di terzi (segnalatori)

Il flusso "drone ritrovato" raccoglie dati di persone che **non sono utenti** della piattaforma:

| Campo | Origine | Note |
|---|---|---|
| `reports.finderName` | volontario | |
| `reports.contactEmail` | volontario | |
| `reports.locationText` | volontario | |
| `reports.location {lat,lng,accuracy}` | **geolocalizzazione GPS** | Dato personale ai sensi GDPR |
| **`reports._origin.ip`** | **raccolto silenziosamente** | `functions/src/submit-report.ts:119` |

L'IP **non è dichiarato** all'utente. L'unico testo informativo è la chiave i18n
`reportFound.privacy` ("i tuoi dati vengono inviati solo al proprietario del drone"), che è
**incompleta**: i dati vanno anche agli amministratori della piattaforma (`/admin/reports`
legge tutti i report) e l'IP viene registrato.

### 2.6 Log e telemetria

| Fonte | Contenuto | Valutazione |
|---|---|---|
| `console.*` (51 occorrenze in `src/`) | messaggi di errore; alcuni includono uid/slug (es. `dronesPublic.ts:249`, `272`) | Finiscono nei log Netlify. Rischio basso ma non nullo. |
| `firebase-functions/logger` | `submitReport` logga `{droneSlug, ownerUserId, reportId}` | Contiene un identificativo utente. |
| `src/lib/analytics/index.ts` | allow-list di 7 eventi, sanitizzazione PII attiva (`PII_KEYS`), troncamento stringhe >200 char | **Ben progettato**. Nessun vendor collegato: in produzione non invia nulla. |
| Log Google Cloud / Firebase | IP, user agent, richieste | Gestiti da Google. Retention configurabile in Console. **UNKNOWN**. |
| Log Netlify | IP, richieste | **UNKNOWN**. |
| `rateLimits/{slug}:{ip}` | **IP nell'ID del documento** | Nessuna scadenza. |

**Nessun cookie di tracciamento, nessun pixel, nessun tag manager, nessun servizio di analytics
di terze parti è presente nel codice.** Questo è un punto a favore. I cookie usati
(`__dronetag_idt`, `__dronetag_session`, `dronetag-theme`, `dronetag-language`) sono tecnici.

---

## 3. Separazione pubblico / privato

### 3.1 Il livello di proiezione — valutazione positiva

`src/lib/utils/publicProjection.ts` è progettato correttamente:
- l'interfaccia `PublicDroneCard` (righe 149-193) è **il contratto**: TypeScript impedisce di
  aggiungere campi non dichiarati;
- i commenti elencano esplicitamente i campi `adminOnlyFields` esclusi (DOB, telefono,
  indirizzo, P.IVA, note interne, seriale radiocomando);
- `maskPolicyNumber()` maschera i caratteri centrali;
- `DronePublicSnapshot` ha rimosso `ownerUserId` (commento in `entities.ts`).

L'architettura "snapshot denormalizzato scritto al momento della modifica" è inoltre una
buona scelta di privacy: la collection pubblica contiene **solo** il payload minimizzato,
quindi non c'è rischio di over-fetch accidentale.

### 3.2 Le due eccezioni che annullano il lavoro fatto

**(a) `insurancePdfUrl` nello snapshot pubblico.**
`src/lib/firebase/dronesPublic.ts:203` include sempre `insurance?.pdfUrl` nello snapshot, che
è leggibile anonimamente (`firestore.rules:194`). Il PDF integrale contiene tipicamente nome,
cognome, indirizzo di residenza del contraente e numero di polizza in chiaro — **vanificando
il mascheramento** applicato tre righe sopra.

`publicProjection.ts` prevede l'opzione `exposePdfUrl` (default `true`), ma `projectSnapshot()`
non la utilizza.

**(b) Firebase Storage con lettura pubblica.**
`storage.rules:49`: `allow read: if true` su `users/{uid}/{allPaths=**}`. Ogni file — inclusi
i documenti d'identità caricati con `kind: 'identity'` — è scaricabile senza autenticazione
da chiunque conosca il path. La scelta è documentata (`storage.rules:14-19`) ma la protezione
si riduce all'imprevedibilità del path.

### 3.3 Cosa il pubblico vede realmente su `/u/{slug}`

| Campo | Valutazione di minimizzazione |
|---|---|
| `holderDisplayName` | **Nome e cognome reali** o ragione sociale. Necessario allo scopo (verifica dell'operatore). Proporzionato. |
| `profilePhotoUrl`, `logoUrl`, `bannerUrl` | Fotografia personale pubblica. Proporzionata **solo se l'utente ne è consapevole** — oggi non c'è alcun consenso esplicito. |
| `manufacturer`, `model`, `classMarking`, `droneSerialNumber` | Dati tecnici. Proporzionati. |
| `insuranceStatus`, `insuranceProvider`, `insuranceValidUntil` | Proporzionati allo scopo. |
| `insuranceMaskedPolicyNumber` | Buona minimizzazione. |
| **`insurancePdfUrl`** | ❌ **Sproporzionato.** |
| `verificationStatus`, `lastVerifiedAt`, `publishedAt` | Proporzionati. |

**Assente:** un controllo di privacy granulare. L'unico interruttore è `Drone.visibility`
(`private`/`public`) per singolo drone: tutto o niente. L'utente non può scegliere di
pubblicare lo stato assicurativo ma non la foto, o il nome ma non il seriale.

---

## 4. Diritti dell'interessato — fattibilità tecnica

### 4.1 Diritto di accesso (art. 15) — ❌ non implementato
Nessun endpoint di export. Un utente può vedere i propri dati solo navigando la dashboard.
Un admin può leggerli da `/admin/users/[uid]`. **Fattibilità:** media — i dati sono tutti
indicizzati per `userId`, quindi una funzione di export è realizzabile senza difficoltà.

### 4.2 Diritto di rettifica (art. 16) — ⚠️ tecnicamente ostacolato
Due meccanismi lo impediscono:
1. **La UI del profilo è in sola lettura sui dati identità.** `/account/profile` gestisce solo
   foto/logo/banner; i campi anagrafici mostrano un hint che rimanda a `/account/support`.
2. **Il data-lock.** `entityDataLocked()` (`firestore.rules:56-61`) congela i campi identità di
   droni, certificati e polizze dopo il primo aggiornamento.

Il canale indicato per la rettifica — il support — **non funziona in produzione**
(`src/lib/firebase/support.ts:36` lancia `support_unavailable`). Quindi allo stato attuale
**un utente non ha alcun modo di far correggere i propri dati**, se non contattare
`info@drone-tag.com` (indirizzo presente nel footer).

Le rules `users` permettono in realtà l'update di 14 campi anagrafici
(`firestore.rules:89-95`): il blocco è **solo nella UI**, non nel modello di autorizzazione.

### 4.3 Diritto alla cancellazione (art. 17) — ❌ non implementato
Non esiste alcuna funzione di cancellazione account: nessun `deleteUser` nel codice, nessun
pulsante, nessun endpoint, nessun trigger `auth.user().onDelete`.

Se si volesse cancellare un utente manualmente, oggi occorrerebbe:

| Passo | Difficoltà |
|---|---|
| Firebase Auth user | facile (Console) |
| `users/{uid}`, `pilots/{uid}`, `slots/{uid}`, `signupOtp/{uid}` | facile (doc id = uid) |
| `operators`, `drones`, `certificates`, `documents`, `insurances`, `authorizations` where `userId == uid` | media (6 query) |
| `dronesPublic/{slug}` per ogni drone | media — **rischio di orfani**: se il drone è già cancellato, lo slug è perso |
| `reports` where `ownerUserId == uid` | media — ma contengono dati di **terzi** (segnalatori): la cancellazione dell'utente non estingue automaticamente quei dati |
| `orders` where `userId == uid` | facile |
| File in Storage sotto `users/{uid}/**` | media — **nessuna cancellazione ricorsiva implementata** |
| `rateLimits` | non collegati all'uid |
| Log Google Cloud / Netlify | fuori controllo applicativo |

**Nessuna cancellazione a cascata esiste.** Anche le cancellazioni parziali già disponibili
(es. `deleteCertificate`) **non rimuovono il file da Storage**, che resta pubblicamente
leggibile per sempre.

**Valutazione: il diritto alla cancellazione non è tecnicamente esercitabile in modo affidabile.**

### 4.4 Diritto alla portabilità (art. 20) — ❌ non implementato

### 4.5 Diritto di opposizione / limitazione — ❌ non implementato
L'unico controllo è rendere privato un drone (`visibility: 'private'`), che cancella lo
snapshot pubblico. È un buon meccanismo, ma non copre gli altri trattamenti.

---

## 5. Consenso e basi giuridiche

**Nessun meccanismo di consenso esiste nel codice.**

| Elemento | Stato | Evidenza |
|---|---|---|
| Checkbox privacy alla registrazione | ❌ assente | `src/app/signup/page.tsx` non ha alcun campo di consenso |
| Checkbox termini alla registrazione | ❌ assente | idem |
| Accettazione termini al checkout | ⚠️ presente ma vuota | `termsAccepted` validato in `api/pricing/checkout/route.ts`, chiave i18n `pricing.checkout.terms` — **ma non esiste alcuna pagina di termini da accettare** |
| Consenso alla pubblicazione dei dati sul profilo pubblico | ❌ assente | Nessun avviso prima di impostare `visibility: 'public'` |
| Consenso alla geolocalizzazione (found-drone) | ⚠️ implicito | Prompt del browser; nessuna informativa applicativa |
| Informativa al segnalante | ⚠️ parziale e inesatta | `reportFound.privacy` non menziona né gli admin né l'IP |
| Cookie banner | ❌ assente | Non necessario per soli cookie tecnici, ma **da confermare legalmente** |
| Doppio opt-in email | ⚠️ | L'OTP verifica il possesso della casella, non è un consenso marketing (peraltro non c'è marketing) |

**Punto positivo:** non essendoci alcun tracciamento di terze parti, il perimetro dei cookie
è limitato a quelli tecnici. Questo semplifica notevolmente la conformità.

---

## 6. Conservazione e cancellazione (retention)

**Nessuna policy di retention esiste.** Nessun TTL è configurato: `firestore.indexes.json`
ha `"fieldOverrides": []` e non esiste alcuna TTL policy.

| Dato | Retention attuale | Problema |
|---|---|---|
| `signupOtp/{uid}` | **indefinita** se il verify non viene completato | Contiene l'email in chiaro. Ha già un campo `expiresAt`: **basterebbe attivare una TTL policy Firestore su quel campo.** Intervento a costo quasi nullo. |
| `rateLimits/{slug}:{ip}` | **indefinita** | IP nell'ID del documento |
| `reports` (incl. IP e email del segnalante) | **indefinita** | Dati di terzi conservati senza limite |
| Certificati/polizze scaduti | indefinita | Vanno in `/account/archive`, cancellabili manualmente dall'utente ✔ |
| File in Storage | **indefinita**, anche dopo la cancellazione del record Firestore | File orfani permanenti e pubblicamente leggibili |
| Account inattivi | indefinita | |
| Log | dipende da Google/Netlify | **UNKNOWN** |

---

## 7. Sicurezza dei dati personali (art. 32)

### Misure presenti ✔
- Cifratura in transito (HTTPS forzato, HSTS con preload).
- Cifratura a riposo (predefinita di Google Cloud).
- Controllo accessi granulare via Firestore rules con allow-list per campo.
- Isolamento per `userId` verificato su ogni endpoint.
- OTP conservato come hash SHA-256, mai in chiaro.
- Password gestite interamente da Firebase Auth (mai toccate dal codice applicativo).
- Security header completi.
- Livello di proiezione pubblica dedicato.
- Allow-list di content-type e limiti dimensionali sugli upload; SVG escluso.

### Misure assenti ❌
- Audit trail degli accessi ai dati personali (chi ha visto cosa).
- Log delle azioni amministrative.
- Cifratura applicativa dei campi più sensibili.
- Pseudonimizzazione.
- Backup verificati e procedura di ripristino documentata (**UNKNOWN**).
- Separazione fra ambiente di sviluppo e produzione: `.firebaserc` contiene **un solo progetto**
  (`dronetag-e905d`). Se sviluppo e produzione condividono lo stesso progetto, i dati personali
  reali sono accessibili dall'ambiente di sviluppo — **problema di compliance rilevante**.
- Data breach detection.
- Verifica formale dei sub-responsabili.

---

## 8. Trasferimenti extra-UE

| Servizio | Ruolo | Localizzazione | Note |
|---|---|---|---|
| Google Firebase (Auth, Firestore, Storage) | Responsabile | **UNKNOWN** — la regione Firestore non è determinabile dal repo | Da verificare in Console: se `us-central1` o multi-region USA, c'è trasferimento extra-UE |
| Google Cloud Functions | Responsabile | **`us-central1` — STATI UNITI** (`functions/src/index.ts:30`) | **Trasferimento extra-UE confermato dal codice.** `submitReport` elabora IP, email e geolocalizzazione dei segnalanti negli USA |
| Netlify | Responsabile (hosting) | USA, CDN globale | Da verificare |
| Resend | Responsabile (email) | USA | Riceve gli indirizzi email in fase di registrazione |
| Google reCAPTCHA / App Check | Responsabile | USA | Solo se configurato |
| Coverdrone | Terza parte | UE | Solo link in uscita, nessun dato trasmesso dal codice |

**Richiede validazione legale:** DPA con ciascun fornitore, valutazione delle Clausole
Contrattuali Standard, eventuale Transfer Impact Assessment. La regione `us-central1` delle
Cloud Functions è una scelta tecnica che ha conseguenze giuridiche dirette: **valutare la
migrazione a `europe-west1`/`europe-west3`.**

---

## 9. Findings privacy

| ID | Titolo | Severità | File | Remediation |
|---|---|---|---|---|
| PRV-001 | PDF integrale della polizza pubblicato sul profilo anonimo | **CRITICAL** | `src/lib/firebase/dronesPublic.ts:203` | Rimuovere `insurancePdfUrl` dallo snapshot |
| PRV-002 | Storage con `read: if true`: documenti d'identità pubblicamente scaricabili | **CRITICAL** | `storage.rules:49` | Separare namespace pubblico/privato; servire via `/api/files/proxy` |
| PRV-003 | Cancellazione account non implementata | **HIGH** | assente | Endpoint + cascading delete + trigger `onDelete` |
| PRV-004 | Nessuna informativa privacy, ToS o cookie policy | **HIGH** | `src/components/landing/PublicFooter.tsx:34-41` (link a `mailto:`) | Pubblicare le pagine legali |
| PRV-005 | Nessuna raccolta di consenso alla registrazione | **HIGH** | `src/app/signup/page.tsx` | Aggiungere consensi tracciati con timestamp e versione |
| PRV-006 | Rettifica dei dati impossibile (UI read-only + support non funzionante) | **HIGH** | `src/app/account/profile/page.tsx`, `src/lib/firebase/support.ts:36` | Riabilitare la modifica o rendere operativo il support |
| PRV-007 | IP del segnalante registrato senza informativa né retention | **HIGH** | `functions/src/submit-report.ts:119` | Dichiararlo, limitarne la conservazione, valutare l'hashing |
| PRV-008 | Nessuna policy di retention; nessun TTL configurato | **HIGH** | `firestore.indexes.json` | TTL su `signupOtp.expiresAt` e `rateLimits` (intervento minimo, alto beneficio) |
| PRV-009 | Nessun audit trail degli accessi admin ai dati personali | **HIGH** | tutto il progetto | Collection `auditLog` immutabile |
| PRV-010 | Cloud Functions in `us-central1`: trasferimento extra-UE | **MEDIUM** | `functions/src/index.ts:30` | Valutare la migrazione in regione UE |
| PRV-011 | Possibile ambiente unico dev/prod | **MEDIUM** | `.firebaserc` | Creare un progetto Firebase separato per lo sviluppo |
| PRV-012 | File orfani in Storage dopo la cancellazione del record | **MEDIUM** | tutte le `delete*` in `src/lib/firebase/*.ts` | Cancellazione transazionale |
| PRV-013 | Export dati / portabilità non implementati | **MEDIUM** | assente | Endpoint di export JSON+file |
| PRV-014 | Nessun controllo granulare di privacy sul profilo pubblico | **MEDIUM** | `src/lib/types/entities.ts` | Preferenze per campo |
| PRV-015 | Duplicazione di PII fra `users`, `pilots` e `operators` senza sincronizzazione | **MEDIUM** | data model | Definire una fonte di verità |
| PRV-016 | Informativa al segnalante incompleta (non menziona admin né IP) | **MEDIUM** | chiave i18n `reportFound.privacy` | Aggiornare il testo |
| PRV-017 | `pilots.emergencyContact`: dato di terzi raccolto senza base né informativa | **MEDIUM** | `src/lib/types/entities.ts:31` | Valutare la necessità del campo |
| PRV-018 | `dateOfBirth` raccolta in tre punti; necessità non evidente | **LOW** | `users`, `pilots`, `operators.private` | Verificare la minimizzazione |
| PRV-019 | Log applicativi con uid/slug | **LOW** | `src/lib/firebase/dronesPublic.ts:249,272` | Rivedere i log in produzione |
| PRV-020 | Profili pubblici indicizzabili (nessun `noindex`, nessun `robots.txt`) | **LOW** | assente | Decisione di prodotto |
| PRV-021 | Nessun registro dei trattamenti né DPA nel repository | **INFO** | — | Attività documentale, non tecnica |

---

## 10. Punti di forza da preservare

Da non perdere durante il refactoring:

1. **`src/lib/utils/publicProjection.ts`** — il pattern "interfaccia come contratto" con
   commenti `adminOnlyFields` è eccellente. Va esteso, non rimosso.
2. **`maskPolicyNumber()`** — mascheramento corretto.
3. **Rimozione di `ownerUserId` dallo snapshot pubblico** e derivazione server-side in
   `submitReport` — pattern esemplare.
4. **`src/lib/analytics/index.ts`** — allow-list di eventi e sanitizzazione PII prima
   ancora di avere un vendor. Approccio "privacy by design" corretto.
5. **Assenza totale di tracker di terze parti.**
6. **Allow-list per campo nelle Firestore rules** — impedisce l'escalation e limita la
   superficie di scrittura.
7. **Esclusione deliberata di SVG** dagli upload.
8. **Password mai gestite dal codice applicativo.**

---

## 11. Da validare con un consulente legale / DPO

1. Base giuridica per la pubblicazione di nome e fotografia su una pagina pubblica indicizzabile.
2. Se la pubblicazione del PDF di polizza sia ammissibile con consenso esplicito, o comunque
   sproporzionata rispetto alla finalità.
3. Qualificazione dei ruoli: DroneTag titolare o responsabile rispetto ai dati dei segnalanti?
4. Base giuridica per la raccolta dell'IP nel flusso found-drone (interesse legittimo
   anti-abuso?) e periodo di conservazione ammissibile.
5. Periodi di conservazione per ciascuna categoria di dati.
6. Necessità di una DPIA: il trattamento comprende documenti d'identità, geolocalizzazione e
   pubblicazione su canale pubblico — **probabile che sia richiesta**.
7. DPA con Google, Netlify e Resend; valutazione dei trasferimenti extra-UE.
8. Gestione dei dati di minori (nessun controllo dell'età è presente; `dateOfBirth` è raccolta
   ma non validata contro un'età minima).
9. Obblighi settoriali specifici del comparto UAS (ENAC / EASA) in materia di conservazione
   dei dati di registrazione operatore.
10. Contenuto e forma dell'informativa e dei termini da pubblicare.
