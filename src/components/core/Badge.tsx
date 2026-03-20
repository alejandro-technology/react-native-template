import React from 'react';
import { View } from 'react-native';
// Components
import { Text } from './Text';
// Theme
import { useTheme } from '@theme/index';
import {
  BadgeVariant,
  BadgeSize,
  getBadgeStyle,
} from '@theme/components/Badge.styles';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export function Badge({ label, variant = 'default', size = 'md' }: BadgeProps) {
  const theme = useTheme();
  const styles = getBadgeStyle({ variant, size, mode: theme.mode });

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
