import React from 'react';
import { fireEvent, render } from '@utils/test-utils';
import { Checkbox } from '@components/core/Checkbox';

describe('Checkbox Component', () => {
  it('debe renderizar el label correctamente', () => {
    const { getByText } = render(<Checkbox label="Aceptar términos" />);
    expect(getByText('Aceptar términos')).toBeTruthy();
  });

  it('debe mostrar el check cuando está marcado', () => {
    const { getByText } = render(<Checkbox checked={true} />);
    expect(getByText('✓')).toBeTruthy();
  });

  it('no debe mostrar el check cuando no está marcado', () => {
    const { queryByText } = render(<Checkbox checked={false} />);
    expect(queryByText('✓')).toBeNull();
  });

  it('debe ejecutar onChange al presionar', () => {
    const onChangeMock = jest.fn();
    const { getByText } = render(
      <Checkbox label="Click me" checked={false} onChange={onChangeMock} />,
    );

    fireEvent.press(getByText('Click me'));
    expect(onChangeMock).toHaveBeenCalledWith(true);
  });

  it('no debe ejecutar onChange cuando está deshabilitado', () => {
    const onChangeMock = jest.fn();
    const { getByText } = render(
      <Checkbox label="Disabled" disabled onChange={onChangeMock} />,
    );

    fireEvent.press(getByText('Disabled'));
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('debe tener el rol de accesibilidad correcto', () => {
    const { getByRole } = render(<Checkbox label="Accesible" checked={true} />);
    const checkbox = getByRole('checkbox');
    expect(checkbox.props.accessibilityState.checked).toBe(true);
  });
});
