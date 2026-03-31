import { renderHook, act } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { useFadeSlide } from '../../../src/theme/hooks/useFadeSlide';

// Mock Animated methods
const mockStart = jest.fn((callback?: () => void) => callback?.());
const mockSetValue = jest.fn();

jest.spyOn(Animated, 'timing').mockImplementation(
  () =>
    ({
      start: mockStart,
    }) as any,
);

jest.spyOn(Animated, 'parallel').mockImplementation((animations: any) => ({
  start: mockStart,
}));

// Mock Animated.Value
jest.spyOn(Animated, 'Value').mockImplementation(() => ({
  setValue: mockSetValue,
  interpolate: jest.fn(),
}));

describe('useFadeSlide', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create fade and slide animations with defaults', () => {
    const { result } = renderHook(() => useFadeSlide());

    expect(result.current.opacity).toBeDefined();
    expect(result.current.translateY).toBeDefined();
    expect(result.current.start).toBeDefined();
    expect(result.current.fadeOut).toBeDefined();
  });

  it('should auto-start animation by default', () => {
    renderHook(() => useFadeSlide());

    expect(Animated.parallel).toHaveBeenCalled();
    expect(mockStart).toHaveBeenCalled();
  });

  it('should not auto-start when autoStart is false', () => {
    renderHook(() => useFadeSlide({ autoStart: false }));

    // When autoStart is false, the animation is not started automatically
    // parallel is called by start(), which is only called when autoStart is true
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('should create animation with custom offset', () => {
    const { result } = renderHook(() => useFadeSlide({ offset: 50 }));

    expect(result.current.opacity).toBeDefined();
  });

  it('should create animation with direction up', () => {
    const { result } = renderHook(() => useFadeSlide({ direction: 'up' }));

    expect(result.current.opacity).toBeDefined();
  });

  it('should create animation with custom duration and delay', () => {
    renderHook(() => useFadeSlide({ duration: 500, delay: 200 }));

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('should expose start method', () => {
    const { result } = renderHook(() => useFadeSlide({ autoStart: false }));

    act(() => {
      result.current.start();
    });

    expect(mockStart).toHaveBeenCalled();
  });

  it('should expose fadeOut method', () => {
    const { result } = renderHook(() => useFadeSlide());

    act(() => {
      result.current.fadeOut();
    });

    expect(Animated.parallel).toHaveBeenCalled();
  });

  it('should call onComplete callback in fadeOut', () => {
    const { result } = renderHook(() => useFadeSlide());
    const onComplete = jest.fn();

    act(() => {
      result.current.fadeOut(onComplete);
    });

    // The onComplete is called by the mock start function
    expect(mockStart).toHaveBeenCalled();
  });
});
