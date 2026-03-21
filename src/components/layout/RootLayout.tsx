import React, { PropsWithChildren } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
// Theme
import {
  ANIMATION_DURATION,
  SpacingToken,
  useFocusFadeIn,
  useTheme,
} from '@theme/index';
import { Toolbar, ToolbarOptions } from './Toolbar';
import { useNavigation } from '@react-navigation/native';

interface Props {
  scroll?: boolean;
  padding?: SpacingToken;
  toolbar?: boolean;
  // Toolbar
  title?: string;
  rightOptions?: ToolbarOptions[];
  leftOptions?: ToolbarOptions[];
}

export function RootLayout({
  children,
  scroll = true,
  padding,
  toolbar = true,
  title,
  leftOptions,
  rightOptions,
}: PropsWithChildren<Props>) {
  const { colors, spacing } = useTheme();
  const { background: backgroundColor } = colors;

  const { animatedStyle: contentStyle } = useFocusFadeIn({
    duration: ANIMATION_DURATION.slow,
    offset: spacing.xl,
  });

  const { goBack } = useNavigation();

  const defaultLeftOptions: ToolbarOptions[] = [
    { icon: 'arrow-left', onPress: goBack },
  ];
  const defaultRightOptions: ToolbarOptions[] = [{ icon: 'mailbox' }];

  const style = [
    styles.container,
    { backgroundColor, padding: padding && spacing[padding] },
  ];

  if (scroll) {
    return (
      <Animated.ScrollView
        keyboardShouldPersistTaps="handled"
        style={contentStyle}
      >
        {toolbar && (
          <Toolbar
            title={title}
            leftOptions={leftOptions || defaultLeftOptions}
            rightOptions={rightOptions || defaultRightOptions}
          />
        )}
        <View style={style}>{children}</View>
      </Animated.ScrollView>
    );
  }

  return (
    <Animated.View style={[style, contentStyle]}>
      {toolbar && <Toolbar title={title} />}
      <View style={style}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
