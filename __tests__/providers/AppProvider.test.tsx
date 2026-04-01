import React from 'react';
import { render } from '@testing-library/react-native';

// Mock nested providers and heavy modules before importing AppProvider
jest.mock('../../src/providers/SecureProvider', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));
jest.mock('../../src/providers/NavigationProvider', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));
jest.mock('../../src/providers/NetworkProvider', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));
jest.mock('../../src/providers/SecureStorageProvider', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));
jest.mock('../../src/providers/GestureHandlerProvider', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

jest.mock('@modules/authentication', () => ({
  __esModule: true,
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock('@theme/providers/ThemeProvider', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

jest.mock('@components/layout/ErrorBoundary', () => ({
  __esModule: true,
  ErrorBoundary: ({ children }: any) => <>{children}</>,
}));

jest.mock('@modules/core/ui', () => ({
  __esModule: true,
  GlobalDeleteConfirmation: () => null,
  GlobalToast: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
}));

import AppProvider from '../../src/providers/AppProvider';
import { Text } from 'react-native';

describe('AppProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <AppProvider>
        <Text>Child</Text>
      </AppProvider>,
    );

    expect(getByText('Child')).toBeTruthy();
  });
});
