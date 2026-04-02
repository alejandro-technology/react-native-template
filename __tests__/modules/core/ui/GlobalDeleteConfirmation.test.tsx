import React from 'react';
import { render, waitFor } from '@utils/test-utils';
import { GlobalDeleteConfirmation } from '@modules/core/ui/GlobalDeleteConfirmation';
import { useAppStorage } from '@modules/core/application/app.storage';
import { act, fireEvent } from '@testing-library/react-native';

// Mock del componente DeleteConfirmationSheet
jest.mock('@components/layout/DeleteConfirmationSheet', () => ({
  DeleteConfirmationSheet: ({
    visible,
    onClose,
    onConfirm,
    isLoading,
    entityName,
    entityType,
  }: any) => {
    const { View, Text, TouchableOpacity } = require('react-native');

    if (!visible) return null;

    return (
      <View testID="delete-confirmation-sheet">
        <Text testID="entity-name">{entityName}</Text>
        <Text testID="entity-type">{entityType}</Text>
        <Text testID="is-loading">{isLoading ? 'true' : 'false'}</Text>
        <TouchableOpacity testID="close-button" onPress={onClose}>
          <Text>Cerrar</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="confirm-button" onPress={onConfirm}>
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

  it('debe manejar estado de carga durante la confirmación', async () => {
    let resolveConfirm: () => void;
    const onConfirm = jest.fn(
      () =>
        new Promise<void>(resolve => {
          resolveConfirm = resolve;
        }),
    );

    act(() => {
      useAppStorage.getState().modal.open({
        entityName: 'Test',
        entityType: 'item',
        onConfirm,
      });
    });

    const { getByTestId } = render(<GlobalDeleteConfirmation />);

    // Inicialmente no está cargando
    expect(getByTestId('is-loading')).toHaveTextContent('false');

    // Presionar confirmar
    act(() => {
      fireEvent.press(getByTestId('confirm-button'));
    });

    // Debe estar en estado de carga
    await waitFor(() => {
      expect(getByTestId('is-loading')).toHaveTextContent('true');
    });

    // Resolver la promesa
    await act(async () => {
      resolveConfirm!();
    });

    // Debe volver a no estar cargando
    await waitFor(() => {
      expect(getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  it('no debe ejecutar onConfirm si es null', () => {
    act(() => {
      useAppStorage.setState(state => ({
        modal: {
          ...state.modal,
          visible: true,
          entityName: 'Test',
          entityType: 'item',
          onConfirm: null,
        },
      }));
    });

    const { getByTestId } = render(<GlobalDeleteConfirmation />);

    // No debería lanzar error al presionar confirmar sin onConfirm
    expect(() => {
      fireEvent.press(getByTestId('confirm-button'));
    }).not.toThrow();
  });

  it('debe actualizar cuando el estado del store cambia', () => {
    const { queryByTestId, rerender } = render(<GlobalDeleteConfirmation />);

    // Inicialmente cerrado
    expect(queryByTestId('delete-confirmation-sheet')).toBeNull();

    // Abrir modal
    act(() => {
      useAppStorage.getState().modal.open({
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
        entityName: 'Test',
        entityType: 'item',
        onConfirm,
      });
    });

    const { getByTestId } = render(<GlobalDeleteConfirmation />);

    await act(async () => {
      fireEvent.press(getByTestId('confirm-button'));
    });

    // Debe volver a false después de completar
    await waitFor(() => {
      expect(getByTestId('is-loading')).toHaveTextContent('false');
      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
