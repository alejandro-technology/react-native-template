import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
// Types
import type { ModalDeleteParams } from '@modules/core/domain/app.model';
// Components
import { Text, Button, Modal } from '@components/core';
// Theme
import { spacing } from '@theme/index';

interface ModalDeleteProps {
  visible: boolean;
  params: ModalDeleteParams;
  onClose: () => void;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function ModalDelete({ visible, params, onClose }: ModalDeleteProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await params.onConfirm();
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      title={`Eliminar ${capitalize(params.entityType)}`}
      closeOnBackdropPress
    >
      <View style={styles.container}>
        <Text variant="body" align="center">
          ¿Estás seguro de que deseas eliminar {params.entityType}{' '}
          <Text variant="body" style={styles.entityName}>
            "{params.entityName}"
          </Text>
          ? Esta acción no se puede deshacer.
        </Text>

        <View style={styles.actions}>
          <Button variant="outlined" onPress={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onPress={handleConfirm} loading={isLoading}>
            Eliminar
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  entityName: {
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
