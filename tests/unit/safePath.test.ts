import { describe, expect, it } from 'vitest';
import { safeInternalPath } from '@/lib/utils/safePath';
import { freshestToken } from '@/lib/auth/sessionCookieNames';

describe('safeInternalPath', () => {
  it('keeps same-origin paths with query and hash', () => {
    expect(safeInternalPath('/account')).toBe('/account');
    expect(safeInternalPath('/admin/users/abc?tab=1#top')).toBe('/admin/users/abc?tab=1#top');
  });

  it('rejects anything that could leave the origin', () => {
    expect(safeInternalPath('//evil.example')).toBeNull();
    expect(safeInternalPath('/\\evil.example')).toBeNull();
    expect(safeInternalPath('https://evil.example')).toBeNull();
    expect(safeInternalPath('javascript:alert(1)')).toBeNull();
    expect(safeInternalPath('/\tevil')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(safeInternalPath(null)).toBeNull();
    expect(safeInternalPath(undefined)).toBeNull();
    expect(safeInternalPath('')).toBeNull();
  });
});

function jwt(exp: number): string {
  const enc = (v: object) =>
    Buffer.from(JSON.stringify(v)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${enc({ alg: 'none' })}.${enc({ exp })}.sig`;
}

describe('freshestToken', () => {
  it('prefers the token that expires last', () => {
    const stale = jwt(1_000);
    const fresh = jwt(2_000);
    expect(freshestToken(stale, fresh)).toBe(fresh);
    expect(freshestToken(fresh, stale)).toBe(fresh);
  });

  it('skips missing values and keeps an unreadable token as a last resort', () => {
    expect(freshestToken(null, undefined)).toBeNull();
    expect(freshestToken(null, 'garbage')).toBe('garbage');
    expect(freshestToken('garbage', jwt(5))).not.toBe('garbage');
  });
});
