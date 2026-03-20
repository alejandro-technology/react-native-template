import React from 'react';
import { Animated } from 'react-native';
// Components
import { RootLayout } from '@components/layout';
import { UserForm } from './components/UserForm';
// Application
import { useUserCreate, useUserUpdate } from '../application/user.mutations';
// Domain
import type { UserFormData } from '../domain/user.scheme';
import { userFormToPayloadAdapter } from '../domain/user.adapter';
// Navigation
import { UsersRoutes, UsersScreenProps } from '@navigation/routes';
// Theme
import { useFocusSlideIn } from '@theme/hooks';
import { ANIMATION_DURATION } from '@theme/animations';

export function UserFormView({
  route: { params },
  navigation: { goBack },
}: UsersScreenProps<UsersRoutes.UserForm>) {
  const { mutate: createUser, isPending: isCreating } = useUserCreate();
  const { mutate: updateUser, isPending: isUpdating } = useUserUpdate();

  const isLoading = isCreating || isUpdating;

  const user = params?.user;
  const isEditing = !!user;

  const { animatedStyle } = useFocusSlideIn({
    direction: 'right',
    duration: ANIMATION_DURATION.slow,
  });

  const handleSubmit = (data: UserFormData) => {
    const payload = userFormToPayloadAdapter(data);

    if (isEditing) {
      updateUser({ id: user.id, data: payload }, {});
    } else {
      createUser(payload, {});
    }
    goBack();
  };

  return (
    <RootLayout
      scroll
      padding="lg"
      title={isEditing ? 'Editar Usuario' : 'Crear Usuario'}
    >
      <Animated.View style={animatedStyle}>
        <UserForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialData={user}
        />
      </Animated.View>
    </RootLayout>
  );
}
