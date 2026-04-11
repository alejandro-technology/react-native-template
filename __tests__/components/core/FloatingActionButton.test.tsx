import React from 'react';
import { fireEvent, render } from '@utils/test-utils';
import { FloatingActionButton } from '@components/core/FloatingActionButton';

describe('FloatingActionButton', () => {
  it('debe renderizar correctamente', () => {
    const { toJSON } = render(
      <FloatingActionButton icon="plus" onPress={jest.fn()} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('debe ejecutar onPress al presionar', () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(
      <FloatingActionButton icon="plus" onPress={onPressMock} />,
    );

    fireEvent.press(getByRole('button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar con tamaño sm', () => {
    const { toJSON } = render(
      <FloatingActionButton icon="plus" onPress={jest.fn()} size="sm" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('debe renderizar con tamaño md (default)', () => {
    const { toJSON } = render(
      <FloatingActionButton icon="plus" onPress={jest.fn()} size="md" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('debe renderizar con tamaño lg', () => {
    const { toJSON } = render(
      <FloatingActionButton icon="plus" onPress={jest.fn()} size="lg" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('debe renderizar con posicion bottom-right (default)', () => {
    const { toJSON } = render(
      <FloatingActionButton icon="plus" onPress={jest.fn()} position="bottom-right" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('debe renderizar con posicion bottom-left', () => {
    const { toJSON } = render(
      <FloatingActionButton icon="plus" onPress={jest.fn()} position="bottom-left" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('debe renderizar con posicion bottom-center', () => {
    const { toJSON } = render(
      <FloatingActionButton icon="plus" onPress={jest.fn()} position="bottom-center" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('debe renderizar con diferentes iconos', () => {
    const { toJSON: json1 } = render(
      <FloatingActionButton icon="save" onPress={jest.fn()} />,
    );
    const { toJSON: json2 } = render(
      <FloatingActionButton icon="close" onPress={jest.fn()} />,
    );
    expect(json1()).toBeTruthy();
    expect(json2()).toBeTruthy();
  });

  it('debe tener accessibilityRole button', () => {
    const { getByRole } = render(
      <FloatingActionButton icon="plus" onPress={jest.fn()} />,
    );
    expect(getByRole('button')).toBeTruthy();
  });
});
