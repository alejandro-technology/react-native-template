import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Badge, Card, Text } from '@components/core';

import { spacing } from '@theme/index';

import type { ExampleListItem as ExampleListItemModel } from '../../domain/example-list-item.model';

interface Props {
  item: ExampleListItemModel;
}

export function ExampleListItem({ item }: Props) {
  return (
    <Card variant="outlined" size="md" fullWidth style={styles.card}>
      <View style={styles.row}>
        <Avatar
          name={item.title}
          userId={`${item.source}-${item.id}`}
          imageUrl={item.imageUrl}
          size="lg"
        />

        <View style={styles.content}>
          <Text variant="h5">{item.title}</Text>
          {item.subtitle ? (
            <Text variant="bodySmall" color="textSecondary">
              {item.subtitle}
            </Text>
          ) : null}
          {item.description ? (
            <Text variant="caption" color="textSecondary">
              {item.description}
            </Text>
          ) : null}
        </View>
      </View>

      {item.badges?.length ? (
        <View style={styles.badges}>
          {item.badges.map(badge => (
            <Badge key={badge} label={badge} variant="default" size="sm" />
          ))}
        </View>
      ) : null}

      {item.metadata?.length ? (
        <View style={styles.metadata}>
          {item.metadata.map(field => (
            <Text key={`${field.label}-${field.value}`} variant="caption">
              {field.label}: {field.value}
            </Text>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  metadata: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});
