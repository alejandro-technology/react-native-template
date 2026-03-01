import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface ReanimatedEntryConfig {
  offset?: number;
  duration?: number;
  delay?: number;
}

export function useReanimatedEntry(config?: ReanimatedEntryConfig) {
  const { offset = 20, duration = 400, delay = 0 } = config ?? {};

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(offset);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const play = () => {
    opacity.value = 0;
    translateY.value = offset;

    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
  };

  return { animatedStyle, play };
}
