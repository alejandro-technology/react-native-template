import React from 'react';
import { StyleSheet, View } from 'react-native';
// Components
import { Text } from '@components/core';
// Store
import { useConnectivityStore } from '@modules/core/application/connectivity.storage';
// Theme
import { useTheme, spacing } from '@theme/index';

export function OfflineBanner() {
  const { colors } = useTheme();
  const isConnected = useConnectivityStore(s => s.isConnected);

  if (isConnected) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.info }]}>
      <Text variant="bodySmall" color="text">
        Sin conexión — usando datos guardados
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
  },
});
