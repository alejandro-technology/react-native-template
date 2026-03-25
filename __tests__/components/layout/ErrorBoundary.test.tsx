import React from 'react';
import { render } from '@utils/test-utils';
import { ErrorBoundary } from '@components/layout/ErrorBoundary';
import { Text } from 'react-native';

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Contenido normal</Text>;
}

describe('ErrorBoundary', () => {
  // Silenciar console.error de React para errores de boundary esperados
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('debe renderizar children cuando no hay error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(getByText('Contenido normal')).toBeTruthy();
  });

  it('debe mostrar fallback cuando hay error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(getByText('Algo salió mal')).toBeTruthy();
    expect(
      getByText(
        'La aplicación encontró un error inesperado. Por favor, intenta de nuevo.',
      ),
    ).toBeTruthy();
  });

  it('debe mostrar detalle del error en modo __DEV__', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(getByText('Test error')).toBeTruthy();
  });

  it('debe mostrar botón de Reintentar', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(getByText('Reintentar')).toBeTruthy();
  });
});
