/**
 * Ejemplo: Testing de Custom Hooks
 * Demuestra:
 * - Testing de hooks con renderHook
 * - Testing de timers con jest
 * - Testing de efectos secundarios
 */

import { renderHook, act } from '@testing-library/react-native';

// Hook de ejemplo: useDebounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Necesario para usar hooks
import React from 'react';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('debe retornar el valor inicial inmediatamente', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debe actualizar el valor después del delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Cambiar el valor
    rerender({ value: 'updated', delay: 500 });

    // Antes del delay, debe mantener el valor anterior
    expect(result.current).toBe('initial');

    // Avanzar el tiempo
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Después del delay, debe tener el nuevo valor
    expect(result.current).toBe('updated');
  });

  it('debe cancelar el debounce anterior si el valor cambia', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'initial' },
      }
    );

    // Primer cambio
    rerender({ value: 'first' });
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Segundo cambio antes de que termine el primer debounce
    rerender({ value: 'second' });
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Solo debe tener el valor inicial después de 500ms totales
    expect(result.current).toBe('initial');

    // Avanzar otros 250ms para completar el segundo debounce
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Ahora debe tener el segundo valor
    expect(result.current).toBe('second');
  });

  it('debe funcionar con diferentes tipos de datos', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: { name: 'John', age: 30 } },
      }
    );

    expect(result.current).toEqual({ name: 'John', age: 30 });

    rerender({ value: { name: 'Jane', age: 25 } });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toEqual({ name: 'Jane', age: 25 });
  });

  it('debe respetar diferentes delays', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    rerender({ value: 'updated', delay: 1000 });

    // No debe actualizar antes del delay
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // Debe actualizar después del delay completo
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });
});

// Otro ejemplo: Hook con estado y callbacks
function useCounter(initialValue = 0) {
  const [count, setCount] = React.useState(initialValue);

  const increment = React.useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const decrement = React.useCallback(() => {
    setCount((c) => c - 1);
  }, []);

  const reset = React.useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}

describe('useCounter', () => {
  it('debe inicializar con el valor por defecto', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('debe inicializar con el valor proporcionado', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('debe incrementar el contador', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);

    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(2);
  });

  it('debe decrementar el contador', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });
    expect(result.current.count).toBe(4);

    act(() => {
      result.current.decrement();
    });
    expect(result.current.count).toBe(3);
  });

  it('debe resetear al valor inicial', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
    });
    expect(result.current.count).toBe(12);

    act(() => {
      result.current.reset();
    });
    expect(result.current.count).toBe(10);
  });

  it('debe mantener las funciones estables (memoizadas)', () => {
    const { result, rerender } = renderHook(() => useCounter(0));

    const { increment: increment1, decrement: decrement1 } = result.current;

    act(() => {
      result.current.increment();
    });
    rerender();

    const { increment: increment2, decrement: decrement2 } = result.current;

    // Las funciones deben ser las mismas instancias
    expect(increment1).toBe(increment2);
    expect(decrement1).toBe(decrement2);
  });
});
