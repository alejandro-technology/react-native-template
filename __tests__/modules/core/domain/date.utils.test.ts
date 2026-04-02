import { formatJoinDate } from '../../../../src/modules/core/domain/utils/date.utils';

describe('date.utils', () => {
  describe('formatJoinDate', () => {
    it('should format date in Spanish month format', () => {
      // Use noon time to avoid timezone issues
      const result = formatJoinDate('2024-01-15T12:00:00Z');
      expect(result).toMatch(/Ene \d+, 2024/);
    });

    it('should format February correctly', () => {
      const result = formatJoinDate('2024-02-20T12:00:00Z');
      expect(result).toMatch(/Feb \d+, 2024/);
    });

    it('should format December correctly', () => {
      const result = formatJoinDate('2024-12-25T12:00:00Z');
      expect(result).toMatch(/Dic \d+, 2024/);
    });

    it('should handle different years', () => {
      const result = formatJoinDate('2023-06-15T12:00:00Z');
      expect(result).toMatch(/Jun \d+, 2023/);
    });

    it('should return month abbreviations in Spanish', () => {
      // Just verify the function returns a properly formatted string
      const result = formatJoinDate('2024-05-15T12:00:00Z');
      expect(result).toMatch(/\w{3} \d+, \d{4}/);
    });

    it('should handle all month abbreviations', () => {
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

      // Test each month using local date to avoid timezone issues
      for (let month = 0; month < 12; month++) {
        const date = new Date(2024, month, 15);
        const isoString = date.toISOString();
        const result = formatJoinDate(isoString);
        // The function uses getMonth() which returns local month
        expect(result).toContain(monthMap[date.getMonth()]);
      }
    });
  });
});
