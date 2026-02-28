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
  userName?: string;
}

export function DeleteConfirmationSheet({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
  userName,
}: DeleteConfirmationSheetProps) {
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      title="Eliminar Usuario"
      closeOnBackdropPress
    >
      <View style={styles.container}>
        <Text variant="body" style={styles.message}>
          ¿Estás seguro de que deseas eliminar el usuario{' '}
          <Text variant="body" style={styles.userName}>
            "{userName}"
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
  userName: {
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
