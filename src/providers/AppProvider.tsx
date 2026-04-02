import { View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Providers
import SecureProvider from './SecureProvider';
import NavigationProvider from './NavigationProvider';
import NetworkProvider from './NetworkProvider';
import { AuthProvider } from '@modules/authentication';
import ThemeProvider from '@theme/providers/ThemeProvider';
import SecureStorageProvider from './SecureStorageProvider';
import GestureHandlerProvider from './GestureHandlerProvider';
// Components
import { ErrorBoundary } from '@components/layout/ErrorBoundary';
import { GlobalModal, GlobalToast } from '@modules/core/ui';
// Styles
import { commonStyles } from '@theme/index';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Enterprise-friendly defaults: avoid refetch on focus, short staleTime,
      // and conservative retry policy (no retry for 4xx client errors).
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount: number, error: unknown) => {
        const status = (error as any)?.response?.status;
        // Don't retry for client errors (4xx)
        if (typeof status === 'number' && status >= 400 && status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors (network/server)
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export default function AppProvider({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <SecureProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SafeAreaProvider>
              <GestureHandlerProvider>
                <SecureStorageProvider>
                  <NetworkProvider>
                    <AuthProvider>
                      <NavigationProvider>
                        <SafeAreaView>{children}</SafeAreaView>
                        <GlobalModal />
                        <GlobalToast />
                      </NavigationProvider>
                    </AuthProvider>
                  </NetworkProvider>
                </SecureStorageProvider>
              </GestureHandlerProvider>
            </SafeAreaProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SecureProvider>
    </ErrorBoundary>
  );
}

function SafeAreaView({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        ...commonStyles.flex,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {children}
    </View>
  );
}
