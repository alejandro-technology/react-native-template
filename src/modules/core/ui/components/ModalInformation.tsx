import React from 'react';
import { View, StyleSheet } from 'react-native';
// Types
import type { ModalInformationParams } from '@modules/core/domain/app.model';
// Components
import { Text, Button, Modal } from '@components/core';
// Theme
import { spacing } from '@theme/index';

interface ModalInformationProps {
  visible: boolean;
  params: ModalInformationParams;
  onClose: () => void;
}

export function ModalInformation({
  visible,
  params,
  onClose,
}: ModalInformationProps) {
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

        <Button variant="outlined" onPress={handleClose}>
          Entendido
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
