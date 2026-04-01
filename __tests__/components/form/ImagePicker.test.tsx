import React from 'react';
import { render } from '@testing-library/react-native';

// Mock react-hook-form useController to provide predictable field values
jest.mock('react-hook-form', () => ({
  useController: () => ({
    field: { value: null, onChange: jest.fn() },
    fieldState: { error: undefined },
  }),
}));

import { ImagePicker } from '@components/form/ImagePicker';

describe('ImagePicker (form)', () => {
  it('renders core ImagePicker via form wrapper', () => {
    const control: any = {};
    const { getByText } = render(
      <ImagePicker
        control={control}
        name="avatar"
        label="Foto"
        displayName="User"
      />,
    );

    expect(getByText('Foto')).toBeTruthy();
  });
});
