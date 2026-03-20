import React from 'react';
import { render } from '@utils/test-utils';
import { Badge } from '@components/core/Badge';

describe('Badge Component', () => {
  it('debe renderizar el label correctamente', () => {
    const { getByText } = render(<Badge label="Nuevo" />);
    expect(getByText('Nuevo')).toBeTruthy();
  });

  it('debe aplicar diferentes variantes', () => {
    const { getByText, rerender } = render(
      <Badge label="Admin" variant="admin" />,
    );
    expect(getByText('Admin')).toBeTruthy();

    rerender(<Badge label="Editor" variant="editor" />);
    expect(getByText('Editor')).toBeTruthy();

    rerender(<Badge label="Viewer" variant="viewer" />);
    expect(getByText('Viewer')).toBeTruthy();
  });

  it('debe aplicar diferentes tamaños', () => {
    const { getByText, rerender } = render(<Badge label="Pequeño" size="sm" />);
    expect(getByText('Pequeño')).toBeTruthy();

    rerender(<Badge label="Grande" size="lg" />);
    expect(getByText('Grande')).toBeTruthy();
  });

  it('debe tener accesibilidad configurada', () => {
    const { getByLabelText } = render(<Badge label="Accesible" />);
    expect(getByLabelText('Accesible')).toBeTruthy();
  });
});
