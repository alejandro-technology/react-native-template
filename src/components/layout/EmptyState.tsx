import React from 'react';
import { StyleSheet, Animated } from 'react-native';
// Components
import { Text, Button, Icon } from '@components/core';
// Theme
import { spacing } from '@theme/index';
import { useTheme } from '@theme/index';
import { useFadeScale } from '@theme/hooks';
import { useAnimatedLoop } from '@theme/hooks';
import { SPRING_CONFIGS, ANIMATION_DURATION } from '@theme/animations';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({
  title = 'No encontrado',
  message = 'No se encontró la información solicitada',
  icon,
  onAction,
  actionLabel = 'Volver',
}: EmptyStateProps) {
  const theme = useTheme();

  const { opacity, scale } = useFadeScale({
    initialScale: 0.5,
    duration: ANIMATION_DURATION.slow,
    springConfig: SPRING_CONFIGS.bouncy,
  });

  const { value: bounceAnim } = useAnimatedLoop({
    type: 'bounce',
    duration: 1000,
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.colors.textSecondary + '15',
            transform: [{ translateY: bounceAnim }],
          },
        ]}
      >
        {icon || <Icon name="mailbox" size={50} color="textSecondary" />}
      </Animated.View>

      <Text variant="h3" style={styles.title}>
        {title}
      </Text>

      <Text variant="body" style={styles.message}>
        {message}
      </Text>

      {onAction && (
        <Button onPress={onAction} variant="outlined" style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: 300,
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
    minWidth: 150,
  },
});
