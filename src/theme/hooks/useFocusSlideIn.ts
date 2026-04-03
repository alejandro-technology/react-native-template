import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ANIMATION_DURATION } from '../animations';

interface FocusSlideInConfig {
  duration?: number;
  delay?: number;
  direction?: 'left' | 'right';
  offset?: number;
}

export function useFocusSlideIn({
  duration = ANIMATION_DURATION.normal,
  delay = 0,
  direction = 'right',
  offset = 50,
}: FocusSlideInConfig = {}) {
  const startOffset = direction === 'right' ? offset : -offset;

  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(startOffset)).current;

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(0);
      translateX.setValue(startOffset);

      const animation = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        }),
      ]);
      animation.start();

      return () => {
        animation.stop();
      };
    }, [opacity, translateX, duration, delay, startOffset]),
  );

  return {
    opacity,
    translateX,
    animatedStyle: {
      opacity,
      transform: [{ translateX }],
    },
  };
}
