import { renderHook } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { useFocusFadeIn } from '../../../src/theme/hooks/useFocusFadeIn';

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

describe('useFocusFadeIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create opacity and translateY animations', () => {
    const { result } = renderHook(() => useFocusFadeIn());

    expect(result.current.opacity).toBeDefined();
    expect(result.current.translateY).toBeDefined();
    expect(result.current.animatedStyle).toBeDefined();
  });

  it('should create animation with custom duration', () => {
    renderHook(() => useFocusFadeIn({ duration: 500 }));

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('should create animation with custom delay', () => {
    renderHook(() => useFocusFadeIn({ delay: 200 }));

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('should create animation with custom offset', () => {
    renderHook(() => useFocusFadeIn({ offset: 50 }));

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('should return animatedStyle with opacity and transform', () => {
    const { result } = renderHook(() => useFocusFadeIn());

    expect(result.current.animatedStyle).toHaveProperty('opacity');
    expect(result.current.animatedStyle).toHaveProperty('transform');
  });

  it('should call useFocusEffect', () => {
    const { useFocusEffect } = require('@react-navigation/native');
    renderHook(() => useFocusFadeIn());

    expect(useFocusEffect).toHaveBeenCalled();
  });
});
