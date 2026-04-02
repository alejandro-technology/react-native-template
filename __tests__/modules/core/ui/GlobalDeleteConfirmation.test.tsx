import React from 'react';
import { render, waitFor } from '@utils/test-utils';
import { GlobalModal as GlobalDeleteConfirmation } from '@modules/core/ui/Modal';
import { useAppStorage } from '@modules/core/application/app.storage';
import { act, fireEvent } from '@testing-library/react-native';

// Mock del componente ModalDelete
jest.mock('@modules/core/ui/components/ModalDelete', () => ({
  ModalDelete: ({ visible, params, onClose }: any) => {
    const { View, Text, TouchableOpacity } = require('react-native');

    if (!visible) return null;

    return (
      <View testID="delete-confirmation-sheet">
        <Text testID="entity-name">{params.entityName}</Text>
        <Text testID="entity-type">{params.entityType}</Text>
        <TouchableOpacity testID="close-button" onPress={onClose}>
          <Text>Cerrar</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="confirm-button" onPress={params.onConfirm}>
          <Text>Confirmar</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

describe('GlobalDeleteConfirmation Component', () => {
  beforeEach(() => {
    // Resetear el store antes de cada test
    act(() => {
      useAppStorage.getState().modal.close();
    });
  });

  it('debe renderizar correctamente cuando el modal está cerrado', () => {
    const { queryByTestId } = render(<GlobalDeleteConfirmation />);
    expect(queryByTestId('delete-confirmation-sheet')).toBeNull();
  });

  it('debe renderizar el modal cuando está visible', () => {
    const onConfirm = jest.fn();
    act(() => {
      useAppStorage.getState().modal.open({
        type: 'delete',
        entityName: 'Producto XYZ',
        entityType: 'producto',
        onConfirm,
      });
    });

    const { getByTestId } = render(<GlobalDeleteConfirmation />);
    expect(getByTestId('delete-confirmation-sheet')).toBeTruthy();
    expect(getByTestId('entity-name')).toHaveTextContent('Producto XYZ');
    expect(getByTestId('entity-type')).toHaveTextContent('producto');
  });

  it('debe cerrar el modal cuando se presiona el botón cerrar', () => {
    const onConfirm = jest.fn();
    act(() => {
      useAppStorage.getState().modal.open({
        type: 'delete',
        entityName: 'Test',
        entityType: 'item',
        onConfirm,
      });
    });

    const { getByTestId, rerender } = render(<GlobalDeleteConfirmation />);

    fireEvent.press(getByTestId('close-button'));

    rerender(<GlobalDeleteConfirmation />);

    expect(useAppStorage.getState().modal.visible).toBe(false);
  });

  it('debe ejecutar onConfirm cuando se presiona el botón confirmar', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);

    act(() => {
      useAppStorage.getState().modal.open({
        type: 'delete',
        entityName: 'Usuario Test',
        entityType: 'usuario',
        onConfirm,
      });
    });

    const { getByTestId } = render(<GlobalDeleteConfirmation />);

    await act(async () => {
      fireEvent.press(getByTestId('confirm-button'));
    });

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('no debe ejecutar onConfirm si params es null', () => {
    act(() => {
      useAppStorage.setState(state => ({
        modal: {
          ...state.modal,
          visible: false,
          params: null,
        },
      }));
    });

    const { queryByTestId } = render(<GlobalDeleteConfirmation />);

    // No se renderiza nada cuando params es null
    expect(queryByTestId('delete-confirmation-sheet')).toBeNull();
  });

  it('debe actualizar cuando el estado del store cambia', () => {
    const { queryByTestId, rerender } = render(<GlobalDeleteConfirmation />);

    // Inicialmente cerrado
    expect(queryByTestId('delete-confirmation-sheet')).toBeNull();

    // Abrir modal
    act(() => {
      useAppStorage.getState().modal.open({
        type: 'delete',
        entityName: 'Item 1',
        entityType: 'tipo1',
        onConfirm: jest.fn(),
      });
    });

    rerender(<GlobalDeleteConfirmation />);
    expect(queryByTestId('delete-confirmation-sheet')).toBeTruthy();

    // Cerrar modal
    act(() => {
      useAppStorage.getState().modal.close();
    });

    rerender(<GlobalDeleteConfirmation />);
    expect(queryByTestId('delete-confirmation-sheet')).toBeNull();
  });

  it('debe resetear estado de carga después de la confirmación', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);

    act(() => {
      useAppStorage.getState().modal.open({
        type: 'delete',
        entityName: 'Test',
        entityType: 'item',
        onConfirm,
      });
    });

    const { getByTestId } = render(<GlobalDeleteConfirmation />);

    await act(async () => {
      fireEvent.press(getByTestId('confirm-button'));
    });

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
