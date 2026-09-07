# POST-PREBETA BACKEND AUDIT

Canonical path for new privileged work: **Route Handler + Admin SDK +
`requireUserFromRequest` / `requireAdminFromRequest` + Zod**.

| Operation | Implementation | Duplicated? |
|---|---|---|
| Account provision | Next.js | No |
| Entity creates | Next.js `/api/entities/*` | Functions `create*` **deprecated, still exported** |
| Public snapshot | Next.js publish + `syncPublicDrones` | No client write |
| Support | Next.js | No |
| Verification email | Next.js `email/` | — |
| Found-drone | Cloud Function | Email also exists unused-capable in Next.js `notifyFoundDrone` |
| Slots bootstrap | Functions trigger + provision fallback | Intentional |

Do not delete the five create callables until invocation metrics are zero.
