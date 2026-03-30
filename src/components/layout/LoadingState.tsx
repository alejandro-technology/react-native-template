import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
// Components
import { Text } from '@components/core';
// Theme
import { useTheme } from '@theme/index';
import { useAnimatedLoop } from '@theme/hooks';
import { spacing, ANIMATION_EASING } from '@theme/index';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { value: pulseAnim } = useAnimatedLoop({
    type: 'pulse',
    duration: 800,
  });
  const { interpolated: spin } = useAnimatedLoop({
    type: 'rotate',
    duration: 1200,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: ANIMATION_EASING.entrance,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.spinnerContainer,
          {
            transform: [{ scale: pulseAnim }, { rotate: spin! }],
          },
        ]}
      >
        <View
          style={[
            styles.spinner,
            {
              borderTopColor: theme.colors.primary,
              borderColor: theme.colors.border,
            },
          ]}
        />
      </Animated.View>
      <Text variant="body" style={styles.message}>
        {message}
      </Text>
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
  spinnerContainer: {
    marginBottom: spacing.lg,
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderStyle: 'solid',
  },
  message: {
    marginTop: spacing.md,
    opacity: 0.7,
  },
});
