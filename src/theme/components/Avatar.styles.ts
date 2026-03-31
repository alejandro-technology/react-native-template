import { TextStyle } from 'react-native';
import { ThemeMode, colors } from '../colors';
import { borderRadius } from '../borders';
import { hScale } from '../responsive';
import { ImageStyle } from 'react-native-fast-image';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarStyleProps {
  size?: AvatarSize;
  mode?: ThemeMode;
  userId: string;
}

const AVATAR_COLORS = [
  '#E3F2FD',
  '#C8E6C9',
  '#FFF9C4',
  '#E1BEE7',
  '#FFCCBC',
  '#B2DFDB',
  '#F8BBD0',
  '#D7CCC8',
];

function getSizeStyles(size: AvatarSize) {
  switch (size) {
    case 'sm':
      return {
        containerSize: hScale(32),
        fontSize: 12,
      };
    case 'md':
      return {
        containerSize: hScale(48),
        fontSize: 16,
      };
    case 'lg':
      return {
        containerSize: hScale(64),
        fontSize: 22,
      };
    case 'xl':
      return {
        containerSize: hScale(96),
        fontSize: 32,
      };
  }
}

function getAvatarColor(userId: string): string {
  const hash = userId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function getAvatarStyle({
  size = 'md',
  mode = 'light',
  userId,
}: AvatarStyleProps): { container: ImageStyle; text: TextStyle } {
  const themeColors = colors[mode];
  const sizeConfig = getSizeStyles(size);

  return {
    container: {
      width: sizeConfig.containerSize,
      height: sizeConfig.containerSize,
      borderRadius: borderRadius.full,
      backgroundColor: getAvatarColor(userId),
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: sizeConfig.fontSize,
      fontWeight: 'bold',
      color: themeColors.text,
    },
  };
}
