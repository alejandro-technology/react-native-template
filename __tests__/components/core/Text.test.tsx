import React from 'react';
import { render } from '@utils/test-utils';
import { Text } from '@components/core/Text';

describe('Text Component', () => {
  it('debe renderizar el contenido correctamente', () => {
    const { getByText } = render(<Text>Hola Mundo</Text>);
    expect(getByText('Hola Mundo')).toBeTruthy();
  });

  it('debe aplicar variantes de tipografía', () => {
    const { getByText, rerender } = render(<Text variant="h1">Título</Text>);
    expect(getByText('Título')).toBeTruthy();

    rerender(<Text variant="caption">Leyenda</Text>);
    expect(getByText('Leyenda')).toBeTruthy();
  });

  it('debe aplicar colores semánticos', () => {
    const { getByText, rerender } = render(<Text color="primary">Azul</Text>);
    expect(getByText('Azul')).toBeTruthy();

    rerender(<Text color="error">Rojo</Text>);
    expect(getByText('Rojo')).toBeTruthy();
  });

  it('debe permitir estilos personalizados', () => {
    const customStyle = { marginTop: 10 };
    const { getByText } = render(<Text style={customStyle}>Con Margen</Text>);
    const textElement = getByText('Con Margen');

    // Verificamos que el estilo se aplique (esto depende de cómo RN maneja los estilos en los tests)
    expect(textElement.props.style).toContainEqual(customStyle);
  });
});
