import axios, { AxiosError } from 'axios';
import { API_ROUTES } from '@config/api.routes';

let refreshPromise: Promise<void> | null = null;

export async function refreshTokenOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        await axios.post(API_ROUTES.AUTH_REFRESH, null, {
          withCredentials: true,
        });
      } catch (error) {
        if (error instanceof AxiosError && error.status === 401) {
          await axios.post(API_ROUTES.AUTH_LOGOUT, null, {
            withCredentials: true,
          });
          // const currentUrl = window.location.pathname;
          // if (currentUrl !== "/") {
          // window.location.href = "/auth/signin?redirect=" + currentUrl;
          // }
          // window.location.href = "/";
          // TODO: Replace this code for real logout
        }
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}
