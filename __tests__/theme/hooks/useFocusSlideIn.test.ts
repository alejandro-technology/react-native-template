import { renderHook } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { useFocusSlideIn } from '../../../src/theme/hooks/useFocusSlideIn';

// Mock useFocusEffect
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => {
    // Simulate focus effect
    callback(() => {});
  }),
}));

// Mock Animated methods
const mockStart = jest.fn();

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
  setValue: jest.fn(),
  interpolate: jest.fn(),
}));

describe('useFocusSlideIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create opacity and translateX animations', () => {
    const { result } = renderHook(() => useFocusSlideIn());

    expect(result.current.opacity).toBeDefined();
    expect(result.current.translateX).toBeDefined();
    expect(result.current.animatedStyle).toBeDefined();
  });

  it('should create animation with custom duration', () => {
    renderHook(() => useFocusSlideIn({ duration: 500 }));

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('should create animation with custom delay', () => {
    renderHook(() => useFocusSlideIn({ delay: 200 }));

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('should create animation with direction right', () => {
    renderHook(() => useFocusSlideIn({ direction: 'right' }));

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('should create animation with direction left', () => {
    renderHook(() => useFocusSlideIn({ direction: 'left' }));

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('should create animation with custom offset', () => {
    renderHook(() => useFocusSlideIn({ offset: 100 }));

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('should return animatedStyle with opacity and transform', () => {
    const { result } = renderHook(() => useFocusSlideIn());

    expect(result.current.animatedStyle).toHaveProperty('opacity');
    expect(result.current.animatedStyle).toHaveProperty('transform');
  });

  it('should call useFocusEffect', () => {
    const { useFocusEffect } = require('@react-navigation/native');
    renderHook(() => useFocusSlideIn());

    expect(useFocusEffect).toHaveBeenCalled();
  });
});
