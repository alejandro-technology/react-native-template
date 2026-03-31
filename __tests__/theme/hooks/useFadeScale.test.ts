import { renderHook } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { useFadeScale } from '../../../src/theme/hooks/useFadeScale';

// Mock Animated methods with proper CompositeAnimation interface
const mockAnimation = {
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
};

jest.spyOn(Animated, 'timing').mockReturnValue(mockAnimation as any);

jest.spyOn(Animated, 'spring').mockReturnValue(mockAnimation as any);

jest.spyOn(Animated, 'parallel').mockReturnValue(mockAnimation as any);

describe('useFadeScale', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create fade and scale animations with defaults', () => {
    const { result } = renderHook(() => useFadeScale());

    expect(result.current.opacity).toBeDefined();
    expect(result.current.scale).toBeDefined();
  });

  it('should create animations with custom initial scale', () => {
    const { result } = renderHook(() => useFadeScale({ initialScale: 0.5 }));

    expect(result.current.opacity).toBeDefined();
    expect(result.current.scale).toBeDefined();
  });

  it('should create animations with custom duration', () => {
    renderHook(() => useFadeScale({ duration: 500 }));

    expect(Animated.timing).toHaveBeenCalled();
    expect(Animated.parallel).toHaveBeenCalled();
  });

  it('should create animations with custom spring config', () => {
    renderHook(() =>
      useFadeScale({
        springConfig: { friction: 10, tension: 100 },
      }),
    );

    expect(Animated.spring).toHaveBeenCalled();
  });

  it('should call Animated.parallel with timing and spring', () => {
    renderHook(() => useFadeScale());

    expect(Animated.parallel).toHaveBeenCalled();
    expect(Animated.timing).toHaveBeenCalled();
    expect(Animated.spring).toHaveBeenCalled();
  });
});
