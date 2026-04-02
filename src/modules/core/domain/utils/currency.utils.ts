/**
 * Utilidades reutilizables para formateo monetario.
 */

export interface CurrencyFormatOptions extends Intl.NumberFormatOptions {
  locale?: string;
  currency?: string;
}

const DEFAULT_CURRENCY = 'MXN';
const DEFAULT_LOCALE = 'es-MX';

function createCurrencyFormatter({
  locale = DEFAULT_LOCALE,
  currency = DEFAULT_CURRENCY,
  ...options
}: CurrencyFormatOptions = {}): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
}

export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {},
): string {
  if (!Number.isFinite(amount)) {
    return '';
  }

  return createCurrencyFormatter(options).format(amount);
}

export function formatCompactCurrency(
  amount: number,
  options: CurrencyFormatOptions = {},
): string {
  if (!Number.isFinite(amount)) {
    return '';
  }

  return createCurrencyFormatter({
    notation: 'compact',
    maximumFractionDigits: 1,
    ...options,
  }).format(amount);
}

export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
  locale = DEFAULT_LOCALE,
): string {
  if (!Number.isFinite(value)) {
    return '';
  }

  return new Intl.NumberFormat(locale, options).format(value);
}
