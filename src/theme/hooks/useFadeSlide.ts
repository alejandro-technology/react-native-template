import { useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { ANIMATION_DURATION, ANIMATION_EASING } from '../animations';

interface FadeSlideConfig {
  offset?: number;
  duration?: number;
  delay?: number;
  direction?: 'down' | 'up';
  autoStart?: boolean;
}

export function useFadeSlide(config?: FadeSlideConfig) {
  const {
    offset = 20,
    duration = ANIMATION_DURATION.normal,
    delay = 0,
    direction = 'down',
    autoStart = true,
  } = config ?? {};

  const slideStart = direction === 'up' ? -offset : offset;

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideStart)).current;

  const start = useCallback(() => {
    opacity.setValue(0);
    translateY.setValue(slideStart);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: ANIMATION_EASING.entrance,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: ANIMATION_EASING.entrance,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, slideStart, duration, delay]);

  const fadeOut = useCallback(
    (onComplete?: () => void) => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          easing: ANIMATION_EASING.exit,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: slideStart,
          duration,
          easing: ANIMATION_EASING.exit,
          useNativeDriver: true,
        }),
      ]).start(() => onComplete?.());
    },
    [opacity, translateY, slideStart, duration],
  );

  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  return { opacity, translateY, start, fadeOut };
}
