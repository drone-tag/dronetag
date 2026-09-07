# DRONETAG — CANONICAL GLOSSARY

> Status: working document, maintained by the engineering team.
> Written by reading the code, not the marketing copy. Every codebase reference below was
> checked against the files and line numbers cited, at the state of the working tree on
> 7 September 2026.
>
> This document is **descriptive of the required vocabulary and prescriptive for future work**.
> It does not change any string in the product. Section 3 lists the places where the current
> product violates the vocabulary, so that a later pass can fix them deliberately rather than
> piecemeal.

---

## 1. Why this document exists

DroneTag currently uses "pilot" and "operator" as if they were two words for the same person.
They are not. In drone regulation these are two distinct roles that can be held by different
people, and conflating them is not a style problem — it produces a public page that asserts
something about a person which may simply not be true.

A concrete example from the current data model. The Firestore collection `pilots/{uid}` is
labelled "Pilot identity" in the interface, but two of its fields are labelled "Operator code"
and "Operator license". The admin screen at `src/app/admin/users/[uid]/page.tsx` renders a card
titled with `admin.users.detail.pilot` ("Pilot identity", `src/lib/i18n/en.ts:1217`) whose
inputs are labelled with `field.operatorCode` (`src/lib/i18n/en.ts:280`) and
`field.operatorLicense` (`src/lib/i18n/en.ts:288`). An administrator filling in that form has no
way to know which of the two roles they are describing.

The second example is the public page. `PublicDroneCard` renders one section whose heading is
`publicDrone.holderSection` — literally "Operator / pilot" (`src/lib/i18n/en.ts:974`) — and then
a single row whose label is chosen at runtime between "Pilot", "Operator" and "Operator
(company)" depending on which record happened to be linked
(`src/components/profile/PublicDroneCard.tsx:72-81`). The visitor is shown one name and told it
is either of two legally distinct roles. That is the ambiguity this glossary is meant to end.

---

## 2. Canonical terms

### 2.1 Remote Pilot / Pilota remoto

**Definition.** The natural person who actually operates the flight controls of the aircraft
during a given flight. This is always a specific human being, never a company. The remote pilot
is the holder of the competency certificate or attestation (in the EU framework, the A1/A3, A2
or STS categories the product already models in `CertificateKind`).

**Codebase mapping.** The Firestore collection `pilots/{uid}`, typed as `Pilot` in
`src/lib/types/entities.ts:20-34`. There is exactly one pilot record per application account:
the document id *is* the account uid, and the record is created server-side at signup alongside
`users/{uid}` and `slots/{uid}` by `POST /api/account/provision`
(`src/app/api/account/provision/route.ts`, where the comment already calls it "the personal
remote-pilot record, always 1:1 with the account"). A drone points at one via
`Drone.linkedPilotId` (`src/lib/types/entities.ts:93`). The display name comes from
`pilotDisplayName()` in `src/lib/utils/entities.ts:129-132`, which is first name plus last name
and nothing else.

**Must not be confused with.** The UAS Operator. A remote pilot may fly for an operator they do
not own and are not legally responsible for. Also not to be confused with the User: the pilot
record is auto-created 1:1 with the account today, but that is an implementation shortcut, not
a statement that every account holder is a remote pilot. A company account has a pilot record
too, and for a company account that record is meaningless.

**Known defect in the mapping.** `Pilot.operatorCode` and `Pilot.operatorLicense`
(`src/lib/types/entities.ts:29-30`) are operator-level identifiers living on the pilot record.
See §3.1.

---

### 2.2 UAS Operator / Operatore UAS

**Definition.** The natural or legal person who is legally responsible for the operation of the
aircraft: registration with the competent authority, insurance cover, operational
authorisations, and accountability for the flight. This can be an individual or a company. The
operator registration number is issued to this entity, not to the pilot.

**Codebase mapping.** The Firestore collection `operators/{id}`, typed as `Operator` in
`src/lib/types/entities.ts:58-70`. Unlike the pilot record there can be several per account —
up to three, enforced by `MAX_OPERATORS` (`src/lib/types/entities.ts:316`) and by the operator
slot quota. Each record carries a `kind` of `'private'` or `'company'` and persists both
shapes, with only the one matching `kind` meaningful. A drone selects one via
`Drone.defaultOperatorId`, and may temporarily override it for at most twenty-four hours via
`Drone.activeOperatorId` and `Drone.activeOperatorUntil`; the resolution rule is
`effectiveOperatorId()` in `src/lib/utils/entities.ts:94-105`, and the twenty-four-hour clamp is
enforced in `firestore.rules` by `activeOperatorUpdateValid()`.

**Must not be confused with.** The Remote Pilot, for the reasons above. Also not to be confused
with the Company: a UAS operator can be a private individual, and `operator.kind === 'private'`
is the normal case for a hobbyist. "Operator" is a role in an operation; "company" is a type of
legal entity.

---

### 2.3 Company / Azienda

**Definition.** A commercial legal entity — a firm with a VAT number or an equivalent registry
identifier. In DroneTag a company is never a pilot; it can be a UAS Operator, and it can be the
holder of an application account.

**Codebase mapping.** Two separate places, which is itself a hazard.

| Where | Field | Meaning |
|---|---|---|
| `users/{uid}` | `accountType: 'company'`, plus `companyName`, `companyContactPerson`, `companyVat`, `companyUniqueNumber` (`src/lib/types/account.ts:38-71`) | The account is held by a company |
| `operators/{id}` | `kind: 'company'`, plus the `company` sub-object with `companyName`, `contactPerson`, `vatNumber`, `uniqueCompanyNumber` (`src/lib/types/entities.ts:49-56`) | This operator entity is a company |

Nothing in the code keeps those two in step. An account of type `private` can own an operator of
kind `company`, and vice versa. That is arguably legitimate — a private individual may administer
a company's operator registration — but it means "is this a company?" has two different answers
depending on which record you ask, and any future UI that asks the question must say which one
it means.

**Must not be confused with.** The UAS Operator role. A company that appears on a public drone
page appears there because it is the effective *operator* of that drone, not merely because it
is a company.

---

### 2.4 Owner / Proprietario

**Definition.** The person or entity that owns the aircraft as physical property. This matters
when it differs from the operator: a leased or club-owned drone is operated by someone who does
not own it, and a found-drone report reaches the operator rather than the owner.

**Codebase mapping — none.** This is the honest answer, and it is worth stating plainly: there
is no representation of a physical owner distinct from the operator anywhere in the data model.
`Drone.userId` (`src/lib/types/entities.ts:80`) is the *account* the drone record belongs to,
and `Report.ownerUserId` (`src/lib/types/entities.ts:346`) is that same account uid denormalised
onto a found-drone report so the security rules can authorise the read. Both are about record
ownership in the database, not about property in the aircraft.

**Must not be confused with.** The account holder. The word "owner" appears throughout the code
and the security rules ("the owner can update", "owner + admin only") meaning *the account that
owns this database record*. If a real ownership concept is ever introduced, it will need a
different word in code, because "owner" is already taken and reusing it would create exactly the
ambiguity this document is trying to remove.

---

### 2.5 User / Utente

**Definition.** An application account: a set of sign-in credentials plus the records attached
to them. A purely technical concept with no aviation meaning.

**Codebase mapping.** A Firebase Auth identity plus the Firestore document `users/{uid}`, typed
as `UserAccount` in `src/lib/types/account.ts:38-71`. Every other record in the product hangs off
this uid, either through the document id (`pilots/{uid}`, `slots/{uid}`, `supportThreads/{uid}`)
or through a `userId` field (`operators`, `drones`, `insurances`, `certificates`, `documents`,
`authorizations`, `orders`).

**Must not be confused with.** All four terms above. One account currently implies exactly one
pilot record, but it may hold up to three operators, and it may hold none of the aviation roles
at all — an administrator account is a user and nothing else.

---

### 2.6 Quick reference

| English | Italian | Is a person? | Codebase home | Cardinality per account |
|---|---|---|---|---|
| Remote Pilot | Pilota remoto | Always | `pilots/{uid}` | Exactly 1 (auto-created) |
| UAS Operator | Operatore UAS | Person or company | `operators/{id}` | 0 to 3 |
| Company | Azienda | Never | `users.accountType` and `operators.kind` | n/a |
| Owner | Proprietario | Person or company | **Not modelled** | n/a |
| User | Utente | n/a (an account) | Firebase Auth + `users/{uid}` | 1 |

---

## 3. Audit: where the current product breaks this vocabulary

Each entry names the file, the line, and the exact string. The severity column reflects how
misleading the string is to a reader who does not already know the data model, not how hard it
is to fix.

> **Update — pre-beta pass.** This section was written as a pure audit ("nothing below has been
> changed"). That is no longer true: the entries marked **APPLIED** below were subsequently
> fixed. Line numbers in those entries refer to the state *before* the fix and no longer
> resolve. The entries are kept rather than deleted so the reasoning stays with the change.
>
> | Entry | State |
> |---|---|
> | §3.1 Operator identifiers on the pilot record | **OPEN** — schema migration, out of scope |
> | §3.2 Admin card mixes the two roles | **APPLIED** (labels + warning; schema still §3.1) |
> | §3.3 Public page merges the roles | **APPLIED** |
> | §3.4 Legacy dashboard vocabulary | **PARTLY APPLIED** — the two dead keys were deleted; the legacy `Profile` strings remain |
> | §3.5 Landing page addresses one role | **PARTLY APPLIED** — `home.preview.operatorRole` fixed; the audience cards are unchanged |
> | §3.6 Pricing billing unit | **OPEN** — needs a commercial decision, not an edit |
> | §3.7 Checkout copy is factually wrong | **APPLIED** |
> | §3.8 / §3.9 Strings that are correct | Unchanged, as intended |

### 3.1 Operator identifiers stored on the pilot record

| Location | String |
|---|---|
| `src/lib/types/entities.ts:29` | `operatorCode: string;` — a field of `interface Pilot` |
| `src/lib/types/entities.ts:30` | `operatorLicense: string;` — a field of `interface Pilot` |
| `src/lib/i18n/en.ts:280` | `'field.operatorCode': 'Operator code'` |
| `src/lib/i18n/en.ts:288` | `'field.operatorLicense': 'Operator license'` |
| `src/lib/i18n/it.ts:271` | `'field.operatorCode': 'Codice operatore'` |
| `src/lib/i18n/it.ts:279` | `'field.operatorLicense': 'Patente operatore'` |

**Severity: high.** This is the root of the confusion, and it is in the schema rather than in a
label, so fixing it is a migration and not a rename. Two operator-level identifiers live on the
record that the product calls the pilot. The `operators` collection, which is where an operator
registration number belongs, has no field for one at all.

Note also that the Italian for `field.operatorLicense` is "Patente operatore" — "operator
driving licence". There is no such thing; a remote pilot holds an *attestato* (a competency
certificate, which the product models separately in `certificates`), and an operator holds a
*registrazione*. Whichever of the two this field is meant to hold, the Italian label names a
third thing that does not exist.

### 3.2 A card titled "Pilot" containing fields titled "Operator"

| Location | String |
|---|---|
| `src/app/admin/users/[uid]/page.tsx:444` | `{t('admin.users.detail.pilot')}` — the `<h3>` of the card |
| `src/app/admin/users/[uid]/page.tsx:461` | `<Input label={t('field.operatorCode')} name="pOpCode"` |
| `src/app/admin/users/[uid]/page.tsx:463` | `<Input label={t('field.operatorLicense')} name="pOpLic"` |
| `src/lib/i18n/en.ts:1217` | `'admin.users.detail.pilot': 'Pilot identity'` |
| `src/lib/i18n/it.ts:1194` | `'admin.users.detail.pilot': 'Identità pilota'` |

**Severity: high.** This is §3.1 made visible to an administrator, who is the person least able
to afford the ambiguity because they are the one who decides whether to grant a verification
badge.

### 3.3 The public page merges the two roles into one heading

| Location | String |
|---|---|
| `src/components/profile/PublicDroneCard.tsx:266` | `<Section title={t('publicDrone.holderSection')} icon={<IconUser />}>` |
| `src/lib/i18n/en.ts:974` | `'publicDrone.holderSection': 'Operator / pilot'` |
| `src/lib/i18n/it.ts:953` | `'publicDrone.holderSection': 'Operatore / pilota'` |
| `src/lib/i18n/en.ts:971` | `'publicDrone.holderPilot': 'Pilot'` |
| `src/lib/i18n/en.ts:972` | `'publicDrone.holderOperatorPrivate': 'Operator'` |
| `src/lib/i18n/en.ts:973` | `'publicDrone.holderOperatorCompany': 'Operator (company)'` |

**Severity: high.** This is the only one of these strings a member of the public ever reads. The
heading says the name below is one of two roles without saying which, and the reader has to
infer the answer from the row label. Two further details make the fallback path worth fixing at
the same time. First, `holderRoleKey()` (`src/components/profile/PublicDroneCard.tsx:72-81`)
selects "Pilot" through a `default:` branch rather than an explicit `case 'pilot':`, so any
`holderKind` value the snapshot might carry that the component does not recognise renders as
"Pilot" rather than failing visibly. Second, `projectSnapshot()`
(`src/lib/firebase/dronesPublic.ts:173-181`) initialises `holderKind` to `'pilot'` and
`holderDisplayName` to an em-dash before looking for an operator or a pilot, so a drone with
neither linked is published as a page that says "Pilot: —".

### 3.4 The legacy dashboard calls an operator profile whatever is convenient

| Location | String |
|---|---|
| `src/lib/i18n/en.ts:314` | `'dashboard.name': 'Operator'` — a table column header |
| `src/lib/i18n/en.ts:316` | `'dashboard.operatorCode': 'Operator code'` |
| `src/lib/i18n/en.ts:610` | `'dashboard.title': 'Operator Profiles'` |
| `src/lib/i18n/en.ts:612` | `'dashboard.createNew': 'Register operator'` |
| `src/lib/i18n/en.ts:632` | `'form.person': 'Operator Identity'` |
| `src/lib/i18n/en.ts:633` | `'form.person.desc': 'Personal identification and contact details for the operator.'` |
| `src/lib/i18n/en.ts:673` | `'public.operatorProfile': 'Operator Profile'` |
| `src/lib/i18n/en.ts:675` | `'public.identity': 'Operator Identity'` |

**Severity: medium, but check before touching.** These belong to the legacy single-`Profile`
model. `'form.person'` labels a section of `ProfileForm` that collects a *person's* name, date
of birth and nationality while calling it "Operator Identity" — the same conflation as §3.2 in
the opposite direction. Note that `dashboard.name` and `account.section.pilot`
(`src/lib/i18n/en.ts:710`, `'Pilot identity'`) are **not referenced anywhere outside the
translation files**; a grep across `src/` excluding `src/lib/i18n/` returns nothing for either.
They are dead keys. Deleting them is cheaper than renaming them, but the deletion has to touch
all five language files together or the build breaks.

### 3.5 The landing page addresses only one of the two roles

| Location | String |
|---|---|
| `src/lib/i18n/en.ts:546` | `'home.audience.operator.title': 'I am an operator'` |
| `src/lib/i18n/en.ts:547` | `'home.audience.operator.desc': 'View and share certificates, insurance, and linked drones.'` |
| `src/lib/i18n/it.ts:537` | `'home.audience.operator.title': 'Sono un operatore'` |
| `src/lib/i18n/it.ts:538` | `'home.audience.operator.desc': 'Consulta e mostra certificati, assicurazioni e droni associati.'` |
| `src/components/landing/AudienceCard.tsx:53-55` | the card that renders those three keys |

**Severity: medium.** The card is titled "I am an operator" and then offers certificates, which
are a remote pilot's credential rather than an operator's. There are exactly three audience
cards — operator, administrator, verifier (`src/components/landing/AudienceCard.tsx:53-71`) —
and no card for a remote pilot, even though the pilot record is the one thing every account gets
automatically.

Related, on the same page: `'home.hero.eyebrow': 'DIGITAL IDENTITY FOR UAS OPERATORS'`
(`src/lib/i18n/en.ts:522`) and `'home.preview.operatorRole': 'UAS operator · AeroFly Srl'`
(`src/lib/i18n/en.ts:533`). The second is the more interesting one: the mock preview shows a
person's name, "Marco Bianchi" (`src/lib/i18n/en.ts:532`), labelled as a UAS operator, with a
company name after it. Under the vocabulary in §2 that would make AeroFly Srl the operator and
Marco Bianchi the remote pilot, which is the opposite of what the label says.

### 3.6 Pricing uses "Pilot" as a plan name and "operator" as a billing unit

| Location | String |
|---|---|
| `src/config/pricing.ts:101` | `id: 'pilot',` |
| `src/config/pricing.ts:122` | `id: 'pilot-pro',` |
| `src/lib/i18n/en.ts:1421` | `'pricing.plan.pilot.name': 'Pilot'` |
| `src/lib/i18n/en.ts:1422` | `'pricing.plan.pilot.audience': 'For individual pilots'` |
| `src/lib/i18n/en.ts:1412` | `'pricing.kit.note': 'On Pilot Pro the kit is included in the annual price. On business plans the kit is charged once per operator.'` |
| `src/lib/i18n/en.ts:1467` | `'pricing.faq.kit.a': '… Business plans charge the kit once per operator.'` |

**Severity: low for the plan names, medium for the billing unit.** "Pilot" and "Pilot Pro" as
plan names are ordinary product branding and can stay, as long as nobody reads them as a claim
about a role. The billing sentence is the problem: "charged once per operator" is ambiguous
between "once per UAS operator entity, of which an account may hold three" and "once per person
using the product". Those are different prices. `src/config/pricing.ts:76` comments "Exactly one
badge per pilot / profile", which is a third reading again.

### 3.7 One badge per pilot, but the badge points at a drone

| Location | String |
|---|---|
| `src/lib/i18n/en.ts:1492` | `'pricing.checkout.kitsHint': 'One NFC badge per remote pilot. The badge links to that pilot's public DroneTag profile.'` |
| `src/lib/i18n/it.ts:1454` | `'pricing.checkout.kitsHint': 'Un badge NFC per pilota remoto. Il badge rimanda al profilo pubblico DroneTag di quel pilota.'` |
| `src/app/checkout/page.tsx:218,224` | both render `t('pricing.checkout.kitsHint')` |

**Severity: high — this one is factually wrong, not merely ambiguous.** This is the only string
in the product that uses the correct term "remote pilot", and it uses it to describe something
that does not exist. There is no public pilot profile. The public URL is `/u/{slug}` where the
slug belongs to a *drone*: `Drone.slug` (`src/lib/types/entities.ts:81`) is the document id of
the public snapshot at `dronesPublic/{slug}`, and `src/app/u/[slug]/page.tsx` resolves the slug
against that collection and nothing else. A badge is per drone, and the page it opens is a
drone's page that happens to name a holder.

### 3.8 Drone form fields, where the vocabulary is actually correct

| Location | String |
|---|---|
| `src/lib/i18n/en.ts:761` | `'drone.field.defaultOperator': 'Default operator'` |
| `src/lib/i18n/en.ts:762` | `'drone.field.linkedPilot': 'Linked pilot'` |
| `src/lib/i18n/en.ts:1076` | `'activeOp.section.title': 'Active operator'` |
| `src/lib/i18n/en.ts:735-736` | `'operator.kind.private': 'Private individual'`, `'operator.kind.company': 'Company'` |

**No change needed.** Recorded here because it is the one screen that already separates the two
roles properly, and because it is the model the rest of the product should be brought in line
with. The drone form asks for a default operator and a linked pilot as two distinct fields
pointing at two distinct collections, and the temporary-operator panel is explicitly about the
operator and never mentions the pilot.

### 3.9 Strings that are correct as written

Two more worth recording so a future rename pass does not "fix" them by mistake:

- `'publicDrone.disclaimer'` (`src/lib/i18n/en.ts:997`) reads "…does not replace official
  operator registration, pilot certification, insurance obligations or authority-issued
  documentation." It distinguishes operator registration from pilot certification correctly, and
  it is the clearest existing statement of the difference anywhere in the product.
- `'insurance.link.operator': 'Operator'` (`src/lib/i18n/en.ts:812`) labels the choice of whether
  a policy is issued to a drone or to an operator. Insurance is genuinely an operator-level
  obligation, so this is right.

---

## 4. What a fix would involve

Recorded so the size of the job is visible. Items 2, 3 and 4 (partly) and 5 were carried out in
the pre-beta pass; see the status table at the head of §3. Items 1 and 6 remain.

1. **Schema.** Move `operatorCode` and `operatorLicense` off `Pilot`. The operator registration
   number belongs on `Operator`; if a pilot-level identifier is also needed it should be named
   for what it is. This touches `src/lib/types/entities.ts`, `firestore.rules` (both the
   `pilots` and the `operators` update allow-lists), `src/app/api/account/provision/route.ts`,
   the admin user detail screen, and any existing documents in Firestore.
2. **Public page.** Split `publicDrone.holderSection` into two explicit rows, or commit to showing
   the operator only and say so. Replace the `default:` branch in `holderRoleKey()` with explicit
   cases so a new `holderKind` fails loudly instead of silently reading "Pilot".
3. **Checkout copy.** Rewrite `pricing.checkout.kitsHint` in all five language files to say that a
   badge is issued per drone and opens that drone's public page.
4. **Landing page.** Decide whether the audience card is addressing a remote pilot or a UAS
   operator, and say which. Fix `home.preview.operatorRole` so the mock does not label a person
   with a company's role.
5. **Dead keys.** Delete `dashboard.name` and `account.section.pilot` from all five language
   files in one commit, since `TranslationKey` is derived from `en.ts` and the other four files
   are type-checked against it.
6. **Billing unit.** Get a decision on what "per operator" means in the pricing copy before it
   reaches a customer, then make the string say it.
