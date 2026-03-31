import axios, {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  type AxiosInstance,
} from 'axios';
import { API_ROUTES } from '@config/api.routes';
import { storage } from '@config/storage';

const AUTH_TOKEN_KEY = 'auth-token';
const REFRESH_TOKEN_KEY = 'refresh-token';

type AuthExpiredCallback = (() => void) | null;

class AxiosService {
  axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];
  private onAuthExpired: AuthExpiredCallback | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_ROUTES.ROOT,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set callback to be called when authentication expires (token refresh fails)
   * This allows the auth module to be notified without direct coupling
   */
  setAuthExpiredCallback(callback: AuthExpiredCallback) {
    this.onAuthExpired = callback;
  }

  private setupInterceptors() {
    // Request interceptor: inject auth token
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = storage.getString(AUTH_TOKEN_KEY);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
    );

    // Response interceptor: handle 401 with token refresh
    this.axiosInstance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.axiosInstance(originalRequest);
          });
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          const refreshToken = storage.getString(REFRESH_TOKEN_KEY);
          if (!refreshToken) {
            this.clearAuth();
            return Promise.reject(error);
          }

          const { data } = await axios.post(`${API_ROUTES.ROOT}/auth/refresh`, {
            refreshToken,
          });

          const newToken = data.token;
          storage.set(AUTH_TOKEN_KEY, newToken);
          if (data.refreshToken) {
            storage.set(REFRESH_TOKEN_KEY, data.refreshToken);
          }

          this.processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return this.axiosInstance(originalRequest);
        } catch (refreshError) {
          this.processQueue(refreshError, '');
          this.clearAuth();
          return Promise.reject(refreshError);
        } finally {
          this.isRefreshing = false;
        }
      },
    );
  }

  private processQueue(error: unknown, token: string) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private clearAuth() {
    storage.remove(AUTH_TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);

    // Notify auth module about expired session
    if (this.onAuthExpired) {
      this.onAuthExpired();
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

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<T>(url, config);
  }
}

function createAxiosService() {
  return new AxiosService();
}

export default createAxiosService();
