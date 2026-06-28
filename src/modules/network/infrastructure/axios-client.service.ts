import { AxiosHeaders } from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosInstance } from 'axios';

import { getAxiosClient } from './axios.service';
import { refreshTokenOnce } from '../application/refresh-token.manager';

export class AxiosClient {
  private axiosInstance: AxiosInstance;
  private expiredCallback: (() => void) | null = null;
  private getToken: (() => string | null) | null = null;

  constructor(instance: AxiosInstance) {
    this.axiosInstance = instance;

    // REQUEST interceptor — attach Authorization when a token getter is registered (REQ-AUTHHTTP-003)
    this.axiosInstance.interceptors.request.use(config => {
      const getter = this.getToken;
      const token = getter ? getter() : null;
      if (token) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        (config.headers as AxiosHeaders).set(
          'Authorization',
          `Bearer ${token}`,
        );
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await refreshTokenOnce();
            return this.axiosInstance(originalRequest as AxiosRequestConfig);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Store the callback to invoke on terminal 401. Does NOT invoke at registration.
   * Passing null clears any previously stored callback. (REQ-AUTHHTTP-001, 011)
   */
  setAuthExpiredCallback(callback: (() => void) | null) {
    this.expiredCallback = callback;
  }

  /**
   * Register the token getter used by the request interceptor.
   * Passing null detaches the getter. (REQ-AUTHHTTP-004)
   */
  setGetToken(getter: (() => string | null) | null) {
    this.getToken = getter;
  }

  /**
   * Invoke the stored expired callback exactly once, swallowing any errors so
   * the interceptor chain never sees them. (REQ-AUTHHTTP-002)
   */
  private fireExpiredCallback(): void {
    if (!this.expiredCallback) {
      return;
    }
    try {
      this.expiredCallback();
    } catch (e) {
      // Swallow — never throw into the interceptor chain.
      console.warn('[AxiosClient] expired callback threw', e);
    }
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<T>(url, config);
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<T>(url, config);
  }
}

function createAxiosClient() {
  return new AxiosClient(getAxiosClient());
}

export default createAxiosClient();
