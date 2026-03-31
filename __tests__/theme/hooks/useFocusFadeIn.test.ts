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

// Mock Animated methods with proper CompositeAnimation interface
const mockAnimation = {
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
};

jest.spyOn(Animated, 'timing').mockReturnValue(mockAnimation as any);

jest.spyOn(Animated, 'parallel').mockReturnValue(mockAnimation as any);

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
