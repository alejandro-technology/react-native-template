// App Storage (Zustand)
export { useAppStorage } from './application/app.storage';
export type {
  ModalOpenParams,
  ToastType,
  ToastPosition,
  ToastShowParams,
} from './domain/app.model';

// Date utilities
export {
  formatDate,
  formatDateParts,
  formatDateTime,
  formatJoinDate,
  formatRelativeDate,
  getDateRangeLabel,
} from './domain/utils/date.utils';
export type { DateFormatOptions } from './domain/utils/date.utils';

// Text utilities
export {
  capitalize,
  capitalizeWords,
  initialsFromText,
  normalizeText,
  removeAccents,
  toSlug,
  truncateText,
} from './domain/utils/format.utils';

// Currency utilities
export {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
} from './domain/utils/currency.utils';
export type { CurrencyFormatOptions } from './domain/utils/currency.utils';

// Permissions
export type {
  PermissionType,
  PermissionStatus,
  PermissionResult,
} from './domain/permissions/permissions.model';
export type { PermissionsRepository } from './domain/permissions/permissions.repository';
export {
  usePermission,
  usePermissions,
} from './application/permissions/use-permissions';
