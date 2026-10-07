/**
 * Same-origin path from an untrusted `?redirect=` value, or null.
 *
 * A leading `/` is not enough: browsers read `/\evil.example` as
 * `//evil.example`, so the value is resolved against a fixed origin and
 * rejected if it escapes it.
 */
export function safeInternalPath(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  if (/[\\\u0000-\u001f]/.test(raw)) return null;
  const base = 'https://internal.invalid';
  try {
    const url = new URL(raw, base);
    if (url.origin !== base) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
