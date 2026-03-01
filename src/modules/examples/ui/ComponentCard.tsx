import React, { useMemo } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { useCardAnimation } from '../hooks/useCardAnimation';
import { Text, Card } from '@components/core';
import { spacing } from '@theme/index';
import { borderRadius } from '@theme/borders';

export interface ComponentCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

function ComponentCard({
  title,
  description,
  icon,
  color,
  onPress,
}: ComponentCardProps) {
  const { opacityAnim, translateYAnim } = useCardAnimation();

  const animatedStyle = {
    opacity: opacityAnim,
    transform: [{ translateY: translateYAnim }],
  };

  const { cardStyle, iconContainerStyle, textStyle, arrowStyle } = useMemo(
    () => ({
      cardStyle: StyleSheet.flatten([styles.card, { borderLeftColor: color }]),
      iconContainerStyle: StyleSheet.flatten([
        styles.iconContainer,
        { backgroundColor: color + '15' },
      ]),
      textStyle: StyleSheet.flatten([styles.icon, { color }]),
      arrowStyle: StyleSheet.flatten([styles.arrow, { color }]),
    }),
    [color],
  );

  return (
    <Animated.View style={animatedStyle}>
      <Card onPress={onPress} style={cardStyle}>
        <View style={iconContainerStyle}>
          <Text style={textStyle}>{icon}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text variant="h4" style={styles.cardTitle}>
            {title}
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            {description}
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={arrowStyle}>→</Text>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: spacing.xs,
  },
  arrowContainer: {
    marginLeft: spacing.sm,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '400',
  },
});

export default ComponentCard;
