import React, { useState, useCallback } from 'react';
// Components
import { DeleteConfirmationSheet } from '../../../components/layout/DeleteConfirmationSheet';
// Store
import { useAppStorage } from '@modules/core/infrastructure/app.storage';

export function GlobalDeleteConfirmation() {
  const { visible, entityName, entityType, onConfirm, close } = useAppStorage(
    state => state.modal,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!onConfirm) return;
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm]);

  return (
    <DeleteConfirmationSheet
      visible={visible}
      onClose={close}
      onConfirm={handleConfirm}
      isLoading={isLoading}
      entityName={entityName}
      entityType={entityType}
    />
  );
}
