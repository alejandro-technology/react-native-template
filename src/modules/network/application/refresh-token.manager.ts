import type { AxiosError } from 'axios';
import { axiosClient } from '../infrastructure/axios.service';
import { API_ROUTES } from '@config/api.routes';

let refreshPromise: Promise<void> | null = null;

/**
 * Single-flight token refresh.
 *
 * Uses the configured `axiosClient` (REQ-AUTHHTTP-007) — same instance the
 * app's other HTTP calls go through, so the request interceptor also runs and
 * attaches the Bearer token per ASMP-003.
 *
 * Re-throws on failure so the response interceptor's catch block can fire
 * the stored expired callback (REQ-AUTHHTTP-009, design D7).
 */
export async function refreshTokenOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        await axiosClient.post(API_ROUTES.AUTH_REFRESH);
      } catch (error) {
        // Canonical 401 detection (REQ-AUTHHTTP-008). The response interceptor
        // is the single owner of the "expired callback" fire path; the manager
        // just re-throws so the interceptor can do its job (D7).
        if ((error as AxiosError).response?.status === 401) {
          // intentionally empty — sign-out is owned by the interceptor's callback
        }
        throw error;
      } finally {
        // De-dup cache reset on every outcome (REQ-AUTHHTTP-010).
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}
