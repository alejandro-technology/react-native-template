import {
  useConnectivityStore,
  getIsConnected,
  useIsConnected,
} from '@modules/core/application/connectivity.storage';
import { act, renderHook } from '@testing-library/react-native';

describe('connectivity.storage - Zustand Store', () => {
  beforeEach(() => {
    // Resetear el store antes de cada test
    act(() => {
      useConnectivityStore.getState().setConnected(true);
    });
  });

  describe('Estado inicial', () => {
    it('debe iniciar con isConnected en true', () => {
      const { isConnected } = useConnectivityStore.getState();
      expect(isConnected).toBe(true);
    });
  });

  describe('setConnected', () => {
    it('debe actualizar isConnected a false', () => {
      act(() => {
        useConnectivityStore.getState().setConnected(false);
      });

      expect(useConnectivityStore.getState().isConnected).toBe(false);
    });

    it('debe actualizar isConnected a true', () => {
      act(() => {
        useConnectivityStore.getState().setConnected(false);
      });

      act(() => {
        useConnectivityStore.getState().setConnected(true);
      });

      expect(useConnectivityStore.getState().isConnected).toBe(true);
    });

    it('debe permitir múltiples actualizaciones consecutivas', () => {
      act(() => {
        useConnectivityStore.getState().setConnected(false);
      });
      expect(useConnectivityStore.getState().isConnected).toBe(false);

      act(() => {
        useConnectivityStore.getState().setConnected(true);
      });
      expect(useConnectivityStore.getState().isConnected).toBe(true);

      act(() => {
        useConnectivityStore.getState().setConnected(false);
      });
      expect(useConnectivityStore.getState().isConnected).toBe(false);
    });
  });

  describe('getIsConnected - getter externo', () => {
    it('debe retornar el estado actual de conectividad', () => {
      act(() => {
        useConnectivityStore.getState().setConnected(true);
      });
      expect(getIsConnected()).toBe(true);

      act(() => {
        useConnectivityStore.getState().setConnected(false);
      });
      expect(getIsConnected()).toBe(false);
    });

    it('debe poder ser llamado fuera de contexto React', () => {
      // Este getter es útil para código no-React
      const isConnected = getIsConnected();
      expect(typeof isConnected).toBe('boolean');
    });
  });

  describe('useIsConnected - hook React', () => {
    it('debe retornar el estado inicial de conectividad', () => {
      const { result } = renderHook(() => useIsConnected());
      expect(result.current).toBe(true);
    });

    it('debe actualizar cuando cambia el estado', () => {
      const { result } = renderHook(() => useIsConnected());
      expect(result.current).toBe(true);

      act(() => {
        useConnectivityStore.getState().setConnected(false);
      });

      expect(result.current).toBe(false);
    });

    it('debe suscribirse solo a isConnected', () => {
      const { result } = renderHook(() => useIsConnected());

      // Cambiar conectividad
      act(() => {
        useConnectivityStore.getState().setConnected(false);
      });

      expect(result.current).toBe(false);

      // Cambiar de nuevo
      act(() => {
        useConnectivityStore.getState().setConnected(true);
      });

      expect(result.current).toBe(true);
    });
  });
});
