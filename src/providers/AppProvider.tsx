import React, { PropsWithChildren } from 'react';
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
// Styles
import { useTheme, commonStyles } from '@theme/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';

const queryClient = new QueryClient();
export default function AppProvider({ children }: PropsWithChildren) {
  return (
    <SecureProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider>
            <GestureHandlerProvider>
              <AuthProvider>
                <NavigationProvider>
                  <SafeAreaView>{children}</SafeAreaView>
                  <GlobalDeleteConfirmation />
                  <GlobalToast />
                </NavigationProvider>
              </AuthProvider>
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

function SafeAreaView({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        ...commonStyles.flex,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        left: insets.left,
        right: insets.right,
      }}
    >
      {children}
    </View>
  );
}
