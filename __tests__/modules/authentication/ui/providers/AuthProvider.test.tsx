/**
 * AuthProvider wiring tests.
 *
 * Approach:
 *   - Mock both `auth.service` (the auth repository factory result) and
 *     `axios-client.service` (the HTTP wrapper) so we can assert the
 *     mount/unmount wiring without real network or real auth.
 *   - The mock factories are self-contained because `jest.mock` is hoisted
 *     above the test file's top-level `const`s — referencing outer variables
 *     inside the factory hits the temporal dead zone. We expose the mock
 *     fns via `__mocks` keys on the module and pull them back out with
 *     `jest.requireMock`.
 *   - Use the real `useAuthStorage` zustand store so the test can verify
 *     `setUnauthenticated` is NOT called during mount (REQ-AUTHHTTP-011).
 *
 * Coverage:
 *   REQ-AUTHHTTP-006 — mount registers both setters; unmount clears both
 *   REQ-AUTHHTTP-011 — no spurious setUnauthenticated during mount
 *   NO-MOUNT-LOGOUT scenario
 *   WIRING-MOUNT + WIRING-UNMOUNT scenarios
 */

import React from 'react';
import { render, act } from '@utils/test-utils';
import AuthProvider from '@modules/authentication/ui/providers/AuthProvider';

// --- Mocks (self-contained: factory must not reference outer consts) ----

jest.mock(
  '../../../../../src/modules/authentication/infrastructure/auth.service',
  () => {
    const onAuthStateChanged = jest.fn(() => jest.fn());
    const getStoredToken = jest.fn(() => 'tok-abc');
    return {
      __esModule: true,
      __mocks: { onAuthStateChanged, getStoredToken },
      default: { onAuthStateChanged, getStoredToken },
    };
  },
);

jest.mock(
  '../../../../../src/modules/network/infrastructure/axios-client.service',
  () => {
    const setGetToken = jest.fn();
    const setAuthExpiredCallback = jest.fn();
    return {
      __esModule: true,
      __mocks: { setGetToken, setAuthExpiredCallback },
      default: { setGetToken, setAuthExpiredCallback },
    };
  },
);

// Pull the mock fns out via requireMock so the test can assert on them.
const authServiceMocks = jest.requireMock(
  '../../../../../src/modules/authentication/infrastructure/auth.service',
).__mocks as {
  onAuthStateChanged: jest.Mock;
  getStoredToken: jest.Mock;
};
const axiosClientMocks = jest.requireMock(
  '../../../../../src/modules/network/infrastructure/axios-client.service',
).__mocks as {
  setGetToken: jest.Mock;
  setAuthExpiredCallback: jest.Mock;
};

// Track the auth storage status so we can assert no spurious logout
// (REQ-AUTHHTTP-011) without spying on internals.
import { useAuthStorage } from '@modules/authentication/application/auth.storage';

// --- Tests --------------------------------------------------------------

describe('AuthProvider wiring (REQ-AUTHHTTP-006, 011)', () => {
  beforeEach(() => {
    axiosClientMocks.setGetToken.mockReset();
    axiosClientMocks.setAuthExpiredCallback.mockReset();
    authServiceMocks.onAuthStateChanged.mockReset();
    authServiceMocks.getStoredToken.mockReset();
    authServiceMocks.onAuthStateChanged.mockReturnValue(jest.fn());
    authServiceMocks.getStoredToken.mockReturnValue('tok-abc');
  });

  it('mounts and registers axiosService.setGetToken(authService.getStoredToken) on mount', () => {
    render(
      <AuthProvider>
        <></>
      </AuthProvider>,
    );

    expect(axiosClientMocks.setGetToken).toHaveBeenCalledTimes(1);
    // Reference equality: the function we pass must be authService.getStoredToken
    // (the `?? null` fallback is only used if getStoredToken is undefined).
    expect(axiosClientMocks.setGetToken).toHaveBeenCalledWith(
      authServiceMocks.getStoredToken,
    );
  });

  it('mounts and registers axiosService.setAuthExpiredCallback with a function on mount', () => {
    render(
      <AuthProvider>
        <></>
      </AuthProvider>,
    );

    expect(axiosClientMocks.setAuthExpiredCallback).toHaveBeenCalledTimes(1);
    const passedFn = axiosClientMocks.setAuthExpiredCallback.mock.calls[0][0];
    expect(typeof passedFn).toBe('function');
  });

  it('clears both setters (set to null) on unmount', () => {
    const { unmount } = render(
      <AuthProvider>
        <></>
      </AuthProvider>,
    );

    expect(axiosClientMocks.setGetToken).toHaveBeenCalledTimes(1);
    expect(axiosClientMocks.setAuthExpiredCallback).toHaveBeenCalledTimes(1);

    act(() => {
      unmount();
    });

    // Each setter should have been called a second time, with null this time.
    expect(axiosClientMocks.setGetToken).toHaveBeenCalledTimes(2);
    expect(axiosClientMocks.setGetToken).toHaveBeenLastCalledWith(null);
    expect(axiosClientMocks.setAuthExpiredCallback).toHaveBeenCalledTimes(2);
    expect(axiosClientMocks.setAuthExpiredCallback).toHaveBeenLastCalledWith(null);
  });

  it('does NOT call setUnauthenticated during mount effect (REQ-AUTHHTTP-011 — no spurious logout)', () => {
    const statusBefore = useAuthStorage.getState().status;
    expect(statusBefore).toBe('loading'); // initial Zustand default

    render(
      <AuthProvider>
        <></>
      </AuthProvider>,
    );

    const statusAfter = useAuthStorage.getState().status;
    // After mount, status must NOT be 'unauthenticated' just from mount.
    // It will be 'loading' (from the mount's setLoading() call) or, if a
    // stored user was found by the listener, 'authenticated'. Never
    // 'unauthenticated' as a side-effect of the HTTP callback registration.
    expect(statusAfter).not.toBe('unauthenticated');
  });
});
