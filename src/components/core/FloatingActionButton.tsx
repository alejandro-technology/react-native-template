import React from 'react';
import { View } from 'react-native';
// Components
import { AnimatedPressable } from './AnimatedPressable';
import { Icon, IconName } from './Icon';
// Theme
import { useTheme } from '@theme/index';
import {
  getFABStyle,
  FABSize,
  FABPosition,
} from '@theme/components/FloatingActionButton.styles';

export interface FloatingActionButtonProps {
  icon: IconName;
  onPress: () => void;
  size?: FABSize;
  position?: FABPosition;
}

export function FloatingActionButton({
  icon,
  onPress,
  size = 'md',
  position = 'bottom-right',
}: FloatingActionButtonProps) {
  const { mode } = useTheme();
  const styles = getFABStyle({ mode, size, position });

  return (
    <View style={styles.container}>
      <AnimatedPressable
        style={styles.button}
        onPress={onPress}
        accessibilityRole="button"
      >
        <Icon name={icon} color="onPrimary" />
      </AnimatedPressable>
    </View>
  );
}
