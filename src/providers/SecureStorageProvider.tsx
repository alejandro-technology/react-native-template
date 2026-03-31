import React, { PropsWithChildren, useEffect, useState } from 'react';
// Config
import { initSecureStorage } from '@config/storage';

export default function SecureStorageProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initSecureStorage()
      .then(() => setIsReady(true))
      .catch(error => {
        console.warn('Failed to initialize secure storage:', error);
        // Continue anyway - secure storage will use fallback
        setIsReady(true);
      });
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
