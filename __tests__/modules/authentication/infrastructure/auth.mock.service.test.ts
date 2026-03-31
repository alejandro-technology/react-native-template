jest.mock('@config/config', () => ({
  CONFIG: {
    SERVICE_PROVIDER: 'mock',
    ROOT_CREDENTIALS: {
      USERNAME: 'root@example.com',
      PASSWORD: 'rootpassword',
    },
  },
}));

// Mock storage at module scope before import
const mockStorageData = new Map<string, string>();

jest.mock('@config/storage', () => ({
  storage: {
    getString: (key: string) => mockStorageData.get(key),
    set: (key: string, value: string) => mockStorageData.set(key, value),
    remove: (key: string) => mockStorageData.delete(key),
  },
}));

import authMockService from '../../../../src/modules/authentication/infrastructure/auth.mock.service';

describe('AuthMockService', () => {
  beforeEach(() => {
    mockStorageData.clear();
  });

  describe('signup', () => {
    it('should sign up new user', async () => {
      const result = await authMockService.signup({
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User',
      });

      expect(result).toEqual({
        user: expect.objectContaining({
          email: 'newuser@example.com',
          displayName: 'New User',
        }),
      });
    });

    it('should return error if email already exists', async () => {
      // First signup
      await authMockService.signup({
        email: 'existing@example.com',
        password: 'password123',
      });

      // Sign out
      await authMockService.signout();

      // Try to signup again with same email
      const result = await authMockService.signup({
        email: 'existing@example.com',
        password: 'password456',
      });

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('El correo electrónico ya está en uso.');
    });
  });

  describe('signin', () => {
    it('should sign in with root credentials', async () => {
      const result = await authMockService.signin({
        email: 'root@example.com',
        password: 'rootpassword',
      });

      expect(result).toEqual({
        user: expect.objectContaining({
          email: 'root@example.com',
        }),
      });
    });

    it('should sign in with registered user', async () => {
      // First signup
      await authMockService.signup({
        email: 'registered@example.com',
        password: 'password123',
      });

      // Sign out
      await authMockService.signout();

      // Sign in
      const result = await authMockService.signin({
        email: 'registered@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        user: expect.objectContaining({
          email: 'registered@example.com',
        }),
      });
    });

    it('should return error for invalid credentials', async () => {
      const result = await authMockService.signin({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('Credenciales inválidas.');
    });
  });

  describe('signout', () => {
    it('should sign out and clear current user', async () => {
      await authMockService.signin({
        email: 'root@example.com',
        password: 'rootpassword',
      });

      const result = await authMockService.signout();

      expect(result).toBeUndefined();

      const currentUser = await authMockService.getCurrentUser();
      expect(currentUser).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no current user', async () => {
      const result = await authMockService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return current user', async () => {
      await authMockService.signin({
        email: 'root@example.com',
        password: 'rootpassword',
      });

      const result = await authMockService.getCurrentUser();

      expect(result).toEqual(
        expect.objectContaining({
          email: 'root@example.com',
        }),
      );
    });
  });

  describe('onAuthStateChanged', () => {
    it('should call callback with current user', async () => {
      await authMockService.signin({
        email: 'root@example.com',
        password: 'rootpassword',
      });

      const callback = jest.fn();
      const unsubscribe = authMockService.onAuthStateChanged(callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'root@example.com',
        }),
      );
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback with null when no user', async () => {
      const callback = jest.fn();
      authMockService.onAuthStateChanged(callback);

      expect(callback).toHaveBeenCalledWith(null);
    });
  });

  describe('sendEmailVerification', () => {
    it('should mark email as verified for current user', async () => {
      await authMockService.signup({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await authMockService.sendEmailVerification();

      expect(result).toBeUndefined();

      const currentUser = await authMockService.getCurrentUser();
      expect(currentUser).toEqual(
        expect.objectContaining({
          emailVerified: true,
        }),
      );
    });

    it('should return error when no current user', async () => {
      const result = await authMockService.sendEmailVerification();

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('No hay usuario autenticado');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should succeed for existing email', async () => {
      await authMockService.signup({
        email: 'test@example.com',
        password: 'password123',
      });
      await authMockService.signout();

      const result = await authMockService.sendPasswordResetEmail('test@example.com');

      expect(result).toBeUndefined();
    });

    it('should return error for non-existent email', async () => {
      const result = await authMockService.sendPasswordResetEmail('nonexistent@example.com');

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('updateProfile', () => {
    it('should update profile for current user', async () => {
      await authMockService.signup({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await authMockService.updateProfile({
        displayName: 'Updated Name',
        photoURL: 'https://example.com/photo.jpg',
      });

      expect(result).toEqual(
        expect.objectContaining({
          displayName: 'Updated Name',
          photoURL: 'https://example.com/photo.jpg',
        }),
      );
    });

    it('should return error when no current user', async () => {
      const result = await authMockService.updateProfile({
        displayName: 'Updated',
      });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('deleteAccount', () => {
    it('should delete account and clear storage', async () => {
      await authMockService.signup({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await authMockService.deleteAccount();

      expect(result).toBeUndefined();

      const currentUser = await authMockService.getCurrentUser();
      expect(currentUser).toBeNull();
    });

    it('should return error when no current user', async () => {
      const result = await authMockService.deleteAccount();

      expect(result).toBeInstanceOf(Error);
    });
  });
});
