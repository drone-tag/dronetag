# POST-PREBETA DEPLOYMENT

Still: Netlify + Firebase project `dronetag-e905d`. Still **no staging project
created by this work**.

New in repo:

- `.firebaserc.example`
- `firebase.json` emulator ports
- `DRONETAG_STAGING_SETUP.md`
- CI without deploy (`.github/workflows/ci.yml`)
- `.netlify/` untracked (commit the index deletion)

**Deploy order for staging (manual):**

1. Create Firebase project; never point local `.env` at production if real users exist.
2. `firebase deploy --only firestore:rules,firestore:indexes,storage`
3. `firebase deploy --only functions`
4. Set Netlify env (public Firebase + `FIREBASE_SERVICE_ACCOUNT_KEY` + `RESEND_API_KEY`)
5. Do not set `CSP_ENFORCE=true` until PDF/OCR is verified same-origin

See `DRONETAG_DEPLOYMENT_HANDOVER.md` for the env name list.
