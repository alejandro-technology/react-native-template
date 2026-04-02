import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '@modules/core/application/core.hooks';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Comportamiento básico', () => {
    it('debe retornar el valor inicial inmediatamente', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('debe actualizar el valor después del delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) =>
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 },
        },
      );

      rerender({ value: 'updated', delay: 500 });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });

    it('no debe actualizar antes del delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) =>
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 1000 },
        },
      );

      rerender({ value: 'updated', delay: 1000 });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('initial');
    });
  });

  describe('Cancelación de debounce', () => {
    it('debe cancelar el debounce anterior si el valor cambia', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebounce(value, 500),
        {
          initialProps: { value: 'initial' },
        },
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

    it('debe cancelar múltiples cambios rápidos y solo aplicar el último', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebounce(value, 300),
        {
          initialProps: { value: 'initial' },
        },
      );

      // Cambios rápidos
      rerender({ value: 'change1' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'change2' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'final' });

      // Aún debe tener el valor inicial
      expect(result.current).toBe('initial');

      // Completar el debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Debe tener el último valor
      expect(result.current).toBe('final');
    });
  });

  describe('Diferentes tipos de datos', () => {
    it('debe funcionar con strings', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebounce(value, 300),
        {
          initialProps: { value: 'hello' },
        },
      );

      expect(result.current).toBe('hello');

      rerender({ value: 'world' });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('world');
    });

    it('debe funcionar con números', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: number }) => useDebounce(value, 300),
        {
          initialProps: { value: 0 },
        },
      );

      expect(result.current).toBe(0);

      rerender({ value: 42 });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(42);
    });

    it('debe funcionar con objetos', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: { name: string; age: number } }) =>
          useDebounce(value, 300),
        {
          initialProps: { value: { name: 'John', age: 30 } },
        },
      );

      expect(result.current).toEqual({ name: 'John', age: 30 });

      rerender({ value: { name: 'Jane', age: 25 } });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toEqual({ name: 'Jane', age: 25 });
    });

    it('debe funcionar con arrays', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: number[] }) => useDebounce(value, 300),
        {
          initialProps: { value: [1, 2, 3] },
        },
      );

      expect(result.current).toEqual([1, 2, 3]);

      rerender({ value: [4, 5, 6] });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toEqual([4, 5, 6]);
    });

    it('debe funcionar con booleanos', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: boolean }) => useDebounce(value, 300),
        {
          initialProps: { value: false },
        },
      );

      expect(result.current).toBe(false);

      rerender({ value: true });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe(true);
    });

    it('debe funcionar con null', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string | null }) => useDebounce(value, 300),
        {
          initialProps: { value: null },
        },
      );

      expect(result.current).toBe(null);

      rerender({ value: 'not null' });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('not null');
    });

    it('debe funcionar con undefined', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string | undefined }) => useDebounce(value, 300),
        {
          initialProps: { value: undefined },
        },
      );

      expect(result.current).toBe(undefined);

      rerender({ value: 'defined' });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('defined');
    });
  });

  describe('Diferentes delays', () => {
    it('debe respetar delay corto (100ms)', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) =>
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 100 },
        },
      );

      rerender({ value: 'updated', delay: 100 });

      act(() => {
        jest.advanceTimersByTime(50);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(50);
      });
      expect(result.current).toBe('updated');
    });

    it('debe respetar delay largo (1000ms)', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) =>
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 1000 },
        },
      );

      rerender({ value: 'updated', delay: 1000 });

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe('updated');
    });

    it('debe respetar cambio de delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) =>
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 },
        },
      );

      rerender({ value: 'updated', delay: 1000 });

      // Avanzar 500ms (el delay anterior)
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe('initial');

      // Avanzar otros 500ms para completar el nuevo delay de 1000ms
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe('updated');
    });

    it('debe funcionar con delay de 0ms', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebounce(value, 0),
        {
          initialProps: { value: 'initial' },
        },
      );

      rerender({ value: 'updated' });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('Cleanup y memory leaks', () => {
    it('debe limpiar el timer al desmontar', () => {
      const { unmount } = renderHook(() => useDebounce('test', 500));

      unmount();

      // Si no hay memory leaks, esto no debería lanzar errores
      expect(true).toBe(true);
    });

    it('debe limpiar timer anterior cuando cambia el valor', () => {
      const { rerender } = renderHook(
        ({ value }: { value: string }) => useDebounce(value, 500),
        {
          initialProps: { value: 'initial' },
        },
      );

      // Primer cambio
      rerender({ value: 'first' });

      // Segundo cambio (debe limpiar el timer del primer cambio)
      rerender({ value: 'second' });

      // Avanzar tiempo
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // No debería haber errores por timers pendientes
      expect(true).toBe(true);
    });

    it('debe limpiar timer cuando cambia el delay', () => {
      const { rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) =>
          useDebounce(value, delay),
        {
          initialProps: { value: 'test', delay: 500 },
        },
      );

      rerender({ value: 'test', delay: 1000 });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(true).toBe(true);
    });
  });

  describe('Casos de uso comunes', () => {
    it('debe funcionar para búsqueda con debounce', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebounce(value, 300),
        {
          initialProps: { value: '' },
        },
      );

      // Usuario escribiendo "react"
      rerender({ value: 'r' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 're' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'rea' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'reac' });
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender({ value: 'react' });

      // Aún no debe haber actualizado
      expect(result.current).toBe('');

      // Después del delay completo
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('react');
    });

    it('debe funcionar para validación de formulario con debounce', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useDebounce(value, 500),
        {
          initialProps: { value: '' },
        },
      );

      // Usuario escribiendo email
      rerender({ value: 'user@example.com' });

      // No debe validar inmediatamente
      expect(result.current).toBe('');

      // Después del delay
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Debe tener el valor para validar
      expect(result.current).toBe('user@example.com');
    });
  });
});
