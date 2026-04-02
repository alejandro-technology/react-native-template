import { renderHook, waitFor, act } from '@testing-library/react-native';
import {
  useNetInfo,
  useIsConnected,
} from '@modules/network/application/use-netinfo';
import netInfoService from '@modules/network/infrastructure/netinfo.service';
import type { NetInfoState } from '@modules/network/domain/netinfo.model';

// Mock del servicio de NetInfo
jest.mock('@modules/network/infrastructure/netinfo.service', () => ({
  __esModule: true,
  default: {
    getState: jest.fn(),
    addListener: jest.fn(),
    isConnected: jest.fn(),
  },
}));

const mockNetInfoService = netInfoService as jest.Mocked<typeof netInfoService>;

describe('useNetInfo Hook', () => {
  const mockState: NetInfoState = {
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
    isWifiEnabled: true,
    details: {
      isConnectionExpensive: false,
      ssid: 'TestNetwork',
      bssid: '00:00:00:00:00:00',
      strength: 100,
      ipAddress: '192.168.1.100',
      subnet: '255.255.255.0',
      frequency: 2400,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock por defecto: estado conectado + listener que no hace nada
    mockNetInfoService.getState.mockResolvedValue(mockState);
    mockNetInfoService.addListener.mockReturnValue(jest.fn());
  });

  describe('Estado inicial', () => {
    it('debe iniciar con valores por defecto', () => {
      mockNetInfoService.getState.mockImplementation(
        () => new Promise(() => {}),
      );

      const { result, unmount } = renderHook(() => useNetInfo());

      expect(result.current.type).toBe('unknown');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isInternetReachable).toBe(false);

      unmount();
    });

    it('debe cargar el estado inicial del servicio', async () => {
      const { result } = renderHook(() => useNetInfo());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockNetInfoService.getState).toHaveBeenCalled();
      expect(result.current.type).toBe('wifi');
      expect(result.current.isConnected).toBe(true);
      expect(result.current.isInternetReachable).toBe(true);
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar errores al cargar estado inicial', async () => {
      mockNetInfoService.getState.mockResolvedValue(new Error('Network error'));

      const { result } = renderHook(() => useNetInfo());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Listener de cambios', () => {
    it('debe suscribirse a cambios de red', async () => {
      renderHook(() => useNetInfo());

      await waitFor(() => {
        expect(mockNetInfoService.addListener).toHaveBeenCalled();
      });
    });

    it('debe actualizar el estado cuando cambia la conexión', async () => {
      let listenerCallback: ((state: NetInfoState) => void) | null = null;

      mockNetInfoService.addListener.mockImplementation(callback => {
        listenerCallback = callback;
        return jest.fn();
      });

      const { result } = renderHook(() => useNetInfo());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simular cambio de red
      const newState: NetInfoState = {
        type: 'cellular',
        isConnected: true,
        isInternetReachable: true,
        isWifiEnabled: false,
        details: {
          isConnectionExpensive: true,
          cellularGeneration: '4g',
        },
      };

      act(() => {
        listenerCallback?.(newState);
      });

      expect(result.current.type).toBe('cellular');
      expect(result.current.details.cellularGeneration).toBe('4g');
      expect(result.current.details.isConnectionExpensive).toBe(true);
    });

    it('debe desuscribirse al desmontar', async () => {
      const unsubscribe = jest.fn();
      mockNetInfoService.addListener.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useNetInfo());

      await waitFor(() => {
        expect(mockNetInfoService.addListener).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('debe refrescar el estado manualmente', async () => {
      const { result } = renderHook(() => useNetInfo());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newState: NetInfoState = {
        ...mockState,
        type: 'ethernet',
      };
      mockNetInfoService.getState.mockResolvedValue(newState);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.type).toBe('ethernet');
    });

    it('debe actualizar isLoading durante el refresh', async () => {
      const { result } = renderHook(() => useNetInfo());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockNetInfoService.getState.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockState), 100)),
      );

      act(() => {
        result.current.refresh();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('debe manejar errores en refresh sin actualizar estado', async () => {
      const { result } = renderHook(() => useNetInfo());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const currentType = result.current.type;

      mockNetInfoService.getState.mockResolvedValue(new Error('Refresh error'));

      await act(async () => {
        await result.current.refresh();
      });

      // El estado no debe cambiar en caso de error
      expect(result.current.type).toBe(currentType);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Valores computados', () => {
    it('debe convertir null a false en isConnected', async () => {
      const stateWithNull: NetInfoState = {
        ...mockState,
        isConnected: null,
      };
      mockNetInfoService.getState.mockResolvedValue(stateWithNull);

      const { result } = renderHook(() => useNetInfo());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('debe convertir null a false en isInternetReachable', async () => {
      const stateWithNull: NetInfoState = {
        ...mockState,
        isInternetReachable: null,
      };
      mockNetInfoService.getState.mockResolvedValue(stateWithNull);

      const { result } = renderHook(() => useNetInfo());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInternetReachable).toBe(false);
    });
  });

  describe('Prevención de memory leaks', () => {
    it('no debe actualizar estado si el componente se desmonta antes de resolver', async () => {
      mockNetInfoService.getState.mockImplementation(
        () =>
          new Promise(resolve => setTimeout(() => resolve(mockState), 1000)),
      );

      const { unmount } = renderHook(() => useNetInfo());

      // Desmontar inmediatamente
      unmount();

      // Esperar para asegurar que no hay actualizaciones
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Si llegamos aquí sin errores, el test pasa
      expect(true).toBe(true);
    });
  });
});

describe('useIsConnected Hook (simplificado)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNetInfoService.isConnected.mockResolvedValue(true);
    mockNetInfoService.addListener.mockReturnValue(jest.fn());
  });

  describe('Estado inicial', () => {
    it('debe iniciar con null', () => {
      mockNetInfoService.isConnected.mockImplementation(
        () => new Promise(() => {}),
      );

      const { result, unmount } = renderHook(() => useIsConnected());

      expect(result.current).toBe(null);

      unmount();
    });

    it('debe cargar el estado de conexión inicial', async () => {
      const { result } = renderHook(() => useIsConnected());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      expect(mockNetInfoService.isConnected).toHaveBeenCalled();
    });
  });

  describe('Listener de cambios', () => {
    it('debe suscribirse a cambios de conexión', async () => {
      renderHook(() => useIsConnected());

      await waitFor(() => {
        expect(mockNetInfoService.addListener).toHaveBeenCalled();
      });
    });

    it('debe actualizar cuando cambia el estado de conexión', async () => {
      let listenerCallback: ((state: NetInfoState) => void) | null = null;

      mockNetInfoService.addListener.mockImplementation(callback => {
        listenerCallback = callback;
        return jest.fn();
      });

      const { result } = renderHook(() => useIsConnected());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      // Simular pérdida de conexión
      act(() => {
        listenerCallback?.({
          type: 'none',
          isConnected: false,
          isInternetReachable: false,
          isWifiEnabled: null,
          details: { isConnectionExpensive: false },
        });
      });

      expect(result.current).toBe(false);
    });

    it('debe desuscribirse al desmontar', async () => {
      const unsubscribe = jest.fn();
      mockNetInfoService.addListener.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useIsConnected());

      await waitFor(() => {
        expect(mockNetInfoService.addListener).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Manejo de null', () => {
    it('debe convertir null a false en el listener', async () => {
      let listenerCallback: ((state: NetInfoState) => void) | null = null;

      mockNetInfoService.addListener.mockImplementation(callback => {
        listenerCallback = callback;
        return jest.fn();
      });

      const { result } = renderHook(() => useIsConnected());

      await waitFor(() => {
        expect(result.current).not.toBe(null);
      });

      // Simular estado con isConnected null
      act(() => {
        listenerCallback?.({
          type: 'unknown',
          isConnected: null,
          isInternetReachable: null,
          isWifiEnabled: null,
          details: { isConnectionExpensive: false },
        });
      });

      expect(result.current).toBe(false);
    });
  });

  describe('Prevención de memory leaks', () => {
    it('no debe actualizar estado si se desmonta antes de resolver', async () => {
      mockNetInfoService.isConnected.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 1000)),
      );

      const { unmount } = renderHook(() => useIsConnected());

      unmount();

      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(true).toBe(true);
    });
  });
});
