/**
 * PATCH  /api/entities/drones/[id] — update a drone and reconcile its public page.
 * DELETE /api/entities/drones/[id] — delete a drone, its public page and policy links.
 *
 * Owners may edit their own drones within the policy described in
 * src/lib/server/entityMutations.ts; admins may edit any drone.
 */

import { NextResponse } from 'next/server';
import { requireUserFromRequest } from '@/lib/server/requestAuth';
import { deleteRoute, mutationErrorResponse, updateDroneServer } from '@/lib/server/entityMutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUserFromRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  try {
    const result = await updateDroneServer(id?.trim() ?? '', body as Record<string, unknown>, auth);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return mutationErrorResponse(err, 'drones.update.failed', { droneId: id });
  }
}

export const DELETE = deleteRoute('drones');
