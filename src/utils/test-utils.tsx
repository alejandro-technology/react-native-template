import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from '@theme/providers/ThemeProvider';

// Crear un QueryClient para tests con configuración optimizada
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllProvidersProps extends PropsWithChildren {
  queryClient?: QueryClient;
}

/**
 * Wrapper que incluye todos los providers necesarios para testing
 */
function AllTheProviders({
  children,
  queryClient = createTestQueryClient(),
}: AllProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 0, height: 0 },
            insets: { top: 0, left: 0, right: 0, bottom: 0 },
          }}
        >
          {children}
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

/**
 * Render customizado que envuelve componentes con los providers necesarios
 * @param ui - Componente a renderizar
 * @param options - Opciones de render
 * @returns Resultado del render con utilities de testing library
 */
const customRender = (ui: React.ReactElement, options?: CustomRenderOptions) => {
  const { queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }: PropsWithChildren) => (
      <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-exportar todo desde @testing-library/react-native
export * from '@testing-library/react-native';

// Exportar el render customizado como default
export { customRender as render, createTestQueryClient };
