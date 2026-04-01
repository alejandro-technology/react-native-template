import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@theme/index', () => ({
  useTheme: () => ({
    colors: {
      primary: '#0f0',
      background: '#fff',
      surface: '#fff',
      text: '#000',
      border: '#ccc',
      error: '#f00',
    },
    isDark: false,
  }),
}));

import NavigationProvider from '../../src/providers/NavigationProvider';
import { Text } from 'react-native';

describe('NavigationProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <NavigationProvider>
        <Text>Nav</Text>
      </NavigationProvider>,
    );

    expect(getByText('Nav')).toBeTruthy();
  });
});
