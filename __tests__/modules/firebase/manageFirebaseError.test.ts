import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';

describe('manageFirebaseError', () => {
  it('should handle auth/email-already-in-use', () => {
    const error = new Error('auth/email-already-in-use');
    const result = manageFirebaseError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.name).toBe('DuplicateIdentifierError');
    expect(result.message).toBe('El correo electrónico ya está en uso.');
  });

  it('should handle auth/invalid-email', () => {
    const error = new Error('auth/invalid-email');
    const result = manageFirebaseError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.name).toBe('FormError');
    expect(result.message).toBe('El correo electrónico no es válido.');
  });

  it('should handle auth/weak-password', () => {
    const error = new Error('auth/weak-password');
    const result = manageFirebaseError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.name).toBe('FormError');
    expect(result.message).toBe('La contraseña debe tener al menos 6 caracteres.');
  });

  it('should handle auth/user-not-found', () => {
    const error = new Error('auth/user-not-found');
    const result = manageFirebaseError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('No existe un usuario con este correo electrónico.');
  });

  it('should handle auth/wrong-password', () => {
    const error = new Error('auth/wrong-password');
    const result = manageFirebaseError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('La contraseña es incorrecta.');
  });

  it('should handle firestore/not-found', () => {
    const error = new Error('firestore/not-found');
    const result = manageFirebaseError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('El documento no fue encontrado.');
  });

  it('should handle firestore/already-exists', () => {
    const error = new Error('firestore/already-exists');
    const result = manageFirebaseError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.name).toBe('DuplicateIdentifierError');
    expect(result.message).toBe('El documento ya existe.');
  });

  it('should handle firestore/permission-denied', () => {
    const error = new Error('firestore/permission-denied');
    const result = manageFirebaseError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Permiso denegado.');
  });

  it('should handle auth/network-request-failed', () => {
    const error = new Error('auth/network-request-failed');
    const result = manageFirebaseError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('No pudimos conectar con el servidor. Revisa tu conexión a internet.');
  });

  it('should handle generic Error', () => {
    const error = new Error('Unknown error');
    const result = manageFirebaseError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Unknown error');
  });

  it('should handle non-Error input', () => {
    const result = manageFirebaseError('unknown');

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
  });
});
