jest.mock('@modules/firebase/infrastructure/authentication.service', () => ({
  signup: jest.fn(),
  signin: jest.fn(),
  signout: jest.fn(),
  getCurrentUser: jest.fn(),
  onAuthStateChanged: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  reload: jest.fn(),
  deleteAccount: jest.fn(),
}));

jest.mock('@modules/firebase/domain/firebase.error', () => ({
  manageFirebaseError: jest.fn((error: unknown) => new Error(String(error))),
}));

import firebaseAuthService from '@modules/firebase/infrastructure/authentication.service';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import firebaseAuthServiceAuth from '../../../../src/modules/authentication/infrastructure/firebase-auth.service';

describe('FirebaseAuthService', () => {
  const mockFirebaseUser = {
    uid: 'firebase-uid-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    emailVerified: true,
    metadata: {
      creationTime: '2024-01-01T00:00:00.000Z',
      lastSignInTime: '2024-01-02T00:00:00.000Z',
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should sign up user and return auth user', async () => {
      const mockCredential = { user: mockFirebaseUser };
      (firebaseAuthService.signup as jest.Mock).mockResolvedValue(mockCredential);
      (firebaseAuthService.updateProfile as jest.Mock).mockResolvedValue(undefined);
      (firebaseAuthService.reload as jest.Mock).mockResolvedValue(undefined);

      const result = await firebaseAuthServiceAuth.signup({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      });

      expect(firebaseAuthService.signup).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(firebaseAuthService.updateProfile).toHaveBeenCalledWith(mockFirebaseUser, {
        displayName: 'Test User',
      });
      expect(result).toEqual({
        user: expect.objectContaining({
          id: 'firebase-uid-123',
          email: 'test@example.com',
        }),
      });
    });

    it('should return error when signup fails', async () => {
      const error = new Error('Auth error');
      (firebaseAuthService.signup as jest.Mock).mockRejectedValue(error);

      const result = await firebaseAuthServiceAuth.signup({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('signin', () => {
    it('should sign in user and return auth user', async () => {
      const mockCredential = { user: mockFirebaseUser };
      (firebaseAuthService.signin as jest.Mock).mockResolvedValue(mockCredential);

      const result = await firebaseAuthServiceAuth.signin({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(firebaseAuthService.signin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toEqual({
        user: expect.objectContaining({
          id: 'firebase-uid-123',
        }),
      });
    });

    it('should return error when signin fails', async () => {
      const error = new Error('Invalid credentials');
      (firebaseAuthService.signin as jest.Mock).mockRejectedValue(error);

      const result = await firebaseAuthServiceAuth.signin({
        email: 'test@example.com',
        password: 'wrong',
      });

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('signout', () => {
    it('should sign out user', async () => {
      (firebaseAuthService.signout as jest.Mock).mockResolvedValue(undefined);

      const result = await firebaseAuthServiceAuth.signout();

      expect(firebaseAuthService.signout).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should return error when signout fails', async () => {
      const error = new Error('Signout failed');
      (firebaseAuthService.signout as jest.Mock).mockRejectedValue(error);

      const result = await firebaseAuthServiceAuth.signout();

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user', async () => {
      (firebaseAuthService.getCurrentUser as jest.Mock).mockReturnValue(null);

      const result = await firebaseAuthServiceAuth.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return auth user when user exists', async () => {
      (firebaseAuthService.getCurrentUser as jest.Mock).mockReturnValue(mockFirebaseUser);

      const result = await firebaseAuthServiceAuth.getCurrentUser();

      expect(result).toEqual(
        expect.objectContaining({
          id: 'firebase-uid-123',
          email: 'test@example.com',
        }),
      );
    });
  });

  describe('onAuthStateChanged', () => {
    it('should register listener and return unsubscribe', () => {
      const mockUnsubscribe = jest.fn();
      (firebaseAuthService.onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);
      const callback = jest.fn();

      const unsubscribe = firebaseAuthServiceAuth.onAuthStateChanged(callback);

      expect(firebaseAuthService.onAuthStateChanged).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback with null when no user', () => {
      const mockUnsubscribe = jest.fn();
      (firebaseAuthService.onAuthStateChanged as jest.Mock).mockImplementation(cb => {
        cb(null);
        return mockUnsubscribe;
      });
      const callback = jest.fn();

      firebaseAuthServiceAuth.onAuthStateChanged(callback);

      expect(callback).toHaveBeenCalledWith(null);
    });
  });

  describe('sendEmailVerification', () => {
    it('should send verification email', async () => {
      (firebaseAuthService.getCurrentUser as jest.Mock).mockReturnValue(mockFirebaseUser);
      (firebaseAuthService.sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

      const result = await firebaseAuthServiceAuth.sendEmailVerification();

      expect(firebaseAuthService.sendEmailVerification).toHaveBeenCalledWith(mockFirebaseUser);
      expect(result).toBeUndefined();
    });

    it('should return error when no current user', async () => {
      (firebaseAuthService.getCurrentUser as jest.Mock).mockReturnValue(null);

      const result = await firebaseAuthServiceAuth.sendEmailVerification();

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toBe('No hay usuario autenticado');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      (firebaseAuthService.sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await firebaseAuthServiceAuth.sendPasswordResetEmail('test@example.com');

      expect(firebaseAuthService.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toBeUndefined();
    });

    it('should return error when send fails', async () => {
      const error = new Error('Send failed');
      (firebaseAuthService.sendPasswordResetEmail as jest.Mock).mockRejectedValue(error);

      const result = await firebaseAuthServiceAuth.sendPasswordResetEmail('test@example.com');

      expect(manageFirebaseError).toHaveBeenCalledWith(error);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('updateProfile', () => {
    it('should update profile', async () => {
      const updatedUser = { ...mockFirebaseUser, displayName: 'Updated' };
      (firebaseAuthService.getCurrentUser as jest.Mock)
        .mockReturnValueOnce(mockFirebaseUser)
        .mockReturnValueOnce(updatedUser);
      (firebaseAuthService.updateProfile as jest.Mock).mockResolvedValue(undefined);
      (firebaseAuthService.reload as jest.Mock).mockResolvedValue(undefined);

      const result = await firebaseAuthServiceAuth.updateProfile({
        displayName: 'Updated',
      });

      expect(firebaseAuthService.updateProfile).toHaveBeenCalledWith(mockFirebaseUser, {
        displayName: 'Updated',
      });
      expect(result).toEqual(
        expect.objectContaining({
          displayName: 'Updated',
        }),
      );
    });

    it('should return error when no current user', async () => {
      (firebaseAuthService.getCurrentUser as jest.Mock).mockReturnValue(null);

      const result = await firebaseAuthServiceAuth.updateProfile({
        displayName: 'Updated',
      });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('deleteAccount', () => {
    it('should delete account', async () => {
      (firebaseAuthService.getCurrentUser as jest.Mock).mockReturnValue(mockFirebaseUser);
      (firebaseAuthService.deleteAccount as jest.Mock).mockResolvedValue(undefined);

      const result = await firebaseAuthServiceAuth.deleteAccount();

      expect(firebaseAuthService.deleteAccount).toHaveBeenCalledWith(mockFirebaseUser);
      expect(result).toBeUndefined();
    });

    it('should return error when no current user', async () => {
      (firebaseAuthService.getCurrentUser as jest.Mock).mockReturnValue(null);

      const result = await firebaseAuthServiceAuth.deleteAccount();

      expect(result).toBeInstanceOf(Error);
    });
  });
});
