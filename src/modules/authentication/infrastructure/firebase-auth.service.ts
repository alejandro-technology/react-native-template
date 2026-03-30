import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import firebaseAuthenticationService from '@modules/firebase/infrastructure/authentication.service';
import type { AuthRepository } from '../domain/auth.repository';
import type {
  SignUpPayload,
  SignUpResponse,
  SignInPayload,
  SignInResponse,
  UserEntity,
  AuthStateChangeCallback,
  AuthStateUnsubscribe,
} from '../domain/auth.model';

/**
 * Convierte un usuario de Firebase a UserEntity
 */
function firebaseUserToEntity(
  firebaseUser: FirebaseAuthTypes.User,
): UserEntity {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    createdAt: firebaseUser.metadata.creationTime ?? null,
    lastLoginAt: firebaseUser.metadata.lastSignInTime ?? null,
  };
}

/**
 * Implementación de AuthRepository usando Firebase Authentication
 *
 * Provee autenticación completa con:
 * - Registro e inicio de sesión con email/password
 * - Gestión de sesión (signout, getCurrentUser)
 * - Listener de cambios de estado de autenticación
 * - Verificación de email y recuperación de contraseña
 * - Actualización de perfil y eliminación de cuenta
 */
class FirebaseAuthService implements AuthRepository {
  async signup(data: SignUpPayload): Promise<SignUpResponse | Error> {
    try {
      const userCredential = await firebaseAuthenticationService.signup(
        data.email,
        data.password,
      );

      // Actualizar displayName si se proporciona
      if (data.displayName) {
        await firebaseAuthenticationService.updateProfile(userCredential.user, {
          displayName: data.displayName,
        });
        await firebaseAuthenticationService.reload(userCredential.user);
      }

      return {
        user: firebaseUserToEntity(userCredential.user),
      };
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async signin(data: SignInPayload): Promise<SignInResponse | Error> {
    try {
      const userCredential = await firebaseAuthenticationService.signin(
        data.email,
        data.password,
      );

      return {
        user: firebaseUserToEntity(userCredential.user),
      };
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async signout(): Promise<void | Error> {
    try {
      await firebaseAuthenticationService.signout();
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async getCurrentUser(): Promise<UserEntity | null | Error> {
    try {
      const firebaseUser = firebaseAuthenticationService.getCurrentUser();
      if (!firebaseUser) {
        return null;
      }
      return firebaseUserToEntity(firebaseUser);
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  onAuthStateChanged(callback: AuthStateChangeCallback): AuthStateUnsubscribe {
    return firebaseAuthenticationService.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        callback(firebaseUserToEntity(firebaseUser));
      } else {
        callback(null);
      }
    });
  }

  async sendEmailVerification(): Promise<void | Error> {
    try {
      const firebaseUser = firebaseAuthenticationService.getCurrentUser();
      if (!firebaseUser) {
        return new Error('No hay usuario autenticado');
      }
      await firebaseAuthenticationService.sendEmailVerification(firebaseUser);
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void | Error> {
    try {
      await firebaseAuthenticationService.sendPasswordResetEmail(email);
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async updateProfile(data: {
    displayName?: string;
    photoURL?: string;
  }): Promise<UserEntity | Error> {
    try {
      const firebaseUser = firebaseAuthenticationService.getCurrentUser();
      if (!firebaseUser) {
        return new Error('No hay usuario autenticado');
      }

      await firebaseAuthenticationService.updateProfile(firebaseUser, data);
      // Recargar para obtener datos actualizados
      await firebaseAuthenticationService.reload(firebaseUser);

      const updatedUser = firebaseAuthenticationService.getCurrentUser();
      if (!updatedUser) {
        return new Error('Error al obtener usuario actualizado');
      }

      return firebaseUserToEntity(updatedUser);
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async deleteAccount(): Promise<void | Error> {
    try {
      const firebaseUser = firebaseAuthenticationService.getCurrentUser();
      if (!firebaseUser) {
        return new Error('No hay usuario autenticado');
      }
      await firebaseAuthenticationService.deleteAccount(firebaseUser);
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

function createFirebaseAuthService(): AuthRepository {
  return new FirebaseAuthService();
}

export default createFirebaseAuthService();
