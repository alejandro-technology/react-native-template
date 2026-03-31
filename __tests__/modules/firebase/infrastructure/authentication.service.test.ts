jest.mock('@react-native-firebase/auth', () => {
  const mockAuth = {
    currentUser: null,
  };

  return {
    __mockAuth: mockAuth,
    getAuth: jest.fn(() => mockAuth),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    sendEmailVerification: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    updateProfile: jest.fn(),
    reload: jest.fn(),
    deleteUser: jest.fn(),
  };
});

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  reload,
  deleteUser,
} from '@react-native-firebase/auth';
import firebaseAuthService from '../../../../src/modules/firebase/infrastructure/authentication.service';

const mockAuth = (getAuth as jest.Mock)();

describe('FirebaseAuthenticationService', () => {
  const mockUser = {
    uid: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.currentUser = null;
  });

  describe('signup', () => {
    it('should create user with email and password', async () => {
      const mockCredential = { user: mockUser };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockCredential);

      const result = await firebaseAuthService.signup('test@example.com', 'password123');

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123',
      );
      expect(result).toEqual(mockCredential);
    });
  });

  describe('signin', () => {
    it('should sign in user with email and password', async () => {
      const mockCredential = { user: mockUser };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockCredential);

      const result = await firebaseAuthService.signin('test@example.com', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123',
      );
      expect(result).toEqual(mockCredential);
    });
  });

  describe('signout', () => {
    it('should sign out user', async () => {
      await firebaseAuthService.signout();

      expect(signOut).toHaveBeenCalledWith(mockAuth);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', () => {
      mockAuth.currentUser = mockUser;

      const result = firebaseAuthService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when not authenticated', () => {
      mockAuth.currentUser = null;

      const result = firebaseAuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChanged', () => {
    it('should register auth state change listener', () => {
      const mockUnsubscribe = jest.fn();
      (onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);
      const callback = jest.fn();

      const unsubscribe = firebaseAuthService.onAuthStateChanged(callback);

      expect(onAuthStateChanged).toHaveBeenCalledWith(mockAuth, callback);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('sendEmailVerification', () => {
    it('should send email verification to user', async () => {
      await firebaseAuthService.sendEmailVerification(mockUser);

      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      await firebaseAuthService.sendPasswordResetEmail('test@example.com');

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, 'test@example.com');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const profileData = { displayName: 'Updated Name', photoURL: 'https://example.com/new.jpg' };

      await firebaseAuthService.updateProfile(mockUser, profileData);

      expect(updateProfile).toHaveBeenCalledWith(mockUser, profileData);
    });
  });

  describe('reload', () => {
    it('should reload user', async () => {
      await firebaseAuthService.reload(mockUser);

      expect(reload).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      await firebaseAuthService.deleteAccount(mockUser);

      expect(deleteUser).toHaveBeenCalledWith(mockUser);
    });
  });
});
