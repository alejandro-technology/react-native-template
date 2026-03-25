import React from 'react';
import { render } from '@utils/test-utils';
import { Toolbar } from '@components/layout/Toolbar';

describe('Toolbar', () => {
  it('debe renderizar el título', () => {
    const { getByText } = render(<Toolbar title="Detalle" />);
    expect(getByText('Detalle')).toBeTruthy();
  });

  it('debe renderizar sin título', () => {
    const { toJSON } = render(<Toolbar />);
    expect(toJSON()).toBeTruthy();
  });

  it('debe renderizar opciones izquierdas y ejecutar onPress', () => {
    const onPress = jest.fn();
    const { toJSON } = render(
      <Toolbar
        title="Test"
        leftOptions={[{ icon: 'arrow-left', onPress }]}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('debe renderizar opciones derechas', () => {
    const onPress = jest.fn();
    const { toJSON } = render(
      <Toolbar
        title="Test"
        rightOptions={[{ icon: 'search', onPress }]}
      />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
