import React from 'react';
import { View, StyleSheet } from 'react-native';
// Types
import type { ModalSuccessParams } from '@modules/core/domain/app.model';
// Components
import { Text, Button, Modal } from '@components/core';
// Theme
import { spacing } from '@theme/index';

interface ModalSuccessProps {
  visible: boolean;
  params: ModalSuccessParams;
  onClose: () => void;
}

export function ModalSuccess({ visible, params, onClose }: ModalSuccessProps) {
  const handleClose = () => {
    params.onClose?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      title={params.title}
      closeOnBackdropPress
    >
      <View style={styles.container}>
        <Text variant="body" align="center">
          {params.message}
        </Text>

        <Button variant="primary" onPress={handleClose}>
          Aceptar
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
});
