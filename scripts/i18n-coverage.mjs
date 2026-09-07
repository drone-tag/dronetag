/**
 * Report translation coverage per language against the English baseline.
 *
 *   node scripts/i18n-coverage.mjs
 *
 * Why this exists: the decision to hide German, Spanish and French from the
 * language selector (see LANGUAGES in src/lib/i18n/index.ts) rests on a
 * coverage number, and that number needs to be reproducible rather than
 * asserted. Run this before adding a language back.
 *
 * "Identical to English" is counted separately from "missing" because the
 * incomplete files were seeded by copying en.ts: every key is present, so a
 * naive presence check reports 100% coverage for a file that is mostly
 * English. Short values are excluded from that count, since "Email", "Admin"
 * and "Dashboard" are genuinely the same word in several of these languages.
 *
 * The parser handles all three shapes the i18n files actually use:
 *   'key': 'value',
 *   'key': "value with an apostrophe",
 *   'key':
 *     'value on the next line',
 */

import { readFileSync } from 'node:fs';

const LANGS = ['it', 'de', 'es', 'fr'];
const IDENTICAL_MIN_LENGTH = 4;

function parse(lang) {
  const source = readFileSync(`src/lib/i18n/${lang}.ts`, 'utf8');
  const entries = new Map();
  const duplicates = [];

  // A single regex over the whole file, so a value on the line after its key
  // is matched the same way as one on the same line.
  const pattern = /^ {2}'((?:[^'\\]|\\.)*)':\s*(?:\r?\n\s*)?(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/gm;

  for (const match of source.matchAll(pattern)) {
    const key = match[1];
    if (entries.has(key)) duplicates.push(key);
    entries.set(key, match[2] ?? match[3] ?? '');
  }

  return { entries, duplicates: [...new Set(duplicates)] };
}

const { entries: english, duplicates: englishDupes } = parse('en');
console.log(`en  ${english.size} keys (baseline)`);
if (englishDupes.length > 0) {
  console.log(`    DUPLICATE KEYS: ${englishDupes.join(', ')}`);
}
console.log('');

let failed = englishDupes.length > 0;

for (const lang of LANGS) {
  const { entries, duplicates } = parse(lang);

  const missing = [];
  let identical = 0;
  for (const [key, englishValue] of english) {
    if (!entries.has(key)) {
      missing.push(key);
    } else if (entries.get(key) === englishValue && englishValue.length >= IDENTICAL_MIN_LENGTH) {
      identical += 1;
    }
  }

  const translated = english.size - missing.length - identical;
  const percent = ((translated / english.size) * 100).toFixed(1);

  console.log(
    `${lang}  ${percent}% translated  (${translated}/${english.size}) — ` +
      `${missing.length} missing, ${identical} identical to English`,
  );

  if (duplicates.length > 0) {
    console.log(`    DUPLICATE KEYS: ${duplicates.join(', ')}`);
    failed = true;
  }
  if (missing.length > 0 && missing.length <= 20) {
    console.log(`    missing: ${missing.join(', ')}`);
  }
}

// Duplicate keys are a build error (TS1117), so surfacing them as a non-zero
// exit makes this usable as a pre-commit or CI check.
process.exit(failed ? 1 : 0);
