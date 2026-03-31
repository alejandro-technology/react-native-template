import { StatusBar, View } from 'react-native';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
// Providers
import SecureProvider from './SecureProvider';
import NavigationProvider from './NavigationProvider';
import ThemeProvider from '@theme/providers/ThemeProvider';
import { AuthProvider } from '@modules/authentication';
// Components
import { GlobalDeleteConfirmation, GlobalToast } from '@modules/core/ui';
import { ErrorBoundary } from '@components/layout/ErrorBoundary';
// Config
import { initSecureStorage } from '@config/storage';
// Styles
import { useTheme, commonStyles } from '@theme/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
                <SecureStorageInitializer>
                  <AuthProvider>
                    <NavigationProvider>
                      <SafeAreaView>{children}</SafeAreaView>
                      <GlobalDeleteConfirmation />
                      <GlobalToast />
                    </NavigationProvider>
                  </AuthProvider>
                </SecureStorageInitializer>
              </GestureHandlerProvider>
            </SafeAreaProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SecureProvider>
    </ErrorBoundary>
  );
}

function SecureStorageInitializer({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initSecureStorage()
      .then(() => setIsReady(true))
      .catch(error => {
        console.warn('Failed to initialize secure storage:', error);
        // Continue anyway - secure storage will use fallback
        setIsReady(true);
      });
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}

function GestureHandlerProvider({ children }: PropsWithChildren) {
  const {
    isDark,
    colors: { background: backgroundColor },
  } = useTheme();
  return (
    <GestureHandlerRootView
      style={{
        ...commonStyles.flex,
        backgroundColor,
      }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {children}
    </GestureHandlerRootView>
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
