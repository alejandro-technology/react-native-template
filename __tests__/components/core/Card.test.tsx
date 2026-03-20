import React from 'react';
import { fireEvent, render } from '@utils/test-utils';
import { Card } from '@components/core/Card';
import { Text } from 'react-native';

describe('Card Component', () => {
  it('debe renderizar el contenido correctamente', () => {
    const { getByText } = render(
      <Card>
        <Text>Contenido de la tarjeta</Text>
      </Card>,
    );
    expect(getByText('Contenido de la tarjeta')).toBeTruthy();
  });

  it('debe ejecutar onPress cuando es presionable', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Card onPress={onPressMock}>
        <Text>Presionable</Text>
      </Card>,
    );

    fireEvent.press(getByText('Presionable'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('no debe ejecutar onPress cuando está deshabilitado', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Card onPress={onPressMock} disabled>
        <Text>Deshabilitado</Text>
      </Card>,
    );

    fireEvent.press(getByText('Deshabilitado'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('debe aplicar variantes correctamente', () => {
    const { getByText, rerender } = render(
      <Card variant="elevated">
        <Text>Elevated</Text>
      </Card>,
    );
    expect(getByText('Elevated')).toBeTruthy();

    rerender(
      <Card variant="outlined">
        <Text>Outlined</Text>
      </Card>,
    );
    expect(getByText('Outlined')).toBeTruthy();
  });
});
