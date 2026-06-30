/**
 * Tests del AuthLocalService.
 *
 * Estrategia: re-mockear react-native-mmkv con un Map<string, string> real
 * a nivel de archivo para que storage.set/getString/remove tengan
 * comportamiento coherente. El mock global en jest.setup.js devuelve
 * undefined en getString, lo cual no sirve para un servicio que
 * persiste y recupera entre llamadas.
 *
 * Jest no permite capturar variables out-of-scope dentro de jest.mock()
 * salvo que estén prefijadas con `mock` (case-insensitive) y se
 * inicialicen en el momento de la declaración.
 */

import type { AuthUser } from '../../domain/auth.model';

// Store compartido por storage y secureStorage. Inicializado inline
// (no lazy) para que esté disponible cuando jest.mock() ejecute su
// factory durante el hoisting.
const mockMMKVStore: Map<string, string> = new Map<string, string>();

jest.mock('react-native-mmkv', () => {
  const factory = () => ({
    getString: (key: string) => mockMMKVStore.get(key),
    set: (key: string, value: string) => {
      mockMMKVStore.set(key, value);
    },
    delete: (key: string) => {
      mockMMKVStore.delete(key);
    },
    remove: (key: string) => {
      mockMMKVStore.delete(key);
    },
    clearAll: () => mockMMKVStore.clear(),
    contains: (key: string) => mockMMKVStore.has(key),
  });
  return {
    MMKV: jest.fn(factory),
    createMMKV: jest.fn(factory),
  };
});

// Importar DESPUÉS del mock para que la fábrica tome la versión in-memory.
import authLocalService from '../auth.local.service';

const STORAGE_KEYS = {
  USERS: 'local-auth-users',
  CREDENTIALS: 'local-auth-credentials',
  CURRENT_USER_ID: 'local-auth-current-user-id',
  SECURE_CREDENTIALS: 'local-auth-credentials-secure',
} as const;

function getCredentialsRaw(): string | undefined {
  return (
    mockMMKVStore.get(STORAGE_KEYS.SECURE_CREDENTIALS) ??
    mockMMKVStore.get(STORAGE_KEYS.CREDENTIALS)
  );
}

beforeEach(() => {
  mockMMKVStore.clear();
});

describe('AuthLocalService', () => {
  describe('signup', () => {
    it('persiste el perfil del usuario y lo deja como sesión activa', async () => {
      const result = await authLocalService.signup({
        email: 'alice@example.com',
        password: 'Secret123',
        displayName: 'Alice',
      });

      expect(result).not.toBeInstanceOf(Error);
      if (result instanceof Error) {
        return;
      }

      expect(result.user.email).toBe('alice@example.com');
      expect(result.user.displayName).toBe('Alice');
      expect(result.user.emailVerified).toBe(false);
      expect(result.user.id).toMatch(/^local-/);

      const users = JSON.parse(mockMMKVStore.get(STORAGE_KEYS.USERS)!);
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('alice@example.com');
      expect(users[0].displayName).toBe('Alice');

      // Las credenciales nunca deben guardarse en claro
      const credentialsRaw = getCredentialsRaw();
      expect(credentialsRaw).toBeDefined();
      expect(credentialsRaw).not.toContain('Secret123');
      const credentials = JSON.parse(credentialsRaw!);
      expect(credentials[0].passwordHash).not.toBe('Secret123');

      expect(mockMMKVStore.get(STORAGE_KEYS.CURRENT_USER_ID)).toBe(
        result.user.id,
      );
    });

    it('rechaza emails duplicados', async () => {
      await authLocalService.signup({
        email: 'bob@example.com',
        password: 'Secret123',
      });

      const second = await authLocalService.signup({
        email: 'bob@example.com',
        password: 'OtherPass9',
      });

      expect(second).toBeInstanceOf(Error);
      expect((second as Error).message).toMatch(/ya está en uso/);
    });

    it('acepta displayName opcional (queda null si no se envía)', async () => {
      const result = await authLocalService.signup({
        email: 'carol@example.com',
        password: 'Secret123',
      });

      expect(result).not.toBeInstanceOf(Error);
      if (result instanceof Error) {
        return;
      }
      expect(result.user.displayName).toBeNull();
    });
  });

  describe('signin', () => {
    beforeEach(async () => {
      await authLocalService.signup({
        email: 'dave@example.com',
        password: 'Secret123',
        displayName: 'Dave',
      });
      // Limpiar sesión activa para probar el flujo de login puro
      mockMMKVStore.delete(STORAGE_KEYS.CURRENT_USER_ID);
    });

    it('autentica con credenciales válidas y actualiza lastLoginAt', async () => {
      const result = await authLocalService.signin({
        email: 'dave@example.com',
        password: 'Secret123',
      });

      expect(result).not.toBeInstanceOf(Error);
      if (result instanceof Error) {
        return;
      }
      expect(result.user.email).toBe('dave@example.com');

      const users = JSON.parse(mockMMKVStore.get(STORAGE_KEYS.USERS)!);
      const lastLoginAt = new Date(users[0].lastLoginAt);
      const now = Date.now();
      expect(now - lastLoginAt.getTime()).toBeLessThan(5000);

      expect(mockMMKVStore.get(STORAGE_KEYS.CURRENT_USER_ID)).toBe(
        result.user.id,
      );
    });

    it('rechaza password incorrecto', async () => {
      const result = await authLocalService.signin({
        email: 'dave@example.com',
        password: 'WRONG-PASSWORD',
      });

      expect(result).toBeInstanceOf(Error);
      expect((result as Error).message).toMatch(/Credenciales inválidas/);
    });

    it('rechaza email inexistente', async () => {
      const result = await authLocalService.signin({
        email: 'nobody@example.com',
        password: 'Secret123',
      });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('signout', () => {
    it('limpia la sesión activa pero conserva el usuario registrado', async () => {
      await authLocalService.signup({
        email: 'eve@example.com',
        password: 'Secret123',
      });

      await authLocalService.signout();

      expect(mockMMKVStore.get(STORAGE_KEYS.CURRENT_USER_ID)).toBeUndefined();

      const current = await authLocalService.getCurrentUser();
      expect(current).toBeNull();

      // El usuario sigue registrado y puede volver a loguearse
      const signin = await authLocalService.signin({
        email: 'eve@example.com',
        password: 'Secret123',
      });
      expect(signin).not.toBeInstanceOf(Error);
    });
  });

  describe('getCurrentUser', () => {
    it('devuelve null cuando no hay sesión activa', async () => {
      const result = await authLocalService.getCurrentUser();
      expect(result).toBeNull();
    });

    it('devuelve el usuario activo si existe', async () => {
      const signup = await authLocalService.signup({
        email: 'frank@example.com',
        password: 'Secret123',
      });
      if (signup instanceof Error) {
        throw signup;
      }

      const result = await authLocalService.getCurrentUser();
      expect(result).not.toBeNull();
      expect(result).not.toBeInstanceOf(Error);
      if (result instanceof Error) {
        return;
      }
      expect(result!.email).toBe('frank@example.com');
      expect(result!.id).toBe(signup.user.id);
    });

    it('devuelve null si el currentUserId apunta a un usuario borrado', async () => {
      await authLocalService.signup({
        email: 'ghost@example.com',
        password: 'Secret123',
      });
      // Simulamos inconsistencia: currentUserId quedó apuntando a algo
      // que ya no existe en la lista de usuarios.
      mockMMKVStore.set(STORAGE_KEYS.CURRENT_USER_ID, 'local-does-not-exist');

      const result = await authLocalService.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChanged', () => {
    it('notifica el estado actual al suscribirse', async () => {
      await authLocalService.signup({
        email: 'grace@example.com',
        password: 'Secret123',
      });

      const callback = jest.fn<void, [AuthUser | null]>();
      const unsubscribe = authLocalService.onAuthStateChanged(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      const user = callback.mock.calls[0][0] as AuthUser;
      expect(user.email).toBe('grace@example.com');

      unsubscribe();
    });

    it('notifica null si no hay sesión activa', () => {
      const callback = jest.fn<void, [AuthUser | null]>();
      authLocalService.onAuthStateChanged(callback);

      expect(callback).toHaveBeenCalledWith(null);
    });

    it('notifica a todos los listeners en signup / signout', async () => {
      const cb1 = jest.fn<void, [AuthUser | null]>();
      const cb2 = jest.fn<void, [AuthUser | null]>();
      const off1 = authLocalService.onAuthStateChanged(cb1);
      const off2 = authLocalService.onAuthStateChanged(cb2);

      cb1.mockClear();
      cb2.mockClear();

      const signup = await authLocalService.signup({
        email: 'henry@example.com',
        password: 'Secret123',
      });
      if (signup instanceof Error) {
        throw signup;
      }

      expect(cb1).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'henry@example.com' }),
      );
      expect(cb2).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'henry@example.com' }),
      );

      cb1.mockClear();
      cb2.mockClear();

      await authLocalService.signout();

      expect(cb1).toHaveBeenCalledWith(null);
      expect(cb2).toHaveBeenCalledWith(null);

      off1();
      off2();
    });

    it('la función devuelta cancela la suscripción', async () => {
      const callback = jest.fn<void, [AuthUser | null]>();
      const unsubscribe = authLocalService.onAuthStateChanged(callback);

      callback.mockClear();
      unsubscribe();

      await authLocalService.signup({
        email: 'iris@example.com',
        password: 'Secret123',
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('sendEmailVerification', () => {
    it('marca el email como verificado cuando hay sesión activa', async () => {
      const signup = await authLocalService.signup({
        email: 'jack@example.com',
        password: 'Secret123',
      });
      if (signup instanceof Error) {
        throw signup;
      }
      expect(signup.user.emailVerified).toBe(false);

      const result = await authLocalService.sendEmailVerification();
      expect(result).toBeUndefined();

      const current = await authLocalService.getCurrentUser();
      expect(current).not.toBeInstanceOf(Error);
      if (current instanceof Error) {
        return;
      }
      expect(current!.emailVerified).toBe(true);
    });

    it('devuelve error si no hay sesión activa', async () => {
      const result = await authLocalService.sendEmailVerification();
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('no revela si el email existe o no (devuelve undefined siempre)', async () => {
      await authLocalService.signup({
        email: 'kate@example.com',
        password: 'Secret123',
      });

      const knownEmail = await authLocalService.sendPasswordResetEmail(
        'kate@example.com',
      );
      const unknownEmail = await authLocalService.sendPasswordResetEmail(
        'ghost@example.com',
      );

      expect(knownEmail).toBeUndefined();
      expect(unknownEmail).toBeUndefined();
    });
  });

  describe('updateProfile', () => {
    it('actualiza displayName y photoURL del usuario activo', async () => {
      await authLocalService.signup({
        email: 'liam@example.com',
        password: 'Secret123',
      });

      const result = await authLocalService.updateProfile({
        displayName: 'Liam Updated',
        photoURL: 'https://example.com/avatar.png',
      });

      expect(result).not.toBeInstanceOf(Error);
      if (result instanceof Error) {
        return;
      }
      expect(result.displayName).toBe('Liam Updated');
      expect(result.photoURL).toBe('https://example.com/avatar.png');

      const current = await authLocalService.getCurrentUser();
      expect(current).not.toBeInstanceOf(Error);
      if (current instanceof Error) {
        return;
      }
      expect(current!.displayName).toBe('Liam Updated');
      expect(current!.photoURL).toBe('https://example.com/avatar.png');
    });

    it('preserva los campos no enviados', async () => {
      await authLocalService.signup({
        email: 'mia@example.com',
        password: 'Secret123',
        displayName: 'Mia',
      });

      const result = await authLocalService.updateProfile({
        photoURL: 'https://example.com/mia.png',
      });

      expect(result).not.toBeInstanceOf(Error);
      if (result instanceof Error) {
        return;
      }
      expect(result.displayName).toBe('Mia');
      expect(result.photoURL).toBe('https://example.com/mia.png');
    });

    it('devuelve error si no hay sesión activa', async () => {
      const result = await authLocalService.updateProfile({
        displayName: 'NoSession',
      });
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('deleteAccount', () => {
    it('elimina el usuario, sus credenciales y cierra la sesión', async () => {
      const signup = await authLocalService.signup({
        email: 'noah@example.com',
        password: 'Secret123',
      });
      if (signup instanceof Error) {
        throw signup;
      }

      const result = await authLocalService.deleteAccount();
      expect(result).toBeUndefined();

      const users = JSON.parse(mockMMKVStore.get(STORAGE_KEYS.USERS)!);
      expect(users).toHaveLength(0);

      const credentialsRaw = getCredentialsRaw() ?? '[]';
      const credentials = JSON.parse(credentialsRaw);
      expect(credentials).toHaveLength(0);

      expect(mockMMKVStore.get(STORAGE_KEYS.CURRENT_USER_ID)).toBeUndefined();

      // El email ya está disponible para un registro nuevo
      const reSignup = await authLocalService.signup({
        email: 'noah@example.com',
        password: 'Secret123',
      });
      expect(reSignup).not.toBeInstanceOf(Error);
    });

    it('devuelve error si no hay sesión activa', async () => {
      const result = await authLocalService.deleteAccount();
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('getStoredToken', () => {
    it('devuelve null (el provider local no emite JWT)', () => {
      expect(authLocalService.getStoredToken!()).toBeNull();
    });
  });
});
