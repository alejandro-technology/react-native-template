jest.mock('react-native-config', () => ({
  API_URL: 'https://api.example.com',
}));

jest.mock('axios', () => {
  const mockAxiosCreate = jest.fn();
  const mockAxiosPost = jest.fn();

  // Create mock instance inside the mock
  const mockAxiosInstance: any = jest.fn(() => Promise.resolve());
  mockAxiosInstance.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };
  mockAxiosInstance.get = jest.fn();
  mockAxiosInstance.post = jest.fn();
  mockAxiosInstance.put = jest.fn();
  mockAxiosInstance.delete = jest.fn();

  mockAxiosCreate.mockReturnValue(mockAxiosInstance);

  return {
    create: mockAxiosCreate,
    post: mockAxiosPost,
    __mockAxiosInstance: mockAxiosInstance,
    __mockAxiosCreate: mockAxiosCreate,
    __mockAxiosPost: mockAxiosPost,
  };
});

jest.mock('@config/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

import axios from 'axios';
import { API_ROUTES } from '@config/api.routes';
import { storage } from '@config/storage';
import axiosService from '../../../../src/modules/network/infrastructure/axios.service';

const mockedAxios = axios as any;
const mockAxiosInstance = mockedAxios.__mockAxiosInstance;
const mockAxiosCreate = mockedAxios.__mockAxiosCreate;
const mockAxiosPost = mockedAxios.__mockAxiosPost;

// Get interceptors once after service initialization
const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
const responseSuccessInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

describe('AxiosService', () => {
  // Don't clear all mocks because it clears the initialization calls
  // Only clear storage and post mocks
  beforeEach(() => {
    (storage.getString as jest.Mock).mockClear();
    (storage.set as jest.Mock).mockClear();
    (storage.remove as jest.Mock).mockClear();
    mockAxiosPost.mockClear();
    mockAxiosInstance.get.mockClear();
    mockAxiosInstance.post.mockClear();
    mockAxiosInstance.put.mockClear();
    mockAxiosInstance.delete.mockClear();
    mockAxiosInstance.mockClear();
  });

  it('should initialize with correct config', () => {
    expect(mockAxiosCreate).toHaveBeenCalledWith({
      baseURL: API_ROUTES.ROOT,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  });

  describe('HTTP methods', () => {
    it('should delegate get to axios instance', () => {
      axiosService.get('/test');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
    });

    it('should delegate post to axios instance', () => {
      axiosService.post('/test', { data: 1 });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', { data: 1 }, undefined);
    });

    it('should delegate put to axios instance', () => {
      axiosService.put('/test', { data: 1 });
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', { data: 1 }, undefined);
    });

    it('should delegate delete to axios instance', () => {
      axiosService.delete('/test');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test', undefined);
    });
  });

  describe('Interceptors', () => {
    describe('Request Interceptor', () => {
      it('should add Authorization header if token exists', () => {
        (storage.getString as jest.Mock).mockReturnValue('fake-token');
        const config = { headers: {} as Record<string, string> };

        const result = requestInterceptor(config);

        expect(result.headers.Authorization).toBe('Bearer fake-token');
      });

      it('should not add Authorization header if token does not exist', () => {
        (storage.getString as jest.Mock).mockReturnValue(undefined);
        const config = { headers: {} as Record<string, string> };

        const result = requestInterceptor(config);

        expect(result.headers.Authorization).toBeUndefined();
      });
    });

    describe('Response Interceptor', () => {
      it('should return response if successful', () => {
        const response = { data: 'test' };
        expect(responseSuccessInterceptor(response)).toBe(response);
      });

      it('should reject if error is not 401', async () => {
        const error = { response: { status: 400 }, config: {} };
        await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      });

      it('should reject if original request already retried', async () => {
        const error = { response: { status: 401 }, config: { _retry: true } };
        await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      });

      it('should clear auth and reject if no refresh token exists', async () => {
        (storage.getString as jest.Mock).mockReturnValue(undefined);
        const error = { response: { status: 401 }, config: {} };
        const callback = jest.fn();

        axiosService.setAuthExpiredCallback(callback);

        await expect(responseErrorInterceptor(error)).rejects.toEqual(error);

        expect(storage.remove).toHaveBeenCalledWith('auth-token');
        expect(storage.remove).toHaveBeenCalledWith('refresh-token');
        expect(callback).toHaveBeenCalled();
      });

      it('should refresh token and retry original request', async () => {
        (storage.getString as jest.Mock).mockReturnValue('fake-refresh-token');
        mockAxiosPost.mockResolvedValue({
          data: { token: 'new-token', refreshToken: 'new-refresh-token' },
        });

        const error = {
          response: { status: 401 },
          config: { headers: {} },
        };

        mockAxiosInstance.mockResolvedValueOnce({ data: 'retry-success' });

        const result = await responseErrorInterceptor(error);

        expect(mockAxiosPost).toHaveBeenCalledWith(`${API_ROUTES.ROOT}/auth/refresh`, {
          refreshToken: 'fake-refresh-token',
        });
        expect(storage.set).toHaveBeenCalledWith('auth-token', 'new-token');
        expect(storage.set).toHaveBeenCalledWith('refresh-token', 'new-refresh-token');
        expect(mockAxiosInstance).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: { Authorization: 'Bearer new-token' },
            _retry: true,
          }),
        );
        expect(result).toEqual({ data: 'retry-success' });
      });

      it('should clear auth if refresh token request fails', async () => {
        (storage.getString as jest.Mock).mockReturnValue('fake-refresh-token');
        const refreshError = new Error('Refresh failed');
        mockAxiosPost.mockRejectedValue(refreshError);

        const error = { response: { status: 401 }, config: {} };
        const callback = jest.fn();
        axiosService.setAuthExpiredCallback(callback);

        await expect(responseErrorInterceptor(error)).rejects.toEqual(refreshError);

        expect(storage.remove).toHaveBeenCalledWith('auth-token');
        expect(storage.remove).toHaveBeenCalledWith('refresh-token');
        expect(callback).toHaveBeenCalled();
      });

      it('should handle concurrent requests during refresh', async () => {
        (storage.getString as jest.Mock).mockReturnValue('fake-refresh-token');

        let resolveRefresh: (value: unknown) => void;
        const refreshPromise = new Promise(resolve => {
          resolveRefresh = resolve;
        });
        mockAxiosPost.mockReturnValue(refreshPromise);

        const error1 = { response: { status: 401 }, config: { headers: {} } };
        const error2 = { response: { status: 401 }, config: { headers: {} } };

        mockAxiosInstance.mockResolvedValueOnce({ data: 'retry1' });
        mockAxiosInstance.mockResolvedValueOnce({ data: 'retry2' });

        const p1 = responseErrorInterceptor(error1);
        const p2 = responseErrorInterceptor(error2);

        resolveRefresh!({ data: { token: 'new-token' } });

        const [res1, res2] = await Promise.all([p1, p2]);

        expect(mockAxiosPost).toHaveBeenCalledTimes(1);
        expect(mockAxiosInstance).toHaveBeenCalledTimes(2);

        expect(res1).toEqual({ data: 'retry1' });
        expect(res2).toEqual({ data: 'retry2' });
      });
    });
  });
});
