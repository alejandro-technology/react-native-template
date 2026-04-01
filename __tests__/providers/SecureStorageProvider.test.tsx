import React from 'react';
import { render, act } from '@testing-library/react-native';

jest.mock('../../src/config/storage', () => ({
  initSecureStorage: jest.fn(() => Promise.resolve()),
}));

import SecureStorageProvider from '../../src/providers/SecureStorageProvider';
import { Text } from 'react-native';

describe('SecureStorageProvider', () => {
  it('renders children after init', async () => {
    const { getByText } = render(
      <SecureStorageProvider>
        <Text>SS</Text>
      </SecureStorageProvider>,
    );

    // wait for effect
    await act(async () => Promise.resolve());

    expect(getByText('SS')).toBeTruthy();
  });
});
