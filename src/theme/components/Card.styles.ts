import { ViewStyle } from 'react-native';
import { Colors, ThemeMode, colors } from '../colors';
import { spacing } from '../spacing';
import { borderRadius, BorderRadiusToken } from '../borders';
import { getShadows } from '@theme/shadows';

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';
export type CardSize = 'sm' | 'md' | 'lg';

interface CardStyleProps {
  variant?: CardVariant;
  size?: CardSize;
  mode?: ThemeMode;
  borderRadius?: BorderRadiusToken;
}

function getSizeStyles(size: CardSize) {
  switch (size) {
    case 'sm':
      return {
        padding: spacing.sm,
      };
    case 'md':
      return {
        padding: spacing.md,
      };
    case 'lg':
      return {
        padding: spacing.lg,
      };
  }
}

function getVariantStyles(
  variant: CardVariant,
  themeColors: Colors,
  mode: ThemeMode,
): ViewStyle {
  const shadowStyle = getShadows(mode === 'dark');

  switch (variant) {
    case 'elevated':
      return {
        backgroundColor: themeColors.surface,
        ...shadowStyle.md,
      };

    case 'outlined':
      return {
        backgroundColor: themeColors.surface,
        borderWidth: 1,
        borderColor: themeColors.border,
      };

    case 'filled':
      return {
        backgroundColor: themeColors.surface,
      };

    case 'ghost':
      return {
        backgroundColor: 'transparent',
      };

    default:
      return {};
  }
}

export function getCardStyle({
  variant = 'elevated',
  size = 'md',
  mode = 'light',
  borderRadius: borderRadiusToken = 'md',
}: CardStyleProps): { container: ViewStyle } {
  const themeColors = colors[mode];
  const sizeConfig = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant, themeColors, mode);

  return {
    container: {
      borderRadius: borderRadius[borderRadiusToken],
      ...sizeConfig,
      ...variantStyles,
    },
  };
}
