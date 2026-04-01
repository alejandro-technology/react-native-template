import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('jail-monkey', () => ({
  __esModule: true,
  default: { isJailBroken: jest.fn(() => false) },
  isJailBroken: jest.fn(() => false),
}));

import SecureProvider from '../../src/providers/SecureProvider';
import { Text } from 'react-native';

describe('SecureProvider', () => {
  it('renders children when device is not jailbroken', () => {
    const { getByText } = render(
      <SecureProvider>
        <Text>Sec</Text>
      </SecureProvider>,
    );

    expect(getByText('Sec')).toBeTruthy();
  });
});
