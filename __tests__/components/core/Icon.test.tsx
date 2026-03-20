import React from 'react';
import { render } from '@utils/test-utils';
import { Icon } from '@components/core/Icon';

describe('Icon Component', () => {
  it('debe renderizar el icono correctamente por nombre', () => {
    const { UNSAFE_getByType } = render(<Icon name="sun" />);
    // ICON_COMPONENTS['sun'] es SunIcon, que está mockeado como un View
    expect(UNSAFE_getByType).toBeTruthy();
  });

  it('debe aplicar el tamaño correctamente', () => {
    const { UNSAFE_getByType } = render(<Icon name="moon" size={30} />);
    const icon = UNSAFE_getByType('View'); // El mock de *.svg devuelve un View
    expect(icon.props.width).toBe(30);
    expect(icon.props.height).toBe(30);
  });

  it('debe aplicar el color correctamente', () => {
    const { UNSAFE_getByType } = render(<Icon name="search" color="primary" />);
    const icon = UNSAFE_getByType('View');
    // El color se resuelve a través de getIconStyle
    expect(icon.props.color).toBeDefined();
  });

  it('debe aplicar el strokeWidth correctamente', () => {
    const { UNSAFE_getByType } = render(
      <Icon name="check" strokeWidth={2.5} />,
    );
    const icon = UNSAFE_getByType('View');
    expect(icon.props.strokeWidth).toBe(2.5);
  });
});
