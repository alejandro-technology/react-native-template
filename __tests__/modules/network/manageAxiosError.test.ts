import { AxiosError } from 'axios';
import { manageAxiosError } from '@modules/network/domain/network.error';

const mockConfig: any = { headers: {} };

describe('manageAxiosError', () => {
  it('should handle timeout error (ECONNABORTED)', () => {
    const error = new AxiosError('Timeout', 'ECONNABORTED', mockConfig);
    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('La solicitud tardó demasiado. Por favor, verifica tu conexión e intenta de nuevo.');
  });

  it('should handle network error (ERR_NETWORK)', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK', mockConfig);
    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('No pudimos conectar con el servidor. Revisa tu conexión a internet.');
  });

  it('should handle connection refused (ECONNREFUSED)', () => {
    const error = new AxiosError('Connection Refused', 'ECONNREFUSED', mockConfig);
    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('El servicio no está disponible en este momento. Por favor, vuelve a intentarlo más tarde.');
  });

  it('should handle 400 Bad Request', () => {
    const error = new AxiosError('Bad Request', undefined, mockConfig);
    error.response = { status: 400, data: {}, statusText: 'Bad Request', headers: {} as never, config: mockConfig };

    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Solicitud incorrecta. Por favor, verifica los datos ingresados.');
  });

  it('should handle 400 with validation errors', () => {
    const error = new AxiosError('Bad Request', undefined, mockConfig);
    error.response = {
      status: 400,
      data: { errors: { email: 'Email is required' } },
      statusText: 'Bad Request',
      headers: {} as never,
      config: mockConfig,
    };

    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.name).toBe('FormError');
    expect(result.message).toContain('email');
  });

  it('should handle 401 Unauthorized', () => {
    const error = new AxiosError('Unauthorized', undefined, mockConfig);
    error.response = { status: 401, data: {}, statusText: 'Unauthorized', headers: {} as never, config: mockConfig };

    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.name).toBe('UnauthorizedError');
    expect(result.message).toBe('Tu sesión ha expirado o no tienes autorización. Por favor, inicia sesión nuevamente.');
  });

  it('should handle 403 Forbidden', () => {
    const error = new AxiosError('Forbidden', undefined, mockConfig);
    error.response = { status: 403, data: {}, statusText: 'Forbidden', headers: {} as never, config: mockConfig };

    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.name).toBe('ForbiddenError');
    expect(result.message).toBe('No tienes permisos para realizar esta acción.');
  });

  it('should handle 404 Not Found', () => {
    const error = new AxiosError('Not Found', undefined, mockConfig);
    error.response = { status: 404, data: {}, statusText: 'Not Found', headers: {} as never, config: mockConfig };

    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.name).toBe('NotFoundError');
    expect(result.message).toBe('El recurso solicitado no fue encontrado.');
  });

  it('should handle 409 Conflict with duplicate identifier', () => {
    const error = new AxiosError('Conflict', undefined, mockConfig);
    error.response = {
      status: 409,
      data: { message: 'Duplicate identifier found' },
      statusText: 'Conflict',
      headers: {} as never,
      config: mockConfig,
    };

    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.name).toBe('ConflictError');
  });

  it('should handle 429 Rate Limit', () => {
    const error = new AxiosError('Too Many Requests', undefined, mockConfig);
    error.response = { status: 429, data: {}, statusText: 'Too Many Requests', headers: {} as never, config: mockConfig };

    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.name).toBe('RateLimitError');
    expect(result.message).toBe('Has realizado demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.');
  });

  it('should handle 500 Server Error', () => {
    const error = new AxiosError('Internal Server Error', undefined, mockConfig);
    error.response = { status: 500, data: {}, statusText: 'Internal Server Error', headers: {} as never, config: mockConfig };

    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Error en el servidor. Por favor, intenta de nuevo más tarde.');
  });

  it('should handle generic Error', () => {
    const error = new Error('Generic error');
    const result = manageAxiosError(error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Generic error');
  });

  it('should handle unknown error type', () => {
    const result = manageAxiosError('unknown');

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
  });
});
