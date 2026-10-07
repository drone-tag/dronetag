import type { DroneClass } from '@/lib/types/entities';

export type DroneCatalogEntry = {
  id: string;
  manufacturer: string;
  model: string;
  classMarking: DroneClass;
  /** Optional i18n key for a short hint shown in the picker. */
  noteKey?: string;
};

/**
 * Curated catalog of common consumer / prosumer UAS.
 * Class markings follow typical EU C-class declarations for current market units.
 * Users can still override class or enter a custom model.
 */
export const DRONE_CATALOG: DroneCatalogEntry[] = [
  // DJI — Mini / Neo / Flip
  { id: 'dji-neo', manufacturer: 'DJI', model: 'Neo', classMarking: 'C0' },
  { id: 'dji-neo-2', manufacturer: 'DJI', model: 'Neo 2', classMarking: 'C0' },
  { id: 'dji-flip', manufacturer: 'DJI', model: 'Flip', classMarking: 'C0' },
  { id: 'dji-mini-2-se', manufacturer: 'DJI', model: 'Mini 2 SE', classMarking: 'C0' },
  { id: 'dji-mini-3', manufacturer: 'DJI', model: 'Mini 3', classMarking: 'C0' },
  { id: 'dji-mini-3-pro', manufacturer: 'DJI', model: 'Mini 3 Pro', classMarking: 'C0' },
  { id: 'dji-mini-4k', manufacturer: 'DJI', model: 'Mini 4K', classMarking: 'C0' },
  { id: 'dji-mini-4-pro', manufacturer: 'DJI', model: 'Mini 4 Pro', classMarking: 'C0', noteKey: 'drone.catalog.note.mini4pro' },
  { id: 'dji-mini-5-pro', manufacturer: 'DJI', model: 'Mini 5 Pro', classMarking: 'C0' },

  // DJI — Air / Avata / Mavic
  { id: 'dji-air-2s', manufacturer: 'DJI', model: 'Air 2S', classMarking: 'C1' },
  { id: 'dji-air-3', manufacturer: 'DJI', model: 'Air 3', classMarking: 'C1' },
  { id: 'dji-air-3s', manufacturer: 'DJI', model: 'Air 3S', classMarking: 'C1' },
  { id: 'dji-avata-2', manufacturer: 'DJI', model: 'Avata 2', classMarking: 'C1' },
  { id: 'dji-mavic-3', manufacturer: 'DJI', model: 'Mavic 3', classMarking: 'C1' },
  { id: 'dji-mavic-3-classic', manufacturer: 'DJI', model: 'Mavic 3 Classic', classMarking: 'C1' },
  { id: 'dji-mavic-3-cine', manufacturer: 'DJI', model: 'Mavic 3 Cine', classMarking: 'C1' },
  { id: 'dji-mavic-3-pro', manufacturer: 'DJI', model: 'Mavic 3 Pro', classMarking: 'C2' },
  { id: 'dji-mavic-3-pro-cine', manufacturer: 'DJI', model: 'Mavic 3 Pro Cine', classMarking: 'C2' },
  { id: 'dji-mavic-4-pro', manufacturer: 'DJI', model: 'Mavic 4 Pro', classMarking: 'C2' },

  // DJI — Enterprise / cinema
  { id: 'dji-mavic-3e', manufacturer: 'DJI', model: 'Mavic 3E', classMarking: 'C2' },
  { id: 'dji-mavic-3t', manufacturer: 'DJI', model: 'Mavic 3T', classMarking: 'C2' },
  { id: 'dji-mavic-3m', manufacturer: 'DJI', model: 'Mavic 3M', classMarking: 'C2' },
  { id: 'dji-matrice-30', manufacturer: 'DJI', model: 'Matrice 30', classMarking: 'C2' },
  { id: 'dji-matrice-30t', manufacturer: 'DJI', model: 'Matrice 30T', classMarking: 'C2' },
  { id: 'dji-matrice-4d', manufacturer: 'DJI', model: 'Matrice 4D', classMarking: 'C2' },
  { id: 'dji-matrice-350', manufacturer: 'DJI', model: 'Matrice 350 RTK', classMarking: 'C3' },
  { id: 'dji-matrice-400', manufacturer: 'DJI', model: 'Matrice 400', classMarking: 'C3' },
  { id: 'dji-inspire-3', manufacturer: 'DJI', model: 'Inspire 3', classMarking: 'C3' },
  { id: 'dji-agras-t40', manufacturer: 'DJI', model: 'Agras T40', classMarking: 'unknown' },
  { id: 'dji-agras-t50', manufacturer: 'DJI', model: 'Agras T50', classMarking: 'unknown' },

  // Autel
  { id: 'autel-evo-nano', manufacturer: 'Autel', model: 'EVO Nano', classMarking: 'C0' },
  { id: 'autel-evo-nano-plus', manufacturer: 'Autel', model: 'EVO Nano+', classMarking: 'C0' },
  { id: 'autel-evo-lite', manufacturer: 'Autel', model: 'EVO Lite', classMarking: 'C1' },
  { id: 'autel-evo-lite-plus', manufacturer: 'Autel', model: 'EVO Lite+', classMarking: 'C1' },
  { id: 'autel-evo-ii-pro', manufacturer: 'Autel', model: 'EVO II Pro', classMarking: 'C2' },
  { id: 'autel-evo-ii-dual', manufacturer: 'Autel', model: 'EVO II Dual 640T', classMarking: 'C2' },
  { id: 'autel-evo-max-4t', manufacturer: 'Autel', model: 'EVO Max 4T', classMarking: 'C2' },

  // Skydio / Parrot / others
  { id: 'skydio-x10', manufacturer: 'Skydio', model: 'X10', classMarking: 'unknown' },
  { id: 'skydio-2-plus', manufacturer: 'Skydio', model: '2+', classMarking: 'unknown' },
  { id: 'parrot-anafi', manufacturer: 'Parrot', model: 'Anafi', classMarking: 'unknown' },
  { id: 'parrot-anafi-usa', manufacturer: 'Parrot', model: 'Anafi USA', classMarking: 'unknown' },
  { id: 'parrot-anafi-ai', manufacturer: 'Parrot', model: 'Anafi Ai', classMarking: 'C2' },
  { id: 'holybro-x500', manufacturer: 'Holybro', model: 'X500 V2', classMarking: 'unknown' },
  { id: 'freefly-alta-x', manufacturer: 'Freefly', model: 'Alta X', classMarking: 'unknown' },
  { id: 'quantaero-trinity', manufacturer: 'Quantum-Systems', model: 'Trinity F90+', classMarking: 'unknown' },
];

export const CUSTOM_DRONE_CATALOG_ID = 'custom';

/** Short class badge text: `C0`…`C4`, or the localized "not available" label. */
export function formatDroneClass(cls: string | null | undefined, t: (key: string) => string): string {
  return !cls || cls === 'unknown' ? t('drone.catalog.classUnknown') : cls;
}

export function droneCatalogLabel(entry: DroneCatalogEntry): string {
  return `${entry.manufacturer} ${entry.model}`.trim();
}

export function searchDroneCatalog(query: string, limit = 40): DroneCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return DRONE_CATALOG.slice(0, limit);
  const scored = DRONE_CATALOG.map((entry) => {
    const hay = `${entry.manufacturer} ${entry.model} ${entry.classMarking}`.toLowerCase();
    let score = 0;
    if (hay.startsWith(q)) score += 40;
    if (entry.model.toLowerCase().startsWith(q)) score += 30;
    if (hay.includes(q)) score += 20;
    for (const token of q.split(/\s+/)) {
      if (token && hay.includes(token)) score += 8;
    }
    return { entry, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.model.localeCompare(b.entry.model));
  return scored.slice(0, limit).map((x) => x.entry);
}

export function findDroneCatalogEntry(id: string): DroneCatalogEntry | undefined {
  return DRONE_CATALOG.find((e) => e.id === id);
}

export function catalogManufacturers(): string[] {
  return [...new Set(DRONE_CATALOG.map((e) => e.manufacturer))].sort((a, b) => a.localeCompare(b));
}
