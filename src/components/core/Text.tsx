import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';
// Types
import { ColorVariant } from '@theme/colors';
import { TypographyVariant } from '@theme/typography';
// Theme
import { useTheme } from '@theme/index';
import { getTextStyle } from '@theme/components/Text.styles';

interface TextProps extends RNTextProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  color?: ColorVariant;
  align?: TextStyle['textAlign'];
  transform?: TextStyle['textTransform'];
  decoration?: TextStyle['textDecorationLine'];
  style?: TextStyle | TextStyle[];
}

export function Text(props: TextProps) {
  const {
    children,
    style: customStyle,
    variant = 'body',
    color = 'text',
    align,
    transform,
    decoration,
    ...rest
  } = props;

  const theme = useTheme();

  const style = getTextStyle({
    mode: theme.mode,
    variant,
    color,
    align,
    transform,
    decoration,
  });

  return (
    <RNText style={[style, customStyle]} {...rest}>
      {children}
    </RNText>
  );
}
