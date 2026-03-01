import React from 'react';
import { View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
// Components
import { Text } from './Text';
// Theme
import { useTheme } from '@theme/index';
import { AvatarSize, getAvatarStyle } from '@theme/components/Avatar.styles';

interface AvatarProps {
  name: string;
  userId: string;
  size?: AvatarSize;
  imageUrl?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function Avatar({ name, userId, size = 'md', imageUrl }: AvatarProps) {
  const theme = useTheme();
  const initials = getInitials(name);
  const styles = getAvatarStyle({ size, mode: theme.mode, userId });

  if (imageUrl) {
    return (
      <FastImage
        style={[styles.container, imageStyles.image]}
        source={{
          uri: imageUrl,
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{initials}</Text>
    </View>
  );
}

const imageStyles = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
});
