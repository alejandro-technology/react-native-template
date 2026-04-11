import {
  formatDate,
  formatDateTime,
  formatRelativeDate,
  formatDateParts,
  getDateRangeLabel,
  formatJoinDate,
} from '../../../../src/modules/core/domain/utils/date.utils';

// Fecha fija para hacer deterministas los tests de tiempo relativo
const FIXED_NOW = new Date('2024-03-15T12:00:00Z');

describe('date.utils', () => {
  describe('formatDate', () => {
    it('debe formatear una fecha válida y contener el año', () => {
      const result = formatDate(new Date('2024-06-15T12:00:00Z'));
      expect(result).toContain('2024');
    });

    it('debe aceptar un string ISO como fecha', () => {
      const result = formatDate('2024-06-20T12:00:00Z');
      expect(result).toContain('2024');
    });

    it('debe aceptar un timestamp numérico', () => {
      const result = formatDate(Date.UTC(2024, 5, 15, 12));
      expect(result).toContain('2024');
    });

    it('debe retornar cadena vacía para una fecha inválida', () => {
      expect(formatDate('fecha-invalida')).toBe('');
    });

    it('debe aceptar opciones de formato personalizadas', () => {
      const result = formatDate(new Date('2024-01-15T12:00:00Z'), {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      });
      expect(result).toContain('2024');
    });
  });

  describe('formatDateTime', () => {
    it('debe incluir el año en el resultado', () => {
      const result = formatDateTime(new Date('2024-03-10T14:30:00Z'));
      expect(result).toContain('2024');
    });

    it('debe retornar cadena vacía para una fecha inválida', () => {
      expect(formatDateTime('no-es-fecha')).toBe('');
    });

    it('debe aceptar un timestamp numérico', () => {
      const result = formatDateTime(Date.UTC(2024, 2, 10, 14, 30));
      expect(result).toContain('2024');
    });
  });

  describe('formatRelativeDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(FIXED_NOW);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debe retornar tiempo en minutos para diferencias menores a 1 hora', () => {
      const future = new Date(FIXED_NOW.getTime() + 45 * 60 * 1000);
      expect(formatRelativeDate(future)).toBe('dentro de 45 minutos');
    });

    it('debe retornar tiempo en horas para diferencias entre 1 y 24 horas', () => {
      const future = new Date(FIXED_NOW.getTime() + 2 * 60 * 60 * 1000);
      expect(formatRelativeDate(future)).toBe('dentro de 2 horas');
    });

    it('debe retornar tiempo en días para diferencias mayores a 24 horas', () => {
      const past = new Date(FIXED_NOW.getTime() - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeDate(past)).toBe('hace 3 días');
    });

    it('debe retornar tiempo pasado en minutos', () => {
      const past = new Date(FIXED_NOW.getTime() - 45 * 60 * 1000);
      expect(formatRelativeDate(past)).toBe('hace 45 minutos');
    });

    it('debe retornar cadena vacía para fecha inválida', () => {
      expect(formatRelativeDate('invalido')).toBe('');
    });

    it('debe aceptar locale personalizado', () => {
      const future = new Date(FIXED_NOW.getTime() + 45 * 60 * 1000);
      const result = formatRelativeDate(future, 'en-US');
      expect(result).toContain('45');
    });
  });

  describe('formatDateParts', () => {
    it('debe retornar un arreglo de partes de fecha para una fecha válida', () => {
      const parts = formatDateParts(new Date('2024-01-15T12:00:00Z'));
      expect(Array.isArray(parts)).toBe(true);
      expect(parts.length).toBeGreaterThan(0);
    });

    it('debe incluir una parte de tipo año con el valor correcto', () => {
      const parts = formatDateParts(new Date('2024-01-15T12:00:00Z'));
      const yearPart = parts.find(p => p.type === 'year');
      expect(yearPart).toBeDefined();
      expect(yearPart?.value).toBe('2024');
    });

    it('debe retornar arreglo vacío para fecha inválida', () => {
      expect(formatDateParts('fecha-invalida')).toEqual([]);
    });

    it('debe incluir una parte de tipo mes cuando se solicita', () => {
      const parts = formatDateParts(new Date('2024-01-15T12:00:00Z'), {
        month: 'long',
      });
      expect(parts.some(p => p.type === 'month')).toBe(true);
    });
  });

  describe('getDateRangeLabel', () => {
    it('debe retornar un rango con separador " - " entre fechas', () => {
      const result = getDateRangeLabel(
        new Date('2024-01-15T12:00:00Z'),
        new Date('2024-03-20T12:00:00Z'),
      );
      expect(result).toContain(' - ');
    });

    it('debe incluir el año de inicio y fin en el rango', () => {
      const result = getDateRangeLabel(
        new Date('2023-01-01T12:00:00Z'),
        new Date('2024-12-31T12:00:00Z'),
      );
      expect(result).toContain('2023');
      expect(result).toContain('2024');
    });

    it('debe retornar cadena vacía si la fecha de inicio es inválida', () => {
      expect(getDateRangeLabel('invalido', new Date())).toBe('');
    });

    it('debe retornar cadena vacía si la fecha de fin es inválida', () => {
      expect(getDateRangeLabel(new Date(), 'invalido')).toBe('');
    });

    it('debe aceptar timestamps numéricos', () => {
      const result = getDateRangeLabel(
        Date.UTC(2024, 0, 1, 12),
        Date.UTC(2024, 11, 31, 12),
      );
      expect(result).toContain('2024');
    });
  });

  describe('formatJoinDate', () => {
    it('debe formatear una fecha en formato de mes abreviado en español', () => {
      // Se usa hora al mediodía UTC para evitar problemas de zona horaria
      const result = formatJoinDate('2024-01-15T12:00:00Z');
      expect(result).toMatch(/Ene \d+, 2024/);
    });

    it('debe formatear febrero correctamente', () => {
      const result = formatJoinDate('2024-02-20T12:00:00Z');
      expect(result).toMatch(/Feb \d+, 2024/);
    });

    it('debe formatear diciembre correctamente', () => {
      const result = formatJoinDate('2024-12-25T12:00:00Z');
      expect(result).toMatch(/Dic \d+, 2024/);
    });

    it('debe manejar diferentes años', () => {
      const result = formatJoinDate('2023-06-15T12:00:00Z');
      expect(result).toMatch(/Jun \d+, 2023/);
    });

    it('debe retornar cadena en formato mes_abreviado día, año', () => {
      const result = formatJoinDate('2024-05-15T12:00:00Z');
      expect(result).toMatch(/\w{3} \d+, \d{4}/);
    });

    it('debe manejar todas las abreviaciones de meses en español', () => {
      const monthMap: Record<number, string> = {
        0: 'Ene',
        1: 'Feb',
        2: 'Mar',
        3: 'Abr',
        4: 'May',
        5: 'Jun',
        6: 'Jul',
        7: 'Ago',
        8: 'Sep',
        9: 'Oct',
        10: 'Nov',
        11: 'Dic',
      };

      for (let month = 0; month < 12; month++) {
        const date = new Date(2024, month, 15);
        const result = formatJoinDate(date.toISOString());
        expect(result).toContain(monthMap[date.getMonth()]);
      }
    });
  });
});
