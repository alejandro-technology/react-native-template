import React, { useEffect, useRef } from 'react';
import { Animated, Text as RNText, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing } from '@theme/index';
import { getToastStyle } from '@theme/components/Toast.styles';
import { useFadeSlide } from '@theme/hooks';

import type {
  ToastType,
  ToastPosition,
} from '@modules/core/application/app.storage';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration: number;
  position: ToastPosition;
}

export function Toast({
  message,
  type,
  visible,
  onHide,
  duration,
  position,
}: ToastProps) {
  const { top, bottom } = useSafeAreaInsets();
  const { mode } = useTheme();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const styles = getToastStyle({ type, mode });
  const isTop = position === 'top';

  const { opacity, translateY, start, fadeOut } = useFadeSlide({
    direction: isTop ? 'up' : 'down',
    autoStart: false,
  });

  useEffect(() => {
    if (visible) {
      start();

      timerRef.current = setTimeout(() => {
        fadeOut(() => onHide());
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, duration, onHide, start, fadeOut]);

  if (!visible) return null;

  const positionStyle = isTop
    ? { top: top + spacing.md }
    : { bottom: bottom + spacing.md };

  return (
    <Animated.View
      style={[
        fixedStyles.wrapper,
        positionStyle,
        styles.container,
        { opacity, transform: [{ translateY }] },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel={message}
    >
      <RNText style={[fixedStyles.icon, { color: styles.text.color }]}>
        {styles.icon}
      </RNText>
      <RNText style={styles.text}>{message}</RNText>
    </Animated.View>
  );
}

const fixedStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    zIndex: 9999,
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
