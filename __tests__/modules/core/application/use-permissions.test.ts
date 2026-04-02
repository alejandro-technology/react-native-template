import { renderHook, waitFor, act } from '@testing-library/react-native';
import { usePermission, usePermissions } from '@modules/core/application/permissions/use-permissions';
import permissionsService from '@modules/core/infrastructure/permissions.service';

// Mock del servicio de permisos
jest.mock('@modules/core/infrastructure/permissions.service', () => ({
  __esModule: true,
  default: {
    check: jest.fn(),
    request: jest.fn(),
    checkAndRequest: jest.fn(),
    openSettings: jest.fn(),
    checkMultiple: jest.fn(),
    requestMultiple: jest.fn(),
  },
}));

const mockPermissionsService = permissionsService as jest.Mocked<typeof permissionsService>;

describe('usePermission Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('debe iniciar con valores por defecto', () => {
      const { result } = renderHook(() => usePermission('camera'));

      expect(result.current.status).toBe('unavailable');
      expect(result.current.canAskAgain).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isGranted).toBe(false);
      expect(result.current.isDenied).toBe(false);
      expect(result.current.isBlocked).toBe(false);
    });
  });

  describe('check', () => {
    it('debe verificar el permiso y actualizar el estado cuando es exitoso', async () => {
      mockPermissionsService.check.mockResolvedValue('granted');

      const { result } = renderHook(() => usePermission('camera'));

      let checkResult: string | undefined;
      await act(async () => {
        checkResult = await result.current.check();
      });

      expect(mockPermissionsService.check).toHaveBeenCalledWith('camera');
      expect(result.current.status).toBe('granted');
      expect(checkResult).toBe('granted');
      expect(result.current.isGranted).toBe(true);
    });

    it('debe manejar errores y retornar unavailable', async () => {
      mockPermissionsService.check.mockResolvedValue(new Error('Error test'));

      const { result } = renderHook(() => usePermission('camera'));

      let checkResult: string | undefined;
      await act(async () => {
        checkResult = await result.current.check();
      });

      expect(result.current.status).toBe('unavailable');
      expect(checkResult).toBe('unavailable');
    });

    it('debe actualizar isLoading durante la verificación', async () => {
      mockPermissionsService.check.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('granted'), 100)),
      );

      const { result } = renderHook(() => usePermission('camera'));

      act(() => {
        result.current.check();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('request', () => {
    it('debe solicitar el permiso y actualizar el estado cuando es exitoso', async () => {
      mockPermissionsService.request.mockResolvedValue({
        type: 'camera',
        status: 'granted',
        canAskAgain: false,
      });

      const { result } = renderHook(() => usePermission('camera'));

      await act(async () => {
        await result.current.request();
      });

      expect(mockPermissionsService.request).toHaveBeenCalledWith('camera');
      expect(result.current.status).toBe('granted');
      expect(result.current.canAskAgain).toBe(false);
    });

    it('debe manejar errores al solicitar permiso', async () => {
      mockPermissionsService.request.mockResolvedValue(new Error('Error test'));

      const { result } = renderHook(() => usePermission('camera'));

      let requestResult: any;
      await act(async () => {
        requestResult = await result.current.request();
      });

      expect(result.current.status).toBe('unavailable');
      expect(result.current.canAskAgain).toBe(false);
      expect(requestResult.status).toBe('unavailable');
    });
  });

  describe('checkAndRequest', () => {
    it('debe verificar y solicitar el permiso correctamente', async () => {
      mockPermissionsService.checkAndRequest.mockResolvedValue({
        type: 'camera',
        status: 'granted',
        canAskAgain: false,
      });

      const { result } = renderHook(() => usePermission('camera'));

      await act(async () => {
        await result.current.checkAndRequest();
      });

      expect(mockPermissionsService.checkAndRequest).toHaveBeenCalledWith('camera');
      expect(result.current.status).toBe('granted');
    });

    it('debe manejar errores en checkAndRequest', async () => {
      mockPermissionsService.checkAndRequest.mockResolvedValue(new Error('Error'));

      const { result } = renderHook(() => usePermission('camera'));

      await act(async () => {
        await result.current.checkAndRequest();
      });

      expect(result.current.status).toBe('unavailable');
      expect(result.current.canAskAgain).toBe(false);
    });
  });

  describe('openSettings', () => {
    it('debe abrir la configuración del dispositivo', async () => {
      mockPermissionsService.openSettings.mockResolvedValue(undefined);

      const { result } = renderHook(() => usePermission('camera'));

      await act(async () => {
        await result.current.openSettings();
      });

      expect(mockPermissionsService.openSettings).toHaveBeenCalled();
    });
  });

  describe('Propiedades computadas', () => {
    it('debe calcular isGranted correctamente', async () => {
      mockPermissionsService.check.mockResolvedValue('granted');

      const { result } = renderHook(() => usePermission('camera'));

      await act(async () => {
        await result.current.check();
      });

      expect(result.current.isGranted).toBe(true);
      expect(result.current.isDenied).toBe(false);
      expect(result.current.isBlocked).toBe(false);
    });

    it('debe calcular isDenied correctamente', async () => {
      mockPermissionsService.check.mockResolvedValue('denied');

      const { result } = renderHook(() => usePermission('camera'));

      await act(async () => {
        await result.current.check();
      });

      expect(result.current.isDenied).toBe(true);
      expect(result.current.isGranted).toBe(false);
      expect(result.current.isBlocked).toBe(false);
    });

    it('debe calcular isBlocked correctamente', async () => {
      mockPermissionsService.check.mockResolvedValue('blocked');

      const { result } = renderHook(() => usePermission('camera'));

      await act(async () => {
        await result.current.check();
      });

      expect(result.current.isBlocked).toBe(true);
      expect(result.current.isGranted).toBe(false);
      expect(result.current.isDenied).toBe(false);
    });
  });
});

describe('usePermissions Hook (múltiples)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('debe iniciar con estado unavailable para todos los permisos', () => {
      const { result } = renderHook(() =>
        usePermissions(['camera', 'microphone']),
      );

      expect(result.current.results).toHaveLength(2);
      expect(result.current.results[0]).toEqual({
        type: 'camera',
        status: 'unavailable',
        canAskAgain: true,
      });
      expect(result.current.results[1]).toEqual({
        type: 'microphone',
        status: 'unavailable',
        canAskAgain: true,
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('checkAll', () => {
    it('debe verificar múltiples permisos correctamente', async () => {
      const mockResults = [
        { type: 'camera' as const, status: 'granted' as const, canAskAgain: false },
        { type: 'microphone' as const, status: 'denied' as const, canAskAgain: true },
      ];
      mockPermissionsService.checkMultiple.mockResolvedValue(mockResults);

      const { result } = renderHook(() =>
        usePermissions(['camera', 'microphone']),
      );

      await act(async () => {
        await result.current.checkAll();
      });

      expect(mockPermissionsService.checkMultiple).toHaveBeenCalledWith([
        'camera',
        'microphone',
      ]);
      expect(result.current.results).toEqual(mockResults);
    });

    it('debe manejar errores en checkAll', async () => {
      mockPermissionsService.checkMultiple.mockResolvedValue(new Error('Error'));

      const { result } = renderHook(() =>
        usePermissions(['camera', 'microphone']),
      );

      let checkResult: any;
      await act(async () => {
        checkResult = await result.current.checkAll();
      });

      expect(checkResult).toEqual([]);
    });
  });

  describe('requestAll', () => {
    it('debe solicitar múltiples permisos correctamente', async () => {
      const mockResults = [
        { type: 'camera' as const, status: 'granted' as const, canAskAgain: false },
        { type: 'microphone' as const, status: 'granted' as const, canAskAgain: false },
      ];
      mockPermissionsService.requestMultiple.mockResolvedValue(mockResults);

      const { result } = renderHook(() =>
        usePermissions(['camera', 'microphone']),
      );

      await act(async () => {
        await result.current.requestAll();
      });

      expect(mockPermissionsService.requestMultiple).toHaveBeenCalledWith([
        'camera',
        'microphone',
      ]);
      expect(result.current.results).toEqual(mockResults);
    });

    it('debe manejar errores en requestAll', async () => {
      mockPermissionsService.requestMultiple.mockResolvedValue(new Error('Error'));

      const { result } = renderHook(() =>
        usePermissions(['camera', 'microphone']),
      );

      let requestResult: any;
      await act(async () => {
        requestResult = await result.current.requestAll();
      });

      expect(requestResult).toEqual([]);
    });
  });

  describe('getStatus', () => {
    it('debe retornar el estado de un permiso específico', async () => {
      const mockResults = [
        { type: 'camera' as const, status: 'granted' as const, canAskAgain: false },
        { type: 'microphone' as const, status: 'denied' as const, canAskAgain: true },
      ];
      mockPermissionsService.checkMultiple.mockResolvedValue(mockResults);

      const { result } = renderHook(() =>
        usePermissions(['camera', 'microphone']),
      );

      await act(async () => {
        await result.current.checkAll();
      });

      expect(result.current.getStatus('camera')).toBe('granted');
      expect(result.current.getStatus('microphone')).toBe('denied');
    });

    it('debe retornar unavailable para permisos no encontrados', () => {
      const { result } = renderHook(() => usePermissions(['camera']));

      expect(result.current.getStatus('microphone')).toBe('unavailable');
    });
  });

  describe('isGranted', () => {
    it('debe retornar true si el permiso está granted', async () => {
      const mockResults = [
        { type: 'camera' as const, status: 'granted' as const, canAskAgain: false },
      ];
      mockPermissionsService.checkMultiple.mockResolvedValue(mockResults);

      const { result } = renderHook(() => usePermissions(['camera']));

      await act(async () => {
        await result.current.checkAll();
      });

      expect(result.current.isGranted('camera')).toBe(true);
    });

    it('debe retornar false si el permiso no está granted', async () => {
      const mockResults = [
        { type: 'camera' as const, status: 'denied' as const, canAskAgain: true },
      ];
      mockPermissionsService.checkMultiple.mockResolvedValue(mockResults);

      const { result } = renderHook(() => usePermissions(['camera']));

      await act(async () => {
        await result.current.checkAll();
      });

      expect(result.current.isGranted('camera')).toBe(false);
    });
  });
});
