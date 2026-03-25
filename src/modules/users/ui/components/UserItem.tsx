import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Card, Avatar, Badge, Icon } from '@components/core';
// Types
import type { UserEntity } from '../../domain/user.model';
// Theme
import { spacing } from '@theme/index';
// Navigation
import { UsersRoutes } from '@navigation/routes';
import { useNavigationUsers } from '@navigation/hooks';
// Helpers
import { getRoleVariant } from '@modules/users/domain/user.utils';
import { formatJoinDate } from '@modules/core/domain/date.utils';

interface UserItemProps {
  user: UserEntity;
  index: number;
}

export const UserItem = React.memo(function UserItem({ user }: UserItemProps) {
  const { navigate } = useNavigationUsers();

  const handleCardPress = () => {
    navigate(UsersRoutes.UserDetail, { userId: user.id });
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
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Icon name="phone" size={14} />
          <Text variant="caption">{user.phone}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="calendar" size={14} />
          <Text variant="caption">{formatJoinDate(user.createdAt)}</Text>
        </View>
      </View>
    </Card>
  );
});
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
  infoRow: {
    gap: spacing.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
