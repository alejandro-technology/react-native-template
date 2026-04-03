import React from 'react';
import { PressableProps, ViewStyle, TextStyle, View } from 'react-native';
// Types
import {
  CheckboxVariant,
  CheckboxSize,
  getCheckboxStyle,
} from '@theme/components/Checkbox.styles';
import { BorderRadiusToken } from '@theme/borders';
import { useTheme } from '@theme/index';
// Components
import { Text } from './Text';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon } from './Icon';

interface CheckboxProps extends Omit<PressableProps, 'style'> {
  checked?: boolean;
  label?: React.ReactNode;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  disabled?: boolean;
  borderRadius?: BorderRadiusToken;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onChange?: (checked: boolean) => void;
}

export function Checkbox(props: CheckboxProps) {
  const {
    checked = false,
    label,
    variant = 'primary',
    size = 'md',
    disabled = false,
    borderRadius,
    style: customStyle,
    textStyle,
    onChange,
    onPress,
    ...pressableProps
  } = props;

  const theme = useTheme();

  const styles = getCheckboxStyle({
    mode: theme.mode,
    variant,
    size,
    disabled,
    checked,
    borderRadius,
  });

  const handlePress = (event: any) => {
    if (!disabled) {
      if (onChange) {
        onChange(!checked);
      }
      if (onPress) {
        onPress(event);
      }
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, customStyle]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={typeof label === 'string' ? label : undefined}
      {...pressableProps}
    >
      <View style={styles.box}>
        {checked && (
          <View testID="checkbox-check">
            <Icon name="check" />
          </View>
        )}
      </View>

      {label && (
        <Text style={textStyle ? [styles.label, textStyle] : styles.label}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}
