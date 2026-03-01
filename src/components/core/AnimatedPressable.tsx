import React, { useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SPRING_CONFIGS } from '@theme/animations';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  scaleValue?: number;
  opacityValue?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function AnimatedPressable({
  scaleValue = 0.97,
  opacityValue = 0.9,
  disabled = false,
  style,
  children,
  onPressIn,
  onPressOut,
  ...pressableProps
}: AnimatedPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(
    (event: any) => {
      if (!disabled) {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: scaleValue,
            ...SPRING_CONFIGS.gentle,
            useNativeDriver: true,
          }),
          Animated.spring(opacityAnim, {
            toValue: opacityValue,
            ...SPRING_CONFIGS.gentle,
            useNativeDriver: true,
          }),
        ]).start();
      }
      onPressIn?.(event);
    },
    [disabled, scaleAnim, opacityAnim, scaleValue, opacityValue, onPressIn],
  );

  const handlePressOut = useCallback(
    (event: any) => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...SPRING_CONFIGS.gentle,
          useNativeDriver: true,
        }),
        Animated.spring(opacityAnim, {
          toValue: 1,
          ...SPRING_CONFIGS.gentle,
          useNativeDriver: true,
        }),
      ]).start();
      onPressOut?.(event);
    },
    [scaleAnim, opacityAnim, onPressOut],
  );

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...pressableProps}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
