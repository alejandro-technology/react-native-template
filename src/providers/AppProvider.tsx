import React, { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Providers
import SecureProvider from './SecureProvider';
import NavigationProvider from './NavigationProvider';
import ThemeProvider from '@theme/providers/ThemeProvider';
// Components
import { GlobalDeleteConfirmation } from '@components/layout';
// Styles
import { useTheme, commonStyles } from '@theme/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
export default function AppProvider({ children }: PropsWithChildren) {
  return (
    <SecureProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider>
            <GestureHandlerProvider>
              <NavigationProvider>
                {children}
                <GlobalDeleteConfirmation />
              </NavigationProvider>
            </GestureHandlerProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SecureProvider>
  );
}

function GestureHandlerProvider({ children }: PropsWithChildren) {
  const {
    colors: { background: backgroundColor },
  } = useTheme();

  return (
    <GestureHandlerRootView
      style={{
        ...commonStyles.flex,
        backgroundColor,
      }}
    >
      {children}
    </GestureHandlerRootView>
  );
}
