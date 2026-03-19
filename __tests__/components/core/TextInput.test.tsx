import React from 'react';
import { render, fireEvent } from '@utils/test-utils';
import { TextInput } from '@components/core/TextInput';

describe('TextInput', () => {
  it('debe renderizar correctamente', () => {
    const { getByPlaceholderText } = render(
      <TextInput placeholder="Escribe aquí" />
    );
    expect(getByPlaceholderText('Escribe aquí')).toBeTruthy();
  });

  it('debe mostrar el label cuando se proporciona', () => {
    const { getByText } = render(
      <TextInput label="Nombre" placeholder="Tu nombre" />
    );
    expect(getByText('Nombre')).toBeTruthy();
  });

  it('debe mostrar el mensaje de error cuando se proporciona', () => {
    const { getByText } = render(
      <TextInput
        label="Email"
        error="El email es inválido"
        placeholder="email@ejemplo.com"
      />
    );
    expect(getByText('El email es inválido')).toBeTruthy();
  });

  it('debe mostrar helper text cuando no hay error', () => {
    const { getByText } = render(
      <TextInput
        label="Contraseña"
        helperText="Mínimo 8 caracteres"
        placeholder="Contraseña"
      />
    );
    expect(getByText('Mínimo 8 caracteres')).toBeTruthy();
  });

  it('no debe mostrar helper text cuando hay error', () => {
    const { queryByText } = render(
      <TextInput
        label="Email"
        error="Campo requerido"
        helperText="Ingresa tu email"
        placeholder="email"
      />
    );
    expect(queryByText('Ingresa tu email')).toBeNull();
  });

  it('debe actualizar el valor cuando el usuario escribe', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <TextInput
        placeholder="Escribe algo"
        onChangeText={onChangeTextMock}
      />
    );

    const input = getByPlaceholderText('Escribe algo');
    fireEvent.changeText(input, 'Hola Mundo');

    expect(onChangeTextMock).toHaveBeenCalledWith('Hola Mundo');
  });

  it('debe ejecutar onFocus cuando el input recibe foco', () => {
    const onFocusMock = jest.fn();
    const { getByPlaceholderText } = render(
      <TextInput placeholder="Foco aquí" onFocus={onFocusMock} />
    );

    fireEvent(getByPlaceholderText('Foco aquí'), 'focus');
    expect(onFocusMock).toHaveBeenCalled();
  });

  it('debe ejecutar onBlur cuando el input pierde foco', () => {
    const onBlurMock = jest.fn();
    const { getByPlaceholderText } = render(
      <TextInput placeholder="Blur aquí" onBlur={onBlurMock} />
    );

    fireEvent(getByPlaceholderText('Blur aquí'), 'blur');
    expect(onBlurMock).toHaveBeenCalled();
  });

  it('debe estar deshabilitado cuando editable es false', () => {
    const { getByPlaceholderText } = render(
      <TextInput placeholder="Deshabilitado" editable={false} />
    );

    const input = getByPlaceholderText('Deshabilitado');
    expect(input.props.editable).toBe(false);
  });

  it('debe renderizar iconos cuando se proporcionan', () => {
    const LeftIcon = () => <></>;
    const RightIcon = () => <></>;

    const { UNSAFE_getByType } = render(
      <TextInput
        placeholder="Con iconos"
        leftIcon={<LeftIcon />}
        rightIcon={<RightIcon />}
      />
    );

    expect(UNSAFE_getByType(LeftIcon)).toBeTruthy();
    expect(UNSAFE_getByType(RightIcon)).toBeTruthy();
  });
});
