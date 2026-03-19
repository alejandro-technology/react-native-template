import React from 'react';
import { render, fireEvent } from '@utils/test-utils';
import { Button } from '@components/core/Button';

describe('Button', () => {
  it('debe renderizar correctamente con texto', () => {
    const { getByText } = render(<Button>Hola Mundo</Button>);
    expect(getByText('Hola Mundo')).toBeTruthy();
  });

  it('debe ejecutar onPress al hacer click', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock}>Presionar</Button>
    );

    fireEvent.press(getByText('Presionar'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('no debe ejecutar onPress cuando está disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock} disabled>
        Deshabilitado
      </Button>
    );

    fireEvent.press(getByText('Deshabilitado'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('no debe ejecutar onPress cuando está loading', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock} loading>
        Cargando
      </Button>
    );

    fireEvent.press(getByText('Cargando'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('debe mostrar ActivityIndicator cuando loading es true', () => {
    const { UNSAFE_getByType } = render(<Button loading>Cargar</Button>);
    const ActivityIndicator = require('react-native').ActivityIndicator;
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('debe aplicar diferentes variantes', () => {
    const { getByText, rerender } = render(
      <Button variant="primary">Primary</Button>
    );

    expect(getByText('Primary')).toBeTruthy();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(getByText('Secondary')).toBeTruthy();
  });

  it('debe aplicar diferentes tamaños', () => {
    const { getByText } = render(<Button size="lg">Grande</Button>);
    expect(getByText('Grande')).toBeTruthy();
  });
});
