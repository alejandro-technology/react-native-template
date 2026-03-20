import { ViewStyle, TextStyle } from 'react-native';
import { Colors, ThemeMode, colors } from '../colors';
import { spacing } from '../spacing';
import { borderRadius, BorderRadiusToken } from '../borders';
import { typography } from '../typography';
import { hScale } from '../responsive';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  mode?: ThemeMode;
  disabled?: boolean;
  fullWidth?: boolean;
  borderRadius?: BorderRadiusToken;
}

function getSizeStyles(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return {
        padding: spacing.sm,
        fontSize: typography.bodySmall.fontSize ?? 14,
        height: hScale(36),
      };
    case 'md':
      return {
        padding: spacing.md,
        fontSize: typography.body.fontSize ?? 16,
        height: hScale(48),
      };
    case 'lg':
      return {
        padding: spacing.lg,
        fontSize: typography.body.fontSize ?? 16,
        height: hScale(56),
      };
  }
}

function getVariantStyles(
  variant: ButtonVariant,
  themeColors: Colors,
  disabled: boolean,
): { container: ViewStyle; text: TextStyle } {
  const opacity = disabled ? 0.5 : 1;

  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: themeColors.primary,
          borderWidth: 0,
          opacity,
        },
        text: {
          color: themeColors.onPrimary,
        },
      };

    case 'secondary':
      return {
        container: {
          backgroundColor: themeColors.surface,
          borderWidth: 1,
          borderColor: themeColors.border,
          opacity,
        },
        text: {
          color: themeColors.text,
        },
      };

    case 'outlined':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: themeColors.primary,
          opacity,
        },
        text: {
          color: themeColors.primary,
        },
      };

    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 0,
          opacity,
        },
        text: {
          color: themeColors.primary,
        },
      };

    default:
      return {
        container: {},
        text: {},
      };
  }
}

export function getButtonStyle({
  variant = 'primary',
  size = 'md',
  mode = 'light',
  disabled = false,
  fullWidth = false,
  borderRadius: borderRadiusToken = 'md',
}: ButtonStyleProps): { container: ViewStyle; text: TextStyle } {
  const themeColors = colors[mode];
  const sizeConfig = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant, themeColors, disabled);

  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: sizeConfig.padding * 2,
      height: sizeConfig.height,
      borderRadius: borderRadius[borderRadiusToken],
      ...(fullWidth && { width: '100%' }),
      ...variantStyles.container,
    },
    text: {
      fontSize: sizeConfig.fontSize,
      fontWeight: '600',
      textAlign: 'center',
      ...variantStyles.text,
    },
  };
}
