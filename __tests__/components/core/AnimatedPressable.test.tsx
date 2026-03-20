import React from 'react';
import { fireEvent, render } from '@utils/test-utils';
import { AnimatedPressable } from '@components/core/AnimatedPressable';
import { Text, Animated } from 'react-native';

describe('AnimatedPressable Component', () => {
  it('debe renderizar el contenido correctamente', () => {
    const { getByText } = render(
      <AnimatedPressable>
        <Text>Presionable</Text>
      </AnimatedPressable>,
    );
    expect(getByText('Presionable')).toBeTruthy();
  });

  it('debe ejecutar onPressIn y onPressOut', () => {
    const onPressInMock = jest.fn();
    const onPressOutMock = jest.fn();
    const { getByText } = render(
      <AnimatedPressable onPressIn={onPressInMock} onPressOut={onPressOutMock}>
        <Text>Click me</Text>
      </AnimatedPressable>,
    );

    fireEvent(getByText('Click me'), 'pressIn');
    expect(onPressInMock).toHaveBeenCalled();

    fireEvent(getByText('Click me'), 'pressOut');
    expect(onPressOutMock).toHaveBeenCalled();
  });

  it('debe disparar animaciones al presionar', () => {
    const springSpy = jest.spyOn(Animated, 'spring');
    const { getByText } = render(
      <AnimatedPressable>
        <Text>Animado</Text>
      </AnimatedPressable>,
    );

    fireEvent(getByText('Animado'), 'pressIn');
    // Se llaman a 2 animaciones (scale y opacity)
    expect(springSpy).toHaveBeenCalled();

    springSpy.mockRestore();
  });

  it('no debe disparar animaciones cuando está deshabilitado', () => {
    const springSpy = jest.spyOn(Animated, 'spring');
    const { getByText } = render(
      <AnimatedPressable disabled>
        <Text>Deshabilitado</Text>
      </AnimatedPressable>,
    );

    fireEvent(getByText('Deshabilitado'), 'pressIn');
    expect(springSpy).not.toHaveBeenCalled();

    springSpy.mockRestore();
  });
});
