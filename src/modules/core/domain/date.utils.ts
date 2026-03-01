/**
 * Utilidades reutilizables para formateo de fechas
 * Estas utilidades son transversales y pueden ser usadas por cualquier módulo
 */

/**
 * Formatea una fecha ISO a formato legible
 * @param isoDate - Fecha en formato ISO
 * @returns Fecha formateada como "MMM DD, YYYY"
 * @example
 * formatJoinDate("2024-01-15T10:30:00Z") // "Ene 15, 2024"
 */
export function formatJoinDate(isoDate: string): string {
  const date = new Date(isoDate);
  const months = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
