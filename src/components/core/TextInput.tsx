import React, { forwardRef, useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
// Types
import {
  TextInputVariant,
  TextInputSize,
  TextInputState,
  getTextInputStyle,
  getLabelStyle,
  getErrorStyle,
  getHelperTextStyle,
} from '@theme/components/TextInput.styles';
import { BorderRadiusToken } from '@theme/borders';
import { useTheme, spacing } from '@theme/index';
// Theme
import { Text } from './Text';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: TextInputVariant;
  size?: TextInputSize;
  fullWidth?: boolean;
  borderRadius?: BorderRadiusToken;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (props: TextInputProps, ref) => {
    const {
      label,
      helperText,
      error,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      borderRadius,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      editable = true,
      onFocus,
      onBlur,
      placeholderTextColor,
      ...textInputProps
    } = props;

    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const isDisabled = editable === false;
    const hasError = !!error;

    const state: TextInputState = isDisabled
      ? 'disabled'
      : hasError
      ? 'error'
      : isFocused
      ? 'focus'
      : 'default';

    const styles = getTextInputStyle({
      mode: theme.mode,
      variant,
      size,
      state,
      fullWidth,
      borderRadius,
      hasIconLeft: !!leftIcon,
      hasIconRight: !!rightIcon,
    });

    const labelStyles = getLabelStyle(theme.mode, state);
    const errorStyles = getErrorStyle(theme.mode);
    const helperStyles = getHelperTextStyle(theme.mode);

    const handleFocus = (event: any) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: any) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    return (
      <View
        style={[
          baseStyles.wrapper,
          fullWidth && baseStyles.fullWidth,
          containerStyle,
        ]}
      >
        {label && (
          <Text
            variant="bodySmall"
            color={hasError ? 'error' : isFocused ? 'primary' : 'textSecondary'}
            style={labelStyles}
          >
            {label}
          </Text>
        )}

        <View
          style={[styles.container, baseStyles.inputContainer]}
          pointerEvents={textInputProps.pointerEvents}
        >
          {leftIcon && <View style={baseStyles.leftIcon}>{leftIcon}</View>}

          <RNTextInput
            ref={ref}
            style={[styles.input, inputStyle]}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={
              placeholderTextColor || theme.colors.textSecondary
            }
            accessibilityLabel={label}
            accessibilityState={{ disabled: isDisabled }}
            accessibilityHint={helperText}
            {...textInputProps}
          />

          {rightIcon && <View style={baseStyles.rightIcon}>{rightIcon}</View>}
        </View>

        {error && (
          <Text variant="caption" color="error" style={errorStyles}>
            {error}
          </Text>
        )}

        {!error && helperText && (
          <Text variant="caption" color="textSecondary" style={helperStyles}>
            {helperText}
          </Text>
        )}
      </View>
    );
  },
);

const baseStyles = StyleSheet.create({
  wrapper: {
    width: 'auto',
  },
  fullWidth: {
    width: '100%',
  },
  inputContainer: {
    overflow: 'hidden',
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
});
