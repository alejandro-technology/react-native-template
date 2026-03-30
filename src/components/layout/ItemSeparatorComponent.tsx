import React from 'react';
import { StyleSheet, View } from 'react-native';
// Theme
import { spacing } from '@theme/spacing';

export function ItemSeparatorComponent() {
  return <View style={styles.root} />;
}

const styles = StyleSheet.create({
  root: {
    height: spacing.md,
  },
});
