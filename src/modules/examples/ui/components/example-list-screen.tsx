import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@components/core';

import { spacing } from '@theme/index';

interface Props {
  title: string;
  subtitle?: string;
}

export function ExampleListScreen({
  title,
  subtitle,
  children,
}: PropsWithChildren<Props>) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2">{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});
