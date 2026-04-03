import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import {
  ANIMATION_DURATION,
  ANIMATION_EASING,
  SPRING_CONFIGS,
} from '../animations';

interface FadeScaleConfig {
  initialScale?: number;
  duration?: number;
  springConfig?: { friction: number; tension: number };
}

export function useFadeScale(config?: FadeScaleConfig) {
  const {
    initialScale = 0.8,
    duration = ANIMATION_DURATION.normal,
    springConfig = SPRING_CONFIGS.gentle,
  } = config ?? {};

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(initialScale)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        easing: ANIMATION_EASING.entrance,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: springConfig.friction,
        tension: springConfig.tension,
        useNativeDriver: true,
      }),
    ]);
    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity, scale, duration, springConfig.friction, springConfig.tension]);

  return { opacity, scale };
}
