import React from 'react';
import { render } from '@testing-library/react-native';

import { OfflineBanner } from '@components/layout/OfflineBanner';

// Mock the zustand hook to accept a selector function: useConnectivityStore(sel)
jest.mock('@modules/network/application/connectivity.storage', () => ({
  useConnectivityStore: jest.fn((selector: any) =>
    selector({ isConnected: true }),
  ),
}));

const mockedHook = require('@modules/network/application/connectivity.storage')
  .useConnectivityStore as jest.Mock;

describe('OfflineBanner', () => {
  afterEach(() => mockedHook.mockReset());

  it('does not render when connected', () => {
    mockedHook.mockImplementation((selector: any) =>
      selector({ isConnected: true }),
    );
    const { queryByText } = render(<OfflineBanner />);
    expect(queryByText('Sin conexión — usando datos guardados')).toBeNull();
  });

  it('renders message when offline', () => {
    mockedHook.mockImplementation((selector: any) =>
      selector({ isConnected: false }),
    );
    const { getByText } = render(<OfflineBanner />);
    expect(getByText('Sin conexión — usando datos guardados')).toBeTruthy();
  });
});
