/**
 * refreshTokenOnce unit tests.
 *
 * Approach (per design testing strategy):
 *   - Mock `@modules/network/infrastructure/axios.service` so the manager
 *     resolves its `axiosClient` import to a stub `{ post: jest.fn() }`.
 *   - We NEVER mock the global `axios` module — the whole point of this slice
 *     is to verify refresh uses the CONFIGURED client (REQ-AUTHHTTP-007).
 *   - Use `jest.isolateModules()` to give each test a fresh `refreshPromise`
 *     cache AND keep class identity consistent (no module registry resets).
 *
 * Coverage:
 *   REQ-AUTHHTTP-007 — uses configured axiosClient (no global axios, no withCredentials)
 *   REQ-AUTHHTTP-008 — error.response?.status === 401 detection
 *   REQ-AUTHHTTP-009 — refresh failure rejects (interceptor will then fire expired callback)
 *   REQ-AUTHHTTP-010 — refreshPromise de-dup: concurrent calls share one POST
 */

jest.mock('@modules/network/infrastructure/axios.service', () => {
  const post = jest.fn();
  return {
    __esModule: true,
    __mockPost: post,
    axiosClient: { post },
  };
});

import { AxiosError } from 'axios';
import { API_ROUTES } from '@config/api.routes';

function withFreshManager<T>(fn: (refreshTokenOnce: () => Promise<void>, mockPost: jest.Mock) => T): T {
  let result!: T;
  jest.isolateModules(() => {
    const svc = require('@modules/network/infrastructure/axios.service');
    const post: jest.Mock = svc.__mockPost;
    const { refreshTokenOnce } = require('@modules/network/application/refresh-token.manager');
    result = fn(refreshTokenOnce, post);
  });
  return result;
}

describe('refreshTokenOnce (REQ-AUTHHTTP-007, 008, 009, 010)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the configured axiosClient (NOT the global axios) to POST to AUTH_REFRESH', async () => {
    await withFreshManager(async (refreshTokenOnce, post) => {
      post.mockResolvedValue({ data: { ok: true } });
      await refreshTokenOnce();

      expect(post).toHaveBeenCalledTimes(1);
      expect(post).toHaveBeenCalledWith(API_ROUTES.AUTH_REFRESH);
    });
  });

  it('does not pass a body or withCredentials (REQ-AUTHHTTP-007 — drops web leftovers)', async () => {
    await withFreshManager(async (refreshTokenOnce, post) => {
      post.mockResolvedValue({ data: { ok: true } });
      await refreshTokenOnce();

      const args = post.mock.calls[0];
      // Only the URL should be passed. Any extra body or withCredentials
      // would mean we leaked the old implementation's payload.
      expect(args).toHaveLength(1);
      expect(args[0]).toBe(API_ROUTES.AUTH_REFRESH);
      expect(JSON.stringify(args)).not.toContain('withCredentials');
    });
  });

  it('rejects when the refresh POST fails (REQ-AUTHHTTP-009 — interceptor will fire expired callback)', async () => {
    await withFreshManager(async (refreshTokenOnce, post) => {
      const networkError = new Error('ECONNREFUSED');
      post.mockRejectedValue(networkError);

      await expect(refreshTokenOnce()).rejects.toBe(networkError);
    });
  });

  it('rejects with an AxiosError carrying status 401 when the server returns 401 (REQ-AUTHHTTP-008)', async () => {
    await withFreshManager(async (refreshTokenOnce, post) => {
      const mockConfig = { headers: {} as any };
      const err401 = new AxiosError(
        'Unauthorized',
        'ERR_BAD_REQUEST',
        mockConfig,
        {},
        {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {} as any,
          config: mockConfig as any,
        },
      );
      post.mockRejectedValue(err401);

      // The manager must RE-THROW so the response interceptor's catch block can
      // fire the stored expired callback. The canonical detection is on
      // error.response?.status, not on error.status.
      await expect(refreshTokenOnce()).rejects.toBeInstanceOf(AxiosError);
      await expect(refreshTokenOnce()).rejects.toMatchObject({
        response: { status: 401 },
      });
    });
  });

  it('de-duplicates concurrent refresh calls (REQ-AUTHHTTP-010 — only one POST)', async () => {
    await withFreshManager(async (refreshTokenOnce, post) => {
      let resolvePost!: (v: unknown) => void;
      post.mockReturnValue(
        new Promise(resolve => {
          resolvePost = resolve;
        }),
      );

      const a = refreshTokenOnce();
      const b = refreshTokenOnce();
      const c = refreshTokenOnce();

      // Yield to the microtask queue so the second/third calls see the
      // already-cached refreshPromise and skip the inner block.
      await Promise.resolve();
      await Promise.resolve();

      expect(post).toHaveBeenCalledTimes(1);

      resolvePost({ data: { ok: true } });
      await Promise.all([a, b, c]);
    });
  });

  it('resets the refresh cache after a successful refresh (REQ-AUTHHTTP-010 — finally { refreshPromise = null })', async () => {
    await withFreshManager(async (refreshTokenOnce, post) => {
      post.mockResolvedValue({ data: { ok: true } });

      await refreshTokenOnce();
      await refreshTokenOnce();
      await refreshTokenOnce();

      expect(post).toHaveBeenCalledTimes(3);
    });
  });
});
