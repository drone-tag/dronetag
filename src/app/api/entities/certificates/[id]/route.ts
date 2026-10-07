/**
 * DELETE /api/entities/certificates/[id] — delete a certificate owned by the caller (or
 * any, for admins), cleaning up what references it. See
 * src/lib/server/entityMutations.ts.
 */

import { deleteRoute } from '@/lib/server/entityMutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const DELETE = deleteRoute('certificates');
