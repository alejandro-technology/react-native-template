import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, Text } from '@components/core';
import { spacing } from '@theme/index';

export default function AvatarsView() {
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Tamaños
        </Text>
        <View style={styles.row}>
          <View style={styles.item}>
            <Avatar name="Ana Lopez" userId="user-sm" size="sm" />
            <Text variant="caption" color="textSecondary">
              Small
            </Text>
          </View>
          <View style={styles.item}>
            <Avatar name="Carlos Ruiz" userId="user-md" size="md" />
            <Text variant="caption" color="textSecondary">
              Medium
            </Text>
          </View>
          <View style={styles.item}>
            <Avatar name="Maria Garcia" userId="user-lg" size="lg" />
            <Text variant="caption" color="textSecondary">
              Large
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Colores por usuario
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          El color se genera automaticamente segun el ID del usuario
        </Text>
        <View style={styles.row}>
          <Avatar name="Pedro Sanchez" userId="id-1" size="md" />
          <Avatar name="Laura Martinez" userId="id-2" size="md" />
          <Avatar name="Diego Torres" userId="id-3" size="md" />
          <Avatar name="Sofia Herrera" userId="id-4" size="md" />
          <Avatar name="Juan Perez" userId="id-5" size="md" />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Iniciales
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          Nombre completo genera dos iniciales, nombre corto usa las primeras
          dos letras
        </Text>
        <View style={styles.row}>
          <View style={styles.item}>
            <Avatar name="Ana Lucia Gomez" userId="init-1" size="lg" />
            <Text variant="caption" color="textSecondary">
              AG
            </Text>
          </View>
          <View style={styles.item}>
            <Avatar name="Bo" userId="init-2" size="lg" />
            <Text variant="caption" color="textSecondary">
              BO
            </Text>
          </View>
          <View style={styles.item}>
            <Avatar name="Carlos David" userId="init-3" size="lg" />
            <Text variant="caption" color="textSecondary">
              CD
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="h3" color="primary">
          Con imagen
        </Text>
        <View style={styles.row}>
          <Avatar
            name="Usuario"
            userId="img-1"
            size="sm"
            imageUrl="https://i.pravatar.cc/64?img=1"
          />
          <Avatar
            name="Usuario"
            userId="img-2"
            size="md"
            imageUrl="https://i.pravatar.cc/96?img=2"
          />
          <Avatar
            name="Usuario"
            userId="img-3"
            size="lg"
            imageUrl="https://i.pravatar.cc/128?img=3"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    gap: spacing.xs,
  },
});
