import React from 'react';
import { render, fireEvent } from '@utils/test-utils';

const mockSetSearchText = jest.fn();

jest.mock('@modules/core', () => ({
  useAppStorage: (selector: any) =>
    selector({
      searchbar: {
        '': { searchText: '', setSearchText: mockSetSearchText },
      },
    }),
}));

import { Header } from '@components/layout/Header';

describe('Header', () => {
  const defaultProps = {
    title: 'Usuarios',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el título', () => {
    const { getByText } = render(<Header {...defaultProps} />);
    expect(getByText('Usuarios')).toBeTruthy();
  });

  it('debe renderizar el botón Agregar y ejecutar onPress', () => {
    const { getByTestId } = render(<Header {...defaultProps} />);
    const button = getByTestId('header-action-button');
    fireEvent.press(button);
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar el campo de búsqueda con placeholder', () => {
    const { getByPlaceholderText } = render(<Header {...defaultProps} />);
    expect(getByPlaceholderText('Buscar usuarios...')).toBeTruthy();
  });

  it('debe ejecutar setSearchText al escribir en búsqueda', () => {
    const { getByPlaceholderText } = render(<Header {...defaultProps} />);
    fireEvent.changeText(getByPlaceholderText('Buscar usuarios...'), 'Juan');
    expect(mockSetSearchText).toHaveBeenCalledWith('Juan');
  });
});
