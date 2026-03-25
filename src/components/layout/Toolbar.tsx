import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
// Components
import { AnimatedPressable, Icon, IconName, Text } from '@components/core';
// Theme
import { hScale, screenWidth, spacing, useTheme } from '@theme/index';

export interface ToolbarOptions {
  icon: IconName;
  onPress?: () => void;
}

interface Props {
  title?: string;
  rightOptions?: ToolbarOptions[];
  leftOptions?: ToolbarOptions[];
}

export function Toolbar({ title, leftOptions, rightOptions }: Props) {
  const {
    colors: { surface, border },
  } = useTheme();

  const renderOptions = useCallback((options: ToolbarOptions[]) => {
    return options?.map(option => (
      <AnimatedPressable key={option.icon} onPress={option.onPress}>
        <Icon name={option.icon} size={spacing.lg} />
      </AnimatedPressable>
    ));
  }, []);

  const renderLeft = useCallback(() => {
    if (leftOptions) return renderOptions(leftOptions);
    return <View style={styles.placeholder} />;
  }, [leftOptions, renderOptions]);

  const renderRight = useCallback(() => {
    if (rightOptions) return renderOptions(rightOptions);
    return <View style={styles.placeholder} />;
  }, [rightOptions, renderOptions]);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: surface,
          borderBottomColor: border,
        },
      ]}
    >
      <View style={styles.leftContainer}>{renderLeft()}</View>

      <View style={styles.titleContainer}>
        <View style={styles.title}>
          <Text variant="h4" numberOfLines={1} align="center">
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.rightContainer}>{renderRight()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    height: hScale(56),
  },
  leftContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  titleContainer: {
    position: 'absolute',
    width: screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    width: '55%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  placeholder: {
    width: spacing.lg,
  },
});
