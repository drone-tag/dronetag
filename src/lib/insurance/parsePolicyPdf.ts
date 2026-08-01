/**
 * Heuristic parser for Italian / EU drone liability insurance PDFs.
 * Extracts holder, provider, policy number, validity dates, and one or
 * more covered UAS (a single policy often lists several aircraft).
 */

export interface ParsedCoveredDrone {
  manufacturer: string;
  model: string;
  registrationMark: string;
}

export interface ParsedPolicyFields {
  holderName: string;
  provider: string;
  policyNumber: string;
  issueDate: string;
  expiryDate: string;
  /** All aircraft / UAS rows found on the schedule (may be empty). */
  coveredDrones: ParsedCoveredDrone[];
  /** First covered drone — kept for older callers / UI chips. */
  droneManufacturer: string;
  droneModel: string;
  droneRegistrationMark: string;
  /** True when at least one field was extracted but not all key fields. */
  partial: boolean;
}

const KNOWN_PROVIDERS = [
  'Allianz',
  'Generali',
  'Unipol',
  'AXA',
  'Zurich',
  'Hiscox',
  'Lloyd',
  'Chubb',
  'Aviva',
  'Reale Mutua',
  'Sara Assicurazioni',
  'Vittoria Assicurazioni',
  'Groupama',
  'Helvetia',
  'Bene Assicurazioni',
  'Coverdrone',
  'Cover4Drones',
  'Flock',
];

const DATE_TOKEN =
  /(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})/g;

function toIsoDate(day: string, month: string, year: string): string {
  let y = year;
  if (y.length === 2) y = `20${y}`;
  return `${y}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function parseDateToken(token: string): string | null {
  const m = token.match(/^(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})$/);
  if (!m) return null;
  return toIsoDate(m[1], m[2], m[3]);
}

function collectDates(text: string): string[] {
  const found: string[] = [];
  for (const m of text.matchAll(DATE_TOKEN)) {
    const iso = toIsoDate(m[1], m[2], m[3]);
    if (!found.includes(iso)) found.push(iso);
  }
  return found.sort();
}

function extractPolicyNumber(text: string): string {
  const patterns = [
    /(?:n[\s°.]*polizza|numero\s+polizza|polizza\s+n[\s°.]*|policy\s*(?:no|number|#)?)\s*[:.]?\s*([A-Z0-9][A-Z0-9\-\/\.]{3,})/i,
    /(?:certificato|certificate)\s*(?:n[\s°.]*)?\s*[:.]?\s*([A-Z0-9][A-Z0-9\-\/\.]{3,})/i,
    /\b(CDA[A-Z0-9]{6,})\b/i,
  ];
  for (const rx of patterns) {
    const m = text.match(rx);
    if (m?.[1]) return m[1].trim();
  }
  return '';
}

function normalizeDroneToken(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

function titleCaseDroneName(raw: string): string {
  const s = normalizeDroneToken(raw);
  if (!s) return '';
  if (s.length <= 4 && s === s.toLowerCase()) return s.toUpperCase();
  return s.replace(/\b([a-zà-öø-ÿ])([a-zà-öø-ÿ]*)/gi, (_, a: string, b: string) => a.toUpperCase() + b);
}

function droneKey(d: ParsedCoveredDrone): string {
  return `${d.manufacturer}|${d.model}|${d.registrationMark}`.toLowerCase();
}

function pushUniqueDrone(list: ParsedCoveredDrone[], next: ParsedCoveredDrone) {
  if (!next.manufacturer && !next.model && !next.registrationMark) return;
  if (list.some((d) => droneKey(d) === droneKey(next))) return;
  list.push(next);
}

/**
 * Extract every UAS / aircraft row from the policy schedule.
 * Scenarios the heuristics try to cover:
 * - Single drone (Marca/Tipo or Coverdrone summary table)
 * - Multi-drone schedule (repeated Marca/Tipo or make/model pairs)
 * - Operator/fleet policies with several registration marks
 */
function extractCoveredDrones(text: string): ParsedCoveredDrone[] {
  const covered: ParsedCoveredDrone[] = [];

  // Coverdrone / EU: values after "(4) Marchi di registrazione" — may repeat.
  const afterHeaders = text.matchAll(
    /marchi\s+di\s+registrazione\s+([a-z0-9°]+)\s+([a-z0-9][a-z0-9\s\-]+?)(?=\s+attrezzatura|\s+parte\s+3|\s+usi\s+standard|\s+operatori\b|\s+marca\b|$)/gi,
  );
  for (const m of afterHeaders) {
    pushUniqueDrone(covered, {
      manufacturer: titleCaseDroneName(m[1]),
      model: titleCaseDroneName(m[2]),
      registrationMark: '',
    });
  }

  // Inline "Marca: … Tipo: …" (repeatable on multi-UAS schedules)
  const marcaTipo = text.matchAll(
    /\bmarca\s*[:.]?\s*([a-z0-9°]+)\s+tipo\s*[:.]?\s*(.+?)(?=\s+anno\s+di\s+fabbricazione|\s+marchi\s+di\s+registrazione|\s+attrezzatura|\s+parte\s+[3-9]|\s+usi\s+standard|\s+marca\b|$)/gi,
  );
  for (const m of marcaTipo) {
    pushUniqueDrone(covered, {
      manufacturer: titleCaseDroneName(m[1]),
      model: titleCaseDroneName(m[2]),
      registrationMark: '',
    });
  }

  // English layouts
  const enPairs = text.matchAll(
    /\b(?:make|brand|manufacturer)\s*[:.]?\s*([a-z0-9°]+)\s+(?:model|type)\s*[:.]?\s*(.+?)(?=\s+serial|\s+year|\s+registration|\s+make\b|$)/gi,
  );
  for (const m of enPairs) {
    pushUniqueDrone(covered, {
      manufacturer: titleCaseDroneName(m[1]),
      model: titleCaseDroneName(m[2]),
      registrationMark: '',
    });
  }

  // Explicit registration marks — attach to first drone without one, or add stub rows
  const regs = [
    ...text.matchAll(/\bmarchi\s+di\s+registrazione\s*[:.]?\s*([A-Z0-9][A-Z0-9\-]{3,})\b/g),
  ]
    .map((m) => m[1].trim())
    .filter((r) => !/^(elettronica|attrezzatura)$/i.test(r));

  for (const reg of regs) {
    const open = covered.find((d) => !d.registrationMark);
    if (open) {
      open.registrationMark = reg;
    } else if (covered.length === 0) {
      pushUniqueDrone(covered, { manufacturer: '', model: '', registrationMark: reg });
    } else {
      // Extra marks on a multi-drone schedule without matching marca rows
      pushUniqueDrone(covered, { manufacturer: '', model: '', registrationMark: reg });
    }
  }

  return covered;
}

/** Fuzzy-match a user's drone fleet against one PDF marca/tipo row. */
export function matchDroneFromPolicySpecs(
  drones: { id: string; manufacturer: string; model: string }[],
  manufacturer: string,
  model: string,
): string | null {
  const ids = matchDronesFromPolicySpecs(drones, [{ manufacturer, model, registrationMark: '' }]);
  return ids[0] ?? null;
}

/** Match all PDF aircraft rows to the user's fleet (unique ids, best score ≥ 3). */
export function matchDronesFromPolicySpecs(
  drones: { id: string; manufacturer: string; model: string }[],
  covered: ParsedCoveredDrone[],
): string[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const matched = new Set<string>();

  for (const row of covered) {
    const mfg = norm(row.manufacturer);
    const mdl = norm(row.model);
    if (!mfg && !mdl) continue;

    let best: { id: string; score: number } | null = null;
    for (const d of drones) {
      if (matched.has(d.id)) continue;
      const dm = norm(d.manufacturer);
      const dl = norm(d.model);
      let score = 0;
      if (mfg && dm && (dm.includes(mfg) || mfg.includes(dm))) score += 2;
      if (mdl && dl && (dl.includes(mdl) || mdl.includes(dl))) score += 3;
      if (mfg && dl.includes(mfg)) score += 1;
      if (score > 0 && (!best || score > best.score)) best = { id: d.id, score };
    }
    if (best && best.score >= 3) matched.add(best.id);
  }

  return [...matched];
}

function cleanExtractedPhrase(raw: string): string {
  return raw
    .replace(/^ri\s+/i, '')
    .replace(/\s*[-–]\s*\d+\s*%.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isPlausibleHolderName(name: string): boolean {
  if (name.length < 3) return false;
  if (/insurance|limited|company|designated|activity/i.test(name)) return false;
  if (/\d+\s*%/.test(name)) return false;
  return true;
}

function extractHolderName(text: string): string {
  const patterns = [
    /nome\s+dell[''']?assicurat[oa]\s*[:.]?\s*(.+?)(?=\s+uso\b|\s+assicuratori\b|\s+contraente\b|\s+premio\b|$)/i,
    /(?:contraente|titolare|nominativo)\s*[:.]?\s*(.+?)(?=\s+uso\b|\s+assicuratori\b|\s+premio\b|$)/i,
    /\bassicurat[oa](?!r)\s*[:.]?\s*(.+?)(?=\s+uso\b|\s+assicuratori\b|\s+premio\b|$)/i,
    /(?:nome\s+e\s+cognome|cognome\s+e\s+nome)\s*[:.]?\s*(.+?)(?=\s+uso\b|$)/i,
  ];

  for (const rx of patterns) {
    const m = text.match(rx);
    if (!m?.[1]) continue;
    const name = cleanExtractedPhrase(m[1]);
    if (isPlausibleHolderName(name)) return name;
  }
  return '';
}

function extractInsurerFromTable(text: string): string {
  const m = text.match(
    /\bassicuratori\b\s*[:.]?\s*(.+?)(?=\s+nome\s+dell[''']?assicurat|\s+uso\b|\s+contraente\b|$)/i,
  );
  if (!m?.[1]) return '';
  const first = cleanExtractedPhrase(m[1])
    .split(/\s+(?=[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\s*[-–]\s*\d+\s*%)/)[0]
    .trim();
  return first;
}

function extractProvider(text: string): string {
  const upper = text.toUpperCase();
  for (const name of KNOWN_PROVIDERS) {
    if (upper.includes(name.toUpperCase())) return name;
  }

  const fromTable = extractInsurerFromTable(text);
  if (fromTable) return fromTable;

  const companyRx =
    /(?<![a-z])([A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ0-9&.'°\- ]{2,80}(?:Assicurazioni|S\.p\.A\.|S\.r\.l\.|Insurance|Limited|Aviation))/i;
  const m = text.match(companyRx);
  if (m?.[1]) return cleanExtractedPhrase(m[1]);

  return '';
}

function extractDateRange(text: string): { issueDate: string; expiryDate: string } {
  const rangePatterns = [
    /periodo\s+di\s+assicurazione\s+da\s+(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})\s+a\s+(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})/i,
    /(?:dal|decorr(?:enza)?(?:\s+dal)?|valid(?:ità|a)\s+dal)\s+(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})\s+(?:al|fino\s+al|scadenza)\s+(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})/i,
    /(?:from|period)\s+(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})\s+(?:to|until)\s+(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})/i,
    /(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})\s*[-–]\s*(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})/,
  ];

  for (const rx of rangePatterns) {
    const m = text.match(rx);
    if (m?.[1] && m?.[2]) {
      const issue = parseDateToken(m[1]);
      const expiry = parseDateToken(m[2]);
      if (issue && expiry) return { issueDate: issue, expiryDate: expiry };
    }
  }

  const expiryRx =
    /(?:scadenza|valid(?:o|a)\s+fino\s+al|expires?(?:\s+on)?|expiry)\s*[:.]?\s*(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})/i;
  const issueRx =
    /(?:emissione|decorrenza|issued?(?:\s+on)?|start)\s*[:.]?\s*(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})/i;

  const expiryM = text.match(expiryRx);
  const issueM = text.match(issueRx);

  let issueDate = issueM?.[1] ? parseDateToken(issueM[1]) ?? '' : '';
  let expiryDate = expiryM?.[1] ? parseDateToken(expiryM[1]) ?? '' : '';

  if (!issueDate || !expiryDate) {
    const dates = collectDates(text);
    if (dates.length >= 2 && !issueDate && !expiryDate) {
      issueDate = dates[0];
      expiryDate = dates[dates.length - 1];
    } else if (dates.length === 1 && !expiryDate) {
      expiryDate = dates[0];
    }
  }

  return { issueDate, expiryDate };
}

export function parsePolicyPdfText(text: string): ParsedPolicyFields {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const { issueDate, expiryDate } = extractDateRange(normalized);
  const holderName = extractHolderName(normalized);
  const provider = extractProvider(normalized);
  const policyNumber = extractPolicyNumber(normalized);
  const coveredDrones = extractCoveredDrones(normalized);
  const first = coveredDrones[0];

  const extracted = [
    holderName, provider, policyNumber, issueDate, expiryDate,
    first?.manufacturer, first?.model,
  ].filter(Boolean);
  const hasAllKey = Boolean(
    holderName && provider && policyNumber && issueDate && expiryDate,
  );

  return {
    holderName,
    provider,
    policyNumber,
    issueDate,
    expiryDate,
    coveredDrones,
    droneManufacturer: first?.manufacturer ?? '',
    droneModel: first?.model ?? '',
    droneRegistrationMark: first?.registrationMark ?? '',
    partial: extracted.length > 0 && !hasAllKey,
  };
}
