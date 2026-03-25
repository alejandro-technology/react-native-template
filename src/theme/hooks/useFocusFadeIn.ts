import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ANIMATION_DURATION } from '../animations';

interface FocusFadeInConfig {
  duration?: number;
  delay?: number;
  offset?: number;
}

export function useFocusFadeIn({
  duration = ANIMATION_DURATION.normal,
  delay = 0,
  offset = 20,
}: FocusFadeInConfig = {}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offset)).current;

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(0);
      translateY.setValue(offset);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }, [opacity, translateY, duration, delay, offset]),
  );

  return {
    opacity,
    translateY,
    animatedStyle: {
      opacity,
      transform: [{ translateY }],
    },
  };
}
