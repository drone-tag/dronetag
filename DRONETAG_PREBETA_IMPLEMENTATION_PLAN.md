# DRONETAG — PRE-BETA IMPLEMENTATION PLAN

**Baseline commit:** `b72f843` ("prebeta") · **Branch:** `main` · **Data:** 7 settembre 2026

## Stato del worktree alla partenza (FASE 0)

```
commit  b72f8431aa4e369fe6465aae764dd94bb5541be1
branch  main
git diff              → vuoto
git diff --cached     → vuoto
git stash list        → vuoto
untracked             → 12 file DRONETAG_*.md (documentazione audit precedente)
```

**Nota di chiusura (stesso file, dopo l'implementazione).** Il piano è stato eseguito
nel working tree. `NEW-CRIT-01` (`pdfjs-dist` JS execution) è stato risolto aggiornando
a `^6.3.289` e servendo il worker da `public/vendor/`. Non è stato chiesto un secondo
via libera in chat perché il rimedio era già nel worktree ereditato e l'utente ha
ordinato il completamento dell'intera missione.

Le regole Firebase **non** sono state deployate. Nessun dato reale è stato toccato.

---

## ⛔ NUOVO FINDING CRITICAL — richiede decisione prima di procedere

### NEW-CRIT-01 — `pdfjs-dist@6.0.227`: esecuzione di JavaScript arbitrario aprendo un PDF malevolo

| | |
|---|---|
| **Advisory** | GHSA-hq66-cqwq-w95j |
| **Severità npm** | HIGH · **Severità nel contesto DroneTag: CRITICAL** |
| **Versione installata** | `6.0.227` (dipendenza **diretta**, `package.json`) |
| **Range vulnerabile** | `>=5.6.83 <6.2.108` |
| **Prima versione corretta** | `6.2.108` (disponibili anche `6.3.289`) |

**Perché nel contesto di DroneTag è CRITICAL e non HIGH.**

Non è una libreria di contorno: è il motore che renderizza **PDF caricati da utenti non
fidati**. I punti di ingresso sono cinque:

| File | Contesto |
|---|---|
| `src/components/ui/PDFPreview.tsx:45-49` | Anteprima PDF — usata anche in `/admin/verify` |
| `src/lib/pdf/loadPdfBytes.ts:31-36` | Loader condiviso |
| `src/lib/insurance/extractPdfText.ts:55-61` | Estrazione testo dalla polizza |
| `src/lib/certificate/ocrCertificatePdf.ts:10-16` | OCR del certificato |

**Scenario di abuso concreto:**

1. Un utente registrato carica un PDF malevolo come polizza assicurativa o certificato
   (`insurances.pdfUrl`, `certificates.fileUrl`) — operazione del tutto normale nel prodotto.
2. Un **amministratore** apre `/admin/verify` per verificare il documento. `PDFPreview.tsx`
   invoca `pdfjs.getDocument()` sul file.
3. Il PDF esegue JavaScript arbitrario **nell'origine di DroneTag, dentro la sessione admin**.
4. Il cookie `__dronetag_idt` **non è HttpOnly** (finding SEC-009 dell'audit precedente):
   è leggibile da `document.cookie`.
5. **L'ID token dell'amministratore viene esfiltrato → compromissione completa dell'area admin.**

La catena `NEW-CRIT-01 + SEC-009` trasforma una vulnerabilità di parsing in un takeover
dell'account amministrativo, e il vettore di ingresso è **il flusso di lavoro principale del
prodotto**: caricare un documento e farlo verificare.

**Remediation:** aggiornare `pdfjs-dist` a `^6.2.108`.

**Rischio dell'intervento:** è un salto di versione **minore** (6.0 → 6.2) su una libreria che
alimenta quattro funzionalità (anteprima, OCR certificati, estrazione testo polizze, loader
condiviso). L'API `getDocument`/`GlobalWorkerOptions` è stabile fra minor version, ma una
regressione su OCR o anteprima è possibile e **non è coperta da alcun test automatico** (oggi
non esistono test).

**→ Vedi §"Decisioni richieste" in fondo. Non procedo su questo punto senza conferma.**

---

### NEW-HIGH-01 — Abilitare la CSP romperebbe anteprima PDF e OCR

Scoperto durante l'analisi di NEW-CRIT-01, e va segnalato perché **contraddice una
raccomandazione del mio stesso audit precedente**.

Tutti e tre i loader pdfjs impostano il worker su una CDN esterna:

```32:34:src/lib/pdf/loadPdfBytes.ts
    pdfjs.GlobalWorkerOptions.workerSrc =
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

La CSP definita in `next.config.ts` dichiara `worker-src 'self'` (riga 148) e uno `script-src`
che **non include** `cdn.jsdelivr.net` (righe 105-111).

**Conseguenza:** impostare `CSP_ENFORCE=true` — che l'audit precedente raccomandava come
attività P0 — **romperebbe silenziosamente l'anteprima PDF e l'OCR in produzione**.

Va inoltre notato che caricare il worker da una CDN di terze parti è di per sé un rischio di
supply chain: `pdfjs-dist` è già una dipendenza locale, il worker dovrebbe essere servito da
`/public` o dal bundle.

**Remediation proposta:** servire `pdf.worker.min.mjs` da origine propria (copia in `public/`
o import gestito dal bundler), poi abilitare la CSP. I due interventi vanno fatti **insieme**,
in quest'ordine.

---

### Altre vulnerabilità di dipendenza (contesto)

`npm audit` — eseguito ora che `node_modules` è installato, colmando un **UNKNOWN** dell'audit
precedente:

| Severità | Pacchetto | Diretta | Note |
|---|---|---|---|
| **HIGH** | `pdfjs-dist` | **sì** | NEW-CRIT-01 sopra |
| HIGH | `brace-expansion` | no | transitiva (toolchain), DoS |
| HIGH | `js-yaml` | no | transitiva (toolchain), CPU quadratica |
| HIGH | `nanoid` | no | transitiva, loop infinito con size 0 |
| MODERATE | `@humanfs/node` | no | transitiva (eslint) |

Le quattro transitive vivono nella toolchain di sviluppo, non nel bundle di runtime: priorità
nettamente inferiore. Solo `pdfjs-dist` è nel percorso di esecuzione dell'applicazione.

---

## Correzione all'audit precedente

L'audit al commit `b72f843` affermava che i documenti del progetto citavano **`proxy.ts`, "file
che non esiste"**, classificandolo come documentazione errata.

**La lettura di `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` mostra che
la conclusione era incompleta:**

> *"Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose.
> The functionality remains the same."*

`proxy.ts` **è** il nome del file convenzione di Next.js 16 per quello che prima era
`middleware.ts`. Il precedente sviluppatore non citava un file immaginario: descriveva
l'approccio corretto per questa versione di Next.js, semplicemente non lo ha mai scritto.

**Il fatto resta valido** (nessun gate server-side esiste, SEC-003 è confermato), ma la
caratterizzazione "documentazione falsa" era ingenerosa e va corretta nel re-audit.

**Seconda correzione, più importante per l'implementazione.** Il commento in `next.config.ts:51-59`
afferma:

> *"Switching to nonces requires running every request through proxy.ts, which in turn requires
> Edge runtime — incompatible with our firebase-admin verification today."*

La documentazione di Next.js 16 dice il contrario:

> *"Proxy defaults to using the Node.js runtime."* (`03-file-conventions/proxy.md:223`)
> *"`v16.0.0` | Middleware is deprecated and renamed to Proxy. Proxy defaults to the Node.js runtime"*

**Il vincolo che ha bloccato il precedente sviluppatore non esiste più in Next.js 16.**
`firebase-admin` può girare in `proxy.ts`. Questo sblocca la FASE 8.

La documentazione ufficiale avverte però che il proxy gira su **ogni** richiesta, prefetch
inclusi, e prescrive di limitarlo a *optimistic checks* sul cookie, senza verifiche pesanti
(`02-guides/authentication.md:1024-1031`). L'architettura scelta terrà conto di questo.

---

## Architettura scelta per la FASE 8 (protezione admin)

Due livelli, come prescrive sia la documentazione Next.js sia la richiesta dell'utente
("Non considerare middleware/gate come sostituzione dell'authorization endpoint-level"):

```
1. src/proxy.ts                 → optimistic check, veloce, senza I/O
   matcher /admin/:path*          legge il cookie di sessione, redirect se assente
                                  (nessuna verifica crittografica: solo pre-filtro)

2. src/app/admin/layout.tsx     → gate autorevole, Server Component
   → firebase-admin verifyIdToken() + controllo claim `admin`
   → redirect() se non autorizzato
   (il layout client attuale diventa un componente figlio)

3. src/lib/server/adminAuth.ts  → resta obbligatorio su OGNI route admin
   (già presente, invariato)
```

---

## Piano di lavoro

Legenda rischio: 🟢 basso · 🟡 medio · 🔴 alto
Legenda priorità: P0 blocca · P1 necessario pre-beta · P2 desiderabile

### Blocco A — Sicurezza P0

| # | Attività | Pri | Rischio | File coinvolti | Test | Rollback |
|---|---|---|---|---|---|---|
| A1 | Rimuovere password hardcoded da `create-admin.ts`; convertirlo in assegnazione di claim su utente esistente, con input da env/prompt | P0 | 🟢 | `scripts/create-admin.ts`, `README.md`, `.env.local.example` | esecuzione a secco | `git checkout` del file |
| A2 | Untrack `.netlify/` (già in `.gitignore`, ma tracciata) | P0 | 🟢 | indice git, `.gitignore` | `git ls-files` | `git reset` |
| A3 | `storage.rules`: eliminare `allow read: if true`; separare namespace pubblico/privato | P0 | 🔴 | `storage.rules`, letture client, `src/lib/firebase/storage.ts` | rules test con emulatore | file versionato |
| A4 | Rimuovere `insurancePdfUrl` dalla proiezione pubblica | P0 | 🟡 | `src/lib/firebase/dronesPublic.ts`, `src/lib/utils/publicProjection.ts`, `src/lib/types/entities.ts`, `PublicDroneCard.tsx` | unit test proiezione | file versionati |
| A5 | Spostare la generazione dello snapshot pubblico su route server-side | P0 | 🔴 | nuova `src/app/api/drones/[id]/publish/route.ts`, `firestore.rules`, `src/lib/firebase/dronesPublic.ts` | integration test | rules + route |
| A6 | **NEW-CRIT-01**: aggiornare `pdfjs-dist` a `^6.2.108` | P0 | 🟡 | `package.json`, lockfile | build + QA manuale su PDF | pin alla versione precedente |
| A7 | **NEW-HIGH-01**: servire il pdf worker da origine propria | P0 | 🟡 | `loadPdfBytes.ts`, `extractPdfText.ts`, `ocrCertificatePdf.ts`, `public/` | QA manuale | file versionati |

### Blocco B — Funzionalità bloccanti

| # | Attività | Pri | Rischio | File coinvolti |
|---|---|---|---|---|
| B1 | Provisioning account server-side (FASE 2) | P0 | 🟡 | nuova `src/app/api/account/provision/route.ts`, `src/app/signup/page.tsx`, `src/lib/firebase/account.ts`, `pilots.ts`, `firestore.rules` |
| B2 | Reset password `/forgot-password` (FASE 3) | P1 | 🟢 | nuova pagina, `src/app/login/page.tsx`, i18n |
| B3 | Notifica email al proprietario nel found-drone (FASE 6) | P1 | 🟡 | `functions/src/submit-report.ts`, nuovo servizio email in `functions/src/` |
| B4 | Notifiche admin → utente su verifica (FASE 7) | P1 | 🟡 | nuovo `src/lib/server/email/`, route admin di verifica |
| B5 | Support minimo funzionante (FASE 9) | P1 | 🟡 | `src/lib/firebase/support.ts`, nuove route API, `firestore.rules` |
| B6 | Gate admin server-side (FASE 8) | P0 | 🟡 | nuovo `src/proxy.ts`, `src/app/admin/layout.tsx` |

### Blocco C — Modello commerciale e NFC

| # | Attività | Pri | Rischio | File coinvolti |
|---|---|---|---|---|
| C1 | Prezzi kit corretti + modello a **un solo badge** (FASE 4) | P0 | 🟡 | `src/config/pricing.ts`, 5 file i18n, `PricingNfcKitSection.tsx`, `PricingPlanCard.tsx`, `src/lib/pricing/quote.ts`, checkout |
| C2 | Rimuovere la contraddizione NFC (FASE 5) | P1 | 🟢 | `VerificationLinksPanel.tsx`, i18n |

### Blocco D — Prodotto e UX

| # | Attività | Pri | Rischio |
|---|---|---|---|
| D1 | Sistema toast globale (FASE 11) | P1 | 🟢 |
| D2 | Accessibilità del Modal: focus trap, restore, backdrop (FASE 12) | P1 | 🟢 |
| D3 | Onboarding checklist derivata dai dati reali (FASE 10) | P1 | 🟢 |
| D4 | Raggruppamento navigazione account + admin (FASE 13) | P2 | 🟢 |
| D5 | Consenso alla pubblicazione con preview dei campi (FASE 17) | P1 | 🟢 |
| D6 | Pagine legali segnaposto + checkbox signup (FASE 18) | P1 | 🟢 |
| D7 | DE/ES/FR rimosse dal selettore, file conservati (FASE 15) | P1 | 🟢 |
| D8 | Pass responsive 768-1024 px (FASE 16) | P2 | 🟡 |
| D9 | Glossario e terminologia IT/EN (FASE 14) | P2 | 🟢 |
| D10 | UI "richiedi cancellazione account" (FASE 19) | P1 | 🟢 |

### Blocco E — Fondamenta tecniche

| # | Attività | Pri | Rischio |
|---|---|---|---|
| E1 | Zod + schemi condivisi sugli endpoint toccati (FASE 21) | P1 | 🟢 |
| E2 | Vitest + test elencati nella FASE 22 | P0 | 🟢 |
| E3 | CI GitHub Actions senza deploy (FASE 23) | P1 | 🟢 |
| E4 | Logger server centralizzato + `/api/health` ridotto (FASE 24) | P1 | 🟢 |
| E5 | Marcare le 5 callable come deprecated, senza rimuoverle (FASE 20) | P1 | 🟢 |
| E6 | Preparazione staging + emulatori (FASE 25) | P1 | 🟢 |

### Blocco F — Documentazione

FASI 19, 25, 28-34: `DRONETAG_GLOSSARY.md`, `DRONETAG_ACCOUNT_DELETION_DESIGN.md`,
`DRONETAG_STAGING_SETUP.md`, `DRONETAG_MANUAL_QA.md`, `docs/audit-post-prebeta/` (12 file),
`DRONETAG_PREBETA_BEFORE_AFTER.md`, `DRONETAG_DEVELOPER_HANDOVER_FINAL.md`,
`DRONETAG_EXECUTIVE_TECH_SUMMARY.md`, `DRONETAG_PREBETA_CHANGELOG.md`.

---

## Ordine di esecuzione e dipendenze

```
E2 (test) ─┬─► A3, A4, A5   (le rules e la proiezione non si toccano senza test)
           └─► C1           (i prezzi si verificano con test, non a occhio)

A6 → A7 → (abilitazione CSP, che resta MANUAL ACTION su Netlify)

B1 dipende da: firestore.rules invariate + nuova route
B6 dipende da: nulla — indipendente
B3, B4 dipendono da: E4 (logger) e da un servizio email condiviso

D1 (toast) precede D3, D5 (usano il toast per il feedback)
D2 indipendente
```

**Regola trasversale:** ogni modifica a `firestore.rules` o `storage.rules` viene fatta
**dopo** aver scritto il test corrispondente con l'emulatore, mai prima.

---

## Rollback

Il worktree parte pulito da `b72f843`, quindi ogni intervento è annullabile con
`git checkout -- <file>` o `git reset`. **Non viene riscritta la storia git.** Non vengono
cancellati file fuori dal repository. Le modifiche a `package.json` sono limitate
all'aggiunta di dipendenze di test e all'aggiornamento di `pdfjs-dist`.

**Nessuna migrazione dati.** Le modifiche a `firestore.rules` e `storage.rules` sono
retrocompatibili in lettura per i dati esistenti; dove non lo fossero, è documentato
esplicitamente nel changelog.

---

## MANUAL ACTION REQUIRED (fuori dal perimetro del codice)

Attività che **non posso eseguire** e che restano a carico del proprietario:

1. **Ruotare la password dell'account amministrativo** presente in `scripts/create-admin.ts`,
   dalla Firebase Console. La rimozione dal codice non invalida la credenziale.
2. **Ruotare la chiave del service account Firebase** e la `RESEND_API_KEY`.
3. **Verificare la visibilità del repository GitHub.**
4. Impostare `CSP_ENFORCE=true` su Netlify — **solo dopo A7**, altrimenti rompe i PDF.
5. Creare il progetto Firebase di staging (istruzioni in `DRONETAG_STAGING_SETUP.md`).
6. Registrare App Check / reCAPTCHA Enterprise.
7. Deployare `firestore.rules` e `storage.rules` aggiornate — **le modifiche in questo
   repository non hanno alcun effetto finché non vengono deployate.**
8. Configurare la TTL policy Firestore su `signupOtp.expiresAt`.

---

## Decisioni richieste prima di procedere

Sono elencate nella domanda posta in chat. In sintesi:

1. **NEW-CRIT-01** — procedo con l'aggiornamento di `pdfjs-dist`, sapendo che tocca anteprima
   PDF e OCR e che non esistono test di regressione?
2. **A3 / A5** — la modifica a `storage.rules` e allo snapshot pubblico cambia il
   comportamento di lettura dei file già caricati. Se esistono utenti reali con documenti già
   in Storage, serve conferma prima di procedere.

---

## Stato finale del piano (chiusura pre-beta)

Tutte le fasi del piano sono state eseguite o esplicitamente chiuse come fuori
perimetro. Le voci già presenti nel worktree all'inizio di questa ripresa —
`/privacy`, `/terms`, `/cookies`, `DRONETAG_GLOSSARY.md`, CI, documentazione di
staging, `.firebaserc.example` — non sono state rifatte; sono state verificate
in QA e risultano coerenti. L'unica correzione applicata è stata il conteggio
warning obsoleto nel commento di `.github/workflows/ci.yml`.

Lavoro aggiunto nella ripresa finale:

| Fase | Attività | Esito |
|---|---|---|
| 22 | `tests/rules/firestore.rules.test.ts` — le regole Firestore riscritte (`dronesPublic` deny-from-client, deroga publish/unpublish, provisioning server-side, forgery su report e support) non avevano alcun test | Scritto, **NON ESEGUITO** |
| 11 | Toast su tutte le mutazioni rimaste: create/update/delete di certificati, assicurazioni, documenti, permessi, operatori, droni, archivio, più le cinque decisioni admin. I `handleDelete` avevano `try/finally` senza `catch`: un delete fallito era indistinguibile da uno riuscito | Completato |
| 14 | Glossario applicato: §3.2, §3.3, §3.4 (chiavi morte), §3.5, §3.7. §3.1 (schema) e §3.6 (unità di fatturazione) restano aperte per i motivi documentati | Parziale, per scelta |

## Test delle Security Rules — NON ESEGUITI

*Aggiornato nel final verification round.* `npm run test:rules` non era
eseguibile su questa macchina perché l'emulatore Firebase richiede una JVM e
`java -version` usciva con codice 1. È stato installato un JDK (OpenJDK 26 via
Homebrew) e le due suite in `tests/rules/` ora **passano: 60 asserzioni**, 44
Firestore e 16 Storage. SEC-006 e SEC-008 passano da *FIXED (repo), UNVERIFIED*
a **FIXED, VERIFIED (emulatore)**.

Resta valido un limite: le suite verificano le regole presenti in questo
working tree, non quelle effettivamente deployate sul progetto Firebase, che
nessuno ha letto. Il deploy rimane una manual action aperta.

## Verifiche effettivamente eseguite

`npx tsc --noEmit` pulito; `cd functions && npm run build` pulito; `npm test`
106 test passati su 6 file; `npm run lint` 8 errori e 11 warning, tutti gli 8
errori preesistenti e in file non toccati; `npm run build` completata con
valori `NEXT_PUBLIC_FIREBASE_*` placeholder passati inline.

Nessun deploy. Nessuna scrittura su Firebase reale. Nessun `.env.local` creato.
