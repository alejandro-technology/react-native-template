import { renderHook } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { useAnimatedLoop } from '../../../src/theme/hooks/useAnimatedLoop';

// Mock Animated methods with proper CompositeAnimation interface
const mockAnimation = {
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
};

jest.spyOn(Animated, 'timing').mockReturnValue(mockAnimation as any);

jest.spyOn(Animated, 'loop').mockReturnValue(mockAnimation as any);

jest.spyOn(Animated, 'sequence').mockReturnValue(mockAnimation as any);

describe('useAnimatedLoop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pulse animation', () => {
    it('should create pulse animation with default duration', () => {
      const { result } = renderHook(() => useAnimatedLoop({ type: 'pulse' }));

      expect(result.current.value).toBeDefined();
      expect(result.current.interpolated).toBeUndefined();
    });

    it('should create pulse animation with custom duration', () => {
      renderHook(() => useAnimatedLoop({ type: 'pulse', duration: 2000 }));

      expect(Animated.sequence).toHaveBeenCalled();
      expect(Animated.loop).toHaveBeenCalled();
    });
  });

  describe('bounce animation', () => {
    it('should create bounce animation', () => {
      const { result } = renderHook(() => useAnimatedLoop({ type: 'bounce' }));

      expect(result.current.value).toBeDefined();
      expect(result.current.interpolated).toBeUndefined();
    });
  });

  describe('rotate animation', () => {
    it('should create rotate animation', () => {
      const { result } = renderHook(() => useAnimatedLoop({ type: 'rotate' }));

      expect(result.current.value).toBeDefined();
      expect(result.current.interpolated).toBeDefined();
    });

    it('should create rotate animation with custom duration', () => {
      renderHook(() => useAnimatedLoop({ type: 'rotate', duration: 3000 }));

      expect(Animated.timing).toHaveBeenCalled();
    });
  });
});
