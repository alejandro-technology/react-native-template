import React from 'react';
import { fireEvent, render } from '@utils/test-utils';
import { Checkbox } from '@components/core/Checkbox';

describe('Checkbox Component', () => {
  it('debe renderizar el label correctamente', () => {
    const { getByText } = render(<Checkbox label="Aceptar términos" />);
    expect(getByText('Aceptar términos')).toBeTruthy();
  });

  it('debe mostrar el check cuando está marcado', () => {
    const { getByTestId } = render(<Checkbox checked={true} />);
    expect(getByTestId('checkbox-check')).toBeTruthy();
  });

  it('no debe mostrar el check cuando no está marcado', () => {
    const { queryByTestId } = render(<Checkbox checked={false} />);
    expect(queryByTestId('checkbox-check')).toBeNull();
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

  it('debe ejecutar onPress además de onChange al presionar', () => {
    const onChangeMock = jest.fn();
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Checkbox
        label="Con onPress"
        checked={false}
        onChange={onChangeMock}
        onPress={onPressMock}
      />,
    );

    fireEvent.press(getByText('Con onPress'));
    expect(onChangeMock).toHaveBeenCalledWith(true);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
