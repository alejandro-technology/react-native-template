import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
// Components
import { Text, Card, Avatar, Badge } from '@components/core';
// Types
import type { UserEntity } from '../../domain/user.model';
// Theme
import { spacing } from '@theme/index';
// Navigation
import { UsersRoutes } from '@navigation/routes';
import { useNavigationUsers } from '@navigation/hooks';
// Store
import { useAppStorage } from '@modules/core/infrastructure/app.storage';
// Application
import { useUserDelete } from '@modules/users/application/user.mutations';
// Helpers
import {
  getRoleVariant,
  formatJoinDate,
} from '@modules/users/domain/user.utils';

interface UserItemProps {
  user: UserEntity;
}

export function UserItem({ user }: UserItemProps) {
  const { navigate } = useNavigationUsers();
  const { mutateAsync: deleteUserAsync } = useUserDelete();
  const { open, close } = useAppStorage(s => s.modal);

  const handleCardPress = () => {
    navigate(UsersRoutes.UserDetail, { userId: user.id });
  };

  const handleViewPress = (e: any) => {
    e.stopPropagation();
    navigate(UsersRoutes.UserDetail, { userId: user.id });
  };

  const handleEditPress = (e: any) => {
    e.stopPropagation();
    navigate(UsersRoutes.UserForm, { user });
  };

  const handleDeletePress = (e: any) => {
    e.stopPropagation();
    open({
      entityName: user.name,
      entityType: 'usuario',
      onConfirm: async () => {
        await deleteUserAsync(user.id);
        close();
      },
    });
  };

  return (
    <Card style={styles.card} onPress={handleCardPress}>
      <View style={styles.row}>
        <View style={styles.header}>
          <Avatar name={user.name} userId={user.id} size="md" />
          <View>
            <Text variant="h3">{user.name}</Text>
            <Text variant="bodySmall" color="textSecondary">
              {user.email}
            </Text>
          </View>
        </View>
        <Badge label={user.role} variant={getRoleVariant(user.role)} />
      </View>
      <View style={styles.row}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="caption">📞 {user.phone}</Text>
          <Text variant="caption">📅 {formatJoinDate(user.createdAt)}</Text>
        </View>
        {/* Action Buttons */}
        <View style={[styles.row, { gap: spacing.xs }]}>
          <Pressable
            onPress={handleViewPress}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text>👁️</Text>
          </Pressable>

          <Pressable
            onPress={handleEditPress}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text>✏️</Text>
          </Pressable>

          <Pressable
            onPress={handleDeletePress}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text>🗑️</Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.md,
  },
  actionButton: {
    padding: spacing.xs,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPressed: {
    opacity: 0.6,
  },
});
