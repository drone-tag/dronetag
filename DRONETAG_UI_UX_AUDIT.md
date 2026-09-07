# DRONETAG — UI / UX / ACCESSIBILITY AUDIT

> Audit statico basato sulla lettura del codice al commit `b72f843`.
> **Limite dichiarato:** questo audit **non** include test su dispositivi reali, misurazioni di
> contrasto con strumenti automatici, né screen-reader testing. Le valutazioni derivano
> dall'analisi del markup JSX, delle classi Tailwind e delle variabili CSS.
> Dove serve una verifica visiva, è indicato **UNKNOWN — richiede test manuale**.

---

## 1. Sintesi

Il design system è **sorprendentemente maturo per un progetto in questo stato di
completamento backend**. Esistono 21 componenti UI riusabili, un sistema di temi basato su
CSS custom properties, 5 lingue, 37 usi di `EmptyState`, dialoghi di conferma su tutte le
azioni distruttive e un componente `Input` con gestione corretta di `label`/`aria-invalid`/
`aria-describedby`.

I problemi non sono di qualità dei componenti ma di **coerenza e completezza del prodotto**:

1. **Il layout tablet non esiste** — il breakpoint `md:` è usato **6 volte** contro 329 usi di
   `sm:` e 61 di `lg:`. Fra 640px e 1024px la UI è "mobile ingrandito".
2. **Traduzioni incomplete** — tedesco, spagnolo e francese sono **al 62% ancora in inglese**
   (798, 796 e 804 chiavi identiche all'inglese su 1275), ma il selettore lingua le presenta
   come disponibili.
3. **La terminologia è incoerente** — "operator" compare in 126 stringhe, "pilot" in 21,
   "company" in 19, "organization" in 11, per concetti in parte sovrapposti.
4. **La UI dichiara essa stessa che l'NFC non funziona** — `links.nfcFuture`: *"NFC integration
   will be available in a future release"*. È la funzionalità che dà il nome al prodotto.
5. **Vicoli ciechi nei flussi** — il profilo rimanda al support per modificare i dati, ma il
   support lancia `support_unavailable`; il checkout termina senza pagamento.
6. **Nessuno stato di caricamento scheletrico** — 0 occorrenze di `animate-pulse`/`Skeleton`.
7. **Nessun sistema di notifiche globale** — i toast esistono solo dentro `PWAClient.tsx`.

---

## 2. Struttura della navigazione

### 2.1 Shell applicativo

| Componente | File | Ruolo |
|---|---|---|
| `AppShell` | `src/components/layout/AppShell.tsx` | contenitore generale |
| `AccountAppShell` | `src/components/layout/AccountAppShell.tsx` | area utente |
| `DesktopSidebar` | `src/components/layout/DesktopSidebar.tsx` | navigazione ≥ `lg` |
| `MobileBottomNavigation` | `src/components/layout/MobileBottomNavigation.tsx` | tab bar mobile |
| `MobileDrawer` / `AccountMoreSheet` | `src/components/layout/*` | overflow mobile |
| `AdminSubNav` | `src/components/layout/AdminSubNav.tsx` | tab admin |
| `PublicHeader` / `PublicFooter` | `src/components/landing/*` | area pubblica |
| `PublicDroneChrome` | `src/components/layout/PublicDroneChrome.tsx` | chrome del profilo pubblico |

L'esistenza di shell distinti per area pubblica, area utente e admin è una scelta corretta.

### 2.2 Navigazione utente — 12 voci

`src/components/layout/accountNavConfig.tsx` definisce: `/account`, `/account/drones`,
`/account/certificates`, `/account/insurances`, `/account/permits`, `/account/operators`,
`/account/documents`, `/account/archive`, `/account/orders`, `/account/profile`,
`/account/billing`, `/account/support`.

**Problema UX:** 12 voci di primo livello sono troppe. Sei di esse (`certificates`,
`insurances`, `permits`, `documents`, `archive`, più in parte `drones`) sono tutte
"documenti caricati" e differiscono solo per tipo. Un utente nuovo non ha modo di capire la
differenza fra *permits*, *documents* e *certificates* senza aprirle. Su mobile la bottom bar
non può contenerne 12 e delega il resto a `AccountMoreSheet`, creando due gerarchie diverse fra
desktop e mobile.

**Problema aggiuntivo:** `/account/billing` e `/account/support` occupano posizioni di primo
livello pur essendo **non funzionanti** (vedi §5).

### 2.3 Navigazione admin — incoerente

`AdminSubNav` espone 6 tab: overview, users, support, verify, plans, nfc.

Esistono però **11 pagine admin**. Due sezioni operative importanti **non sono nella subnav**:

| Pagina | Raggiungibile da |
|---|---|
| `/admin/reports` | solo dalla dashboard `/admin` e da `InboxBellButton` |
| `/admin/drones` | solo dalla dashboard `/admin` e da `InboxBellButton` |
| `/admin/users/new` | solo da `/admin/users` |
| `/admin/drones/[id]` | da `/admin/users/[uid]` e `/admin` |

Un admin che si trovi su `/admin/verify` non ha alcun collegamento diretto verso i report dei
droni ritrovati se non tornando alla dashboard o usando la campanella. **Da correggere: è un
costo cognitivo continuo per l'utente più operativo del sistema.**

---

## 3. Responsive

### 3.1 Il tablet è il caso non gestito — FACT

Conteggio delle classi di breakpoint in `src/**/*.tsx`:

| Breakpoint | Occorrenze | Significato |
|---|---|---|
| `sm:` (≥640px) | **329** | usato come "non-mobile" |
| `md:` (≥768px) | **6** | praticamente inutilizzato |
| `lg:` (≥1024px) | **61** | usato per la sidebar desktop |

Conseguenza concreta: fra 640px e 1024px (iPad in verticale, molti Android tablet, finestre
desktop ridotte) l'app applica gli stili `sm:` — pensati per il telefono in orizzontale — su una
viewport larga. La `DesktopSidebar` non compare (è `lg:`), quindi si usa la bottom navigation
mobile su uno schermo da 10 pollici.

**Impatto:** medio-alto per un prodotto destinato a operatori professionali, che con ogni
probabilità useranno tablet in campo.
**Verifica visiva: UNKNOWN — richiede test su dispositivo reale.**

### 3.2 Elementi responsive ben fatti ✔

- `Modal.tsx` è un **bottom-sheet su mobile** e un dialogo centrato da `sm:` in su, con
  handle di trascinamento (`h-1 w-12`, `sm:hidden`) e `max-h-[min(92dvh,100dvh)]`. Uso corretto
  di `dvh` invece di `vh` (evita il bug della barra indirizzi su iOS).
- Classe `safe-pb` per la safe area di iOS.
- Classe `tap-44` sui pulsanti icona → target di 44px, conforme alle linee guida.
- `Input.tsx` usa `text-base` su mobile e `sm:text-sm` da tablet: `text-base` (16px) **evita lo
  zoom automatico di Safari iOS** sul focus. Dettaglio curato.
- `ResponsivePageHeader.tsx` esiste come componente dedicato.

---

## 4. Terminologia — incoerenza sostanziale

### 4.1 I dati

Occorrenze nei valori delle stringhe di `src/lib/i18n/en.ts` (1275 chiavi):

| Termine EN | Occorrenze | Termine IT | Occorrenze |
|---|---|---|---|
| Operator | **126** | operatore | **104** |
| Insurance | 64 | assicurazione | 29 |
| Certificate | 54 | certificato | 46 |
| Admin | 45 | — | — |
| User | 36 | utente | 24 |
| Badge | 22 | badge | 22 |
| **Pilot** | **21** | **pilota** | **8** |
| Company | 19 | azienda | 18 |
| Organization | 11 | organizzazione | 10 |
| Owner | 8 | proprietario | 8 |
| Holder | 4 | — | 0 |

### 4.2 I conflitti concreti

**(a) "Pilot" vs "Operator".** Nel regolamento UAS europeo sono due ruoli distinti: il *pilota
remoto* è la persona fisica ai comandi, l'*operatore UAS* è il soggetto (persona o impresa)
registrato e responsabile. Il codice riflette questa distinzione a livello di dati — esistono
le collection `pilots` e `operators`, e `Operator` ha i sotto-oggetti `private` e `company` —
ma la UI usa "Operator" 6 volte più di "Pilot". Il **piano tariffario** si chiama però
"Pilot"/"Pilot Pro" (`src/config/pricing.ts`), e la navigazione ha una voce "Operators".
Un utente individuale che acquista il piano "Pilot" e poi trova la sezione "Operators" non ha
alcun indizio su cosa sia l'una e cosa l'altra.

**(b) "Company" vs "Organization".** Usati in modo intercambiabile (19 vs 11). Nel data model
non esiste alcuna collection `companies`: i dati aziendali sono campi denormalizzati dentro
`users` (`companyName`, `companyVat`, …) e dentro `operators.company`. **La UI suggerisce
l'esistenza di un'entità azienda che nel database non esiste.**

**(c) "Owner" vs "Holder".** `holderDisplayName` e `holderName` nei dati, "Owner" nella UI.

**(d) Il piano si chiama "Team" e "Business"**, ma la UI non parla mai di "team": parla di
"operators". Un acquirente del piano Team non trova alcuna sezione "Team".

**Raccomandazione (non implementata):** definire un glossario canonico prima di qualunque
lavoro sulla UI, allinearlo al lessico ENAC/EASA, e applicarlo in un unico passaggio sui file
i18n. È un intervento a basso rischio tecnico e alto impatto sulla comprensibilità.

---

## 5. Flussi UX — analisi per percorso

### Flusso 1 — Nuovo utente / registrazione

**Step:** 2 (`SignupStep = 'form' | 'verify'` — `src/app/signup/page.tsx:22`).
Form → OTP via email → dashboard.

| Aspetto | Valutazione |
|---|---|
| Numero di step | Buono (2) |
| Verifica email | OTP a 6 cifre, cooldown 60s, max 5 tentativi ✔ |
| **Consenso privacy/termini** | ❌ **assente** — nessuna checkbox |
| **Il flusso funziona?** | ❌ **NO in produzione.** `signup/page.tsx` chiama `ensureAccount()` / `ensurePilot()` che eseguono `create` client-side su `users`/`pilots`, ma `firestore.rules` nega esplicitamente questi create. **Dead end tecnico.** |
| Onboarding successivo | ❌ **nessun wizard di onboarding esiste** (0 file corrispondenti a `*onboard*`) |

**Dopo il signup l'utente atterra su `/account` senza alcuna guida.** Deve scoprire da solo che
serve creare un operatore, poi un drone, poi caricare certificato e assicurazione, poi
pubblicare. Nessun checklist, nessun progress, nessun empty state che spieghi il primo passo.
**È la lacuna UX più costosa in termini di conversione.**

### Flusso 2 — Aggiunta drone

`/account/drones` → modal → `POST /api/drones` → riga in lista.
Presente `DroneCatalogPicker.tsx` (catalogo modelli) — buon dettaglio.
Blocco: il campo identità si congela dopo il primo update (`entityDataLocked()` in
`firestore.rules:56`) e la UI **non lo spiega in anticipo**: l'utente scopre il lock quando è
troppo tardi.

### Flusso 3-5 — Upload certificato / assicurazione / documento

`UploadField.tsx` (214 righe) è ben fatto: preview, accept, stato corrente.
Presente OCR client-side per precompilare i metadati — buon investimento UX.
Le pagine sono grandi (`insurances/page.tsx` = **901 righe**, `certificates/page.tsx` = 612):
form, lista, modali e logica Firebase convivono nello stesso file.

### Flusso 6 — Attivazione badge NFC

**Dead end dichiarato dal prodotto stesso.** `VerificationLinksPanel.tsx:158-181` mostra una
sezione "NFC Reference" con un banner di avviso ambrato che recita:

> *"NFC integration will be available in a future release. This field is reserved for the NFC
> tag identifier."* (`links.nfcFuture`)
>
> *"A physical NFC tag can be linked to this profile for tap-to-verify access. NFC tag
> programming is not yet available."* (`links.nfcDesc`)

Al contempo `/pricing` vende il badge NFC come **obbligatorio** a €15,90–24,90.
**Questa è una contraddizione di prodotto, non solo di UI.** Va risolta prima di qualunque
vendita: o il badge è programmabile, o non può essere venduto come componente obbligatorio.

### Flusso 7 — Pubblicazione profilo

`Drone.visibility: 'private' | 'public'` → scrive `dronesPublic/{slug}`.
Meccanismo pulito. Manca però: nessun avviso all'utente su **quali dati diventeranno pubblici**
prima del passaggio, nessuna anteprima "vedi come appare al pubblico", nessuna richiesta di
consenso. Considerato che la pubblicazione espone nome, foto e (oggi) il PDF di polizza, la
mancanza di un passaggio di conferma informata è un problema serio.

### Flusso 8 — Azienda / team

Non esiste un flusso azienda. Nessuna gestione membri, nessun invito, nessun ruolo aziendale,
nessuna vista flotta condivisa. I dati aziendali sono solo campi anagrafici.
**Stato: NON IMPLEMENTATA** — ma i piani "Team" e "Business" la presuppongono.

### Flusso 9 — Verifica admin

`/admin/verify` (701 righe) è la pagina più completa dell'area admin.
Manca: cronologia delle verifiche, motivazione strutturata del rifiuto, notifica all'utente
(nessuna email viene inviata all'approvazione o al rifiuto — vedi `DRONETAG_FEATURE_MATRIX.md`).

### Flusso 10-11 — Upgrade piano / checkout

`/pricing` → `/checkout` (418 righe) → `POST /api/pricing/checkout` → crea un `order` con stato
`pending`. **Poi si ferma.** Nessun provider di pagamento è integrato. L'utente arriva a una
schermata di conferma ordine senza aver pagato e senza sapere cosa succederà.
**Dead end commerciale.**

### Flusso 12 — Support

`/account/support` ha una UI completa: form, lista ticket, stati. `src/lib/firebase/support.ts:36`
lancia `support_unavailable` in modalità live. **L'utente vede un errore generico.**
È il caso peggiore fra i dead end perché il support è il canale indicato dalla UI del profilo
per correggere i propri dati (vedi §4 di `DRONETAG_PRIVACY_AUDIT.md`).

---

## 6. Stati dell'interfaccia

| Stato | Presenza | Note |
|---|---|---|
| Empty state | ✔ **buono** | `EmptyState.tsx`, 37 usi |
| Loading | ⚠️ parziale | 75 riferimenti a "Loading", ma **0 skeleton** (`animate-pulse`: 0). Si usano spinner/testo. Su liste lunghe produce layout shift. |
| Errore di form | ✔ | `FormErrorBanner.tsx` + `Input error` con `role="alert"` |
| Errore di sistema | ✔ | `ErrorPanel.tsx`, `src/app/error.tsx`, `not-found.tsx` |
| Successo | ⚠️ **debole** | **Nessun sistema di toast globale.** I toast esistono solo in `PWAClient.tsx` (install/online). Le conferme di salvataggio si affidano al re-render della lista. |
| Conferma distruttiva | ✔ **buono** | `ConfirmDialog.tsx` usato in 10 pagine; **nessun `window.confirm`** nel codice |
| Offline | ✔ | `PWAClient.tsx` gestisce offline/online con toast |

**Raccomandazione:** un provider di toast globale è l'intervento a miglior rapporto
costo/beneficio su tutta la UI. Oggi un salvataggio riuscito è indistinguibile da un no-op.

---

## 7. Accessibilità

### 7.1 Metriche rilevate

| Indicatore | Valore |
|---|---|
| File `.tsx` | 123 |
| Attributi `aria-*` | **172** |
| `aria-label` | 34 |
| `role=` | 43 |
| `htmlFor` | 11 (+ tutti gli `Input`/`Select`/`Textarea` lo derivano internamente) |
| `alt=` | 14 su 14+ elementi immagine |
| `.sr-only` | 10 |
| `tabIndex` | 3 |
| `focus-visible` | **2** |

### 7.2 Cosa è fatto bene ✔

**`src/components/ui/Input.tsx`** è un esempio corretto:

```23:80:src/components/ui/Input.tsx
export function Input({ label, name, type = 'text', value, onChange, placeholder, required, error, disabled, className, id, ...rest }: InputProps) {
  const inputId = id ?? name;
  // <label htmlFor={inputId}> … con asterisco aria-hidden
  //   aria-invalid={Boolean(error)}
  //   aria-describedby={error ? `${inputId}-error` : undefined}
  //   <p id={`${inputId}-error`} role="alert">{error}</p>
```

- `label` è una prop **obbligatoria**: TypeScript impedisce di creare un input senza etichetta.
- L'asterisco del campo obbligatorio è `aria-hidden` (correttamente non letto dallo screen reader).
- L'errore è collegato via `aria-describedby` e annunciato via `role="alert"`.

**`src/components/ui/Modal.tsx`**: `role="dialog"`, `aria-modal="true"`,
`aria-labelledby` con `useId()`, chiusura con `Escape`, scroll del body bloccato, icone
`aria-hidden`, pulsanti con `aria-label`.

Le icone SVG decorative sono marcate `aria-hidden` in modo sistematico.

### 7.3 Problemi rilevati

| ID | Problema | Gravità | Evidenza |
|---|---|---|---|
| A11Y-01 | **`Modal` non implementa focus trap** né focus iniziale né ripristino del focus alla chiusura | **Alta** | `Modal.tsx` non contiene `focus()`, nessuna gestione di `Tab`. Un utente da tastiera può tabulare fuori dal dialogo aperto. |
| A11Y-02 | **Il backdrop del modal è un `<button>`** che copre l'intero schermo | Media | `Modal.tsx:51-57`. Compare nella sequenza di tabulazione come controllo senza contenuto visibile. Preferibile un `div` con handler + il pulsante di chiusura esplicito già presente. |
| A11Y-03 | **`focus-visible` usato solo 2 volte** su 123 file | **Alta** | Gli stati di focus dipendono dallo stile di default del browser, che le classi Tailwind `outline-none` spesso rimuovono (`inputBase` contiene `outline-none`). Su `Input` è compensato dal `focus:ring`, ma **su pulsanti e link non è verificato.** |
| A11Y-04 | **Nessun `<a href="#main">` skip link** | Media | Nessuna occorrenza. Con 12 voci di navigazione, un utente da tastiera deve attraversarle a ogni pagina. |
| A11Y-05 | **Contrasto non verificato** | UNKNOWN | Il tema usa variabili CSS in `src/app/globals.css` (275 righe, tema scuro su `[data-theme="dark"]`). Testi `text-[11px]` sono usati per hint e avvisi: **11px è sotto la soglia comunemente raccomandata**. Richiede misurazione. |
| A11Y-06 | **Nessuna `aria-live` per gli aggiornamenti asincroni** | Media | Salvataggi, upload e cambi di stato non vengono annunciati (conseguenza dell'assenza di un sistema di toast). |
| A11Y-07 | Testo a 11px in avvisi e hint | Media | `VerificationLinksPanel.tsx:179`, `Input`-hint, ecc. |
| A11Y-08 | Zoom responsive | UNKNOWN | Non verificabile staticamente. Non è stato trovato `user-scalable=no` nel viewport — **questo è positivo**. |
| A11Y-09 | `tabIndex` usato solo 3 volte | INFO | Basso uso di tabindex personalizzati: è un bene (meno rischio di ordini di tabulazione innaturali). |

**Valutazione complessiva accessibilità: discreta sui componenti di base, insufficiente sui
comportamenti interattivi (focus management).** Il gap principale è il focus trap del modal:
è l'unico problema che rende una parte dell'app **inutilizzabile** da tastiera.

---

## 8. Internazionalizzazione

### 8.1 Architettura — buona

`src/lib/i18n/index.ts` implementa un sistema semplice e corretto:
- `en.ts` è la fonte autoritativa; `TranslationKey` è derivato da essa
  (`export type TranslationKey = keyof typeof translations`);
- gli altri file sono tipizzati `TranslationMap = Record<TranslationKey, string>`, quindi
  **TypeScript impedisce chiavi mancanti o superflue**;
- fallback a inglese con warning in sviluppo (`warnMissing`);
- interpolazione di parametri `{key}`.

### 8.2 Copertura reale — il problema

Misurazione sulle 1275 chiavi:

| Lingua | Chiavi | Mancanti | **Stringhe identiche all'inglese** |
|---|---|---|---|
| `en.ts` | 1275 | — | — (riferimento) |
| `it.ts` | 1275 | 0 | 41 (3%) — **tradotto** ✔ |
| `de.ts` | 1275 | 0 | **798 (62%)** ❌ |
| `es.ts` | 1275 | 0 | **796 (62%)** ❌ |
| `fr.ts` | 1275 | 0 | **804 (63%)** ❌ |

Delle stringhe identiche in tedesco, **216 sono lunghe più di 30 caratteri** — non possono
essere coincidenze lessicali. Esempi verificati in `de.ts`:

- `settings.subtitle` = "Manage appearance, language and account preferences."
- `login.adminProvisioned` = "Accounts are created by an administrator. Contact us if you need credentials."
- `demo.banner` = "Demo mode — sample data, Firebase not connected"

**Il typing rende invisibile il problema:** poiché la chiave *esiste* con un valore inglese,
né TypeScript né il `warnMissing` runtime segnalano nulla. Il controllo automatico dà falso
verde.

**Conseguenza per l'utente:** un utente tedesco che seleziona "Deutsch" ottiene un'interfaccia
mista tedesco/inglese senza alcun avviso. Il selettore in `LANGUAGES`
(`src/lib/i18n/index.ts:14-20`) presenta le 5 lingue come equivalenti.

**Raccomandazione:** o completare le traduzioni, o rimuovere de/es/fr dal selettore fino al
completamento. Uno script di CI che confronti i valori (non le chiavi) con l'inglese
intercetterebbe il problema.

### 8.3 Formattazione localizzata

**UNKNOWN / da verificare:** non è stato accertato un uso sistematico di `Intl.NumberFormat` o
`Intl.DateTimeFormat`. I prezzi in `src/config/pricing.ts` sono in EUR; il formato di data
mostrato all'utente andrebbe verificato per locale.

---

## 9. Coerenza visiva e design system

### 9.1 Punti di forza

- **21 componenti UI riusabili** in `src/components/ui/`: `Accordion`, `Button`, `Card`,
  `EmptyState`, `EntityListRow`, `Input`, `MetadataRow`, `Modal`, `PDFPreview`,
  `PasswordInput`, `QRPreview`, `ResponsivePageHeader`, `RowActionMenu`, `SectionHeader`,
  `Select`, `StatsCard`, `StatusBadge`, `Textarea`, `Toggle`, `UploadField`, `UserAvatar`.
- **Tokenizzazione completa via CSS variables** (`var(--color-text)`, `var(--color-border)`,
  `var(--tone-warning-bg)`, …). Il tema scuro è un solo override su `[data-theme="dark"]`
  (`globals.css:66`) invece di 500 varianti `dark:` sparse — infatti `dark:` compare **1 volta
  sola** in tutto il codice. **Scelta architetturale corretta.**
- `StatusBadge` centralizza la rappresentazione degli stati.
- `classNames()` helper condiviso.

### 9.2 Debolezze

| Problema | Evidenza |
|---|---|
| **Pagine molto grandi con logica mista** | `admin/users/[uid]/page.tsx` **940 righe**, `account/insurances/page.tsx` **901**, `admin/verify/page.tsx` **701**, `account/operators/page.tsx` **622**. Contengono UI, stato, chiamate Firebase e validazione insieme. Difficili da modificare e impossibili da testare in isolamento. |
| Componenti grandi | `AccountDashboard.tsx` 509, `PublicProfileCard.tsx` 508, `PublicDroneCard.tsx` 487, `ProfileForm.tsx` 472 |
| Duplicazione fra `PublicProfileCard` e `PublicDroneCard` | 508 + 487 righe con responsabilità sovrapposte — **da verificare se una delle due è legacy** |
| Icone SVG inline ripetute | Nessuna libreria di icone; SVG copiati in più file (es. l'icona di avviso in `VerificationLinksPanel.tsx:176`) |
| `md:` inutilizzato | vedi §3.1 |

---

## 10. Registro dei findings UI/UX

| ID | Titolo | Severità | Area | File |
|---|---|---|---|---|
| UX-001 | La UI dichiara che l'NFC non è disponibile, mentre `/pricing` lo vende come obbligatorio | **CRITICAL** | Prodotto | `VerificationLinksPanel.tsx:158-181`, `src/config/pricing.ts` |
| UX-002 | Support non funzionante ma presentato come canale ufficiale per la rettifica dei dati | **CRITICAL** | Flusso | `src/lib/firebase/support.ts:36`, `src/app/account/profile/page.tsx` |
| UX-003 | Checkout senza pagamento: dead end commerciale | **CRITICAL** | Flusso | `src/app/checkout/page.tsx`, `src/app/api/pricing/checkout/route.ts` |
| UX-004 | Signup rotto in produzione (create client-side negati dalle rules) | **CRITICAL** | Flusso | `src/app/signup/page.tsx`, `firestore.rules` |
| UX-005 | de/es/fr al 62% in inglese ma offerte come lingue complete | **HIGH** | i18n | `src/lib/i18n/{de,es,fr}.ts` |
| UX-006 | Nessun onboarding: l'utente atterra su una dashboard vuota senza guida | **HIGH** | Flusso | nessun file |
| UX-007 | Modal senza focus trap né ripristino del focus | **HIGH** | A11y | `src/components/ui/Modal.tsx` |
| UX-008 | Nessun sistema di toast globale: i successi non sono comunicati | **HIGH** | Feedback | — |
| UX-009 | Layout tablet inesistente (`md:` usato 6 volte) | **HIGH** | Responsive | tutto il progetto |
| UX-010 | Terminologia incoerente: pilot/operator/company/organization/owner/holder | **HIGH** | Copy | `src/lib/i18n/*` |
| UX-011 | Pubblicazione del profilo senza avviso su quali dati diventano pubblici | **HIGH** | Privacy UX | `src/app/account/drones/[id]/page.tsx` |
| UX-012 | 12 voci di navigazione di primo livello, 6 delle quali sono "documenti" | **MEDIUM** | IA | `accountNavConfig.tsx` |
| UX-013 | `/admin/reports` e `/admin/drones` assenti dalla subnav admin | **MEDIUM** | IA | `AdminSubNav.tsx` |
| UX-014 | Nessuno skeleton loader; layout shift sulle liste | **MEDIUM** | Percezione | — |
| UX-015 | `focus-visible` usato 2 volte con `outline-none` diffuso | **MEDIUM** | A11y | `src/components/ui/*` |
| UX-016 | Nessuno skip link | **MEDIUM** | A11y | — |
| UX-017 | Il data-lock sui campi identità non è annunciato prima della modifica | **MEDIUM** | Flusso | `firestore.rules:56`, form entità |
| UX-018 | `/account/billing` in navigazione primaria pur essendo non funzionante | **MEDIUM** | IA | `accountNavConfig.tsx:96` |
| UX-019 | Pagine da 600-940 righe con UI, stato e I/O mescolati | **MEDIUM** | Manutenibilità | vedi §9.2 |
| UX-020 | Nessuna `aria-live` per operazioni asincrone | **MEDIUM** | A11y | — |
| UX-021 | Testo a 11px in hint e avvisi | **LOW** | A11y | vari |
| UX-022 | Backdrop del modal implementato come `<button>` a schermo intero | **LOW** | A11y | `Modal.tsx:51` |
| UX-023 | Contrasto colore non misurato | **UNKNOWN** | A11y | `globals.css` |
| UX-024 | Possibile duplicazione `PublicProfileCard` / `PublicDroneCard` | **LOW** | Manutenibilità | `src/components/profile/*` |
| UX-025 | Nessuna libreria di icone; SVG duplicati inline | **LOW** | Manutenibilità | vari |

---

## 11. Raccomandazioni in ordine di rapporto valore/costo

1. **Toast provider globale** — costo basso, impatto immediato su ogni schermata.
2. **Focus trap nel `Modal`** — costo basso (una libreria o ~40 righe), sblocca l'uso da tastiera.
3. **Rimuovere de/es/fr dal selettore** finché non sono completi — costo quasi nullo, elimina
   un'esperienza palesemente rotta.
4. **Glossario terminologico + passata sui file i18n** — costo medio, nessun rischio tecnico.
5. **Checklist di onboarding sulla dashboard vuota** — costo medio, impatto alto sulla conversione.
6. **Riportare `/admin/reports` e `/admin/drones` nella subnav** — costo di 5 minuti.
7. **Introdurre `md:` e verificare l'app su tablet** — costo medio.
8. **Modale di conferma alla pubblicazione** con l'elenco dei dati che diventano pubblici —
   costo basso, risolve anche un requisito privacy.
9. **Skeleton loader sulle liste** — costo basso.
10. **Estrarre la logica Firebase dalle pagine >500 righe** — costo alto, va pianificato
    insieme al refactoring backend descritto in `DRONETAG_BACKEND_AUDIT.md`.
