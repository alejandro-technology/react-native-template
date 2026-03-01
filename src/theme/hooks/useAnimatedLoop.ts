import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { ANIMATION_EASING } from '../animations';

interface AnimatedLoopConfig {
  type: 'pulse' | 'bounce' | 'rotate';
  duration?: number;
}

export function useAnimatedLoop(config: AnimatedLoopConfig) {
  const { type, duration = 1000 } = config;

  const value = useRef(new Animated.Value(type === 'pulse' ? 1 : 0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    if (type === 'rotate') {
      animation = Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
    } else if (type === 'pulse') {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1.1,
            duration: duration,
            easing: ANIMATION_EASING.loop,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 1,
            duration: duration,
            easing: ANIMATION_EASING.loop,
            useNativeDriver: true,
          }),
        ]),
      );
    } else {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: -10,
            duration: duration,
            easing: ANIMATION_EASING.loop,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: duration,
            easing: ANIMATION_EASING.loop,
            useNativeDriver: true,
          }),
        ]),
      );
    }

    animation.start();

    return () => {
      animation.stop();
    };
  }, [value, type, duration]);

  const interpolated =
    type === 'rotate'
      ? value.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        })
      : undefined;

  return { value, interpolated };
}
