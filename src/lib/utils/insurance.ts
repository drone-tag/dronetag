import type { Insurance } from '@/lib/types/entities';

/** Normalize legacy docs that only have `droneId` into a `droneIds` array. */
export function normalizeInsuranceDroneIds(
  droneIds: unknown,
  droneId: string | null,
): string[] {
  const fromArray = Array.isArray(droneIds)
    ? droneIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    : [];
  if (fromArray.length > 0) return [...new Set(fromArray)];
  if (droneId) return [droneId];
  return [];
}

export function primaryInsuranceDroneId(insurance: Pick<Insurance, 'droneIds' | 'droneId'>): string | null {
  return insurance.droneIds[0] ?? insurance.droneId ?? null;
}
