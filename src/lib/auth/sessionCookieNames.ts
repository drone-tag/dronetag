/**
 * Cookie names shared by Proxy, Server Components and /api/*.
 *
 * This module must stay free of Node-only imports (`firebase-admin`, `fs`,
 * etc.). Next.js 16 documents Proxy as defaulting to the Node.js runtime
 * and forbids a `runtime` export
 * (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`).
 * The Netlify `@netlify/plugin-nextjs` adapter still compiles `src/proxy.ts`
 * into an Edge handler (`___netlify-edge-handler-node-middleware`). Importing
 * firebase-admin from that graph crashes production with ERR_MODULE_NOT_FOUND.
 */
export const ID_TOKEN_COOKIE = '__dronetag_idt';
export const SESSION_COOKIE = '__dronetag_session';
