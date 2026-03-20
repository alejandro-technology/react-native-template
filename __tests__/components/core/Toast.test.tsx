import React from 'react';
import { render, act } from '@utils/test-utils';
import { Toast } from '@components/core/Toast';

jest.mock('@theme/hooks', () => {
  const mockFadeOut = jest.fn(cb => {
    if (typeof cb === 'function') {
      cb();
    }
  });

  return {
    useFadeSlide: jest.fn(() => ({
      opacity: { interpolate: jest.fn(), setValue: jest.fn() },
      translateY: { interpolate: jest.fn(), setValue: jest.fn() },
      start: jest.fn(),
      fadeOut: mockFadeOut,
    })),
    useAnimatedLoop: jest.fn(),
    useFadeScale: jest.fn(),
    useFocusFadeIn: jest.fn(),
    useFocusSlideIn: jest.fn(),
  };
});

describe('Toast Component', () => {
  const defaultProps = {
    message: 'Mensaje de prueba',
    type: 'success' as const,
    visible: true,
    onHide: jest.fn(),
    duration: 3000,
    position: 'bottom' as const,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debe renderizar el mensaje correctamente', () => {
    const { getByText } = render(<Toast {...defaultProps} />);
    expect(getByText('Mensaje de prueba')).toBeTruthy();
  });

  it('no debe renderizar nada cuando visible es false', () => {
    const { queryByText } = render(<Toast {...defaultProps} visible={false} />);
    expect(queryByText('Mensaje de prueba')).toBeNull();
  });

  it('debe llamar a onHide después de la duración', () => {
    render(<Toast {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(defaultProps.onHide).toHaveBeenCalled();
  });

  it('debe mostrar el icono correcto según el tipo success', () => {
    const { getByText } = render(<Toast {...defaultProps} type="success" />);
    expect(getByText('\u2713')).toBeTruthy();
  });
});
