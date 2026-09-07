# POST-PREBETA DATA MODEL

Compatible additive changes only.

| Collection | Change |
|---|---|
| `users` | Optional `acceptedTermsAt` (ISO string) |
| `reports` | `emailNotified`, `notificationAttemptedAt`, `notificationError` |
| `dronesPublic` | Client create/update/delete **denied**; no `insurancePdfUrl` in new writes |
| `supportThreads` | Live; client writes denied |

Storage: `public/users/{uid}/**` (images, anonymous read) vs `users/{uid}/**`
(private). Existing download-URL tokens still work (tokens bypass rules).

No `badges` collection. No `companies` collection. See `DRONETAG_DATA_MODEL.md`.
