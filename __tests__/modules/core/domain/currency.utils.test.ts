import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
} from '@modules/core/domain/utils/currency.utils';

describe('currency.utils', () => {
  describe('formatCurrency', () => {
    it('debe retornar una cadena no vacía para un número válido', () => {
      const result = formatCurrency(1000);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('debe incluir el número en la cadena formateada', () => {
      const result = formatCurrency(1000);
      expect(result).toMatch(/1[.,]?000/);
    });

    it('debe retornar cadena vacía para NaN', () => {
      expect(formatCurrency(NaN)).toBe('');
    });

    it('debe retornar cadena vacía para Infinity', () => {
      expect(formatCurrency(Infinity)).toBe('');
    });

    it('debe retornar cadena vacía para -Infinity', () => {
      expect(formatCurrency(-Infinity)).toBe('');
    });

    it('debe formatear el valor cero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('debe formatear valores negativos', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('500');
    });

    it('debe aceptar locale y moneda personalizados', () => {
      const result = formatCurrency(1000, { locale: 'en-US', currency: 'USD' });
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('debe formatear con dos decimales usando locale en-US', () => {
      const result = formatCurrency(100, { locale: 'en-US', currency: 'USD' });
      expect(result).toMatch(/100\.00/);
    });

    it('debe formatear valores decimales', () => {
      const result = formatCurrency(99.99, { locale: 'en-US', currency: 'USD' });
      expect(result).toContain('99.99');
    });
  });

  describe('formatCompactCurrency', () => {
    it('debe formatear en notación compacta para millones', () => {
      const result = formatCompactCurrency(1000000);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('debe producir una cadena más corta que el formato completo para valores grandes', () => {
      const full = formatCurrency(1000000);
      const compact = formatCompactCurrency(1000000);
      expect(compact.length).toBeLessThan(full.length);
    });

    it('debe retornar cadena vacía para NaN', () => {
      expect(formatCompactCurrency(NaN)).toBe('');
    });

    it('debe retornar cadena vacía para Infinity', () => {
      expect(formatCompactCurrency(Infinity)).toBe('');
    });

    it('debe retornar cadena vacía para -Infinity', () => {
      expect(formatCompactCurrency(-Infinity)).toBe('');
    });

    it('debe formatear valores menores a mil sin notación compacta', () => {
      const result = formatCompactCurrency(500);
      expect(result).toContain('500');
    });

    it('debe aceptar opciones de locale y moneda personalizados', () => {
      const result = formatCompactCurrency(1000000, {
        locale: 'en-US',
        currency: 'USD',
      });
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatNumber', () => {
    it('debe formatear un número entero', () => {
      const result = formatNumber(1234);
      expect(typeof result).toBe('string');
      expect(result).toContain('1');
    });

    it('debe retornar cadena vacía para NaN', () => {
      expect(formatNumber(NaN)).toBe('');
    });

    it('debe retornar cadena vacía para Infinity', () => {
      expect(formatNumber(Infinity)).toBe('');
    });

    it('debe retornar cadena vacía para -Infinity', () => {
      expect(formatNumber(-Infinity)).toBe('');
    });

    it('debe formatear el valor cero', () => {
      expect(formatNumber(0)).toContain('0');
    });

    it('debe formatear con separador de miles usando locale en-US', () => {
      const result = formatNumber(1234, {}, 'en-US');
      expect(result).toBe('1,234');
    });

    it('debe aceptar opciones de estilo porcentaje', () => {
      const result = formatNumber(0.75, { style: 'percent' });
      expect(result).toContain('75');
    });

    it('debe respetar las opciones de decimales', () => {
      const result = formatNumber(3.14159, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }, 'en-US');
      expect(result).toBe('3.14');
    });

    it('debe formatear números negativos', () => {
      const result = formatNumber(-42);
      expect(result).toContain('42');
    });
  });
});
