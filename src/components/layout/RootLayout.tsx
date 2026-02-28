import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
// Theme
import { useTheme } from '@theme/index';

interface Props {
  scroll?: boolean;
}
export function RootLayout({
  children,
  scroll = true,
}: PropsWithChildren<Props>) {
  const { colors } = useTheme();
  const { background: backgroundColor } = colors;
  const style = [styles.contentContainer, { backgroundColor }];

  if (scroll) {
    return <ScrollView contentContainerStyle={style}>{children}</ScrollView>;
  }

  return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
});
