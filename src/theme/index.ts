/**
 * Sistema de temas para React Native
 *
 * Proporciona un sistema completo de diseño con:
 * - Múltiples temas (light, dark, primary, secondary, premium)
 * - Tokens de espaciado, tipografía, bordes y sombras
 * - Utilidades responsive con breakpoints
 * - Validación y helpers de tema
 *
 */

// ==========================================
// Imports de constantes
// ==========================================
import { borderRadius } from './borders';
import { getThemeColors } from './colors';
import { commonStyles } from './common';
import { getShadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

// ==========================================
// Imports de tipos
// ==========================================
import type { BorderRadius } from './borders';
import type { ThemeMode, Colors } from './colors';
import type { ShadowDefinition, ShadowLevel } from './shadows';
import type { Spacing } from './spacing';
import type { Typography } from './typography';

// ==========================================
// Imports de Hook
// ==========================================
export { useTheme } from './providers/useTheme';

// ==========================================
// Interfaz principal del tema
// ==========================================

/**
 * Estructura completa de un tema
 */
export interface Theme {
  /** Colores del tema */
  colors: Colors;
  /** Tipografía del tema */
  typography: Typography;
  /** Espaciado del tema */
  spacing: Spacing;
  /** Radios de borde del tema */
  borderRadius: BorderRadius;
  /** Función para obtener sombras según modo oscuro */
  shadows: Record<ShadowLevel, ShadowDefinition>;
  /** Estilos comunes reutilizables */
  commonStyles: typeof commonStyles;
  /** Indica si es modo oscuro */
  isDark: boolean;
  /** Modo del tema */
  mode: ThemeMode;
  /** Función para alternar entre modos oscuro y claro */
  toggleTheme: (mode: ThemeMode) => void;
}

// ==========================================
// Factory de temas
// ==========================================

/**
 * Crea un tema completo basado en un modo
 * @param mode - Modo de tema a crear
 * @returns Tema completo configurado
 * @example
 * const customTheme = createTheme('primary');
 * console.log(customTheme.colors.primary); // '#2563EB'
 */
function createTheme(mode: ThemeMode): Theme {
  const isDark = mode === 'dark';
  const colors = getThemeColors(mode);
  const shadows = getShadows(isDark);

  return {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    commonStyles,
    isDark,
    mode,
    toggleTheme: () => {},
  };
}

// ==========================================
// Funciones de utilidad
// ==========================================

/**
 * Obtiene un tema por su modo
 * @param mode - Modo de tema deseado
 * @returns Tema correspondiente
 * @throws Error si el modo no es válido
 * @example
 * const theme = getTheme('dark');
 * // o
 * const theme = getTheme('primary');
 */
export function getTheme(mode: ThemeMode): Theme {
  return createTheme(mode);
}

// ==========================================
// Export default
// ==========================================
export * from './animations';
export * from './borders';
export * from './colors';
export * from './common';
export * from './hooks';
export * from './responsive';
export * from './shadows';
export * from './spacing';
export * from './typography';
