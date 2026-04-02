/**
 * Utilidades reutilizables para formateo de texto.
 */

export function capitalize(text: string): string {
  if (!text.trim()) {
    return '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function capitalizeWords(text: string): string {
  if (!text.trim()) {
    return '';
  }

  return text
    .trim()
    .split(/\s+/)
    .map(word => capitalize(word.toLowerCase()))
    .join(' ');
}

export function initialsFromText(text: string, maxLength = 2): string {
  if (!text.trim()) {
    return '';
  }

  return text
    .trim()
    .split(/\s+/)
    .slice(0, maxLength)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

export function truncateText(
  text: string,
  maxLength: number,
  suffix = '...',
): string {
  if (maxLength <= 0) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  const truncatedLength = Math.max(maxLength - suffix.length, 0);

  return `${text.slice(0, truncatedLength).trimEnd()}${suffix}`;
}

export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function toSlug(text: string): string {
  return removeAccents(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
