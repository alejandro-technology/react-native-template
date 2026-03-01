import React from 'react';
import { View, PressableProps, ViewStyle } from 'react-native';
import { BorderRadiusToken } from '@theme/borders';
import { useTheme } from '@theme/index';
import {
  CardVariant,
  CardSize,
  getCardStyle,
} from '@theme/components/Card.styles';
import { AnimatedPressable } from './AnimatedPressable';

interface CardBaseProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  borderRadius?: BorderRadiusToken;
  fullWidth?: boolean;
  style?: ViewStyle;
}

interface CardAsView extends CardBaseProps {
  onPress?: never;
}

interface CardAsPressable extends CardBaseProps {
  onPress: PressableProps['onPress'];
  disabled?: PressableProps['disabled'];
}

type CardProps = CardAsView | CardAsPressable;

export function Card(props: CardProps) {
  const {
    children,
    variant = 'elevated',
    size = 'md',
    borderRadius,
    fullWidth = false,
    style: customStyle,
  } = props;

  const theme = useTheme();

  const isPressable = 'onPress' in props && props.onPress !== undefined;

  const styles = getCardStyle({
    variant,
    size,
    mode: theme.mode,
    borderRadius,
  });

  const cardStyle: ViewStyle = {
    ...styles,
    ...(fullWidth && { width: '100%' }),
    ...customStyle,
  };

  if (isPressable) {
    const { onPress, disabled = false } = props;
    const isDisabled = disabled;

    const handlePress = (event: any) => {
      if (!isDisabled && onPress) {
        onPress(event);
      }
    };

    return (
      <AnimatedPressable
        onPress={handlePress}
        disabled={Boolean(isDisabled)}
        style={cardStyle}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
