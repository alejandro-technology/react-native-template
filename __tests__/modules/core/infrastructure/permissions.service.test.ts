import {
  check,
  request,
  checkMultiple,
  requestMultiple,
  openSettings,
  RESULTS,
  PERMISSIONS,
} from 'react-native-permissions';
import { Platform } from 'react-native';
import permissionsService from '@modules/core/infrastructure/permissions.service';

// Mock de react-native-permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn(),
  request: jest.fn(),
  checkMultiple: jest.fn(),
  requestMultiple: jest.fn(),
  openSettings: jest.fn(),
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    LIMITED: 'limited',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
  },
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
  },
}));

const mockCheck = check as jest.MockedFunction<typeof check>;
const mockRequest = request as jest.MockedFunction<typeof request>;
const mockCheckMultiple = checkMultiple as jest.MockedFunction<
  typeof checkMultiple
>;
const mockRequestMultiple = requestMultiple as jest.MockedFunction<
  typeof requestMultiple
>;
const mockOpenSettings = openSettings as jest.MockedFunction<
  typeof openSettings
>;

describe('PermissionsService', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    jest.clearAllMocks();
    // Restaurar platform original
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatform,
      writable: true,
    });
  });

  describe('check', () => {
    describe('iOS', () => {
      beforeEach(() => {
        Object.defineProperty(Platform, 'OS', {
          value: 'ios',
          writable: true,
        });
      });

      it('debe verificar permiso de cámara en iOS', async () => {
        mockCheck.mockResolvedValue(RESULTS.GRANTED);

        const result = await permissionsService.check('camera');

        expect(mockCheck).toHaveBeenCalledWith(PERMISSIONS.IOS.CAMERA);
        expect(result).toBe('granted');
      });

      it('debe verificar permiso de galería en iOS', async () => {
        mockCheck.mockResolvedValue(RESULTS.GRANTED);

        const result = await permissionsService.check('photoLibrary');

        expect(mockCheck).toHaveBeenCalledWith(PERMISSIONS.IOS.PHOTO_LIBRARY);
        expect(result).toBe('granted');
      });

      it('debe retornar unavailable para permisos no disponibles en iOS', async () => {
        const result = await permissionsService.check('health');

        expect(mockCheck).not.toHaveBeenCalled();
        expect(result).toBe('unavailable');
      });
    });

    describe('Android', () => {
      beforeEach(() => {
        Object.defineProperty(Platform, 'OS', {
          value: 'android',
          writable: true,
        });
      });

      it('debe verificar permiso de cámara en Android', async () => {
        mockCheck.mockResolvedValue(RESULTS.GRANTED);

        const result = await permissionsService.check('camera');

        expect(mockCheck).toHaveBeenCalledWith(PERMISSIONS.ANDROID.CAMERA);
        expect(result).toBe('granted');
      });

      it('debe verificar permiso de galería en Android', async () => {
        mockCheck.mockResolvedValue(RESULTS.GRANTED);

        const result = await permissionsService.check('photoLibrary');

        expect(mockCheck).toHaveBeenCalledWith(
          PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        );
        expect(result).toBe('granted');
      });
    });

    describe('Mapeo de estados', () => {
      beforeEach(() => {
        Object.defineProperty(Platform, 'OS', {
          value: 'ios',
          writable: true,
        });
      });

      it('debe mapear GRANTED correctamente', async () => {
        mockCheck.mockResolvedValue(RESULTS.GRANTED);
        const result = await permissionsService.check('camera');
        expect(result).toBe('granted');
      });

      it('debe mapear DENIED correctamente', async () => {
        mockCheck.mockResolvedValue(RESULTS.DENIED);
        const result = await permissionsService.check('camera');
        expect(result).toBe('denied');
      });

      it('debe mapear BLOCKED correctamente', async () => {
        mockCheck.mockResolvedValue(RESULTS.BLOCKED);
        const result = await permissionsService.check('camera');
        expect(result).toBe('blocked');
      });

      it('debe mapear LIMITED correctamente', async () => {
        mockCheck.mockResolvedValue(RESULTS.LIMITED);
        const result = await permissionsService.check('camera');
        expect(result).toBe('limited');
      });

      it('debe mapear UNAVAILABLE correctamente', async () => {
        mockCheck.mockResolvedValue(RESULTS.UNAVAILABLE);
        const result = await permissionsService.check('camera');
        expect(result).toBe('unavailable');
      });
    });

    describe('Manejo de errores', () => {
      beforeEach(() => {
        Object.defineProperty(Platform, 'OS', {
          value: 'ios',
          writable: true,
        });
      });

      it('debe manejar errores y retornar Error', async () => {
        mockCheck.mockRejectedValue(new Error('Permission check failed'));

        const result = await permissionsService.check('camera');

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
          expect(result.message).toBe('Permission check failed');
        }
      });

      it('debe manejar errores no-Error', async () => {
        mockCheck.mockRejectedValue('String error');

        const result = await permissionsService.check('camera');

        expect(result).toBeInstanceOf(Error);
        if (result instanceof Error) {
          expect(result.message).toBe('Error al verificar permiso');
        }
      });
    });
  });

  describe('request', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
    });

    it('debe solicitar permiso correctamente', async () => {
      mockRequest.mockResolvedValue(RESULTS.GRANTED);

      const result = await permissionsService.request('camera');

      expect(mockRequest).toHaveBeenCalledWith(PERMISSIONS.IOS.CAMERA);
      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.type).toBe('camera');
        expect(result.status).toBe('granted');
        expect(result.canAskAgain).toBe(true);
      }
    });

    it('debe indicar que no se puede preguntar de nuevo cuando está bloqueado', async () => {
      mockRequest.mockResolvedValue(RESULTS.BLOCKED);

      const result = await permissionsService.request('camera');

      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.status).toBe('blocked');
        expect(result.canAskAgain).toBe(false);
      }
    });

    it('debe retornar unavailable para permisos no disponibles', async () => {
      const result = await permissionsService.request('health');

      expect(mockRequest).not.toHaveBeenCalled();
      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.status).toBe('unavailable');
        expect(result.canAskAgain).toBe(false);
      }
    });

    it('debe manejar errores al solicitar permiso', async () => {
      mockRequest.mockRejectedValue(new Error('Request failed'));

      const result = await permissionsService.request('camera');

      expect(result).toBeInstanceOf(Error);
      if (result instanceof Error) {
        expect(result.message).toBe('Request failed');
      }
    });
  });

  describe('checkAndRequest', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
    });

    it('debe retornar granted si ya está concedido', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      const result = await permissionsService.checkAndRequest('camera');

      expect(mockCheck).toHaveBeenCalled();
      expect(mockRequest).not.toHaveBeenCalled();
      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.status).toBe('granted');
        expect(result.canAskAgain).toBe(false);
      }
    });

    it('debe retornar blocked si está bloqueado', async () => {
      mockCheck.mockResolvedValue(RESULTS.BLOCKED);

      const result = await permissionsService.checkAndRequest('camera');

      expect(mockCheck).toHaveBeenCalled();
      expect(mockRequest).not.toHaveBeenCalled();
      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.status).toBe('blocked');
        expect(result.canAskAgain).toBe(false);
      }
    });

    it('debe solicitar permiso si está denegado', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      mockRequest.mockResolvedValue(RESULTS.GRANTED);

      const result = await permissionsService.checkAndRequest('camera');

      expect(mockCheck).toHaveBeenCalled();
      expect(mockRequest).toHaveBeenCalled();
      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.status).toBe('granted');
      }
    });

    it('debe manejar permiso no disponible', async () => {
      const result = await permissionsService.checkAndRequest('health');

      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.status).toBe('unavailable');
      }
    });

    it('debe manejar errores', async () => {
      mockCheck.mockRejectedValue(new Error('Check failed'));

      const result = await permissionsService.checkAndRequest('camera');

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('openSettings', () => {
    it('debe abrir la configuración del dispositivo', async () => {
      mockOpenSettings.mockResolvedValue();

      const result = await permissionsService.openSettings();

      expect(mockOpenSettings).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('debe manejar errores al abrir configuración', async () => {
      mockOpenSettings.mockRejectedValue(new Error('Settings failed'));

      const result = await permissionsService.openSettings();

      expect(result).toBeInstanceOf(Error);
      if (result instanceof Error) {
        expect(result.message).toBe('Settings failed');
      }
    });
  });

  describe('checkMultiple', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
    });

    it('debe verificar múltiples permisos correctamente', async () => {
      mockCheckMultiple.mockResolvedValue({
        [PERMISSIONS.IOS.CAMERA]: RESULTS.GRANTED,
        [PERMISSIONS.IOS.PHOTO_LIBRARY]: RESULTS.DENIED,
      });

      const result = await permissionsService.checkMultiple([
        'camera',
        'photoLibrary',
      ]);

      expect(mockCheckMultiple).toHaveBeenCalled();
      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          type: 'camera',
          status: 'granted',
          canAskAgain: true,
        });
        expect(result[1]).toEqual({
          type: 'photoLibrary',
          status: 'denied',
          canAskAgain: true,
        });
      }
    });

    it('debe retornar unavailable para todos si no hay permisos válidos', async () => {
      const result = await permissionsService.checkMultiple(['health']);

      expect(mockCheckMultiple).not.toHaveBeenCalled();
      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result).toHaveLength(1);
        expect(result[0].status).toBe('unavailable');
      }
    });

    it('debe manejar errores', async () => {
      mockCheckMultiple.mockRejectedValue(new Error('Check multiple failed'));

      const result = await permissionsService.checkMultiple(['camera']);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('requestMultiple', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
    });

    it('debe solicitar múltiples permisos correctamente', async () => {
      mockRequestMultiple.mockResolvedValue({
        [PERMISSIONS.IOS.CAMERA]: RESULTS.GRANTED,
        [PERMISSIONS.IOS.PHOTO_LIBRARY]: RESULTS.DENIED,
      });

      const result = await permissionsService.requestMultiple([
        'camera',
        'photoLibrary',
      ]);

      expect(mockRequestMultiple).toHaveBeenCalled();
      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result).toHaveLength(2);
        expect(result[0].status).toBe('granted');
        expect(result[1].status).toBe('denied');
      }
    });

    it('debe retornar unavailable para permisos no válidos', async () => {
      const result = await permissionsService.requestMultiple(['health']);

      expect(mockRequestMultiple).not.toHaveBeenCalled();
      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result[0].status).toBe('unavailable');
      }
    });

    it('debe manejar errores', async () => {
      mockRequestMultiple.mockRejectedValue(
        new Error('Request multiple failed'),
      );

      const result = await permissionsService.requestMultiple(['camera']);

      expect(result).toBeInstanceOf(Error);
    });
  });
});
