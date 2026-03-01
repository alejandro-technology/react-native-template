/**
 * Utilidades específicas del dominio de usuarios
 * Para utilidades de fecha reutilizables, ver @modules/core/domain/date.utils
 */

/**
 * Mapea el rol del usuario a la variante de badge correspondiente
 */
export function getRoleVariant(
  role: string,
): 'admin' | 'editor' | 'viewer' | 'default' {
  const roleMap: Record<string, 'admin' | 'editor' | 'viewer'> = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
  };
  return roleMap[role.toUpperCase()] || 'default';
}
