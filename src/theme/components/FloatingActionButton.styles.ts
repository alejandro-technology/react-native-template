import { ViewStyle } from 'react-native';
import { colors, ThemeMode } from '../colors';
import { spacing } from '../spacing';
import { borderRadius } from '../borders';
import { moderateScale } from '../responsive';

export type FABSize = 'sm' | 'md' | 'lg';
export type FABPosition = 'bottom-right' | 'bottom-left' | 'bottom-center';

interface FABStyleProps {
  mode: ThemeMode;
  size?: FABSize;
  position?: FABPosition;
}

interface FABStyles {
  container: ViewStyle;
  button: ViewStyle;
}

const sizeMap: Record<FABSize, number> = {
  sm: moderateScale(40),
  md: moderateScale(52),
  lg: moderateScale(64),
};

const positionMap: Record<FABPosition, ViewStyle> = {
  'bottom-right': {
    bottom: spacing.sm,
    right: spacing.sm,
  },
  'bottom-left': {
    bottom: spacing.sm,
    left: spacing.sm,
  },
  'bottom-center': {
    bottom: spacing.sm,
    alignSelf: 'center',
  },
};

export function getFABStyle(props: FABStyleProps): FABStyles {
  const { mode, size = 'md', position = 'bottom-right' } = props;
  const themeColors = colors[mode];
  const buttonSize = sizeMap[size];

  return {
    container: {
      position: 'absolute',
      ...positionMap[position],
      zIndex: 100,
    },
    button: {
      width: buttonSize,
      height: buttonSize,
      borderRadius: borderRadius.full,
      backgroundColor: themeColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
  };
}
