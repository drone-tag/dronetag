# DRONETAG — REGISTRO DEL DEBITO TECNICO

> Basato sul commit `b72f843`. Nessuna delle voci qui elencate è stata corretta durante
> l'audit: il documento è un registro, non un changelog.

**Classificazione delle priorità**

| Livello | Significato |
|---|---|
| **P0** | Blocca la produzione / criticità di sicurezza. Da risolvere prima di esporre il sistema a utenti reali. |
| **P1** | Necessario prima di una beta con utenti reali. |
| **P2** | Necessario prima del lancio commerciale (vendita, pagamenti, SLA). |
| **P3** | Miglioramento della qualità e della manutenibilità. |
| **P4** | Nice-to-have. |

**Complessità:** S = ore, M = giorni, L = settimane, XL = più settimane con decisioni architetturali.

---

## 1. Sintesi quantitativa

| Priorità | Voci | Stima aggregata indicativa |
|---|---|---|
| **P0** | 12 | ~3-4 settimane/uomo |
| **P1** | 16 | ~6-8 settimane/uomo |
| **P2** | 14 | ~8-12 settimane/uomo |
| **P3** | 12 | ~4-6 settimane/uomo |
| **P4** | 6 | — |
| **Totale** | **60** | **stima indicativa: 5-7 mesi/uomo** per arrivare a un prodotto commercialmente vendibile |

> La stima è indicativa e non tiene conto di test, code review, iterazioni di prodotto né di
> eventuali decisioni di riprogettazione. Il numero è inteso come ordine di grandezza per la
> pianificazione, non come preventivo.

**Osservazione di contesto:** il debito tecnico di questo progetto è **atipico**. Non è un
codebase disordinato: ci sono **1 solo TODO** in tutto `src/` e `functions/src/`, **4
occorrenze di `any`**, un design system coerente, tipizzazione forte e commenti di qualità.
Il debito non è nella scrittura del codice, ma in **cosa non è stato costruito** (pagamenti,
notifiche, test, cancellazione account) e in **decisioni di architettura rimaste a metà**
(demo mode ovunque, doppia implementazione backend, gate admin client-side).

---

## 2. P0 — Blocca la produzione

| ID | Area | Problema | Impatto | Rischio | Compl. | Dipendenze |
|---|---|---|---|---|---|---|
| **TD-P0-01** | Security | `scripts/create-admin.ts` contiene email e **password amministrativa in chiaro**, committate in git | Chiunque legga il repo può tentare l'accesso admin | **Compromissione totale** | S | Ruotare la password; verificare la visibilità del repo |
| **TD-P0-02** | Security | `storage.rules:49` — `allow read: if true` su `users/{uid}/**`: **documenti d'identità pubblicamente scaricabili** | Esposizione di documenti d'identità | Data breach | M | Serve un proxy autenticato o URL firmati |
| **TD-P0-03** | Privacy | `src/lib/firebase/dronesPublic.ts:203` pubblica `insurancePdfUrl` sul profilo anonimo: il PDF contiene nome, indirizzo e n. polizza in chiaro | Vanifica il mascheramento applicato 3 righe sopra | Data breach | S | — |
| **TD-P0-04** | AuthZ | **Nessun gate server-side su `/admin`.** La protezione è solo client-side (`AuthContext.isAdmin`). `.env.local.example` documenta un `proxy.ts` **che non esiste** | Le pagine admin sono servite a chiunque; la protezione effettiva resta solo sulle rules e sulle API | Alto | M | Decidere fra middleware Next e verifica per-route |
| **TD-P0-05** | Funzionalità | **Il signup è rotto in produzione**: `ensureAccount()`/`ensurePilot()` eseguono `create` client-side su `users`/`pilots`, negati da `firestore.rules` | Nessun nuovo utente può registrarsi | Bloccante assoluto | M | Spostare la creazione su una route server |
| **TD-P0-06** | Security | Artefatti di build committati: 51 file `.netlify/`, fra cui uno zip da 21 MB **contenente un `.env.local`** | Nel file trovato non ci sono chiavi private, ma il pattern è pericoloso | Alto | S | `git rm -r --cached .netlify` + rotazione cautelativa |
| **TD-P0-07** | Security | `firestore.rules` non applica App Check (`TODO V-035` alle righe 30-34) e `NEXT_PUBLIC_RECAPTCHA_*` non risultano configurate | Nessuna difesa contro l'abuso automatizzato | Alto | M | Registrare reCAPTCHA Enterprise |
| **TD-P0-08** | Security | **CSP disattivata per default** (`next.config.ts:164`: solo se `CSP_ENFORCE=true`) | Nessuna difesa in profondità contro XSS | Medio-alto | S | Verificare lo stato della variabile in Netlify |
| **TD-P0-09** | Infra | **Un solo progetto Firebase.** Lo sviluppo locale scrive sui dati di produzione; nessun emulatore configurato | Ogni errore in sviluppo tocca dati reali | Alto | M | Creare `dronetag-staging` |
| **TD-P0-10** | Legale | **Nessuna informativa privacy, nessun termine di servizio, nessuna cookie policy.** Il footer rimanda a `mailto:` | Impossibile trattare dati personali di utenti UE | Legale | M | Richiede input legale |
| **TD-P0-11** | Privacy | **Cancellazione account non implementata.** Nessun `deleteUser`, nessuna cascata, nessun trigger `onDelete` | Diritto art. 17 non esercitabile | Legale | L | Va progettata insieme alla cancellazione dei file Storage |
| **TD-P0-12** | Privacy | **Nessuna raccolta di consenso** alla registrazione né alla pubblicazione del profilo | Base giuridica assente | Legale | S | Dipende da TD-P0-10 |

---

## 3. P1 — Necessario prima della beta

| ID | Area | Problema | Impatto | Rischio | Compl. | Dipendenze |
|---|---|---|---|---|---|---|
| **TD-P1-01** | Funzionalità | **Support non funzionante**: `src/lib/firebase/support.ts:36` lancia `support_unavailable` in modalità live, ma la UI è completa e il profilo indica il support come canale per correggere i dati | Vicolo cieco visibile all'utente | Alto | M | — |
| **TD-P1-02** | Funzionalità | **Reset password assente.** Nessun `sendPasswordResetEmail` nel codice | Un utente che perde la password non può rientrare | Alto | S | Firebase Auth lo offre nativamente: intervento piccolo, impatto grande |
| **TD-P1-03** | Notifiche | **Nessuna email oltre all'OTP.** Nessuna notifica di approvazione, rifiuto, scadenza, drone ritrovato | Il flusso di verifica è muto; il proprietario non sa che il suo drone è stato ritrovato | Alto | L | Resend già integrato: l'infrastruttura c'è |
| **TD-P1-04** | Funzionalità | `submitReport` **non notifica nessuno** — `functions/src/submit-report.ts:122`: *"TODO V-006/V-035: enqueue push + email fanout. For now just log."* | La funzione centrale del prodotto (drone ritrovato) non produce alcun effetto | **Alto — inficia la proposta di valore** | M | Dipende da TD-P1-03 |
| **TD-P1-05** | Testing | **Nessun test.** Nessun Vitest, Jest, Playwright, Cypress; nessun test delle Firestore rules | Ogni modifica alle rules è un salto nel buio | Alto | L | — |
| **TD-P1-06** | Monitoring | **Nessun error monitoring.** 51 `console.*` sono l'unica osservabilità | In produzione gli errori sono invisibili | Alto | S | Sentry o equivalente |
| **TD-P1-07** | Audit | **Nessun audit trail.** Nessun log delle azioni admin, delle verifiche, dei cambi di ruolo | Impossibile ricostruire chi ha fatto cosa | Alto | M | — |
| **TD-P1-08** | Architettura | **`DEMO_MODE` attraversa 161 punti del codice**, con branch `if (DEMO_MODE)` in 20 moduli di `src/lib/firebase/`. `src/lib/demo/` + `src/components/demo/` = **3.381 righe**; `public/demo/` = **2,4 MB** | Ogni funzione di accesso ai dati ha due implementazioni divergenti. `AuthContext.tsx` in demo tratta **ogni utente come admin** | **Alto** | L | Decisione di prodotto: la demo serve ancora? |
| **TD-P1-09** | Backend | **Doppia implementazione dei create.** 6 Cloud Functions callable (`createDrone`, `createOperator`, `createCertificate`, `createDocument`, `createInsurance`) sono deployate ma **non chiamate**: il client usa le route Next.js | Logica e validazione divergono; App Check non protegge il percorso realmente usato | Alto | M | Decidere l'architettura target |
| **TD-P1-10** | Data | **Nessuna cancellazione dei file Storage** quando si elimina un record Firestore | File orfani permanenti, pubblicamente leggibili | Medio-alto | M | Dipende da TD-P0-02 |
| **TD-P1-11** | i18n | de/es/fr al **62% ancora in inglese** (798/796/804 chiavi su 1275), ma offerte come lingue complete | Esperienza rotta per 3 dei 5 mercati dichiarati | Medio | M | O tradurre, o rimuovere dal selettore |
| **TD-P1-12** | UX | **Nessun onboarding.** L'utente atterra su una dashboard vuota senza guida | Conversione bassa; supporto sovraccarico | Medio-alto | M | — |
| **TD-P1-13** | Retention | Nessun TTL configurato. `signupOtp` (contiene email) e `rateLimits` (contengono IP) crescono senza limite | Accumulo di dati personali | Medio | **S** | `signupOtp` ha già `expiresAt`: basta attivare la TTL policy |
| **TD-P1-14** | UX | **Nessun sistema di toast globale**: un salvataggio riuscito è indistinguibile da un no-op | Percezione di inaffidabilità | Medio | S | — |
| **TD-P1-15** | A11y | `Modal` senza focus trap né ripristino del focus | Modali inutilizzabili da tastiera | Medio | S | — |
| **TD-P1-16** | Infra | **Nessuna CI.** Nessun `lint`, nessun `tsc --noEmit` automatico prima del deploy | Regressioni silenziose | Medio | S | — |

---

## 4. P2 — Necessario prima del lancio commerciale

| ID | Area | Problema | Impatto | Rischio | Compl. | Dipendenze |
|---|---|---|---|---|---|---|
| **TD-P2-01** | Billing | **Nessun provider di pagamento.** `POST /api/pricing/checkout` crea un `order` `pending` e si ferma | **Impossibile incassare** | Bloccante commerciale | **XL** | Decisione: Stripe o altro |
| **TD-P2-02** | Billing | Nessun ciclo di vita dell'abbonamento: rinnovo, disdetta, upgrade, downgrade, fatture, webhook | Nessuna gestione post-vendita | Bloccante | XL | Dipende da TD-P2-01 |
| **TD-P2-03** | Prodotto | **Contraddizione sul badge NFC**: `links.nfcFuture` dice *"NFC integration will be available in a future release"*, `/pricing` lo vende a €15,90-24,90 come obbligatorio | Si venderebbe un prodotto che l'app dichiara non pronto | **Bloccante commerciale e reputazionale** | L | Decisione di prodotto |
| **TD-P2-04** | Dati | **Il badge non è un'entità nel database.** È solo uno slug sul drone. Nessun `badgeId`, `status`, `issuedAt`, `revokedAt`, `replacementOf`, `tagUID` | Impossibile gestire smarrimento, revoca, sostituzione, tracciamento di magazzino | Alto | L | Vedi la proposta in `DRONETAG_DATA_MODEL.md` |
| **TD-P2-05** | Funzionalità | **Nessuna funzionalità azienda/team**: niente membri, inviti, ruoli, flotta condivisa | I piani "Team" (€49/mese) e "Business" (€149/mese) non hanno funzionalità corrispondenti | **Bloccante commerciale** | XL | Richiede un modello multi-tenant |
| **TD-P2-06** | Billing | `/account/billing` è in navigazione primaria ma non funziona | Vicolo cieco | Medio | M | Dipende da TD-P2-01 |
| **TD-P2-07** | Privacy | Export dati / portabilità (art. 20) non implementati | Richiesta GDPR non evadibile | Medio | M | — |
| **TD-P2-08** | Privacy | Nessun controllo granulare di visibilità: `Drone.visibility` è tutto-o-niente | L'utente non può pubblicare lo stato assicurativo senza pubblicare la foto | Medio | M | — |
| **TD-P2-09** | Funzionalità | Rettifica dei dati impossibile: profilo in sola lettura + data-lock nelle rules + support non funzionante | Nessun canale per correggere un errore anagrafico | Medio-alto | M | Dipende da TD-P1-01 |
| **TD-P2-10** | UX | **Layout tablet inesistente**: `md:` usato 6 volte contro 329 `sm:` e 61 `lg:` | Esperienza degradata sui dispositivi più probabili per un operatore in campo | Medio | M | — |
| **TD-P2-11** | Copy | Terminologia incoerente: operator (126) / pilot (21) / company (19) / organization (11) / owner (8) / holder (4) | L'utente non capisce cosa sta comprando né cosa sta configurando | Medio | M | Serve un glossario condiviso col cliente |
| **TD-P2-12** | Infra | Cloud Functions in `us-central1` (`functions/src/index.ts:30`): trasferimento extra-UE di IP, email e geolocalizzazione | Esposizione normativa | Medio | M | Migrazione di regione = ridistribuzione |
| **TD-P2-13** | Backup | Backup Firestore non verificabili dal repository; nessuna procedura di ripristino documentata | Perdita di dati non recuperabile | Alto | S | Verificare in Console |
| **TD-P2-14** | Deploy | Nessuna procedura di rollback documentata | Un deploy difettoso non ha una via d'uscita rapida | Medio | S | — |

---

## 5. P3 — Miglioramenti

| ID | Area | Problema | Compl. |
|---|---|---|---|
| **TD-P3-01** | Struttura | Pagine da 600-940 righe con UI, stato e I/O Firebase mescolati: `admin/users/[uid]/page.tsx` (940), `account/insurances/page.tsx` (901), `admin/verify/page.tsx` (701), `account/operators/page.tsx` (622) | L |
| **TD-P3-02** | Struttura | Componenti da 450-510 righe: `AccountDashboard` (509), `PublicProfileCard` (508), `PublicDroneCard` (487), `ProfileForm` (472) | M |
| **TD-P3-03** | Duplicazione | `PublicProfileCard.tsx` e `PublicDroneCard.tsx` (508 + 487 righe) hanno responsabilità sovrapposte — **verificare se una è legacy** | M |
| **TD-P3-04** | Dati | PII duplicata fra `users`, `pilots` e `operators` senza sincronizzazione: nome ed email possono divergere | M |
| **TD-P3-05** | Dati | Collection `profiles` legacy; redirect `/admin/profiles → /admin/users` in `next.config.ts:195-208` | S |
| **TD-P3-06** | Codice | `src/lib/auth/adminAllowlist.ts` definisce `SUPER_ADMIN_EMAILS_LOWER` ma **non è importato da nessuna parte**: codice morto che dà una falsa impressione di controllo | S |
| **TD-P3-07** | Repo | 26 MB di binari nella storia git: zip Netlify (21 MB) + `eng.traineddata` (5,2 MB) | M |
| **TD-P3-08** | UX | 12 voci di navigazione di primo livello, 6 delle quali sono varianti di "documento caricato" | M |
| **TD-P3-09** | UX | `/admin/reports` e `/admin/drones` non compaiono in `AdminSubNav` | **S** |
| **TD-P3-10** | UX | Nessuno skeleton loader (0 `animate-pulse`); layout shift sulle liste | S |
| **TD-P3-11** | A11y | `focus-visible` usato 2 volte con `outline-none` diffuso; nessuno skip link; nessuna `aria-live` | M |
| **TD-P3-12** | Docs | `README.md`, `.env.local.example` e `docs/DEPLOY_*.md` contengono affermazioni false (`proxy.ts` esistente, `create-admin.ts` eliminato, staging configurato) | S |

---

## 6. P4 — Nice-to-have

| ID | Area | Problema |
|---|---|---|
| TD-P4-01 | Perf | `/u/[slug]` usa `<img>` grezzo invece di `next/image`, pur avendo `remotePatterns` già configurato (`next.config.ts:214-223`) |
| TD-P4-02 | Perf | Nessun import dinamico per l'OCR Tesseract (5,2 MB) |
| TD-P4-03 | UI | Nessuna libreria di icone: SVG duplicati inline |
| TD-P4-04 | Build | `turbopack.root` configurato ma `dev`/`build` usano `--webpack` esplicitamente |
| TD-P4-05 | SEO | Nessun `robots.txt`, nessun `sitemap.xml`, nessun `noindex` sui profili pubblici (decisione di prodotto) |
| TD-P4-06 | i18n | Formattazione di date e numeri per locale non verificata (`Intl.*`) |

---

## 7. Debito "invisibile" — le decisioni non prese

Queste non sono voci correggibili con una pull request: sono **decisioni** che il nuovo team
deve prendere prima di poter pianificare il lavoro. Finché restano aperte, ogni stima è
inaffidabile.

| # | Decisione | Perché blocca | Chi decide |
|---|---|---|---|
| 1 | **Il demo mode resta o si rimuove?** 161 punti nel codice, 3.381 righe, 2,4 MB di asset. Se resta, va isolato dietro un'interfaccia; se va rimosso, è un intervento ampio ma meccanico | Condiziona TD-P1-08 e ogni refactoring dello strato dati | Prodotto + tecnico |
| 2 | **Route Next.js o Cloud Functions?** Oggi coesistono due implementazioni dei create; una non è usata | Condiziona TD-P1-09, l'App Check e tutto il lavoro backend | Tecnico |
| 3 | **Il badge NFC è programmabile oggi, sì o no?** La UI dice di no, il pricing lo vende | Condiziona TD-P2-03, TD-P2-04 e l'intera proposta commerciale | Proprietario |
| 4 | **Serve davvero il multi-tenant aziendale?** I piani Team/Business lo presuppongono, il data model non lo prevede | Condiziona TD-P2-05, che è il lavoro più oneroso in assoluto | Proprietario |
| 5 | **Quali dati devono essere pubblici sul profilo?** Oggi: nome, foto, seriale, stato assicurativo **e il PDF integrale della polizza** | Condiziona TD-P0-03, TD-P2-08 e l'informativa privacy | Proprietario + legale |
| 6 | **Il prodotto opera in UE?** Se sì, la regione `us-central1` e l'assenza di informativa sono problemi immediati | Condiziona TD-P0-10, TD-P0-11, TD-P2-12 | Proprietario + legale |
| 7 | **Il modello di prezzo è definitivo?** `src/config/pricing.ts` va confrontato riga per riga con il listino ufficiale | Condiziona TD-P2-01 | Proprietario |

---

## 8. Sequenza di lavoro suggerita

Non è un piano di progetto: è un ordine di dipendenze.

**Settimana 1 — Contenimento**
TD-P0-01, TD-P0-06 (rotazione credenziali, pulizia repo, verifica visibilità GitHub),
TD-P0-08 (`CSP_ENFORCE`), TD-P0-03 (rimozione `insurancePdfUrl`), TD-P3-09.
Sono interventi piccoli con beneficio immediato.

**Settimane 2-4 — Sbloccare il prodotto**
TD-P0-05 (signup rotto — senza questo non esiste beta), TD-P0-04 (gate admin server-side),
TD-P0-02 (Storage), TD-P0-09 (progetto staging), TD-P1-02 (reset password),
TD-P1-13 (TTL), TD-P1-06 (Sentry), TD-P1-16 (CI).

**Mesi 2-3 — Rendere il prodotto onesto**
TD-P1-01 (support), TD-P1-03/04 (notifiche e `submitReport`), TD-P0-11/12 (cancellazione
account e consensi), TD-P0-10 (pagine legali), TD-P1-12 (onboarding), TD-P1-05 (test sulle
rules almeno), decisioni #1 e #2.

**Mesi 4+ — Rendere il prodotto vendibile**
TD-P2-01/02 (pagamenti), TD-P2-03/04 (badge NFC come entità), TD-P2-05 (multi-tenant),
decisioni #3, #4, #7.

---

## 9. Nota sulla qualità del codice esistente

Va detto con chiarezza, perché condiziona il modo in cui il nuovo team deve approcciare il
progetto: **il codice è scritto bene**.

| Indicatore | Valore | Giudizio |
|---|---|---|
| TODO / FIXME / HACK in `src` + `functions/src` | **1** | eccellente |
| Occorrenze di `any` | **4** su 42.056 righe | eccellente |
| Righe di codice `src/` | 42.056 | — |
| Righe di codice `functions/src/` | 992 | — |
| Route handler API | 24 | — |
| Componenti UI riusabili | 21 | buono |
| Chiavi i18n | 1.275 | — |
| Uso di `window.confirm` | **0** (esiste `ConfirmDialog`) | buono |
| Tipizzazione | forte, `TranslationKey` derivato, `PublicDroneCard` come contratto | molto buono |
| Commenti | densi, motivati, con riferimenti a ID di vulnerabilità (`V-035`, `PR-SEC-2`) | molto buono |

**Implicazione pratica:** il nuovo team **non deve riscrivere**. Deve completare quello che
manca e correggere una manciata di decisioni sbagliate. Un refactoring generalizzato
distruggerebbe lavoro valido — in particolare il livello di proiezione pubblica
(`src/lib/utils/publicProjection.ts`), le allow-list per campo nelle Firestore rules, la
guardia di build in `next.config.ts` e il sistema di temi a variabili CSS, che sono tutte
scelte corrette da preservare.
