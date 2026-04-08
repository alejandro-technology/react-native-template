import { ViewStyle, TextStyle } from 'react-native';
import { Colors, ThemeMode, colors } from '../colors';
import { spacing } from '../spacing';
import { borderRadius, BorderRadiusToken } from '../borders';
import { getShadows } from '@theme/shadows';

export type ModalSize = 'sm' | 'md' | 'lg';

interface ModalStyleProps {
  size?: ModalSize;
  mode?: ThemeMode;
  borderRadius?: BorderRadiusToken;
}

function getSizeStyles(size: ModalSize): {
  width: ViewStyle['width'];
  padding: number;
} {
  switch (size) {
    case 'sm':
      return {
        width: '80%',
        padding: spacing.md,
      };
    case 'md':
      return {
        width: '90%',
        padding: spacing.lg,
      };
    case 'lg':
      return {
        width: '94%',
        padding: spacing.xl,
      };
    default:
      return {
        width: '90%',
        padding: spacing.lg,
      };
  }
}

function getVariantStyles(
  themeColors: Colors,
  mode: ThemeMode,
): { container: ViewStyle; title: TextStyle } {
  const shadowStyle = getShadows(mode === 'dark');

  return {
    container: {
      backgroundColor: themeColors.surface,
      ...shadowStyle.md,
    },
    title: {
      color: themeColors.text,
    },
  };
}

export function getModalStyle({
  size = 'md',
  mode = 'light',
  borderRadius: borderRadiusToken = 'lg',
}: ModalStyleProps): {
  overlay: ViewStyle;
  backdrop: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  iconButton: ViewStyle;
  content: ViewStyle;
} {
  const themeColors = colors[mode];
  const sizeConfig = getSizeStyles(size);
  const variantStyles = getVariantStyles(themeColors, mode);

  return {
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    container: {
      maxHeight: '80%',
      borderRadius: borderRadius[borderRadiusToken],
      padding: sizeConfig.padding,
      width: sizeConfig.width,
      ...variantStyles.container,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      flex: 1,
      textAlign: 'center',
      ...variantStyles.title,
    },
    iconButton: {
      padding: spacing.xs,
      marginRight: spacing.sm,
    },
    content: {
      marginTop: spacing.md,
    },
  };
}
