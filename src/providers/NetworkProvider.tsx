import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { useNetInfo } from '@modules/network';
import { useAppStorage } from '@modules/core';

export default function NetworkProvider({ children }: PropsWithChildren) {
  const { isConnected, isLoading } = useNetInfo();
  const { show, hide } = useAppStorage(state => state.toast);
  const previousConnectedRef = useRef<boolean | null>(null);
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Skip initial render
    if (previousConnectedRef.current === null) {
      previousConnectedRef.current = isConnected;
      return;
    }

    // Show toast when connection is lost
    if (!isConnected && previousConnectedRef.current === true) {
      if (!toastShownRef.current) {
        show({
          message:
            'Sin conexión a internet. Algunas funciones pueden no estar disponibles.',
          type: 'info',
          duration: 5000,
          position: 'top',
        });
        toastShownRef.current = true;
      }
    }

    // Hide toast and show reconnection message when connection is restored
    if (isConnected && previousConnectedRef.current === false) {
      hide();
      toastShownRef.current = false;
      show({
        message: 'Conexión restaurada',
        type: 'success',
        duration: 2000,
        position: 'top',
      });
    }

    previousConnectedRef.current = isConnected;
  }, [isConnected, isLoading, show, hide]);

  return <>{children}</>;
}
