import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
// Components
import { Text, Card } from '@components/core';
// Types
import type { UserEntity } from '../../domain/user.model';
// Theme
import { useTheme, spacing } from '@theme/index';
// Navigation
import { UsersRoutes } from '@navigation/routes';
import { useNavigationUsers } from '@navigation/hooks';

interface UserItemProps {
  user: UserEntity;
}

export function UserItem({ user }: UserItemProps) {
  const theme = useTheme();
  const { navigate } = useNavigationUsers();
  const onPress = () => navigate(UsersRoutes.UserDetail, { userId: user.id });

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.info}>
            <Text variant="h3" style={styles.name}>
              {user.name}
            </Text>
            <Text variant="body" style={styles.email}>
              {user.email}
            </Text>
            <View style={styles.metaRow}>
              <Text variant="caption" style={styles.phone}>
                {user.phone}
              </Text>
              <Text
                variant="caption"
                style={{ color: theme.colors.primary, fontWeight: 'bold' }}
              >
                {user.role}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    marginBottom: spacing.xs,
  },
  email: {
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  phone: {
    opacity: 0.6,
  },
});
