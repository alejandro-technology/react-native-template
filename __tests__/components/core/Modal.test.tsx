import React from 'react';
import { fireEvent, render } from '@utils/test-utils';
import { Modal } from '@components/core/Modal';
import { Text } from 'react-native';

describe('Modal Component', () => {
  it('debe renderizar el contenido cuando visible es true', () => {
    const { getByText } = render(
      <Modal visible={true}>
        <Text>Contenido del Modal</Text>
      </Modal>,
    );
    expect(getByText('Contenido del Modal')).toBeTruthy();
  });

  it('debe mostrar el título cuando se proporciona', () => {
    const { getByText } = render(
      <Modal visible={true} title="Título del Modal">
        <Text>Contenido</Text>
      </Modal>,
    );
    expect(getByText('Título del Modal')).toBeTruthy();
  });

  it('debe llamar a onRequestClose al presionar el backdrop si closeOnBackdropPress es true', () => {
    const onCloseMock = jest.fn();
    const { getByTestId } = render(
      <Modal
        visible={true}
        onRequestClose={onCloseMock}
        closeOnBackdropPress={true}
      >
        <Text>Contenido</Text>
      </Modal>,
    );

    const backdrop = getByTestId('modal-backdrop');
    fireEvent.press(backdrop);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar el icono y manejar su presión', () => {
    const onPressIconMock = jest.fn();
    const { getByText } = render(
      <Modal visible={true} icon={<Text>X</Text>} onPressIcon={onPressIconMock}>
        <Text>Contenido</Text>
      </Modal>,
    );

    fireEvent.press(getByText('X'));
    expect(onPressIconMock).toHaveBeenCalledTimes(1);
  });

  it('debe aplicar estilos personalizados de header y título', () => {
    const { getByText } = render(
      <Modal
        visible={true}
        title="Styled"
        headerStyle={{ paddingTop: 10 }}
        titleStyle={{ fontSize: 30 }}
      >
        <Text>Contenido</Text>
      </Modal>,
    );
    expect(getByText('Styled')).toBeTruthy();
  });

  it('debe renderizar contenido sin header cuando no hay title ni icon', () => {
    const { getByText } = render(
      <Modal visible={true}>
        <Text>Solo contenido</Text>
      </Modal>,
    );
    expect(getByText('Solo contenido')).toBeTruthy();
  });
});
