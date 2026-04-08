/**
 * Utilidades reutilizables para manejo y formateo de fechas.
 * Estas utilidades son transversales y pueden ser usadas por cualquier módulo.
 */

import { CONFIG } from '@config/config';

export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}

const JOIN_DATE_MONTH_MAP: Record<string, string> = {
  ene: 'Ene',
  feb: 'Feb',
  mar: 'Mar',
  abr: 'Abr',
  may: 'May',
  jun: 'Jun',
  jul: 'Jul',
  ago: 'Ago',
  sep: 'Sep',
  sept: 'Sep',
  oct: 'Oct',
  nov: 'Nov',
  dic: 'Dic',
};

function parseDateInput(date: Date | string | number): Date {
  return date instanceof Date ? date : new Date(date);
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function createDateFormatter({
  locale = CONFIG.LOCALE,
  ...options
}: DateFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, options);
}

export function formatDate(
  date: Date | string | number,
  options: DateFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  },
): string {
  const parsedDate = parseDateInput(date);

  if (!isValidDate(parsedDate)) {
    return '';
  }

  return createDateFormatter(options).format(parsedDate);
}

export function formatDateTime(
  date: Date | string | number,
  options: DateFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
): string {
  return formatDate(date, options);
}

export function formatRelativeDate(
  date: Date | string | number,
  locale = CONFIG.LOCALE,
): string {
  const parsedDate = parseDateInput(date);

  if (!isValidDate(parsedDate)) {
    return '';
  }

  const now = new Date();
  const diffInMs = parsedDate.getTime() - now.getTime();
  const diffInMinutes = Math.round(diffInMs / (1000 * 60));
  const diffInHours = Math.round(diffInMinutes / 60);
  const diffInDays = Math.round(diffInHours / 24);

  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
  });

  if (Math.abs(diffInMinutes) < 60) {
    return formatter.format(diffInMinutes, 'minute');
  }

  if (Math.abs(diffInHours) < 24) {
    return formatter.format(diffInHours, 'hour');
  }

  return formatter.format(diffInDays, 'day');
}

export function formatDateParts(
  date: Date | string | number,
  options: DateFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  },
): Intl.DateTimeFormatPart[] {
  const parsedDate = parseDateInput(date);

  if (!isValidDate(parsedDate)) {
    return [];
  }

  return createDateFormatter(options).formatToParts(parsedDate);
}

export function getDateRangeLabel(
  startDate: Date | string | number,
  endDate: Date | string | number,
  options: DateFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  },
): string {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);

  if (!isValidDate(start) || !isValidDate(end)) {
    return '';
  }

  return `${formatDate(start, options)} - ${formatDate(end, options)}`;
}

/**
 * Mantiene compatibilidad con usos existentes en el proyecto.
 */
export function formatJoinDate(isoDate: string): string {
  const parsedDate = parseDateInput(isoDate);

  if (!isValidDate(parsedDate)) {
    return '';
  }

  const parts = formatDateParts(parsedDate, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    locale: CONFIG.LOCALE,
  });

  const day = parts.find(part => part.type === 'day')?.value;
  const monthPart = parts.find(part => part.type === 'month')?.value;
  const year = parts.find(part => part.type === 'year')?.value;
  const normalizedMonth = monthPart
    ? JOIN_DATE_MONTH_MAP[monthPart.toLowerCase().replace('.', '')]
    : undefined;

  if (!day || !normalizedMonth || !year) {
    return '';
  }

  return `${normalizedMonth} ${day}, ${year}`;
}
