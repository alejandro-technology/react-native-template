import React from 'react';
import {
  PressableProps,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
// Types
import {
  ButtonVariant,
  ButtonSize,
  getButtonStyle,
} from '@theme/components/Button.styles';
import { BorderRadiusToken } from '@theme/borders';
import { useTheme, spacing } from '@theme/index';
// Theme
import { Text } from './Text';
import { AnimatedPressable } from './AnimatedPressable';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  borderRadius?: BorderRadiusToken;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    borderRadius,
    leftIcon,
    rightIcon,
    style: customStyle,
    textStyle,
    onPress,
    ...pressableProps
  } = props;

  const theme = useTheme();
  const isDisabled = disabled || loading;

  const styles = getButtonStyle({
    mode: theme.mode,
    variant,
    size,
    disabled: isDisabled,
    fullWidth,
    borderRadius,
  });

  const handlePress = (event: any) => {
    if (!isDisabled && onPress) {
      onPress(event);
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={isDisabled}
      style={[styles.container, customStyle]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...pressableProps}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={styles.text.color as string}
          style={baseStyle.loadingIndicator}
        />
      )}

      {leftIcon && <View style={baseStyle.leftIcon}>{leftIcon}</View>}

      <Text style={textStyle ? [styles.text, textStyle] : styles.text}>
        {children}
      </Text>

      {rightIcon && <View style={baseStyle.rightIcon}>{rightIcon}</View>}
    </AnimatedPressable>
  );
}

const baseStyle = StyleSheet.create({
  loadingIndicator: {
    marginRight: spacing.sm,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
});
