# Pricing & checkout — implementazione

## Obiettivo

Pagina commerciale pubblica `/pricing`, flusso `/checkout` demo-safe, listino centralizzato e API che **non si fidano** degli importi inviati dal browser.

Stripe / billing reale **non** è collegato (`NoopBillingProvider` già presente in `src/lib/billing/types.ts`).

---

## File creati / modificati

### Nuovi

| File | Ruolo |
|---|---|
| `src/config/pricing.ts` | Listino tipizzato (prezzi, kit, limiti operatori, CTA, flag) |
| `src/lib/pricing/quote.ts` | Calcolo quote server-trusted |
| `src/lib/pricing/demoRequests.ts` | Persistenza locale richieste checkout (demo) |
| `src/app/pricing/page.tsx` | Pagina prezzi |
| `src/app/checkout/page.tsx` | Checkout grafico + submit |
| `src/app/api/pricing/quote/route.ts` | `POST` ricalcolo importi |
| `src/app/api/pricing/checkout/route.ts` | `POST` validazione + registrazione richiesta |
| `src/components/pricing/PricingPlanCard.tsx` | Card piani riutilizzabili |
| `src/components/pricing/PricingAudienceToggle.tsx` | Toggle Privati / Aziende |
| `src/components/pricing/PricingNfcKitSection.tsx` | Sezione kit NFC obbligatorio |
| `src/components/pricing/PricingFaqSection.tsx` | FAQ commerciale |
| `src/components/pricing/PricingVisuals.tsx` | Illustrazioni CSS (badge NFC / profilo) |
| `PRICING_IMPLEMENTATION.md` | Questo documento |

### Modificati

| File | Ruolo |
|---|---|
| `src/components/layout/AppShell.tsx` | Chrome pubblico su `/pricing` e `/checkout` |
| `src/components/landing/PublicHeader.tsx` | Link “Prezzi” |
| `src/components/landing/PublicFooter.tsx` | Link prezzi |
| `src/components/landing/LandingCTA.tsx` | CTA verso pricing |
| `src/lib/i18n/en.ts` (+ `it`, `de`, `es`, `fr`) | Stringhe commerciali |

---

## Cosa è funzionante

- Listino ufficiale in `src/config/pricing.ts` con i prezzi richiesti (centesimi EUR).
- `/pricing`: hero, toggle Privati/Aziende, card, badge **Consigliato** su Pilot Pro, sezione kit NFC, riepilogo costi, FAQ, CTA finale.
- Limiti operatori **configurabili** (`PRICING_OPERATOR_LIMITS`) senza mostrare un tetto marketing definitivo (copy: “piccoli team” / “aziende e flotte”).
- `/checkout`: piano, tipo cliente, operatori (aziende), quantità kit, riepilogo (abbonamento / kit / iniziale / rinnovo), fatturazione, termini, submit.
- API quote/checkout: validazione server, importi **ricalcolati** dal config (il client non può abbassare i prezzi).
- Banner chiaro **“Pagamento non ancora attivo”**.
- Nessuna credenziale di pagamento; nessun dato carta salvato.
- Stile allineato a landing (navy, action blue, card, Tailwind tokens esistenti).

### Esempi riepilogo (come da brief)

| Piano | Iniziale | Rinnovo |
|---|---|---|
| Pilot | 99 € + 34,90 € = **133,90 €** | 99 € / anno |
| Pilot Pro | **139 €** (kit incluso) | 139 € / anno |
| Team | 49 € + (29,90 € × operatori) | 49 € / mese |
| Business | 149 € + (27,90 € × operatori) | 149 € / mese |

---

## Cosa è ancora simulato

- Nessun addebito carta / SEPA / Stripe Checkout.
- Richieste salvate in memoria processo (API) + `localStorage` demo lato client.
- Nessuna collezione Firestore `pricingRequests` / `subscriptions` aggiornata da webhook.
- Enterprise = form di contatto commerciale, non preventivo automatico.
- Feature bullet dei piani sono copy commerciale (non sbloccano ancora slot/entitlement reali).

---

## Collegare un pagamento reale (checklist)

1. Configurare Stripe (o altro) **solo** via env server: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price id per piano.
2. Mappare ogni `PlanId` → `BillingProduct.externalPriceId` in `src/lib/billing/types.ts`.
3. Implementare `StripeBillingProvider` e `setBillingProvider(...)` all’avvio server.
4. In `/api/pricing/checkout`, dopo la quote server-side, chiamare `createCheckoutSession` e redirigere all’URL vendor.
5. Webhook `POST /api/billing/webhook`: verificare firma, aggiornare `subscriptions/{uid}` + `slots/{uid}`.
6. Creare ordini fisici kit NFC (produzione/spedizione) solo dopo `checkout.session.completed`.
7. Firestore rules per eventuali nuove collezioni; mai accettare `amount` dal client.
8. Aggiornare copy FAQ quando il pagamento è live.

---

## Immagini da aggiungere in seguito

Oggi si usano **placeholder CSS** (`PricingVisuals`). Consigliati asset locali in `public/pricing/`:

- foto prodotto badge NFC (certificati + assicurazione);
- mockup profilo pubblico su telefono;
- eventuale foto drone in contesto outdoor (licenza propria / stock con licenza chiara).

Non usare immagini remote a licenza incerta.

---

## Note operative

- Cambiare prezzi / kit / soft-cap operatori: **solo** `src/config/pricing.ts`.
- DE/ES/FR: stringhe pricing allineate all’inglese (IT completo).
- Verifica locale: `npm run dev` → `/pricing` → scegli piano → `/checkout`.
