import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The email client's contract is "never throw, always classify".
 *
 * Every caller is a side effect of an action that has already succeeded — a
 * report has been filed, a certificate has been approved — so an exception
 * escaping this module would turn a delivery problem into lost work. These
 * tests pin that behaviour, and pin the sanitisation that keeps recipient
 * addresses out of the strings we persist.
 */

const message = {
  kind: 'test',
  to: 'owner@example.test',
  subject: 'Subject',
  text: 'Body',
  html: '<p>Body</p>',
};

let sendEmail: typeof import('@/lib/server/email/client').sendEmail;

beforeEach(async () => {
  vi.resetModules();
  vi.unstubAllEnvs();
  ({ sendEmail } = await import('@/lib/server/email/client'));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('configuration', () => {
  it('skips rather than fails when no API key is configured', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendEmail(message);

    // `skipped` is distinct from `failed` on purpose: local development and CI
    // legitimately run without a key, and conflating the two would make logs
    // read as if delivery were broken.
    expect(result).toEqual({ status: 'skipped', reason: 'email_not_configured' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('skips when there is no usable recipient', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendEmail({ ...message, to: 'not-an-address' });

    expect(result.status).toBe('skipped');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('failure handling', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 'test-key');
  });

  it.each([
    [401, 'email_provider_auth_failed'],
    [403, 'email_provider_auth_failed'],
    [422, 'email_address_rejected'],
    [429, 'email_rate_limited'],
    [500, 'email_provider_unavailable'],
    [503, 'email_provider_unavailable'],
    [400, 'email_send_failed'],
  ])('maps HTTP %i to %s', async (status, reason) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status }));

    const result = await sendEmail(message);

    expect(result).toEqual({ status: 'failed', reason });
  });

  it('does not throw when the network is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const result = await sendEmail(message);

    expect(result).toEqual({ status: 'failed', reason: 'email_network_error' });
  });

  it('never surfaces the recipient address in the failure reason', async () => {
    // Resend echoes the address back in some error payloads; those strings end
    // up in Firestore documents an admin can read.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ message: 'Invalid recipient: owner@example.test' }),
      }),
    );

    const result = await sendEmail(message);

    expect(JSON.stringify(result)).not.toContain('owner@example.test');
  });
});

describe('success', () => {
  it('reports sent and passes the provider id through', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'resend-123' }) }),
    );

    const result = await sendEmail(message);

    expect(result).toEqual({ status: 'sent', id: 'resend-123' });
  });

  it('still reports sent when the provider returns an unparseable body', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('not json');
        },
      }),
    );

    const result = await sendEmail(message);

    expect(result.status).toBe('sent');
  });

  it('sends the recipient in the provider payload but not the internal kind tag', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ id: 'x' }) });
    vi.stubGlobal('fetch', fetchSpy);

    await sendEmail(message);

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string);
    expect(body.to).toEqual(['owner@example.test']);
    expect(body).not.toHaveProperty('kind');
  });
});
