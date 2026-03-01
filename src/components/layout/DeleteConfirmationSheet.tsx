import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Button, Modal } from '@components/core';
// Theme
import { spacing } from '@theme/index';

interface DeleteConfirmationSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  entityName: string;
  entityType: string;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function DeleteConfirmationSheet({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
  entityName,
  entityType,
}: DeleteConfirmationSheetProps) {
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      title={`Eliminar ${capitalize(entityType)}`}
      closeOnBackdropPress
    >
      <View style={styles.container}>
        <Text variant="body" align="center">
          ¿Estás seguro de que deseas eliminar {entityType}{' '}
          <Text variant="body" style={styles.entityName}>
            "{entityName}"
          </Text>
          ? Esta acción no se puede deshacer.
        </Text>

        <View style={styles.actions}>
          <Button variant="outlined" onPress={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onPress={onConfirm} loading={isLoading}>
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
