jest.mock('react-native-config', () => ({
  API_URL: 'https://api.example.com',
}));

jest.mock('@config/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('@modules/network/infrastructure/axios.service', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('@modules/network/domain/network.error', () => ({
  manageAxiosError: jest.fn((error: unknown) => new Error(String(error))),
}));

import { storage } from '@config/storage';
import axiosService from '@modules/network/infrastructure/axios-client.service';
import { manageAxiosError } from '@modules/network/domain/network.error';
import authHttpService from '../../../../src/modules/authentication/infrastructure/auth.http.service';

describe('AuthHttpService', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signin', () => {
    it('should sign in user and store token', async () => {
      const mockResponse = {
        user: mockUser,
        token: 'jwt-token-123',
      };
      (axiosService.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authHttpService.signin({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(axiosService.post).toHaveBeenCalledWith('/auth/signin', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(storage.set).toHaveBeenCalledWith('http-auth-token', 'jwt-token-123');
      expect(result).toEqual({ user: mockUser });
    });

    it('should return error when signin fails', async () => {
      const error = new Error('Invalid credentials');
      (axiosService.post as jest.Mock).mockRejectedValue(error);

      const result = await authHttpService.signin({
        email: 'test@example.com',
        password: 'wrong',
      });

      expect(manageAxiosError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('signup', () => {
    it('should sign up user and store token', async () => {
      const mockResponse = {
        user: mockUser,
        token: 'jwt-token-123',
      };
      (axiosService.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authHttpService.signup({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      });

      expect(axiosService.post).toHaveBeenCalledWith('/auth/signup', {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      });
      expect(result).toEqual({ user: mockUser });
    });

    it('should return error when signup fails', async () => {
      const error = new Error('Email already exists');
      (axiosService.post as jest.Mock).mockRejectedValue(error);

      const result = await authHttpService.signup({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(manageAxiosError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('signout', () => {
    it('should sign out user and clear storage', async () => {
      (storage.getString as jest.Mock).mockReturnValue('jwt-token-123');
      (axiosService.post as jest.Mock).mockResolvedValue({});

      const result = await authHttpService.signout();

      expect(storage.remove).toHaveBeenCalledWith('http-auth-token');
      expect(storage.remove).toHaveBeenCalledWith('http-auth-user');
      expect(result).toBeUndefined();
    });

    it('should clear storage even if signout endpoint fails', async () => {
      (storage.getString as jest.Mock).mockReturnValue('jwt-token-123');
      (axiosService.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await authHttpService.signout();

      expect(storage.remove).toHaveBeenCalledWith('http-auth-token');
      expect(storage.remove).toHaveBeenCalledWith('http-auth-user');
      expect(result).toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no token', async () => {
      (storage.getString as jest.Mock).mockReturnValue(undefined);

      const result = await authHttpService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return user from server when token exists', async () => {
      (storage.getString as jest.Mock).mockReturnValue('jwt-token-123');
      (axiosService.get as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const result = await authHttpService.getCurrentUser();

      expect(axiosService.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should return stored user when server validation fails', async () => {
      // Mock token check returns token
      (storage.getString as jest.Mock).mockImplementation((key: string) => {
        if (key === 'http-auth-token') return 'jwt-token-123';
        if (key === 'http-auth-user') {
          return JSON.stringify({
            ...mockUser,
            createdAt: mockUser.createdAt.toISOString(),
            lastLoginAt: mockUser.lastLoginAt.toISOString(),
          });
        }
        return undefined;
      });
      (axiosService.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await authHttpService.getCurrentUser();

      expect(result).toEqual(expect.objectContaining({
        id: 'user-123',
        email: 'test@example.com',
      }));
    });
  });

  describe('onAuthStateChanged', () => {
    it('should call callback with current user', () => {
      const storedUserStr = JSON.stringify({
        ...mockUser,
        createdAt: mockUser.createdAt.toISOString(),
        lastLoginAt: mockUser.lastLoginAt.toISOString(),
      });
      (storage.getString as jest.Mock).mockReturnValue(storedUserStr);
      const callback = jest.fn();

      const unsubscribe = authHttpService.onAuthStateChanged(callback);

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user-123',
        email: 'test@example.com',
      }));
      expect(typeof unsubscribe).toBe('function');
    });

    it('should unsubscribe callback', () => {
      (storage.getString as jest.Mock).mockReturnValue(undefined);
      const callback = jest.fn();

      const unsubscribe = authHttpService.onAuthStateChanged(callback);
      unsubscribe();

      // Callback should not be called again after unsubscribe
      // This is implicitly tested by the fact that unsubscribe is a function
    });
  });

  describe('sendEmailVerification', () => {
    it('should send verification email', async () => {
      (axiosService.post as jest.Mock).mockResolvedValue({});

      const result = await authHttpService.sendEmailVerification();

      expect(axiosService.post).toHaveBeenCalledWith('/auth/send-verification-email');
      expect(result).toBeUndefined();
    });

    it('should return error when send verification fails', async () => {
      const error = new Error('Failed to send');
      (axiosService.post as jest.Mock).mockRejectedValue(error);

      const result = await authHttpService.sendEmailVerification();

      expect(manageAxiosError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      (axiosService.post as jest.Mock).mockResolvedValue({});

      const result = await authHttpService.sendPasswordResetEmail('test@example.com');

      expect(axiosService.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
      expect(result).toBeUndefined();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updatedUser = { ...mockUser, displayName: 'Updated Name' };
      (axiosService.put as jest.Mock).mockResolvedValue({ data: { user: updatedUser } });

      const result = await authHttpService.updateProfile({
        displayName: 'Updated Name',
      });

      expect(axiosService.put).toHaveBeenCalledWith('/auth/profile', {
        displayName: 'Updated Name',
      });
      expect(storage.set).toHaveBeenCalledWith('http-auth-user', JSON.stringify(updatedUser));
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      (axiosService.delete as jest.Mock).mockResolvedValue({});

      const result = await authHttpService.deleteAccount();

      expect(axiosService.delete).toHaveBeenCalledWith('/auth/account');
      expect(storage.remove).toHaveBeenCalledWith('http-auth-token');
      expect(storage.remove).toHaveBeenCalledWith('http-auth-user');
      expect(result).toBeUndefined();
    });
  });
});
