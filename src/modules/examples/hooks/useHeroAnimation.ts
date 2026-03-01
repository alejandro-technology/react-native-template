import { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ANIMATION_DURATION } from '@theme/index';

/**
 * Hook para manejar la animación de entrada del componente Hero.
 * Realiza un efecto de Fade In y Slide Up.
 */
export const useHeroAnimation = () => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-30)).current;

  const playAnimation = useCallback(() => {
    opacityAnim.setValue(0);
    translateYAnim.setValue(-30);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION.slow,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION.slow,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, translateYAnim]);

  useFocusEffect(
    useCallback(() => {
      playAnimation();
    }, [playAnimation]),
  );

  return {
    opacityAnim,
    translateYAnim,
    playAnimation,
  };
};
