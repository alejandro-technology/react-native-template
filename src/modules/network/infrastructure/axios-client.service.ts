import { AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosInstance } from 'axios';

import { getAxiosClient } from './axios.service';
import { refreshTokenOnce } from '../application/refresh-token.manager';

class AxiosClient {
  private axiosInstance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.axiosInstance = instance;

    this.axiosInstance.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as { _retry?: boolean };

        if (error.status === 401 && !originalRequest._retry) {
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

  setAuthExpiredCallback(callback: (() => void) | null) {
    callback?.();
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
