import React from 'react';
import { DeleteConfirmationSheet } from '@components/layout';
import { useUserDelete } from '@modules/users/application/user.mutations';
import { useAppStorage } from '@modules/core/infrastructure/app.storage';

export default function DeleteConfirmationSheetUser() {
  const { mutate: deleteUser, isPending } = useUserDelete();
  const { visible, entityName, entityType, entityId, close } = useAppStorage(
    state => state.modal,
  );

  const handleConfirmDelete = () => {
    deleteUser(entityId, {
      onSuccess: () => {
        close();
      },
    });
  };

  return (
    <DeleteConfirmationSheet
      visible={visible}
      onClose={() => close()}
      onConfirm={handleConfirmDelete}
      isLoading={isPending}
      entityName={entityName}
      entityType={entityType}
    />
  );
}
