import { render } from '@utils/test-utils';
import { Avatar } from '@components/core/Avatar';

// Mock de FastImage
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  const FastImage = (props: any) => React.createElement(View, props);
  FastImage.priority = { normal: 'normal' };
  FastImage.resizeMode = { cover: 'cover' };
  return FastImage;
});

describe('Avatar Component', () => {
  const defaultProps = {
    name: 'John Doe',
    userId: '123',
  };

  it('debe renderizar las iniciales correctamente cuando no hay imagen', () => {
    const { getByText } = render(<Avatar {...defaultProps} />);
    expect(getByText('JD')).toBeTruthy();
  });

  it('debe manejar nombres de una sola palabra', () => {
    const { getByText } = render(<Avatar name="John" userId="123" />);
    expect(getByText('JO')).toBeTruthy(); // Según la lógica: name.substring(0, 2).toUpperCase()
  });

  it('debe renderizar la imagen cuando imageUrl está presente', () => {
    const imageUrl = 'https://example.com/avatar.jpg';
    const { UNSAFE_getByType } = render(
      <Avatar {...defaultProps} imageUrl={imageUrl} />,
    );

    const FastImage = require('react-native-fast-image');
    const image = UNSAFE_getByType(FastImage);
    expect(image.props.source.uri).toBe(imageUrl);
  });

  it('debe aplicar diferentes tamaños', () => {
    const { getByText, rerender } = render(
      <Avatar {...defaultProps} size="sm" />,
    );
    expect(getByText('JD')).toBeTruthy();

    rerender(<Avatar {...defaultProps} size="lg" />);
    expect(getByText('JD')).toBeTruthy();
  });
});
