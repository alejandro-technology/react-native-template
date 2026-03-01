import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Text, Card } from '@components/core';
import { spacing } from '@theme/index';
import { borderRadius } from '@theme/borders';
import { useFadeSlide } from '@theme/hooks';

export interface ComponentCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
  delay?: number;
}

function ComponentCard({
  title,
  description,
  icon,
  color,
  onPress,
  delay = 0,
}: ComponentCardProps) {
  const { opacity, translateY } = useFadeSlide({
    offset: 20,
    duration: 400,
    delay,
  });

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Card
        onPress={onPress}
        style={{ ...styles.card, borderLeftColor: color }}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Text style={[styles.icon, { color }]}>{icon}</Text>
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
          <Text style={[styles.arrow, { color }]}>→</Text>
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
