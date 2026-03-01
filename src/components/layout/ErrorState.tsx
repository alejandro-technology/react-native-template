import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
// Components
import { Text, Button } from '@components/core';
// Theme
import { spacing } from '@theme/index';
import { useTheme } from '@theme/index';
import { useFadeScale } from '@theme/hooks';
import { SPRING_CONFIGS } from '@theme/animations';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Error',
  message = 'Ha ocurrido un error',
  onRetry,
  retryLabel = 'Reintentar',
}: ErrorStateProps) {
  const theme = useTheme();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const { opacity, scale } = useFadeScale({
    initialScale: 0.8,
    duration: 400,
    springConfig: SPRING_CONFIGS.gentle,
  });

  useEffect(() => {
    // Shake animation (unique to ErrorState)
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateX: shakeAnim }, { scale }],
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.error + '20' },
        ]}
      >
        <Text variant="h1" style={[styles.icon, { color: theme.colors.error }]}>
          ⚠️
        </Text>
      </View>

      <Text variant="h3" style={[styles.title, { color: theme.colors.error }]}>
        {title}
      </Text>

      <Text variant="body" style={styles.message}>
        {message}
      </Text>

      {onRetry && (
        <Button onPress={onRetry} style={styles.button}>
          {retryLabel}
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    marginBottom: spacing.md,
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
