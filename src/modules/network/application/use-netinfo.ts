import { useEffect, useState } from 'react';
import netInfoService from '../infrastructure/netinfo.service';
import type { NetInfoState } from '../domain/netinfo.model';

export function useNetInfo() {
  const [state, setState] = useState<NetInfoState>({
    type: 'unknown',
    isConnected: null,
    isInternetReachable: null,
    isWifiEnabled: null,
    details: {
      isConnectionExpensive: false,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchInitialState = async () => {
      const result = await netInfoService.getState();
      if (mounted) {
        if (result instanceof Error) {
          setState(prev => ({ ...prev, isConnected: false }));
        } else {
          setState(result);
        }
        setIsLoading(false);
      }
    };

    fetchInitialState();

    const unsubscribe = netInfoService.addListener(newState => {
      if (mounted) {
        setState(newState);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    const result = await netInfoService.getState();
    if (!(result instanceof Error)) {
      setState(result);
    }
    setIsLoading(false);
  };

  return {
    ...state,
    isLoading,
    refresh,
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable ?? false,
  };
}

export function useIsConnected() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      const connected = await netInfoService.isConnected();
      if (mounted) {
        setIsConnected(connected);
      }
    };

    checkConnection();

    const unsubscribe = netInfoService.addListener(state => {
      if (mounted) {
        setIsConnected(state.isConnected ?? false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return isConnected;
}
