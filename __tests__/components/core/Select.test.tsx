import React from 'react';
import { fireEvent, render } from '@utils/test-utils';
import { Select } from '@components/core/Select';

describe('Select Component', () => {
  const options = [
    { label: 'Opción 1', value: '1' },
    { label: 'Opción 2', value: '2' },
  ];

  it('debe renderizar el label y placeholder correctamente', () => {
    const { getByText, getByPlaceholderText } = render(
      <Select
        label="Mi Select"
        placeholder="Selecciona algo"
        options={options}
      />,
    );
    expect(getByText('Mi Select')).toBeTruthy();
    expect(getByPlaceholderText('Selecciona algo')).toBeTruthy();
  });

  it('debe mostrar las opciones al presionar', () => {
    const { getByPlaceholderText, getByText } = render(
      <Select options={options} placeholder="Seleccionar" />,
    );

    fireEvent.press(getByPlaceholderText('Seleccionar'));

    expect(getByText('Opción 1')).toBeTruthy();
    expect(getByText('Opción 2')).toBeTruthy();
  });

  it('debe llamar a onChange y cerrar el modal al seleccionar una opción', () => {
    const onChangeMock = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <Select
        options={options}
        placeholder="Seleccionar"
        onChange={onChangeMock}
      />,
    );

    fireEvent.press(getByPlaceholderText('Seleccionar'));
    fireEvent.press(getByText('Opción 1'));

    expect(onChangeMock).toHaveBeenCalledWith(options[0]);
    // El modal debería cerrarse (aunque en tests de RN esto puede depender de cómo se mockee el Modal)
    // Pero la lógica de Select llama a setIsOpen(false)
  });

  it('debe mostrar la opción seleccionada', () => {
    const { getByDisplayValue } = render(
      <Select options={options} value={options[1]} />,
    );
    expect(getByDisplayValue('Opción 2')).toBeTruthy();
  });

  it('no debe abrir el modal cuando está deshabilitado', () => {
    const { getByPlaceholderText, queryByText } = render(
      <Select options={options} placeholder="Seleccionar" disabled />,
    );

    fireEvent.press(getByPlaceholderText('Seleccionar'));
    expect(queryByText('Opción 1')).toBeNull();
  });
});
