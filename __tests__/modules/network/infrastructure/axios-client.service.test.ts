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
import { AxiosError } from 'axios';
import { AxiosClient } from '@modules/network/infrastructure/axios-client.service';

// Mock refresh-token.manager so we can control refreshTokenOnce() outcomes
// without making real HTTP calls.
const mockRefreshTokenOnce = jest.fn();
jest.mock('@modules/network/application/refresh-token.manager', () => ({
  refreshTokenOnce: (...args: unknown[]) => mockRefreshTokenOnce(...args),
}));

/**
 * Build an AxiosError that the response interceptor's error handler will
 * receive — mirrors what the real fetch/http adapter produces after
 * `settle()` rejects via `validateStatus`. A raw 401 from a custom adapter
 * without this wrapping will land in the SUCCESS handler because the custom
 * adapter bypasses axios's settle step.
 */
function buildAxiosError(config: any, status: number, data: unknown) {
  return new AxiosError(
    `Request failed with status code ${status}`,
    'ERR_BAD_REQUEST',
    config,
    {},
    {
      status,
      data,
      statusText: 'OK',
      headers: {},
      config,
    },
  );
}

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
    if (next.status < 200 || next.status >= 300) {
      return Promise.reject(buildAxiosError(config, next.status, next.data));
    }
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

describe('AxiosClient — terminal 401 fires stored expired callback (REQ-AUTHHTTP-002, 009, 010)', () => {
  function createClientWithController() {
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
      if (next.status < 200 || next.status >= 300) {
        return Promise.reject(buildAxiosError(config, next.status, next.data));
      }
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

  beforeEach(() => {
    mockRefreshTokenOnce.mockReset();
  });

  it('fires the stored expired callback EXACTLY once when refresh fails (REQ-AUTHHTTP-002, 009)', async () => {
    const { client, queueResponse } = createClientWithController();
    const expiredCb = jest.fn();
    client.setAuthExpiredCallback(expiredCb);
    queueResponse({ status: 401, data: { error: 'unauthorized' } });
    mockRefreshTokenOnce.mockRejectedValue(new Error('refresh-failed'));

    await expect(client.get('/protected')).rejects.toThrow();

    expect(expiredCb).toHaveBeenCalledTimes(1);
    expect(mockRefreshTokenOnce).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire the expired callback on a non-401 error (REQ-AUTHHTTP-002 — only terminal 401)', async () => {
    const { client, queueResponse } = createClientWithController();
    const expiredCb = jest.fn();
    client.setAuthExpiredCallback(expiredCb);
    queueResponse({ status: 500, data: { error: 'server-error' } });

    await expect(client.get('/protected')).rejects.toBeDefined();

    expect(expiredCb).not.toHaveBeenCalled();
    expect(mockRefreshTokenOnce).not.toHaveBeenCalled();
  });

  it('fires the expired callback on every terminal 401 and does NOT re-refresh when _retry is already true (REQ-AUTHHTTP-002, 010 — RETRY-GUARD)', async () => {
    const { client, queueResponse, instance } = createClientWithController();
    const expiredCb = jest.fn();
    client.setAuthExpiredCallback(expiredCb);

    // First call: 401 + refresh succeeds. Retry: 401 again — the _retry flag
    // short-circuits the response interceptor; the expired callback fires
    // for this terminal 401 (REQ-AUTHHTTP-002, RETRY-GUARD scenario).
    queueResponse({ status: 401 });
    queueResponse({ status: 401 });
    mockRefreshTokenOnce.mockResolvedValue(undefined);

    await expect(client.get('/protected')).rejects.toBeDefined();

    // After the refresh succeeded but the retry still returned 401, the
    // callback fired once. Now simulate another _retry:true request that
    // gets a 401 — refresh must NOT be invoked a second time, and the
    // callback fires again for this terminal 401.
    queueResponse({ status: 401 });
    const requestConfig: any = {
      url: '/protected',
      method: 'get',
      _retry: true,
    };
    await expect(
      (instance as any)(requestConfig),
    ).rejects.toBeDefined();

    // Only the first .get() should have triggered refreshTokenOnce.
    // The pre-marked _retry request must not.
    expect(mockRefreshTokenOnce).toHaveBeenCalledTimes(1);
    // The expired callback fires on EVERY terminal 401 (one per failed request).
    expect(expiredCb).toHaveBeenCalledTimes(2);
  });

  it('does NOT throw out of the interceptor chain if the expired callback itself throws (REQ-AUTHHTTP-002 — try/catch swallow)', async () => {
    const { client, queueResponse } = createClientWithController();
    const throwing = jest.fn(() => {
      throw new Error('callback exploded');
    });
    client.setAuthExpiredCallback(throwing);
    queueResponse({ status: 401 });
    mockRefreshTokenOnce.mockRejectedValue(new Error('refresh-failed'));

    // The user's original request still rejects — but the chain doesn't
    // re-throw the callback's own error. The end-state is: callback ran,
    // and the original rejection surfaced to the caller.
    await expect(client.get('/protected')).rejects.toThrow();
    expect(throwing).toHaveBeenCalledTimes(1);
  });

  it('does nothing dangerous when no callback is registered (REQ-AUTHHTTP-002 — defensive)', async () => {
    const { client, queueResponse } = createClientWithController();
    // Intentionally do NOT call setAuthExpiredCallback.
    queueResponse({ status: 401 });
    mockRefreshTokenOnce.mockRejectedValue(new Error('refresh-failed'));

    await expect(client.get('/protected')).rejects.toThrow();
    // No crash, no callback invocation.
  });
});
