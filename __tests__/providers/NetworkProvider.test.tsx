import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@modules/network', () => ({
  useNetInfo: () => ({ isConnected: true, isLoading: false }),
}));

jest.mock('@modules/core', () => ({
  useAppStorage: () => ({
    toast: { show: jest.fn(), hide: jest.fn() },
    show: jest.fn(),
    hide: jest.fn(),
  }),
}));

jest.mock('@modules/network/application/connectivity.storage', () => ({
  useConnectivityStore: (selector: any) => {
    const store = { setConnected: jest.fn() };
    return selector ? selector(store) : store;
  },
}));

import NetworkProvider from '../../src/providers/NetworkProvider';
import { Text } from 'react-native';

describe('NetworkProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <NetworkProvider>
        <Text>Net</Text>
      </NetworkProvider>,
    );

    expect(getByText('Net')).toBeTruthy();
  });
});
