import { fireEvent, render } from '@utils/test-utils';
import { DatePicker } from '@components/core/DatePicker';

// Mock de DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => {
    return React.createElement(View, { testID: 'date-picker', ...props });
  };
});

describe('DatePicker Component', () => {
  const mockDate = new Date(2023, 0, 1); // 1 de enero de 2023

  it('debe renderizar el label y la fecha formateada correctamente', () => {
    const { getByText, getByDisplayValue } = render(
      <DatePicker
        label="Fecha de nacimiento"
        value={mockDate}
        onChange={() => {}}
      />,
    );
    expect(getByText('Fecha de nacimiento')).toBeTruthy();
    // Formato es-ES: 01/01/2023
    expect(getByDisplayValue('01/01/2023')).toBeTruthy();
  });

  it('debe mostrar el placeholder cuando el valor es null', () => {
    const { getByDisplayValue } = render(
      <DatePicker
        placeholder="Selecciona una fecha"
        value={null}
        onChange={() => {}}
      />,
    );
    // Cuando pointerEvents="none", TextInput recibe el placeholder como value
    expect(getByDisplayValue('Selecciona una fecha')).toBeTruthy();
  });

  it('debe abrir el picker al presionar', () => {
    const { getByDisplayValue, getByTestId } = render(
      <DatePicker value={mockDate} onChange={() => {}} />,
    );

    fireEvent.press(getByDisplayValue('01/01/2023'));
    expect(getByTestId('date-picker')).toBeTruthy();
  });

  it('debe mostrar el icono correcto según el modo', () => {
    const { UNSAFE_getByProps } = render(
      <DatePicker value={mockDate} onChange={() => {}} mode="time" />,
    );
    // Buscamos el icono por nombre 'clock'
    expect(UNSAFE_getByProps({ name: 'clock' })).toBeTruthy();
  });

  it('no debe abrir el picker cuando está deshabilitado', () => {
    const { getByDisplayValue, queryByTestId } = render(
      <DatePicker value={mockDate} onChange={() => {}} disabled />,
    );

    fireEvent.press(getByDisplayValue('01/01/2023'));
    expect(queryByTestId('date-picker')).toBeNull();
  });
});
