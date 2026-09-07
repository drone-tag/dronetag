# DRONETAG — PRODUCT READINESS

> Valutazione al commit `b72f843`. Ogni punteggio è motivato con evidenze verificabili nel
> codice. **I punteggi non esprimono un giudizio sulla qualità del lavoro svolto**, ma la
> distanza fra lo stato attuale e uno stato produttivo.

---

## 1. Il verdetto in una riga

DroneTag è **un frontend molto avanzato su un backend a metà**: l'interfaccia, il design
system, la modellazione dei dati e le regole di sicurezza sono di buona qualità, ma le tre
funzioni che rendono il prodotto vendibile — **registrazione, notifiche di drone ritrovato e
pagamenti** — non funzionano.

**BETA READINESS: 34 / 100**
**PRODUCTION READINESS: 21 / 100**

---

## 2. Punteggi per area

| # | Area | Punteggio | Motivazione sintetica |
|---|---|---|---|
| 1 | **UI / UX** | **68** | Design system con 21 componenti, 37 empty state, dialoghi di conferma ovunque, `Modal` bottom-sheet su mobile. Penalizzato da: nessun layout tablet (`md:` usato 6 volte), nessun onboarding, nessun toast globale, terminologia incoerente. |
| 2 | **Frontend** | **72** | 42.056 righe, 123 componenti, 4 sole occorrenze di `any`, 1 solo TODO. Penalizzato da: pagine da 900 righe con I/O Firebase inline, `DEMO_MODE` in 161 punti. |
| 3 | **Backend** | **38** | 24 route handler funzionanti con Admin SDK e validazione. Penalizzato da: 5 Cloud Functions deployate e mai chiamate, nessun pagamento, nessuna notifica, support che lancia `support_unavailable`. |
| 4 | **Authentication** | **55** | Firebase Auth, OTP email con hash SHA-256, cooldown 60s, sessione HttpOnly. Penalizzato da: **nessun reset password**, signup rotto in produzione, cookie `__dronetag_idt` non-HttpOnly ancora accettato dal server. |
| 5 | **Authorization** | **45** | Firestore rules con allow-list per campo — lavoro serio e non banale. Penalizzato da: **nessun gate server-side su `/admin`**, App Check non applicato, `dronesPublic` scrivibile dal client. |
| 6 | **Database** | **62** | Modello coerente, snapshot pubblico denormalizzato, indici presenti. Penalizzato da: PII duplicata su 3 collection senza sincronizzazione, nessun TTL, nessuna cascata di cancellazione, collection `profiles` legacy. |
| 7 | **Security** | **28** | Header di sicurezza completi, guardia di build, OTP hashato, SVG escluso dagli upload. Penalizzato da: **password admin in chiaro in git**, **Storage con `read: if true`**, CSP off di default, nessun App Check, nessun rate limiting sulle API Next. |
| 8 | **Privacy readiness** | **22** | Livello di proiezione pubblica ben progettato, `maskPolicyNumber()`, zero tracker di terze parti. Penalizzato da: **PDF di polizza pubblico**, nessuna informativa, nessun consenso, nessuna cancellazione account, nessuna retention. |
| 9 | **Admin** | **58** | 11 pagine, verifica documenti, gestione utenti e piani. Penalizzato da: protezione solo client-side, nessun audit trail, nessuna notifica all'utente su approvazione/rifiuto, 2 sezioni fuori dalla navigazione. |
| 10 | **Public profile** | **60** | Funziona, è la parte più matura del prodotto, con proiezione minimizzata e mascheramento. Penalizzato da: PDF di polizza esposto, nessun rate limiting sulla lettura, `<img>` grezzo invece di `next/image`. |
| 11 | **NFC** | **15** | Lo slug esiste, l'URL `/u/{slug}` funziona, il QR si genera. Ma **la UI stessa dichiara che l'NFC non è disponibile** (`links.nfcFuture`), **non esiste un'entità badge** nel database, e non c'è alcun flusso di attivazione, revoca o sostituzione. |
| 12 | **Billing** | **8** | Esiste un catalogo prezzi centralizzato e un calcolo di preventivo server-side che non si fida del client — lavoro corretto. Ma **nessun provider di pagamento**, nessun webhook, nessun abbonamento, e `/account/billing` non funziona. |
| 13 | **Notifications** | **12** | Resend è integrato e l'OTP di registrazione parte davvero. **Nient'altro.** `submitReport` chiude con `// TODO … For now just log.` |
| 14 | **Testing** | **0** | Nessun framework di test installato. Nessun test unitario, di integrazione, E2E o sulle security rules. Nessuno script `test` in `package.json`. |
| 15 | **Monitoring** | **5** | 51 `console.*` e il logger di Firebase Functions. Nessun error monitoring, nessun uptime check, nessun audit trail, nessun alerting. |
| 16 | **Deploy** | **35** | Netlify configurato e funzionante, guardia di build che impedisce di pubblicare un bundle vulnerabile. Penalizzato da: **un solo progetto Firebase**, nessuna CI, nessun rollback, artefatti di build committati. |
| 17 | **Documentation** | **30** | Esiste documentazione abbondante (README, TECHNICAL_HANDOVER, 4 file in `docs/`), e i commenti nel codice sono ottimi. **Penalizzato pesantemente perché almeno tre affermazioni verificabili sono false** (esistenza di `proxy.ts`, cancellazione di `create-admin.ts`, staging configurato): una documentazione inaffidabile è peggio dell'assenza di documentazione. |

**Media aritmetica: 36,1** — ma la media non è la metrica giusta, perché le aree non hanno
lo stesso peso e alcune sono bloccanti a prescindere dal punteggio delle altre.

---

## 3. Beta readiness — 34/100

**Definizione adottata:** una beta è un rilascio a un gruppo ristretto di utenti reali, che
usano dati reali, sapendo che il prodotto è incompleto, ma potendo completare almeno il
percorso principale.

### Blocker assoluti per la beta

| # | Blocker | Evidenza | Perché blocca |
|---|---|---|---|
| 1 | **Un nuovo utente non può registrarsi** | `src/app/signup/page.tsx` chiama `ensureAccount()`/`ensurePilot()` che eseguono `create` client-side su `users`/`pilots`; `firestore.rules` nega esplicitamente questi create | Senza registrazione non esiste beta. È il blocker numero uno. |
| 2 | **Nessun reset password** | Nessun `sendPasswordResetEmail` nel codice | Il primo utente che dimentica la password è perso, e il canale di support non funziona |
| 3 | **`submitReport` non notifica nessuno** | `functions/src/submit-report.ts:122` — `// TODO V-006/V-035: enqueue push + email fanout. For now just log.` | È **la funzione centrale del prodotto**. Un badge NFC che, se scansionato, non avvisa il proprietario, non serve a niente. |
| 4 | **Support non operativo** | `src/lib/firebase/support.ts:36` lancia `support_unavailable` | In beta il support è indispensabile, e qui è anche il canale indicato per correggere i propri dati |
| 5 | **Password admin in chiaro nel repository** | `scripts/create-admin.ts` | Rischio di compromissione totale con dati di utenti reali |
| 6 | **Documenti d'identità pubblicamente scaricabili** | `storage.rules:49` — `allow read: if true` | Data breach con utenti reali |
| 7 | **PDF di polizza pubblicato sul profilo anonimo** | `src/lib/firebase/dronesPublic.ts:203` | Espone nome, indirizzo e numero di polizza in chiaro |
| 8 | **Nessuna informativa privacy né consenso** | Nessuna pagina legale; nessuna checkbox in `signup/page.tsx` | Non si possono raccogliere dati personali reali |
| 9 | **Nessuna cancellazione account** | Nessun `deleteUser`, nessuna cascata | Un beta tester che chiede di essere rimosso non può essere accontentato |
| 10 | **Sviluppo e produzione sullo stesso progetto Firebase** | `.firebaserc` | Ogni sessione di sviluppo mette a rischio i dati dei beta tester |
| 11 | **Nessun error monitoring** | Nessuna dipendenza | I bug segnalati dai beta tester non sarebbero diagnosticabili |
| 12 | **Area admin senza gate server-side** | Nessun `middleware.ts`, nessun `proxy.ts` | La protezione dipende dal codice che gira nel browser dell'utente |

### Cosa invece **funzionerebbe** in beta

Va riconosciuto, perché è la base su cui si costruisce:

- login e logout;
- creazione, modifica e cancellazione di operatori, droni, certificati, assicurazioni,
  autorizzazioni e documenti (24 route handler con Admin SDK, validazione e controllo
  di proprietà);
- upload di file con allow-list di content-type e limiti dimensionali;
- OCR client-side per precompilare i metadati dei documenti;
- generazione dello slug e pubblicazione del profilo su `/u/{slug}`;
- il profilo pubblico, con proiezione minimizzata e mascheramento del numero di polizza;
- il form di segnalazione drone ritrovato (**scrive nel database**, ma non notifica nessuno);
- l'area admin: verifica documenti, gestione utenti, gestione piani;
- l'archivio dei documenti scaduti;
- il calcolo del preventivo, server-side e non falsificabile dal client;
- interfaccia completa in italiano e inglese; PWA installabile con gestione offline.

**Stima per raggiungere una beta credibile: 6-10 settimane/uomo**, concentrate su registrazione,
notifiche, sicurezza e adempimenti privacy.

---

## 4. Production readiness — 21/100

**Definizione adottata:** produzione commerciale significa vendere abbonamenti e badge a
clienti paganti, con aspettative di continuità del servizio.

### Blocker assoluti per la produzione

Oltre a tutti i blocker della beta:

| # | Blocker | Evidenza |
|---|---|---|
| 13 | **Nessun provider di pagamento** | Nessuna dipendenza `stripe`/`paypal`/`adyen`. `POST /api/pricing/checkout` crea un `order` `pending` e termina |
| 14 | **Nessun ciclo di vita dell'abbonamento** | Nessun webhook, nessun rinnovo, nessuna disdetta, nessuna fattura, nessun cambio piano |
| 15 | **I piani Team (€49/mese) e Business (€149/mese) non hanno funzionalità corrispondenti** | Nessuna gestione membri, inviti, ruoli o flotta condivisa. Non esiste una collection `companies`: i dati aziendali sono campi anagrafici dentro `users` |
| 16 | **Il badge NFC non esiste come entità** | Nessun `badgeId`, `status`, `issuedAt`, `revokedAt`, `replacementOf`, `tagUID`. Impossibile gestire smarrimento, revoca, sostituzione o magazzino |
| 17 | **La UI dichiara che l'NFC non è disponibile mentre il pricing lo vende come obbligatorio** | `links.nfcFuture` vs `pricing.kit.mandatoryBanner` |
| 18 | **I prezzi dei kit NFC nel codice non corrispondono al listino** | vedi §5 |
| 19 | **Il modello a due badge è ancora vivo nel codice e nella UI** | vedi §5 |
| 20 | **Zero test automatici** | Nessuna copertura su un sistema che maneggia documenti d'identità e pagamenti |
| 21 | **Nessun audit trail** | Impossibile ricostruire chi ha approvato o rifiutato un documento |
| 22 | **Nessun backup verificato né procedura di rollback** | UNKNOWN dal repository |
| 23 | **de/es/fr al 62% in inglese** | Non si può vendere in Germania, Spagna o Francia con un'interfaccia mista |
| 24 | **Cloud Functions in `us-central1`** | `functions/src/index.ts:30` — trasferimento extra-UE di IP, email e geolocalizzazione |

**Stima per raggiungere una produzione commerciale: 5-7 mesi/uomo** a partire dallo stato
attuale, con le decisioni di prodotto già prese.

---

## 5. Verifica del modello commerciale — FASE 16

Confronto riga per riga fra il listino fornito e `src/config/pricing.ts`.

### 5.1 Abbonamenti — **tutti corretti** ✔

| Piano | Listino | `pricing.ts` | Esito |
|---|---|---|---|
| Free | €0 | `priceCents: 0`, `interval: 'year'` | ✔ CONFIRMED |
| Pilot | €99/anno | `priceCents: 9900`, `interval: 'year'` | ✔ CONFIRMED |
| Pilot Pro | €139/anno | `priceCents: 13900`, `interval: 'year'` | ✔ CONFIRMED |
| Team | €49/mese | `priceCents: 4900`, `interval: 'month'` | ✔ CONFIRMED |
| Business | €149/mese | `priceCents: 14900`, `interval: 'month'` | ✔ CONFIRMED |
| Enterprise | preventivo | `priceCents: null`, `interval: 'quote'` | ✔ CONFIRMED |

### 5.2 Badge NFC — **tutti errati tranne due** ❌

| Piano | Listino | `pricing.ts` (`kitPriceCents`) | Differenza | Esito |
|---|---|---|---|---|
| Free | **€24,90** | `3990` = **€39,90** | +€15,00 | ❌ **INCORRECT** |
| Pilot | **€19,90** | `3490` = **€34,90** | +€15,00 | ❌ **INCORRECT** |
| Pilot Pro | incluso | `0`, `kitIncluded: true` | — | ✔ CONFIRMED |
| Team | **€17,90**/pilota | `2990` = **€29,90** | +€12,00 | ❌ **INCORRECT** |
| Business | **€15,90**/pilota | `2790` = **€27,90** | +€12,00 | ❌ **INCORRECT** |
| Enterprise | preventivo | `null` | — | ✔ CONFIRMED |

**Conseguenza immediata:** la pagina `/pricing` oggi mostra al pubblico prezzi dei badge
**da €12 a €15 più alti** di quelli ufficiali. Poiché `src/lib/pricing/quote.ts:103` calcola
il totale a partire da questi stessi valori, anche gli ordini creati in `orders` sarebbero
sbagliati.

### 5.3 Il modello a due badge è ancora vivo — **CONFIRMED**

L'informazione fornita diceva: *"è previsto UN SOLO badge NFC obbligatorio per profilo/pilota,
non due"*. Il codice implementa ancora il modello precedente, e lo fa **in modo visibile
all'utente finale**:

```65:68:src/config/pricing.ts
export const NFC_KIT_CONTENTS_KEYS = [
  'pricing.kit.item.certBadge',
  'pricing.kit.item.insuranceBadge',
] as const;
```

Le stringhe corrispondenti, renderizzate da `src/components/pricing/PricingNfcKitSection.tsx:31`
sulla pagina pubblica `/pricing`:

| Chiave | Inglese | Italiano |
|---|---|---|
| `pricing.kit.item.certBadge` | "1 NFC badge for certificates" | "1 badge NFC per certificati" |
| `pricing.kit.item.insuranceBadge` | "1 NFC badge for insurance" | "1 badge NFC per assicurazione" |
| `pricing.kit.visual.cert` | "CERT" | "CERT" |
| `pricing.kit.visual.ins` | "INS" | "ASS" |
| **`pricing.kit.mandatoryBody`** (IT) | — | *"…**Ogni kit include due badge.**"* |

La frase italiana **dichiara esplicitamente due badge per kit**. Questo spiega anche lo scarto
di prezzo del §5.2: i valori nel codice sono, con ogni probabilità, il prezzo di un kit da due
badge, mentre il listino aggiornato si riferisce a un badge singolo.

**Lavoro necessario per allineare il modello a un badge:** aggiornare i 4 `kitPriceCents`,
ridurre `NFC_KIT_CONTENTS_KEYS` a un elemento, riscrivere 5 chiavi i18n **in tutte e 5 le
lingue**, e rivedere il componente `PricingNfcKitSection.tsx` che mostra due badge affiancati.
Complessità S, priorità alta: è un errore visibile a ogni visitatore della pagina prezzi.

### 5.4 Cosa invece è implementato correttamente ✔

- **Catalogo centralizzato**: `src/config/pricing.ts` con il commento *"All UI and server quote
  logic MUST read from this file. Never trust client-submitted euro amounts."* — e la regola è
  rispettata: nessun importo in euro è hardcoded nella UI.
- **Calcolo server-side**: `src/lib/pricing/quote.ts` ricalcola tutto a partire dal `planId`;
  il client non può inviare un totale.
- **Validazione dei vincoli**: piani individuali rifiutati per clienti `company` e viceversa
  (`quote.ts:60-65`); `operatorCount` limitato da `maxOperators` (Team 25, Business 200).
- **Kit obbligatorio per operatore** sui piani business: `kitQuantity` ha come minimo
  `operatorCount` (`quote.ts:82`).
- **Abbonamento business a canone fisso**, non moltiplicato per operatore — coerente con il
  listino fornito.
- **Prezzi in centesimi interi**, mai in float. Corretto.

### 5.5 Punti da validare con il cliente

1. **Un utente individuale può acquistare fino a 20 kit** (`quote.ts:84`:
   `assertPositiveInt(raw.kitQuantity, 'kitQuantity', 1, 20)`). Se il modello prevede
   **un badge obbligatorio per profilo**, il massimo dovrebbe essere 1.
2. `PRICING_OPERATOR_LIMITS` = Team 25, Business 200. Il commento li definisce "soft caps"
   non pubblicizzati. **Sono i limiti commerciali corretti?**
3. Il piano Free ha un badge a pagamento obbligatorio: è coerente definirlo "Free"?
4. Non esiste logica di upgrade, downgrade, proration o rinnovo. **Come devono comportarsi?**

---

## 6. Percorsi utente critici — FASE 24

| Journey | Funziona | Punto di rottura |
|---|---|---|
| **A — Pilota**<br>signup → onboarding → profilo → drone → certificato → assicurazione → badge → profilo pubblico | ❌ **NO** | **Si rompe al primo passo.** Il signup esegue create client-side negati dalle rules. Anche superandolo: nessun onboarding, e il badge non è attivabile. I passi intermedi (drone, certificato, assicurazione, pubblicazione) **funzionano** se l'account esiste già. |
| **B — Admin**<br>login → utente → verifica documento → approva/rifiuta → stato pubblico | ⚠️ **PARZIALE** | Il flusso tecnico funziona e lo stato si propaga su `dronesPublic`. Manca: **nessuna notifica all'utente**, nessun audit trail, protezione solo client-side. |
| **C — Azienda**<br>azienda → aggiungi pilota → flotta → documenti → ruoli → visibilità | ❌ **NO** | **Non esiste.** Nessuna collection `companies`, nessun membro, nessun invito, nessun ruolo. I dati aziendali sono campi anagrafici in `users`. |
| **D — NFC**<br>tap badge → URL pubblico → profilo → dati visibili → segnalazione drone ritrovato | ⚠️ **PARZIALE** | La parte digitale funziona: `/u/{slug}` risolve, il profilo si vede, il form invia e `submitReport` scrive in `reports`. **Si rompe agli estremi**: il badge fisico non è programmabile (la UI lo dichiara), e **il proprietario non riceve alcuna notifica**. Il valore del prodotto si concentra proprio in questi due estremi. |
| **E — Commerciale**<br>pricing → scelta piano → badge → checkout → pagamento → abbonamento → attivazione | ❌ **NO** | Arriva fino alla creazione di un `order` `pending`. **Nessun pagamento.** Inoltre i prezzi dei badge mostrati sono errati e descrivono due badge invece di uno. |

**Nessuno dei cinque percorsi critici è completo.** Due (A ed E) si interrompono in modo
definitivo, uno (C) non esiste, due (B e D) funzionano nella parte centrale ma sono muti verso
l'utente.

---

## 7. Verifica delle informazioni fornite in premessa

| # | Affermazione da verificare | Esito | Evidenza |
|---|---|---|---|
| 1 | Applicazione full-stack custom | ✔ **CONFIRMED** | Next.js App Router + 24 route handler + 7 Cloud Functions |
| 2 | Next.js 16 | ✔ **CONFIRMED** | `package.json` |
| 3 | React 19 | ✔ **CONFIRMED** | `package.json` |
| 4 | Tailwind CSS 4 | ✔ **CONFIRMED** | `package.json` |
| 5 | Firebase Authentication | ✔ **CONFIRMED** | `src/lib/firebase/auth.ts`, `src/contexts/AuthContext.tsx` |
| 6 | Firestore | ✔ **CONFIRMED** | `firestore.rules`, 20 moduli in `src/lib/firebase/` |
| 7 | Firebase Storage | ✔ **CONFIRMED** | `storage.rules`, `src/lib/firebase/storage.ts` |
| 8 | Firebase Cloud Functions | ✔ **CONFIRMED** | `functions/src/index.ts`, 7 funzioni esportate |
| 9 | Firebase Admin SDK | ✔ **CONFIRMED** | `src/lib/server/firebaseAdmin.ts` |
| 10 | Hosting Netlify o Vercel, non Firebase Hosting | ✔ **CONFIRMED** | `netlify.toml` presente, nessun `vercel.json`, nessun `hosting` in `firebase.json` |
| 11 | Alcune operazioni usano Next.js API / Route Handler | ✔ **CONFIRMED** | 24 file `route.ts` |
| 12 | Alcune operazioni usano Cloud Functions | ⚠️ **PARTIALLY CONFIRMED** | Solo `submitReport` è realmente chiamato dal client. Le altre 5 callable sono deployate ma **non usate**. `bootstrapSlots` è un trigger di autenticazione. |
| 13 | Alcune operazioni Firebase avvengono ancora dal client | ✔ **CONFIRMED** | Tutte le letture, gli update, le delete e gli upload passano dal client SDK; solo i create passano dalle route |
| 14 | Password admin hardcoded in `scripts/create-admin.ts` | ✔ **CONFIRMED** — **ancora presente** | Il file esiste. Il commento in `scripts/grant-admin.ts` che lo dà per eliminato è **falso**. |
| 15 | `/admin` con gate prevalentemente client-side | ✔ **CONFIRMED** | Nessun `middleware.ts`, nessun `proxy.ts`. La protezione è `AuthContext.isAdmin`. |
| 16 | Support e billing incompleti / demo | ✔ **CONFIRMED** | `support.ts:36` lancia `support_unavailable`; nessun provider di pagamento |
| 17 | NFC con URL pubblici `/u/{slug}` | ✔ **CONFIRMED** | `src/app/u/[slug]/`, `src/lib/nfc/payload.ts` |
| 18 | Il badge NFC non è un'entità autonoma nel database | ✔ **CONFIRMED** | Nessuna collection `badges`. Il badge è uno slug sul drone. |
| 19 | `submitReport` usa una callable Firebase | ✔ **CONFIRMED** | `functions/src/submit-report.ts`, invocata via `src/lib/firebase/callable.ts` |
| 20 | Alcune "create entity" passano client → API Next.js → Admin SDK | ✔ **CONFIRMED** | È il percorso di tutti i create |
| 21 | Esistono Cloud Functions parallele che implementano flussi simili | ✔ **CONFIRMED** | `createDrone`, `createOperator`, `createCertificate`, `createDocument`, `createInsurance` duplicano le route Next.js e **non sono chiamate da nessuna parte** |

**Elemento aggiuntivo non presente nelle informazioni fornite, ma rilevante:**
la documentazione del progetto (`README.md`, `.env.local.example`, `docs/DEPLOY_*.md`) descrive
un file `proxy.ts` come "admin route gate". **Quel file non esiste.** Chi si affida alla
documentazione conclude che l'area admin sia protetta lato server: non lo è.

---

## 8. Come leggere questi punteggi

Un punteggio di 21/100 su un prodotto con un frontend da 72/100 può sembrare contraddittorio.
Non lo è: **il prodotto è sbilanciato**, non scadente.

Quello che è stato costruito è, in larga parte, costruito bene. Le Firestore rules con
allow-list per campo, il livello di proiezione pubblica, il calcolo dei preventivi che non si
fida del client, la guardia di build che impedisce di pubblicare un bundle in cui tutti sono
admin: sono scelte di qualità, non frequenti in progetti a questo stadio.

Quello che manca, manca del tutto: pagamenti, notifiche, test, cancellazione account, gestione
aziendale, entità badge. Non sono funzioni "da rifinire": sono funzioni **da scrivere**.

La conseguenza pratica per il nuovo team è che **il lavoro è prevalentemente additivo, non
correttivo**. Con la sola eccezione della decisione sul `DEMO_MODE` (161 punti nel codice) e
della duplicazione backend, non ci sono grovigli da districare prima di poter procedere.
Questa è una buona notizia dal punto di vista della pianificazione: il rischio di sorprese
durante lo sviluppo è più basso di quanto i punteggi bassi suggeriscano.
