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
  productName?: string;
}

export function DeleteConfirmationSheet({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
  productName,
}: DeleteConfirmationSheetProps) {
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      title="Eliminar Producto"
      closeOnBackdropPress
    >
      <View style={styles.container}>
        <Text variant="body" style={styles.message}>
          ¿Estás seguro de que deseas eliminar el producto{' '}
          <Text variant="body" style={styles.productName}>
            "{productName}"
          </Text>
          ? Esta acción no se puede deshacer.
        </Text>

        <View style={styles.actions}>
          <Button variant="outlined" onPress={onClose} style={styles.button}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onPress={onConfirm}
            loading={isLoading}
            style={styles.button}
          >
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
  message: {
    textAlign: 'center',
  },
  productName: {
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
