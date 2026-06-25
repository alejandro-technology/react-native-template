import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ANIMATION_DURATION } from '../animations';
import { isIOS } from '@theme/responsive';

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
  const opacity = useRef(new Animated.Value(isIOS ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(isIOS ? 0 : offset)).current;
  useFocusEffect(
    useCallback(() => {
      if (isIOS) return;
      opacity.setValue(0);
      translateY.setValue(offset);

      const animation = Animated.parallel([
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
      ]);
      animation.start();

      return () => {
        animation.stop();
      };
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
