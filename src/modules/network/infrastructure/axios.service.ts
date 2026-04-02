import axios, { type CreateAxiosDefaults, type AxiosInstance } from 'axios';
import { API_ROUTES } from '@config/api.routes';

/**
 * createAxiosInstance: Creates an Axios instance with optional configuration.
 */
function createAxiosInstance(options: CreateAxiosDefaults = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout || 10000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return instance;
}

// Client instance with interceptors for auth handling
export const axiosClient: AxiosInstance = createAxiosInstance({
  baseURL: API_ROUTES.ROOT,
});

/**
 * getAxiosClient: Returns the client instance (for explicit use).
 */
export function getAxiosClient(): AxiosInstance {
  return axiosClient;
}
