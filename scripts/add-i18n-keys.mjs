/**
 * Developer utility: append translation keys to every i18n file at once.
 *
 * The five language files are typed as `Record<TranslationKey, string>` where
 * TranslationKey is derived from en.ts, so adding a key to English breaks the
 * build until the same key exists in the other four. Doing that by hand across
 * five 1500-line files is tedious and easy to get wrong.
 *
 * Usage:
 *   node scripts/add-i18n-keys.mjs '<json>'
 *
 * where <json> maps language code to an object of key/value pairs:
 *   {"en":{"a.b":"Hello"},"it":{"a.b":"Ciao"}}
 *
 * Languages omitted from the payload fall back to the English string, which
 * matches how de/es/fr already sit in this repo — they are largely untranslated
 * and are hidden from the public language selector for that reason. The
 * fallback is recorded so a future translation pass can find them.
 */

import { readFileSync, writeFileSync } from 'node:fs';

const LANGS = ['en', 'it', 'de', 'es', 'fr'];

const payload = JSON.parse(process.argv[2] ?? '{}');
const englishKeys = payload.en ?? {};

function escape(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

for (const lang of LANGS) {
  const path = `src/lib/i18n/${lang}.ts`;
  let source = readFileSync(path, 'utf8');

  const entries = Object.entries(englishKeys).map(([key, englishValue]) => {
    const translated = payload[lang]?.[key];
    const value = translated ?? englishValue;
    // Mark untranslated fallbacks so they are greppable later.
    const marker = translated === undefined && lang !== 'en' ? ' // TODO: translate' : '';
    return `  '${escape(key)}': '${escape(value)}',${marker}`;
  });

  if (entries.length === 0) continue;

  // en.ts closes with `} as const satisfies ...`; the others with a bare `};`.
  const anchor = lang === 'en' ? '\n} as const satisfies' : '\n};';
  const at = source.lastIndexOf(anchor);
  if (at === -1) {
    console.error(`[add-i18n-keys] could not locate the closing brace in ${path}`);
    process.exit(1);
  }

  source = `${source.slice(0, at)}\n${entries.join('\n')}${source.slice(at)}`;
  writeFileSync(path, source);
  console.log(`[add-i18n-keys] ${entries.length} key(s) → ${path}`);
}
