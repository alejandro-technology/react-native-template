import React from 'react';
// Store
import { useAppStorage } from '@modules/core/application/app.storage';
// Components
import { ModalDelete } from './components/ModalDelete';
import { ModalSuccess } from './components/ModalSuccess';
import { ModalInformation } from './components/ModalInformation';

export function GlobalModal() {
  const { visible, params, close } = useAppStorage(state => state.modal);

  if (!params) return null;

  if (params.type === 'delete') {
    return <ModalDelete visible={visible} params={params} onClose={close} />;
  }

  if (params.type === 'success') {
    return <ModalSuccess visible={visible} params={params} onClose={close} />;
  }

  if (params.type === 'information') {
    return (
      <ModalInformation visible={visible} params={params} onClose={close} />
    );
  }

  return null;
}
