# DRONETAG — SECURITY AUDIT

> Audit statico read-only del codice sorgente, commit `b72f843` (2026-09-07).
> Nessuna modifica, nessun test di penetrazione, nessuna interazione con l'ambiente reale.
>
> **Nessun valore di segreto è riportato in questo documento.** Dove è stato trovato un
> segreto, sono indicati file, tipo e impatto, con il valore oscurato.
>
> **Limiti di questo audit:**
> - Non è stato verificato se `firestore.rules` / `storage.rules` presenti in repo siano
>   effettivamente deployate. Tutte le valutazioni assumono che lo siano. Se non lo fossero,
>   la severità di quasi ogni finding aumenta.
> - Non è stata eseguita alcuna analisi dinamica né scansione di vulnerabilità delle
>   dipendenze contro un database CVE (`npm audit` non è stato eseguito per non modificare
>   lo stato del progetto). La sezione dipendenze è quindi limitata a osservazioni statiche.
> - Non è stato possibile verificare la configurazione lato Firebase Console (App Check,
>   quote, backup) né le variabili d'ambiente reali su Netlify.

---

## Sintesi

| Severità | Numero |
|---|---|
| **CRITICAL** | 2 |
| **HIGH** | 7 |
| **MEDIUM** | 11 |
| **LOW** | 8 |
| **INFO** | 4 |
| **Totale** | **32** |

### Valutazione generale

Il progetto mostra un **livello di consapevolezza di sicurezza superiore alla media** per un
prodotto in fase pre-beta: le Firestore rules sono scritte con allow-list per campo e
default-deny, gli endpoint verificano sistematicamente l'ownership, l'anti-auto-verifica è
implementata correttamente, i security header sono configurati, e `submitReport` è un
esempio di endpoint scritto bene.

I problemi principali non sono errori di codifica, ma **tre disallineamenti strutturali**:
1. controlli implementati su un percorso di codice che non viene percorso (App Check);
2. controlli documentati ma mai scritti (`proxy.ts`);
3. artefatti e script di sviluppo rimasti in repository.

---

## CRITICAL

---

### SEC-001 — Password amministratore hardcoded in repository

| | |
|---|---|
| **Severità** | **CRITICAL** |
| **File** | `scripts/create-admin.ts:18-19` (e riproduzione in chiaro alle righe 31, 38) |
| **Stato** | Tracciato in git, presente nel working tree |

**Descrizione.** Lo script contiene in chiaro un indirizzo email amministrativo
(`admin@dronetag.io`) e la relativa password (valore **oscurato**, formato:
`DroneTag<anno>!` — 13 caratteri, schema banale e indovinabile). Contiene inoltre l'intera
configurazione web Firebase del progetto reale `dronetag-e905d` (apiKey, authDomain,
projectId, storageBucket, messagingSenderId, appId).

Lo script usa il **client SDK** (`createUserWithEmailAndPassword`), quindi chiunque abbia
accesso al file può crearlo o, se l'account esiste già, autenticarsi con quelle credenziali.

Aggravante: `scripts/grant-admin.ts:4-6` dichiara esplicitamente:
> *"V-028 closure: replaces the **deleted** scripts/create-admin.ts (which shipped a hardcoded password)."*

**Il file non è mai stato cancellato.** La remediation è stata documentata ma non eseguita,
e la documentazione dà una falsa sicurezza.

**Scenario di abuso.** Chiunque abbia accesso al repository (nuovo sviluppatore, ex
collaboratore, fork, backup, CI log) legge le credenziali e tenta il login su
`https://<dominio>/login`. Se l'account `admin@dronetag.io` esiste con quella password e ha
il claim `admin`, ottiene **accesso completo** a tutti i dati personali di tutti gli utenti,
alla verifica documenti, alla modifica delle quote e alla cancellazione dei dati.

**Impatto.** Compromissione totale della piattaforma e di tutti i dati personali gestiti.

**Remediation (in ordine):**
1. Verificare **subito** nella Firebase Console se l'utente `admin@dronetag.io` esiste.
2. Se esiste: disabilitarlo o cambiarne la password, e revocare i refresh token
   (`auth.revokeRefreshTokens`). Verificare i suoi custom claims.
3. Eliminare `scripts/create-admin.ts`.
4. Poiché il segreto è nella **storia di git** (commit iniziale), la rimozione dal working
   tree non basta: considerare la riscrittura della storia (`git filter-repo`) o, più
   semplicemente, considerare la password come definitivamente compromessa e non riusarla mai.
5. Ruotare la Firebase Web API key **non è necessario** (è pubblica per progettazione), ma
   verificare le restrizioni della chiave nella Google Cloud Console (referrer HTTP).

**Priorità: P0 — da eseguire prima di qualunque altra attività.**

---

### SEC-002 — Artefatto di build Netlify committato, contenente un file `.env.local`

| | |
|---|---|
| **Severità** | **CRITICAL** (per igiene dei segreti) |
| **File** | `.netlify/functions/___netlify-server-handler.zip` (21,2 MB, tracciato in git) |

**Descrizione.** L'intera directory `.netlify/` è stata committata, incluso l'archivio della
funzione server Netlify. Verificando il contenuto dell'archivio (solo elenco nomi + lunghezze,
**nessun valore letto o riportato**) è presente al suo interno un file `.env.local` di 26
righe con le seguenti variabili:

| Variabile | Stato nel file |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | valorizzata |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | valorizzata |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | valorizzata |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | valorizzata |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | valorizzata |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | valorizzata |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | valorizzata — **percorso filesystem locale dello sviluppatore** |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | **vuota** |
| `APP_CHECK_ENFORCE` | valorizzata |
| `CSP_ENFORCE` | valorizzata |

**Nota importante e rassicurante:** `FIREBASE_SERVICE_ACCOUNT_KEY` è **vuota** e nessuna
chiave privata è presente. Una ricerca di marcatori `BEGIN PRIVATE KEY` / `BEGIN RSA PRIVATE KEY`
su tutta la repository (esclusi `node_modules` e `.git`) non ha prodotto risultati.
**Nessuna private key di service account è stata trovata.**

Ciò che è comunque esposto: le variabili `NEXT_PUBLIC_*` (pubbliche per progettazione, quindi
non un segreto), il percorso assoluto del filesystem dello sviluppatore, e l'intero bundle
server compilato con `node_modules`.

**Perché resta CRITICAL.** Non per ciò che è trapelato oggi, ma perché il **processo** è
rotto: un file `.env.local` è finito dentro un artefatto committato. Al prossimo build fatto
su una macchina dove `FIREBASE_SERVICE_ACCOUNT_KEY` è valorizzata, la chiave privata del
service account finirebbe in git. `.gitignore` contiene `.netlify/`, ma la directory era già
tracciata, quindi la regola **non ha effetto**.

**Impatto.** Rischio elevato di esfiltrazione di credenziali server al prossimo commit;
disclosure del path locale; repository appesantita di 21 MB.

**Remediation:**
1. `git rm -r --cached .netlify` e commit (la regola `.gitignore` diventerà efficace).
2. Verificare la storia di git per accertarsi che nessun commit precedente contenga una
   chiave valorizzata.
3. Aggiungere un hook pre-commit o un secret scanner (gitleaks/trufflehog) in CI.
4. Considerare la rimozione dell'artefatto anche dalla storia per recuperare spazio.

**Priorità: P0.**

---

## HIGH

---

### SEC-003 — Nessuna protezione server-side dell'area `/admin`

| | |
|---|---|
| **Severità** | **HIGH** |
| **File** | `src/app/admin/layout.tsx:15-22` (unico gate); `src/middleware.ts` e `src/proxy.ts` **assenti** |

**Descrizione.** L'accesso a `/admin/*` è controllato esclusivamente da un `useEffect` in un
client component:

```
useEffect(() => {
  if (loading) return;
  if (!user) { router.replace('/login'); return; }
  if (!isAdmin) router.replace('/account');
}, [user, loading, isAdmin, router]);
```

Non esiste alcun `middleware.ts` né `proxy.ts`, nonostante siano citati come gate
server-side in `README.md:102`, `.env.local.example:27`, `docs/DEPLOY_STAGING.md:155`,
`docs/STAGING-SIGNOFF.md:21`, `next.config.ts:56` e `src/lib/server/firebaseAdmin.ts:4`.

**Attenuanti (importanti).** Un utente non-admin che forza `/admin`:
- riceve l'HTML e il bundle JS dell'area admin (disclosure di struttura, non di dati);
- **non ottiene dati**: `listAllAccounts()` chiama `/api/admin/accounts` protetto da
  `requireAdminFromRequest` (403), e i fallback client Firestore vengono negati dalle rules.

Quindi **non è un bypass di autorizzazione sui dati**, ma è un difetto di difesa in profondità
e una divergenza grave rispetto al design documentato.

**Scenario di abuso.** Ricognizione della superficie amministrativa; flash di UI admin;
in caso di futura regressione nelle rules o in un endpoint, mancherebbe il secondo strato.

**Remediation.** Implementare `middleware.ts` (o `proxy.ts`) che legge `__dronetag_session`
e blocca `/admin/*` server-side. Attenzione: `firebase-admin` non è compatibile con l'Edge
runtime; usare `export const runtime = 'nodejs'` nel middleware oppure verificare il JWT via
JWKS in Edge e delegare il controllo del claim al Node.

**Priorità: P0** (è il finding più citato dai documenti esistenti e il più semplice da chiudere).

---

### SEC-004 — App Check non protegge alcuna operazione di scrittura reale

| | |
|---|---|
| **Severità** | **HIGH** |
| **File** | `functions/src/util.ts:44-51` vs `src/app/api/entities/**` |

**Descrizione.** `requireAppCheck()` è implementato e usato in tutte le Cloud Functions
callable. Tuttavia il client **non chiama le callable** per le create: usa i Route Handlers
Next.js (`src/lib/firebase/drones.ts:174`, ecc.). I wrapper `callCreate*` in
`src/lib/firebase/callable.ts:47-93` non sono importati da nessun file.

**Nessun Route Handler verifica il token App Check.** Le Firestore rules contengono un TODO
esplicito per lo stesso motivo (`firestore.rules:33-36`).

Risultato: impostare `APP_CHECK_ENFORCE=true` protegge **solo** `submitReport`. Tutte le altre
scritture sono raggiungibili da qualunque client con un ID token valido, senza attestazione
dell'app.

**Scenario di abuso.** Script automatizzato che, ottenuto un ID token (registrandosi
normalmente), chiama direttamente gli endpoint `/api/entities/*` e gli endpoint di upload,
senza passare dal browser. Non c'è né App Check né rate limit (vedi SEC-005).

**Impatto.** Abuso automatizzato, consumo di Storage e Firestore, costi.

**Remediation.** Verificare l'header `X-Firebase-AppCheck` nei Route Handler tramite
`getAppCheck().verifyToken()` dell'Admin SDK. Iniziare in modalità log-only.

**Priorità: P1.**

---

### SEC-005 — Nessun rate limiting su alcun Route Handler

| | |
|---|---|
| **Severità** | **HIGH** |
| **File** | tutti i 24 file sotto `src/app/api/**` |

**Descrizione.** L'unico rate limiting del sistema è `applyRateLimit()` in
`functions/src/util.ts`, usato solo da `submitReport` (3/10 min per slug+IP). Il cooldown OTP
di 60 s (`src/lib/server/otp.ts:25-27`) è per-utente, non per-IP, e non è un vero rate limit.

Endpoint privi di limiti e particolarmente esposti:
- `POST /api/pricing/checkout` — **anonimo**, raccoglie nome, email, indirizzo di fatturazione;
- `POST /api/auth/otp/email/send` — genera invii email a pagamento (Resend);
- tutti gli endpoint di upload file (5) — scrivono su Storage;
- `GET /api/files/proxy` — scarica fino a 20 MB per richiesta.

**Scenario di abuso.** (a) Flood anonimo su `/api/pricing/checkout` che riempie la memoria
del processo e genera rumore. (b) Amplificazione dei costi: loop su `/api/files/proxy` con
file da 20 MB → banda in uscita. (c) Un utente registrato che riempie lo Storage caricando
ripetutamente file da 20 MB sullo stesso documento (l'upload sovrascrive, ma ogni richiesta
consuma banda e operazioni).

**Impatto.** Denial of wallet, degrado del servizio.

**Remediation.** Introdurre un rate limiter condiviso (riutilizzare il pattern token-bucket
Firestore già presente in `functions/src/util.ts`) applicato per uid e per IP nei Route
Handler. In alternativa, usare le funzionalità di rate limit del provider di hosting.

**Priorità: P1.**

---

### SEC-006 — Firebase Storage: lettura pubblica su tutti i file utente

| | |
|---|---|
| **Severità** | **HIGH** |
| **File** | `storage.rules:48-50` |

```
match /users/{uid}/{allPaths=**} {
  allow read: if true;
  ...
}
```

**Descrizione.** Ogni file caricato da ogni utente è leggibile **senza autenticazione** da
chiunque conosca il path. Questo include:
- PDF delle polizze assicurative (`users/{uid}/insurances/{id}/policy.pdf`);
- PDF dei certificati (`users/{uid}/certificates/{id}/certificate.pdf`);
- **documenti generici, incluso il tipo `identity`** (`users/{uid}/documents/{id}/file.{ext}`)
  — cioè potenzialmente carte d'identità e passaporti;
- autorizzazioni e permessi.

La scelta è **deliberata e documentata** (`storage.rules:14-19`): serve a far caricare
immagini e PDF sulla pagina pubblica senza autenticazione, dato che `getDownloadURL()`
restituisce comunque un URL con token permanente.

**Perché resta un problema.** La sicurezza si regge sull'imprevedibilità del path
(`uid` di 28 caratteri + docId di 20). Non è una difesa: è security through obscurity.
Se un path trapela (log, referer, condivisione, screenshot, backup, un URL nello snapshot
pubblico), il file è accessibile per sempre e non è revocabile senza cancellarlo.
Inoltre `insurancePdfUrl` **è deliberatamente pubblicato** nello snapshot (vedi SEC-007),
quindi almeno una categoria di documenti è esposta per progettazione.

**Remediation.**
1. Separare i namespace: `users/{uid}/public/**` (`read: if true`) e
   `users/{uid}/private/**` (`read: if request.auth.uid == uid || isAdmin()`).
2. Servire i file privati esclusivamente attraverso `/api/files/proxy`, che già verifica
   l'ownership.
3. Per i file realmente pubblici, preferire **signed URL a scadenza** generate lato server.

**Priorità: P1.**

---

### SEC-007 — Il PDF integrale della polizza è pubblicato sul profilo pubblico

| | |
|---|---|
| **Severità** | **HIGH** |
| **File** | `src/lib/firebase/dronesPublic.ts:203` (`insurancePdfUrl: insurance?.pdfUrl ?? ''`); `firestore.rules:194` (`allow read: if true`) |

**Descrizione.** `DronePublicSnapshot` maschera correttamente il numero di polizza
(`insuranceMaskedPolicyNumber`), ma include contemporaneamente `insurancePdfUrl`: il link
diretto al **documento integrale**. Un PDF di polizza contiene tipicamente nome e cognome
del contraente, indirizzo di residenza, numero di polizza completo, massimali e talvolta
codice fiscale.

Il mascheramento del numero di polizza è quindi **annullato** dal link al documento che lo
contiene in chiaro.

`src/lib/utils/publicProjection.ts` prevede correttamente un'opzione `exposePdfUrl`
(default `true`), ma `projectSnapshot()` in `dronesPublic.ts` non la usa: include sempre l'URL.

**Scenario di abuso.** Chiunque scansioni un badge NFC, o conosca uno slug, scarica il PDF.
Chi possiede un elenco di slug (per esempio chi produce i badge) può raccogliere
sistematicamente dati personali di tutti i clienti.

**Impatto.** Esposizione di dati personali su canale pubblico non autenticato.

**Remediation.** Rimuovere `insurancePdfUrl` dallo snapshot pubblico e sostituirlo con la
sola evidenza di validità (già presente: `insuranceStatus`, `insuranceProvider`,
`insuranceValidUntil`, numero mascherato). Se la visione del documento è un requisito
funzionale, servirla tramite un endpoint autenticato o una signed URL a breve scadenza
generata su richiesta.

**Priorità: P1.** Richiede anche una decisione di prodotto con il cliente.

---

### SEC-008 — Lo snapshot pubblico è scritto dal client senza validazione del contenuto

| | |
|---|---|
| **Severità** | **HIGH** |
| **File** | `src/lib/firebase/dronesPublic.ts:135-140`; `firestore.rules:193-213` |

**Descrizione.** `setSnapshot()` esegue `setDoc(doc(db, 'dronesPublic', slug), snapshot)`
direttamente dal browser. Le rules verificano **chi** scrive (deve possedere il drone
referenziato e lo slug deve corrispondere), ma **non validano il contenuto**:

```
allow update: if isSignedIn()
                 && request.resource.data.droneId == resource.data.droneId
                 && request.resource.data.slug == resource.data.slug
                 && <writer possiede il drone>;
```

Qualunque altro campo è libero.

**Scenario di abuso.** Il proprietario di un drone apre la console del browser e scrive nel
proprio `dronesPublic/{slug}`:
- `verificationStatus: 'verified'` → **badge di verifica falsificato** sulla pagina pubblica,
  senza alcuna verifica amministrativa;
- `insuranceStatus: 'valid'`, `insuranceValidUntil: '2030-01-01'` → **copertura assicurativa
  inesistente dichiarata valida**;
- `holderDisplayName: '<qualunque nome>'` → impersonificazione;
- `insurancePdfUrl: 'https://<host arbitrario>/…'` → il link viene reso nella pagina pubblica
  senza che `snapshotFromRaw()` (`dronesPublic.ts:64-96`) verifichi l'host contro l'allow-list
  di `src/lib/utils/urlAllowlist.ts`.

Le rules su `drones/*` impediscono correttamente l'auto-verifica sul documento sorgente
(`firestore.rules:153-182`), ma **quella difesa è aggirabile scrivendo direttamente sulla
proiezione pubblica**, che è l'unica cosa che il pubblico vede.

**Impatto.** Il valore centrale del prodotto — "profilo verificabile" — è falsificabile
dall'utente stesso. Impatto reputazionale e potenzialmente legale (dichiarazione di copertura
assicurativa inesistente esibita a un'autorità).

**Remediation.** Spostare la generazione dello snapshot lato server (dentro i Route Handler
che modificano drone/assicurazione/pilota/operatore) e impostare
`allow create, update, delete: if isAdmin()` su `dronesPublic`. Nel frattempo, mitigazione
parziale: validare `insurancePdfUrl` con `isAllowedFileUrl()` in `snapshotFromRaw()`.

**Priorità: P0/P1** — è il finding con l'impatto di business più alto.

---

### SEC-009 — ID token in cookie leggibile da JavaScript

| | |
|---|---|
| **Severità** | **HIGH** |
| **File** | `src/contexts/AuthContext.tsx:24-35` |

**Descrizione.** Il cookie `__dronetag_idt` viene impostato con `document.cookie`, quindi
**non è HttpOnly** ed è leggibile da qualunque script eseguito sulla pagina. Contiene un
ID token Firebase valido fino a 55 minuti.

Esiste anche `__dronetag_session` (HttpOnly, impostato da `/api/session`), ma il cookie
JS-readable resta e `src/lib/server/requestAuth.ts:30` lo accetta come fallback.

**Attenuanti:** `SameSite=Strict` e `Secure` su HTTPS; il token scade in ≤1 h;
`verifyIdToken(token, true)` controlla la revoca; la CSP (quando `CSP_ENFORCE=true`)
limita gli script. Va inoltre osservato che il Firebase SDK conserva comunque i token in
IndexedDB, che è ugualmente accessibile da JS: il cookie non introduce una classe di
rischio del tutto nuova, ma la amplia (viene inviato automaticamente a ogni richiesta
same-origin e può finire nei log di un proxy).

**Scenario di abuso.** Una singola XSS (o una dipendenza npm compromessa) esfiltra il cookie
e permette di impersonare l'utente — **incluso un admin** — per un'ora.

**Remediation.** Usare esclusivamente il cookie HttpOnly. Valutare
`adminAuth().createSessionCookie()` per una sessione server vera, revocabile e più duratura.
Rimuovere `__dronetag_idt` e il relativo fallback in `requestAuth.ts`.

**Priorità: P1.**

---

## MEDIUM

---

### SEC-010 — Nessun audit log delle azioni amministrative
**File:** tutto il progetto. Non esiste alcuna collection `auditLog`. Le azioni admin
(verifica/rifiuto documenti, modifica dati anagrafici altrui, modifica quote, cancellazione
droni, creazione utenti) non lasciano traccia. **Impatto:** impossibile ricostruire chi ha
fatto cosa; nessuna difesa contro un admin malintenzionato o un account admin compromesso;
requisito tipicamente richiesto in ambito compliance. **Remediation:** scrivere un record
immutabile (Admin SDK, rules `write: if false`) per ogni mutazione privilegiata. **P1.**

### SEC-011 — Verifica amministrativa eseguita interamente dal client
**File:** `src/app/admin/verify/page.tsx`, `src/components/admin/VerifyControls.tsx`.
Il cambio di `verificationStatus` avviene con `updateDoc` dal browser, autorizzato solo da
`allow update: if isAdmin()`. Nessuna validazione delle transizioni di stato, nessun
controllo di coerenza, nessun log. **Remediation:** endpoint dedicato + audit. **P1.**

### SEC-012 — `updatedAt` generato dal client e usato dalle rules
**File:** `firestore.rules:56-61`; tutte le `update*` in `src/lib/firebase/*.ts`.
`entityDataLocked()` considera un documento bloccato se `updatedAt != createdAt`. Ma
`updatedAt` è scritto dal client (`new Date().toISOString()`). Un client può quindi
mantenere `updatedAt == createdAt` per **posticipare indefinitamente il data-lock** e
continuare a modificare i campi identità di droni, certificati e polizze. **Remediation:**
usare `serverTimestamp()` lato Admin SDK o basare il lock esclusivamente su `dataLockedAt`
scritto dal server. **P2.**

### SEC-013 — Webhook billing senza verifica di firma
**File:** `src/app/api/billing/webhook/route.ts`. Endpoint POST pubblico, nessuna
autenticazione, nessuna verifica di firma. Oggi restituisce sempre `501` tramite
`NoopBillingProvider`, quindi **innocuo**. Diventa **CRITICAL** nel momento in cui si
collega un provider reale senza aggiungere la verifica. Il commento a
`src/lib/billing/types.ts:84-88` prescrive correttamente la verifica: assicurarsi che venga
rispettata. **P2 (oggi) / P0 (all'attivazione).**

### SEC-014 — `POST /api/pricing/checkout` anonimo raccoglie PII senza limiti
**File:** `src/app/api/pricing/checkout/route.ts`. Nessuna autenticazione, nessun rate limit,
nessun captcha. Accetta nome, email, indirizzo di fatturazione, P.IVA. I dati finiscono in
una `Map` in memoria del processo (`route.ts:33`). **Impatto:** flood, crescita non limitata
della memoria, PII trattata senza base giuridica né retention. **Remediation:** rate limit +
persistenza controllata + informativa. **P2.**

### SEC-015 — Divergenza di validazione fra API e Cloud Functions
Le due implementazioni parallele delle create hanno già validazioni diverse
(`registrationNumber`, `fileUrl` obbligatorio/opzionale, `dataLockedAt`). Un attaccante che
scopra le callable deployate potrebbe usarle per creare documenti con vincoli più deboli o
con forma diversa da quella attesa dall'UI. **Remediation:** rimuovere le callback morte.
**P2.** Dettaglio in `DRONETAG_BACKEND_AUDIT.md` §3.

### SEC-016 — Nessuna validazione con schema; nessuna sanitizzazione dell'input testuale
Nessuna libreria di validazione. Ogni endpoint valida a mano. I campi liberi (`notes`,
`message`, `label`, `area`) non sono sanitizzati. Il rischio XSS diretto è **basso** perché
React esegue l'escape di default e non è stato trovato alcun `dangerouslySetInnerHTML` su
dati utente (l'unico uso è per il boot script del tema in `src/app/layout.tsx:60`, con
contenuto statico). Il rischio reale è su output secondari: CSV export (`exportNfcCsv`
esegue l'escape RFC 4180 correttamente ✔) e futuri PDF/email. **Remediation:** introdurre
`zod`. **P2.**

### SEC-017 — Indirizzi IP conservati senza policy di retention
**File:** `functions/src/submit-report.ts:119` (`_origin: { ip }`); `rateLimits/{slug}:{ip}`
(l'IP è **nella chiave del documento**). Nessuna TTL policy configurata in
`firestore.indexes.json`. Gli IP restano indefinitamente. Vedi `DRONETAG_PRIVACY_AUDIT.md`.
**P2.**

### SEC-018 — Documenti OTP orfani con email in chiaro
**File:** `src/lib/server/otp.ts:31-38`. `signupOtp/{uid}` è cancellato solo al verify
riuscito. Se l'utente abbandona, il documento resta per sempre con `email` in chiaro e
`codeHash`. Nessuna TTL. **Remediation:** TTL policy Firestore su `expiresAt`. **P2.**

### SEC-019 — `/api/health` pubblico espone la configurazione di sicurezza
**File:** `src/app/api/health/route.ts`. Restituisce senza autenticazione: versione, commit,
`firebase.adminConfigured`, `security.appCheckEnforce`, `security.cspMode`. Permette a un
attaccante di sapere se App Check e CSP sono attivi prima di tentare un attacco.
**Remediation:** ridurre il payload pubblico a `{status:'ok'}` e proteggere il dettaglio.
**P3.**

### SEC-020 — Nessuna cancellazione a cascata; file orfani in Storage
Cancellare un'entità (`deleteCertificate`, `deleteDocument`, ecc.) rimuove il documento
Firestore ma **non il file in Storage**, che resta leggibile pubblicamente (SEC-006) per
sempre. Cancellare un drone non rimuove i `reports` collegati. **Remediation:** cancellazione
transazionale o trigger Storage/Firestore. **P2.**

---

## LOW

| ID | Titolo | File | Note |
|---|---|---|---|
| SEC-021 | Confronto OTP non a tempo costante | `src/lib/server/otp.ts:68` | `data.codeHash === hashCode(code)`. Impatto pratico trascurabile (5 tentativi). Usare `crypto.timingSafeEqual`. |
| SEC-022 | Rate limit OTP per-utente, non per-IP | `src/lib/server/otp.ts:25-27` | Un attaccante con N account genera N email. Costo Resend. |
| SEC-023 | Codice OTP restituito nella risposta in dev | `src/lib/server/otp.ts:41-44` | Corretto per lo sviluppo; verificare che il build di produzione abbia sempre `NODE_ENV=production`. |
| SEC-024 | CSP non attiva per default | `next.config.ts:164-166` | L'header viene emesso solo con `CSP_ENFORCE=true`. Il commento parla di "Report-Only" ma **nessun header report-only viene mai emesso**: o enforce, o niente. Impossibile fare soak. |
| SEC-025 | CSP con `'unsafe-inline'` su script e style | `next.config.ts:106-115` | Scelta documentata e motivata; riduce l'efficacia della CSP contro XSS. |
| SEC-026 | `adminFetch` forza `getIdToken(true)` a ogni richiesta | `src/lib/client/adminApi.ts:17` | Round-trip extra per ogni chiamata API. Non è una vulnerabilità ma amplia la superficie di rete. |
| SEC-027 | Nessun `robots.txt` / `noindex` sui profili pubblici | assente | Le pagine `/u/*` sono indicizzabili. Attenuato dal client-rendering. |
| SEC-028 | Nessun meccanismo di reset password | assente | Non è una vulnerabilità diretta, ma spinge verso pratiche insicure (password condivise, reset manuale via canale non verificato). |

---

## INFO

| ID | Osservazione |
|---|---|
| SEC-029 | La Firebase Web API key presente in `scripts/create-admin.ts`, `scripts/seed-caffagni.ts` e `docs/DEPLOY_STAGING.md` **non è un segreto**: è pubblica per progettazione e viene comunque inclusa nel bundle client. Va però verificato che nella Google Cloud Console abbia restrizioni per referrer HTTP e API. |
| SEC-030 | `SUPER_ADMIN_EMAILS_LOWER = ['info@3dmakes.ch']` in `src/lib/auth/adminAllowlist.ts` è **dead code**: il modulo non è importato da nessuna parte. Non esiste più alcuna promozione ad admin basata su email. Corretto. |
| SEC-031 | Nessun `npm audit` è stato eseguito. Le versioni installate sono recenti (Next 16.2.12, React 19.2.4, firebase 12.11.0, firebase-admin 14.2.0). `package.json` contiene `overrides` per `postcss`, `minimatch`, `sharp`, `uuid`, il che suggerisce che in passato siano state applicate correzioni di sicurezza transitive. **Da rieseguire con `npm audit` in un ambiente controllato.** |
| SEC-032 | I security header (HSTS, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy) sono configurati correttamente in `next.config.ts:163-185` e applicati a tutte le route. Buona pratica. |

---

## Verifica delle escalation ipotizzate

| Scenario | Esito | Evidenza |
|---|---|---|
| Utente normale chiama un endpoint admin | **BLOCCATO** — 403 | `requireAdminFromRequest` verifica `decoded.admin !== true` |
| Utente passa un `uid`/`userId` arbitrario nel body | **BLOCCATO** | Nessun endpoint legge l'owner dal body; sempre `auth.uid` |
| Utente modifica il proprio `companyId` | **N/A** | Il campo non esiste (no multi-tenancy) |
| Utente legge dati di un'altra azienda | **N/A** | Non esistono aziende |
| Utente legge entità di un altro utente | **BLOCCATO** | Rules: `request.auth.uid == resource.data.userId`; API: ricarica il doc e confronta |
| Utente modifica `verificationStatus` su `drones`/`certificates` | **BLOCCATO** | Campo escluso da tutte le allow-list (`firestore.rules:161-181`) |
| Utente modifica `verificationStatus` su **`dronesPublic`** | **NON BLOCCATO** ⚠ | **SEC-008** |
| Utente si auto-assegna il claim `admin` | **BLOCCATO** | I claim si impostano solo con l'Admin SDK via `grant-admin.ts` |
| Utente si concede slot extra | **BLOCCATO** | `slots` è write-admin-only |
| Utente accede ai documenti di un altro tramite `/api/files/proxy` | **BLOCCATO** | Prefisso `users/{auth.uid}/` verificato (`route.ts:47-50`) |
| Chiunque accede ai documenti di chiunque **conoscendo l'URL Storage** | **NON BLOCCATO** ⚠ | **SEC-006** |
| Utente crea un report attribuito a un altro proprietario | **BLOCCATO** | `ownerUserId` derivato server-side (`submit-report.ts:74`) |
| Utente estende l'override operatore oltre 24h | **BLOCCATO** | Clamp nelle rules (`firestore.rules:62-74`) |
| Utente rinomina il proprio `slug` per occupare quello altrui | **BLOCCATO** | `slug` immutabile nelle rules |
| Utente ritarda il data-lock non aggiornando `updatedAt` | **NON BLOCCATO** ⚠ | **SEC-012** |

Nel complesso, il modello di autorizzazione **regge bene** sugli scenari classici. Le due
falle reali sono `dronesPublic` (SEC-008) e Storage (SEC-006).

---

## Piano di remediation consigliato

**Immediato (giorni, prima di qualunque beta)**
1. SEC-001 — verificare/disabilitare l'account admin, eliminare lo script.
2. SEC-002 — `git rm -r --cached .netlify`, aggiungere secret scanning.
3. SEC-008 — almeno la mitigazione: validare `insurancePdfUrl` con l'allow-list host; pianificare lo spostamento server-side.
4. SEC-003 — implementare `middleware.ts`.

**Prima della beta**
5. SEC-007 — decidere con il cliente se il PDF di polizza può restare pubblico; se no, rimuoverlo dallo snapshot.
6. SEC-006 — separare Storage pubblico/privato.
7. SEC-009 — eliminare il cookie non-HttpOnly.
8. SEC-005 — rate limiting sugli endpoint anonimi e di upload.
9. SEC-010 — audit log.

**Prima del lancio commerciale**
10. SEC-004, SEC-011, SEC-012, SEC-013, SEC-014, SEC-015, SEC-016, SEC-017, SEC-018, SEC-020.

**Successivamente**
11. SEC-019, SEC-021 → SEC-028.
