/**
 * Sistema de colores para temas de la aplicación
 *
 * Soporta temas base (light/dark) y temas personalizados (primary, secondary, premium)
 */

/**
 * Temas base disponibles
 */
export type BaseThemeMode = 'light' | 'dark';

/**
 * Temas personalizados disponibles
 */
export type CustomThemeMode = 'primary' | 'secondary' | 'premium';

/**
 * Todos los modos de tema soportados
 */
export type ThemeMode = BaseThemeMode | CustomThemeMode;

/**
 * Estructura completa de colores de un tema
 */
export interface Colors {
  /** Color de fondo principal */
  background: string;
  /** Color de superficie (tarjetas, modales) */
  surface: string;
  /** Color de bordes */
  border: string;
  /** Color de texto principal */
  text: string;
  /** Color de texto secundario */
  textSecondary: string;
  /** Color primario del tema */
  primary: string;

  /** Colores semánticos */
  /** Color para estados de éxito */
  success: string;
  /** Color para advertencias */
  warning: string;
  /** Color para errores */
  error: string;
  /** Color para información */
  info: string;

  /** Colores de texto sobre fondos de color */
  /** Texto sobre color primario */
  onPrimary: string;
  /** Texto sobre color de éxito */
  onSuccess: string;
  /** Texto sobre color de error */
  onError: string;
  /** Texto sobre color de información */
  onInfo: string;
}

/**
 * Colores para el tema claro
 */
const lightColors: Colors = {
  background: '#f6f6f8',
  surface: '#ffffff',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  onPrimary: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onError: '#FFFFFF',
  onInfo: '#FFFFFF',
};

/**
 * Colores para el tema oscuro
 */
const darkColors: Colors = {
  background: '#0F172A',
  surface: '#1E293B',
  border: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  primary: '#60A5FA',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  onPrimary: '#0F172A',
  onSuccess: '#0F172A',
  onError: '#0F172A',
  onInfo: '#0F172A',
};

/**
 * Colores para el tema primario (azul corporativo)
 */
const primaryColors: Colors = {
  background: '#EFF6FF',
  surface: '#FFFFFF',
  border: '#BFDBFE',
  text: '#1E3A8A',
  textSecondary: '#3B82F6',
  primary: '#2563EB',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
  onPrimary: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onError: '#FFFFFF',
  onInfo: '#FFFFFF',
};

/**
 * Colores para el tema secundario (verde naturaleza)
 */
const secondaryColors: Colors = {
  background: '#F0FDF4',
  surface: '#FFFFFF',
  border: '#BBF7D0',
  text: '#14532D',
  textSecondary: '#16A34A',
  primary: '#16A34A',
  success: '#15803D',
  warning: '#CA8A04',
  error: '#B91C1C',
  info: '#0891B2',
  onPrimary: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onError: '#FFFFFF',
  onInfo: '#FFFFFF',
};

/**
 * Colores para el tema premium (púrpura elegante)
 */
const premiumColors: Colors = {
  background: '#FAF5FF',
  surface: '#FFFFFF',
  border: '#E9D5FF',
  text: '#581C87',
  textSecondary: '#9333EA',
  primary: '#7C3AED',
  success: '#15803D',
  warning: '#B45309',
  error: '#BE123C',
  info: '#7C3AED',
  onPrimary: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onError: '#FFFFFF',
  onInfo: '#FFFFFF',
};

/**
 * Objeto con todos los temas disponibles
 */
export const colors: Record<ThemeMode, Colors> = {
  light: lightColors,
  dark: darkColors,
  primary: primaryColors,
  secondary: secondaryColors,
  premium: premiumColors,
} as const;

export type ColorVariant = keyof typeof lightColors;

export function getThemeColors(mode: ThemeMode) {
  return colors[mode];
}
