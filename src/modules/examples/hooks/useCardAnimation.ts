import { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ANIMATION_DURATION } from '@theme/animations';

/**
 * Hook para manejar la animación de entrada de una tarjeta.
 * Realiza un efecto de Fade In y Slide Up con una duración ligeramente diferente.
 */
export const useCardAnimation = () => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  const playAnimation = useCallback(() => {
    opacityAnim.setValue(0);
    translateYAnim.setValue(20);

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
