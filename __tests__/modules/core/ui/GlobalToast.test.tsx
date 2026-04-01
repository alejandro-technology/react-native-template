import React from 'react';
import { render } from '@utils/test-utils';
import { GlobalToast } from '@modules/core/ui/GlobalToast';
import { useAppStorage } from '@modules/core/application/app.storage';
import { act } from '@testing-library/react-native';

// Mock del componente Toast
jest.mock('@components/core/Toast', () => ({
  Toast: ({ message, visible, type }: any) => {
    const { Text, View } = require('react-native');
    if (!visible) return null;
    return (
      <View testID="toast-container">
        <Text testID="toast-message">{message}</Text>
        <Text testID="toast-type">{type}</Text>
      </View>
    );
  },
}));

describe('GlobalToast Component', () => {
  beforeEach(() => {
    // Resetear el store antes de cada test
    act(() => {
      useAppStorage.getState().toast.hide();
    });
  });

  it('debe renderizar correctamente cuando el toast está oculto', () => {
    const { queryByTestId } = render(<GlobalToast />);
    expect(queryByTestId('toast-container')).toBeNull();
  });

  it('debe renderizar el toast cuando está visible', () => {
    act(() => {
      useAppStorage.getState().toast.show({
        message: 'Operación exitosa',
        type: 'success',
      });
    });

    const { getByTestId } = render(<GlobalToast />);
    expect(getByTestId('toast-container')).toBeTruthy();
    expect(getByTestId('toast-message')).toHaveTextContent('Operación exitosa');
    expect(getByTestId('toast-type')).toHaveTextContent('success');
  });

  it('debe pasar los valores correctos del store al componente Toast', () => {
    act(() => {
      useAppStorage.getState().toast.show({
        message: 'Error de red',
        type: 'error',
        duration: 5000,
        position: 'top',
      });
    });

    const { getByTestId } = render(<GlobalToast />);
    expect(getByTestId('toast-message')).toHaveTextContent('Error de red');
    expect(getByTestId('toast-type')).toHaveTextContent('error');
  });

  it('debe actualizar cuando el estado del store cambia', () => {
    const { getByTestId, queryByTestId, rerender } = render(<GlobalToast />);

    // Inicialmente oculto
    expect(queryByTestId('toast-container')).toBeNull();

    // Mostrar toast
    act(() => {
      useAppStorage.getState().toast.show({
        message: 'Info importante',
        type: 'info',
      });
    });

    rerender(<GlobalToast />);
    expect(getByTestId('toast-container')).toBeTruthy();
    expect(getByTestId('toast-message')).toHaveTextContent('Info importante');

    // Ocultar toast
    act(() => {
      useAppStorage.getState().toast.hide();
    });

    rerender(<GlobalToast />);
    expect(queryByTestId('toast-container')).toBeNull();
  });

  it('debe soportar los tres tipos de toast', () => {
    const types: Array<'success' | 'error' | 'info'> = [
      'success',
      'error',
      'info',
    ];

    types.forEach(type => {
      act(() => {
        useAppStorage.getState().toast.show({
          message: `Mensaje ${type}`,
          type,
        });
      });

      const { getByTestId } = render(<GlobalToast />);
      expect(getByTestId('toast-type')).toHaveTextContent(type);
    });
  });
});
