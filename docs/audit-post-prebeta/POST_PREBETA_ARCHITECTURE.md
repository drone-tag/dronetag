# POST-PREBETA ARCHITECTURE

Unchanged core: Next.js 16 App Router + Firebase. Changes:

```
SIGNUP
  Auth createUser → POST /api/account/provision → Admin SDK
    users/{uid}, pilots/{uid}, slots/{uid}

PUBLISH
  Owner confirms consent → updateDrone visibility
    → POST /api/entities/drones/{id}/publish
    → syncDronePublicSnapshotAdmin() writes dronesPublic/{slug}

FOUND DRONE
  callable submitReport → Firestore reports
    → notify-owner.ts Resend (failure recorded, report kept)

ADMIN
  proxy.ts matcher /admin/* (cookie present?)
  layout.tsx verifyAdminSession() (token + claim)
  API routes still requireAdminFromRequest

SUPPORT
  POST /api/support/thread  (user)
  POST /api/admin/support   (admin)
  Client Firestore writes denied
```

`proxy.ts` is the Next.js 16 file convention (Node runtime). It is **not**
authorization. Endpoint checks remain mandatory.

See also `DRONETAG_ARCHITECTURE.md` (baseline, still accurate for routing map).
