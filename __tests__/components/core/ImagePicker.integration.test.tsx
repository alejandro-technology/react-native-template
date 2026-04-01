import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ImagePicker } from '../../../src/components/core/ImagePicker';

// Mocks
jest.mock('../../../src/modules/core/application/use-permissions', () => ({
  usePermission: () => ({
    checkAndRequest: jest.fn(async () => ({
      status: 'granted',
      canAskAgain: true,
    })),
  }),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn((options, cb) =>
    cb({ assets: [{ uri: 'camera-uri' }] }),
  ),
  launchImageLibrary: jest.fn((options, cb) =>
    cb({ assets: [{ uri: 'library-uri' }] }),
  ),
}));

describe('ImagePicker integration', () => {
  it('opens modal and selects camera', async () => {
    const onChange = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <ImagePicker
        value={null}
        onChange={onChange}
        displayName="Test User"
        label="Foto"
        placeholder="Toca"
      />,
    );

    const avatar = getByTestId('imagepicker-avatar');
    fireEvent.press(avatar);

    // camera option should be visible
    const camera = await waitFor(() =>
      getByTestId('imagepicker-option-camera'),
    );
    fireEvent.press(camera);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('camera-uri'));
    // modal should be closed
    expect(queryByTestId('imagepicker-option-camera')).toBeNull();
  });

  it('opens modal and selects gallery', async () => {
    const onChange = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <ImagePicker
        value={null}
        onChange={onChange}
        displayName="Test User"
        label="Foto"
        placeholder="Toca"
      />,
    );

    const avatar = getByTestId('imagepicker-avatar');
    fireEvent.press(avatar);

    const gallery = await waitFor(() =>
      getByTestId('imagepicker-option-gallery'),
    );
    fireEvent.press(gallery);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('library-uri'));
    expect(queryByTestId('imagepicker-option-gallery')).toBeNull();
  });
});
