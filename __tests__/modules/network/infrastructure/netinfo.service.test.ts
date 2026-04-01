import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState as RNNetInfoState } from '@react-native-community/netinfo';
import netInfoService from '@modules/network/infrastructure/netinfo.service';

// Mock de @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe('NetInfoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getState', () => {
    it('debe retornar el estado de red mapeado correctamente para WiFi', async () => {
      const mockRNState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        isWifiEnabled: true,
        details: {
          isConnectionExpensive: false,
          ssid: 'MyNetwork',
          bssid: 'aa:bb:cc:dd:ee:ff',
          strength: 85,
          ipAddress: '192.168.1.10',
          subnet: '255.255.255.0',
          frequency: 2400,
        },
      } as RNNetInfoState;

      mockNetInfo.fetch.mockResolvedValue(mockRNState);

      const result = await netInfoService.getState();

      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.type).toBe('wifi');
        expect(result.isConnected).toBe(true);
        expect(result.isInternetReachable).toBe(true);
        expect(result.isWifiEnabled).toBe(true);
        expect(result.details.isConnectionExpensive).toBe(false);
        expect(result.details.ssid).toBe('MyNetwork');
        expect(result.details.bssid).toBe('aa:bb:cc:dd:ee:ff');
        expect(result.details.strength).toBe(85);
        expect(result.details.ipAddress).toBe('192.168.1.10');
        expect(result.details.subnet).toBe('255.255.255.0');
        expect(result.details.frequency).toBe(2400);
      }
    });

    it('debe retornar el estado de red mapeado para conexión celular', async () => {
      const mockRNState = {
        type: 'cellular',
        isConnected: true,
        isInternetReachable: true,
        isWifiEnabled: false,
        isConnectionExpensive: true,
        details: {
          isConnectionExpensive: true,
          cellularGeneration: '4g',
          carrier: null,
        },
      } as RNNetInfoState;

      mockNetInfo.fetch.mockResolvedValue(mockRNState);

      const result = await netInfoService.getState();

      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.type).toBe('cellular');
        expect(result.isConnected).toBe(true);
        expect(result.details.isConnectionExpensive).toBe(true);
        expect(result.details.cellularGeneration).toBe('4g');
        expect(result.details.ssid).toBeUndefined();
      }
    });

    it('debe manejar estado sin conexión', async () => {
      const mockRNState = {
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        isWifiEnabled: undefined,
        details: null,
      } as RNNetInfoState;

      mockNetInfo.fetch.mockResolvedValue(mockRNState);

      const result = await netInfoService.getState();

      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.type).toBe('none');
        expect(result.isConnected).toBe(false);
        expect(result.isInternetReachable).toBe(false);
      }
    });

    it('debe mapear tipos de conexión desconocidos a unknown', async () => {
      const mockRNState: RNNetInfoState = {
        type: 'invalid-type' as any,
        isConnected: true,
        isInternetReachable: true,
        isWifiEnabled: undefined,
        details: null,
      };

      mockNetInfo.fetch.mockResolvedValue(mockRNState);

      const result = await netInfoService.getState();

      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.type).toBe('unknown');
      }
    });

    it('debe manejar generaciones celulares válidas', async () => {
      const generations = ['2g', '3g', '4g', '5g'] as const;

      for (const gen of generations) {
        const mockRNState = {
          type: 'cellular',
          isConnected: true,
          isInternetReachable: true,
          isWifiEnabled: false,
          details: {
            isConnectionExpensive: false,
            cellularGeneration: gen,
            carrier: null,
          },
        } as RNNetInfoState;

        mockNetInfo.fetch.mockResolvedValue(mockRNState);

        const result = await netInfoService.getState();

        expect(result).not.toBeInstanceOf(Error);
        if (!(result instanceof Error)) {
          expect(result.details.cellularGeneration).toBe(gen);
        }
      }
    });

    it('debe mapear generaciones celulares inválidas a unknown', async () => {
      const mockRNState = {
        type: 'cellular',
        isConnected: true,
        isInternetReachable: true,
        isWifiEnabled: false,
        details: {
          isConnectionExpensive: false,
          cellularGeneration: '6g' as any,
          carrier: null,
        },
      } as RNNetInfoState;

      mockNetInfo.fetch.mockResolvedValue(mockRNState);

      const result = await netInfoService.getState();

      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.details.cellularGeneration).toBe('unknown');
      }
    });

    it('debe convertir valores null a undefined en detalles WiFi', async () => {
      const mockRNState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        isWifiEnabled: true,
        details: {
          isConnectionExpensive: false,
          ssid: null,
          bssid: null,
          strength: null,
          ipAddress: null,
          subnet: null,
          frequency: null,
        },
      } as RNNetInfoState;

      mockNetInfo.fetch.mockResolvedValue(mockRNState);

      const result = await netInfoService.getState();

      expect(result).not.toBeInstanceOf(Error);
      if (!(result instanceof Error)) {
        expect(result.details.ssid).toBeUndefined();
        expect(result.details.bssid).toBeUndefined();
        expect(result.details.strength).toBeUndefined();
        expect(result.details.ipAddress).toBeUndefined();
        expect(result.details.subnet).toBeUndefined();
        expect(result.details.frequency).toBeUndefined();
      }
    });

    it('debe manejar errores y retornar Error', async () => {
      mockNetInfo.fetch.mockRejectedValue(new Error('Network fetch failed'));

      const result = await netInfoService.getState();

      expect(result).toBeInstanceOf(Error);
      if (result instanceof Error) {
        expect(result.message).toBe('Network fetch failed');
      }
    });

    it('debe manejar errores no-Error y retornar mensaje genérico', async () => {
      mockNetInfo.fetch.mockRejectedValue('String error');

      const result = await netInfoService.getState();

      expect(result).toBeInstanceOf(Error);
      if (result instanceof Error) {
        expect(result.message).toBe('Error al obtener estado de conexión');
      }
    });
  });

  describe('addListener', () => {
    it('debe agregar un listener y retornar función de desuscripción', () => {
      const unsubscribe = jest.fn();
      mockNetInfo.addEventListener.mockReturnValue(unsubscribe);

      const callback = jest.fn();
      const result = netInfoService.addListener(callback);

      expect(mockNetInfo.addEventListener).toHaveBeenCalled();
      expect(typeof result).toBe('function');
      expect(result).toBe(unsubscribe);
    });

    it('debe llamar al callback con estado mapeado cuando cambia la red', () => {
      let eventCallback: ((state: RNNetInfoState) => void) | null = null;

      mockNetInfo.addEventListener.mockImplementation(cb => {
        eventCallback = cb;
        return jest.fn();
      });

      const callback = jest.fn();
      netInfoService.addListener(callback);

      const mockRNState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        isWifiEnabled: true,
        details: {
          isConnectionExpensive: false,
          ssid: 'TestNet',
          bssid: null,
          strength: null,
          ipAddress: null,
          subnet: null,
          frequency: null,
        },
      } as RNNetInfoState;

      eventCallback!(mockRNState);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'wifi',
          isConnected: true,
          details: expect.objectContaining({
            ssid: 'TestNet',
          }),
        }),
      );
    });

    it('debe mapear correctamente múltiples tipos de conexión en callbacks', () => {
      let eventCallback: ((state: RNNetInfoState) => void) | null = null;

      mockNetInfo.addEventListener.mockImplementation(cb => {
        eventCallback = cb;
        return jest.fn();
      });

      const callback = jest.fn();
      netInfoService.addListener(callback);

      // WiFi
      eventCallback!({
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        isWifiEnabled: true,
        details: {
          isConnectionExpensive: false,
          ssid: 'WiFi',
          bssid: null,
          strength: null,
          ipAddress: null,
          subnet: null,
          frequency: null,
        },
      } as RNNetInfoState);

      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'wifi' }),
      );

      // Cellular
      eventCallback!({
        type: 'cellular',
        isConnected: true,
        isInternetReachable: true,
        isWifiEnabled: false,
        details: {
          isConnectionExpensive: false,
          cellularGeneration: '4g',
          carrier: null,
        },
      } as RNNetInfoState);

      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'cellular' }),
      );

      // None
      eventCallback!({
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        isWifiEnabled: undefined,
        details: null,
      } as RNNetInfoState);

      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'none' }),
      );
    });
  });

  describe('isConnected', () => {
    it('debe retornar true cuando hay conexión', async () => {
      const mockRNState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        isWifiEnabled: true,
        details: null,
      } as any;

      mockNetInfo.fetch.mockResolvedValue(mockRNState);

      const result = await netInfoService.isConnected();

      expect(result).toBe(true);
    });

    it('debe retornar false cuando no hay conexión', async () => {
      const mockRNState = {
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        isWifiEnabled: undefined,
        details: null,
      } as RNNetInfoState;

      mockNetInfo.fetch.mockResolvedValue(mockRNState);

      const result = await netInfoService.isConnected();

      expect(result).toBe(false);
    });

    it('debe retornar false cuando isConnected es null', async () => {
      const mockRNState = {
        type: 'unknown',
        isConnected: null,
        isInternetReachable: null,
        isWifiEnabled: undefined,
        details: null,
      } as RNNetInfoState;

      mockNetInfo.fetch.mockResolvedValue(mockRNState);

      const result = await netInfoService.isConnected();

      expect(result).toBe(false);
    });

    it('debe retornar false en caso de error', async () => {
      mockNetInfo.fetch.mockRejectedValue(new Error('Fetch failed'));

      const result = await netInfoService.isConnected();

      expect(result).toBe(false);
    });

    it('debe retornar false en caso de error no-Error', async () => {
      mockNetInfo.fetch.mockRejectedValue('Unknown error');

      const result = await netInfoService.isConnected();

      expect(result).toBe(false);
    });
  });

  describe('Mapeo de tipos de conexión', () => {
    const validTypes = [
      'none',
      'unknown',
      'wifi',
      'cellular',
      'bluetooth',
      'ethernet',
      'wimax',
      'vpn',
      'other',
    ] as const;

    it('debe mapear todos los tipos válidos correctamente', async () => {
      for (const type of validTypes) {
        const mockRNState = {
          type: type,
          isConnected: true,
          isInternetReachable: true,
          isWifiEnabled: undefined,
          details: null,
        } as RNNetInfoState;

        mockNetInfo.fetch.mockResolvedValue(mockRNState);

        const result = await netInfoService.getState();

        expect(result).not.toBeInstanceOf(Error);
        if (!(result instanceof Error)) {
          expect(result.type).toBe(type);
        }
      }
    });
  });
});
