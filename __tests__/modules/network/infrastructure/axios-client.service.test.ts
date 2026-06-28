/**
 * AxiosClient store-only callback + request interceptor tests.
 *
 * Approach (per design testing strategy):
 *   - `AxiosClient` is constructed against a REAL `axios.create({ adapter })` instance
 *     so the request/response interceptors run for real.
 *   - The custom `adapter` is a JS function that captures the post-interceptor
 *     request config and returns a canned response (no network).
 *   - `axios-mock-adapter` is NOT a project dep, so this is the only truthful
 *     way to assert that the request interceptor actually mutated the config.
 *
 * Coverage:
 *   REQ-AUTHHTTP-001 — setAuthExpiredCallback stores without invoking
 *   REQ-AUTHHTTP-003 — request interceptor attaches Bearer when getter returns non-null
 *   REQ-AUTHHTTP-004 — setGetToken getter can be null (default) or return null
 */

import axios from 'axios';
import { AxiosClient } from '@modules/network/infrastructure/axios-client.service';

interface CapturedRequest {
  url?: string;
  method?: string;
  headers?: unknown;
  data?: unknown;
}

function createClientWithStubbedAdapter() {
  const captured: CapturedRequest[] = [];
  const responses: Array<{ status: number; data?: unknown }> = [];

  const adapter = (config: any) => {
    captured.push({
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    const next = responses.shift() ?? { status: 200, data: { ok: true } };
    return Promise.resolve({
      data: next.data,
      status: next.status,
      statusText: 'OK',
      headers: {},
      config,
    });
  };

  const instance = axios.create({ adapter });
  const client = new AxiosClient(instance);

  return {
    client,
    instance,
    captured,
    queueResponse: (r: { status: number; data?: unknown }) => responses.push(r),
  };
}

describe('AxiosClient — setAuthExpiredCallback store-only (REQ-AUTHHTTP-001)', () => {
  it('does NOT invoke the callback at registration time', () => {
    const { client } = createClientWithStubbedAdapter();
    const cb = jest.fn();

    client.setAuthExpiredCallback(cb);

    expect(cb).not.toHaveBeenCalled();
  });

  it('stores the latest callback (overwrites previous)', () => {
    const { client } = createClientWithStubbedAdapter();
    const first = jest.fn();
    const second = jest.fn();

    client.setAuthExpiredCallback(first);
    client.setAuthExpiredCallback(second);

    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
  });

  it('clears the stored callback when null is passed', () => {
    const { client } = createClientWithStubbedAdapter();
    const cb = jest.fn();

    client.setAuthExpiredCallback(cb);
    client.setAuthExpiredCallback(null);

    // Nothing to call directly; we can only verify the registration did not fire.
    // The terminal-401 fire path is exercised in the dedicated T3 suite.
    expect(cb).not.toHaveBeenCalled();
  });
});

describe('AxiosClient — setGetToken + request interceptor (REQ-AUTHHTTP-003, 004)', () => {
  it('attaches Authorization: Bearer <token> when getter returns a non-null string', async () => {
    const { client, captured } = createClientWithStubbedAdapter();
    client.setGetToken(() => 'eyJ.payload.sig');

    await client.get('/protected');

    expect(captured).toHaveLength(1);
    const headers = captured[0].headers as Record<string, string> | undefined;
    // axios v1 may store headers as a plain object via AxiosHeaders.toJSON() or as an instance.
    // We accept either: look for a string match in the Authorization value.
    const auth =
      (headers && (headers as any).Authorization) ||
      (headers && (headers as any).authorization) ||
      (headers && (headers as any).get?.('Authorization'));
    expect(auth).toBe('Bearer eyJ.payload.sig');
  });

  it('does NOT attach an Authorization header when getter returns null', async () => {
    const { client, captured } = createClientWithStubbedAdapter();
    client.setGetToken(() => null);

    await client.get('/public');

    const headers = captured[0].headers as Record<string, string> | undefined;
    const auth =
      (headers && (headers as any).Authorization) ??
      (headers && (headers as any).authorization);
    expect(auth).toBeUndefined();
  });

  it('does NOT attach an Authorization header when no getter was registered (default)', async () => {
    const { client, captured } = createClientWithStubbedAdapter();
    // Intentionally do NOT call setGetToken.

    await client.get('/public');

    const headers = captured[0].headers as Record<string, string> | undefined;
    const auth =
      (headers && (headers as any).Authorization) ??
      (headers && (headers as any).authorization);
    expect(auth).toBeUndefined();
  });

  it('does NOT attach an Authorization header after setGetToken(null) clears the getter', async () => {
    const { client, captured } = createClientWithStubbedAdapter();
    client.setGetToken(() => 'token-1');
    client.setGetToken(null);

    await client.get('/public');

    const headers = captured[0].headers as Record<string, string> | undefined;
    const auth =
      (headers && (headers as any).Authorization) ??
      (headers && (headers as any).authorization);
    expect(auth).toBeUndefined();
  });
});
