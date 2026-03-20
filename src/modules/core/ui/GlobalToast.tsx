import React from 'react';
// Components
import { Toast } from '@components/core';
// Store
import { useAppStorage } from '@modules/core/application/app.storage';

export function GlobalToast() {
  const { visible, message, type, duration, position, hide } = useAppStorage(
    state => state.toast,
  );

  return (
    <Toast
      visible={visible}
      message={message}
      type={type}
      duration={duration}
      position={position}
      onHide={hide}
    />
  );
}
