# DRONETAG — ACCOUNT DELETION DESIGN

> Design only. **No automatic production deletion is implemented.**
> Pre-beta implements a support request (`/account/profile` → `/account/support?subject=Account%20deletion%20request`).

## Why this is not automated yet

Cascading delete across Auth, Firestore, Storage, public snapshots and third-party
logs cannot be undone. There is no verified backup/restore runbook, no legal
retention schedule, and `reports` contain **third-party** finder data. Automating
this without those pieces would create a worse privacy outcome than a manual queue.

## Current product behaviour

| Step | Status |
|---|---|
| User UI “Request account deletion” | Implemented — profile page |
| Ticket recorded in support thread | Implemented — subject preset |
| Automatic Auth/Firestore/Storage delete | **Not implemented** |
| Self-service data export | **Not implemented** |

## Data that must be deleted or reviewed

| Store | Records | Notes |
|---|---|---|
| Firebase Auth | `users` record for uid | After Firestore/Storage cleanup |
| Firestore `users/{uid}` | Account + branding URLs | Source of truth for identity |
| Firestore `pilots/{uid}` | Remote-pilot record | Doc id = uid |
| Firestore `slots/{uid}` | Quota | Doc id = uid |
| Firestore `signupOtp/{uid}` | Email + hash | TTL recommended |
| Firestore `operators`, `drones`, `certificates`, `insurances`, `documents`, `authorizations` | `userId == uid` | Query + batch delete |
| Firestore `dronesPublic/{slug}` | Public snapshots | **Must** be deleted or the NFC URL keeps serving PII |
| Firestore `orders` | Commercial records | May have **legal retention** — do not auto-delete without counsel |
| Firestore `reports` | Finder name, email, GPS, IP | Third-party data. Deleting the owner does not automatically erase finder rights |
| Firestore `supportThreads/{uid}` + messages | Support history | Keep until request is closed, then delete or archive per policy |
| Firestore `rateLimits` | IP in document id | Not keyed by uid |
| Storage `users/{uid}/**` | Private PDFs | Recursive delete |
| Storage `public/users/{uid}/**` | Public branding | Recursive delete |
| Google / Netlify / Resend logs | IP, request metadata | Outside app control |

## Recommended cascade (when implemented)

1. Authenticate the requester (session + optional email confirmation).
2. Write an immutable `deletionRequests/{id}` audit row (`requestedAt`, uid, actor).
3. Set `users/{uid}.deletionStatus = 'pending'` so the UI can show state.
4. Unpublish every drone (`visibility: private` + delete `dronesPublic/{slug}`).
5. Delete Storage prefixes `users/{uid}/` and `public/users/{uid}/`.
6. Delete entity collections where `userId == uid`.
7. Decide legally on `orders` and `reports` (retain / anonymise / delete).
8. Delete `users`, `pilots`, `slots`, support thread.
9. `auth.deleteUser(uid)` last.
10. Record `completedAt` on the audit row.

## Export (portability)

A safe first export is a JSON zip of the owner's Firestore documents **excluding**
other users' data and finder IPs, plus a list of Storage object names (not public
URLs that stay valid forever). Implement only after the same ownership checks as
provisioning (`uid` from token).

## MANUAL ACTION REQUIRED

Until the cascade exists, an administrator who receives a deletion request must
follow the table above by hand in Firebase Console / Admin SDK scripts, and
confirm `dronesPublic` slugs are gone.
