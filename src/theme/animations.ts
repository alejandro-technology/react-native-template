import { Easing } from 'react-native';

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const SPRING_CONFIGS = {
  gentle: { friction: 8, tension: 40 },
  bouncy: { friction: 6, tension: 40 },
} as const;

export const ANIMATION_EASING = {
  entrance: Easing.out(Easing.ease),
  exit: Easing.in(Easing.ease),
  loop: Easing.inOut(Easing.ease),
} as const;
