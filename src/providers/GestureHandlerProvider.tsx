import { StatusBar } from 'react-native';
import React, { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Styles
import { useTheme, commonStyles } from '@theme/index';

export default function GestureHandlerProvider({
  children,
}: PropsWithChildren) {
  const {
    isDark,
    colors: { background: backgroundColor },
  } = useTheme();
  return (
    <GestureHandlerRootView
      style={{
        ...commonStyles.flex,
        backgroundColor,
      }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {children}
    </GestureHandlerRootView>
  );
}
