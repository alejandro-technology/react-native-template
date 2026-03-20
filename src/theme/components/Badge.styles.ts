import { ViewStyle, TextStyle } from 'react-native';
import { Colors, ThemeMode, colors } from '../colors';
import { spacing } from '../spacing';
import { borderRadius } from '../borders';
import { typography } from '../typography';

export type BadgeVariant = 'admin' | 'editor' | 'viewer' | 'default';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeStyleProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  mode?: ThemeMode;
}

function getVariantStyles(
  variant: BadgeVariant,
  themeColors: Colors,
): { container: ViewStyle; text: TextStyle } {
  switch (variant) {
    case 'admin':
      return {
        container: {
          backgroundColor: themeColors.primary,
        },
        text: {
          color: themeColors.onPrimary,
        },
      };

    case 'editor':
      return {
        container: {
          backgroundColor: themeColors.success,
        },
        text: {
          color: themeColors.onSuccess,
        },
      };

    case 'viewer':
      return {
        container: {
          backgroundColor: themeColors.border,
        },
        text: {
          color: themeColors.text,
        },
      };

    case 'default':
      return {
        container: {
          backgroundColor: themeColors.surface,
          borderWidth: 1,
          borderColor: themeColors.border,
        },
        text: {
          color: themeColors.textSecondary,
        },
      };
  }
}

function getSizeStyles(size: BadgeSize) {
  switch (size) {
    case 'sm':
      return {
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xs / 4,
        fontSize: typography.overline.fontSize,
      };
    case 'md':
      return {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        fontSize: typography.overline.fontSize,
      };
    case 'lg':
      return {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        fontSize: typography.caption.fontSize,
      };
  }
}

export function getBadgeStyle({
  variant = 'default',
  size = 'md',
  mode = 'light',
}: BadgeStyleProps): { container: ViewStyle; text: TextStyle } {
  const themeColors = colors[mode];
  const variantStyles = getVariantStyles(variant, themeColors);
  const sizeConfig = getSizeStyles(size);

  return {
    container: {
      paddingHorizontal: sizeConfig.paddingHorizontal,
      paddingVertical: sizeConfig.paddingVertical,
      borderRadius: borderRadius.sm,
      alignSelf: 'flex-start',
      ...variantStyles.container,
    },
    text: {
      fontSize: sizeConfig.fontSize,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      ...variantStyles.text,
    },
  };
}
