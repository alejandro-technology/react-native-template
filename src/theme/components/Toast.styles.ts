import { ViewStyle, TextStyle } from 'react-native';
import { Colors, ThemeMode, colors } from '../colors';
import { spacing } from '../spacing';
import { borderRadius } from '../borders';
import { getShadows } from '../shadows';
import { typography } from '../typography';

import type { ToastType } from '@modules/core/application/app.storage';

interface ToastStyleProps {
  type?: ToastType;
  mode?: ThemeMode;
}

function getTypeStyles(
  type: ToastType,
  themeColors: Colors,
): { container: ViewStyle; icon: string } {
  switch (type) {
    case 'success':
      return {
        container: { backgroundColor: themeColors.success },
        icon: '\u2713',
      };
    case 'error':
      return {
        container: { backgroundColor: themeColors.error },
        icon: '\u2715',
      };
    case 'info':
      return {
        container: { backgroundColor: themeColors.info },
        icon: '\u2139',
      };
  }
}

export function getToastStyle({
  type = 'info',
  mode = 'light',
}: ToastStyleProps): { container: ViewStyle; text: TextStyle; icon: string } {
  const themeColors = colors[mode];
  const isDark = mode === 'dark';
  const shadows = getShadows(isDark);
  const typeStyles = getTypeStyles(type, themeColors);

  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      ...shadows.md,
      ...typeStyles.container,
    },
    text: {
      color: themeColors.onPrimary,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: '600',
      flex: 1,
      marginLeft: spacing.sm,
    },
    icon: typeStyles.icon,
  };
}
