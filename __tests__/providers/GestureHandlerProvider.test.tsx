import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@theme/index', () => ({
  useTheme: () => ({
    isDark: false,
    colors: { background: '#fff' },
    commonStyles: { flex: {} },
  }),
  commonStyles: { flex: {} },
}));

import GestureHandlerProvider from '../../src/providers/GestureHandlerProvider';
import { Text } from 'react-native';

describe('GestureHandlerProvider', () => {
  it('renders children and status bar', () => {
    const { getByText } = render(
      <GestureHandlerProvider>
        <Text>GH</Text>
      </GestureHandlerProvider>,
    );

    expect(getByText('GH')).toBeTruthy();
  });
});
