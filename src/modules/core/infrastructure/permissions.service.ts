import {
  check,
  checkNotifications,
  request,
  requestNotifications,
  checkMultiple,
  requestMultiple,
  openSettings,
  RESULTS,
  PERMISSIONS,
} from 'react-native-permissions';
import type {
  Permission,
  PermissionStatus as RNPermissionStatus,
} from 'react-native-permissions';
import { Platform } from 'react-native';
import type {
  PermissionType,
  PermissionStatus,
  PermissionResult,
  PermissionsRepository,
} from '../domain/permissions/permissions.model';

const POST_NOTIFICATIONS =
  'android.permission.POST_NOTIFICATIONS' as Permission;

// Map our permission types to react-native-permissions Permission type
function getPermission(type: PermissionType): Permission | null {
  if (type === 'notifications') {
    return null;
  }

  if (Platform.OS === 'ios') {
    const iosMap: Record<PermissionType, Permission | null> = {
      location: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      locationWhenInUse: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      locationAlways: PERMISSIONS.IOS.LOCATION_ALWAYS,
      camera: PERMISSIONS.IOS.CAMERA,
      microphone: PERMISSIONS.IOS.MICROPHONE,
      photoLibrary: PERMISSIONS.IOS.PHOTO_LIBRARY,
      photoLibraryAdd: PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
      contacts: PERMISSIONS.IOS.CONTACTS,
      calendar: PERMISSIONS.IOS.CALENDARS,
      reminders: PERMISSIONS.IOS.REMINDERS,
      bluetooth: PERMISSIONS.IOS.BLUETOOTH,
      motion: PERMISSIONS.IOS.MOTION,
      siri: PERMISSIONS.IOS.SIRI,
      speechRecognition: PERMISSIONS.IOS.SPEECH_RECOGNITION,
      mediaLibrary: PERMISSIONS.IOS.MEDIA_LIBRARY,
      appTracking: PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY,
      faceID: PERMISSIONS.IOS.FACE_ID,
      health: null,
      notifications: null,
    };
    return iosMap[type] ?? null;
  }

  // Android permissions
  // For Android 13+ (API 33+), READ_EXTERNAL_STORAGE is deprecated
  // Use READ_MEDIA_IMAGES for photo library access
  const androidMap: Record<PermissionType, Permission | null> = {
    location: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    locationWhenInUse: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    locationAlways: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    camera: PERMISSIONS.ANDROID.CAMERA,
    microphone: PERMISSIONS.ANDROID.RECORD_AUDIO,
    // Use READ_MEDIA_IMAGES for Android 13+, fallback to READ_EXTERNAL_STORAGE
    photoLibrary: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    photoLibraryAdd: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    contacts: PERMISSIONS.ANDROID.READ_CONTACTS,
    calendar: PERMISSIONS.ANDROID.READ_CALENDAR,
    reminders: PERMISSIONS.ANDROID.READ_CALENDAR,
    bluetooth: PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    motion: PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION,
    siri: null,
    speechRecognition: null,
    mediaLibrary: null,
    appTracking: null,
    faceID: null,
    health: PERMISSIONS.ANDROID.BODY_SENSORS,
    notifications: POST_NOTIFICATIONS,
  };
  return androidMap[type] ?? null;
}

function mapStatus(status: RNPermissionStatus): PermissionStatus {
  const map: Record<RNPermissionStatus, PermissionStatus> = {
    [RESULTS.UNAVAILABLE]: 'unavailable',
    [RESULTS.DENIED]: 'denied',
    [RESULTS.LIMITED]: 'limited',
    [RESULTS.GRANTED]: 'granted',
    [RESULTS.BLOCKED]: 'blocked',
  };
  return map[status] ?? 'unavailable';
}

function buildResult(
  type: PermissionType,
  status: PermissionStatus,
  canAskAgain: boolean,
): PermissionResult {
  return {
    type,
    status,
    canAskAgain,
  };
}

class PermissionsService implements PermissionsRepository {
  async check(type: PermissionType): Promise<PermissionStatus | Error> {
    try {
      if (type === 'notifications') {
        const response = await checkNotifications();
        return response.status;
      }

      const permission = getPermission(type);
      if (!permission) {
        return 'unavailable';
      }
      const status = await check(permission);
      return mapStatus(status);
    } catch (error) {
      return new Error(
        error instanceof Error ? error.message : 'Error al verificar permiso',
      );
    }
  }

  async request(type: PermissionType): Promise<PermissionResult | Error> {
    try {
      if (type === 'notifications') {
        const response = await requestNotifications();
        return buildResult(
          type,
          mapStatus(response.status),
          response.status !== RESULTS.BLOCKED,
        );
      }

      const permission = getPermission(type);
      if (!permission) {
        return {
          type,
          status: 'unavailable',
          canAskAgain: false,
        };
      }
      const status = await request(permission);
      return buildResult(type, mapStatus(status), status !== RESULTS.BLOCKED);
    } catch (error) {
      return new Error(
        error instanceof Error ? error.message : 'Error al solicitar permiso',
      );
    }
  }

  async checkAndRequest(
    type: PermissionType,
  ): Promise<PermissionResult | Error> {
    try {
      if (type === 'notifications') {
        const currentStatus = await checkNotifications();

        if (currentStatus.status === RESULTS.GRANTED) {
          return buildResult(type, 'granted', false);
        }

        if (currentStatus.status === RESULTS.BLOCKED) {
          return buildResult(type, 'blocked', false);
        }

        const newStatus = await requestNotifications();
        return buildResult(
          type,
          mapStatus(newStatus.status),
          newStatus.status !== RESULTS.BLOCKED,
        );
      }

      const permission = getPermission(type);
      if (!permission) {
        return {
          type,
          status: 'unavailable',
          canAskAgain: false,
        };
      }
      const currentStatus = await check(permission);

      if (currentStatus === RESULTS.GRANTED) {
        return buildResult(type, 'granted', false);
      }

      if (currentStatus === RESULTS.BLOCKED) {
        return buildResult(type, 'blocked', false);
      }

      const newStatus = await request(permission);
      return buildResult(
        type,
        mapStatus(newStatus),
        newStatus !== RESULTS.BLOCKED,
      );
    } catch (error) {
      return new Error(
        error instanceof Error
          ? error.message
          : 'Error al verificar y solicitar permiso',
      );
    }
  }

  async openSettings(): Promise<void | Error> {
    try {
      await openSettings();
    } catch (error) {
      return new Error(
        error instanceof Error ? error.message : 'Error al abrir configuración',
      );
    }
  }

  async checkMultiple(
    types: PermissionType[],
  ): Promise<PermissionResult[] | Error> {
    try {
      const notificationTypes = types.filter(type => type === 'notifications');
      const regularTypes = types.filter(type => type !== 'notifications');

      const notificationResults = await Promise.all(
        notificationTypes.map(async type => {
          const response = await checkNotifications();
          return buildResult(
            type,
            mapStatus(response.status),
            response.status !== RESULTS.BLOCKED,
          );
        }),
      );

      const permissions = regularTypes
        .map(type => getPermission(type))
        .filter((p): p is Permission => p !== null);

      const results =
        permissions.length > 0 ? await checkMultiple(permissions) : null;

      const hasSupportedType =
        notificationResults.length > 0 || permissions.length > 0;

      if (!results && notificationResults.length === 0) {
        return types.map(type => buildResult(type, 'unavailable', false));
      }

      return types.map(type => {
        const notificationResult = notificationResults.find(
          result => result.type === type,
        );

        if (notificationResult) {
          return notificationResult;
        }

        const permission = getPermission(type);
        const status = permission
          ? results?.[permission] ?? RESULTS.UNAVAILABLE
          : RESULTS.UNAVAILABLE;
        return buildResult(
          type,
          mapStatus(status),
          permission ? status !== RESULTS.BLOCKED : hasSupportedType,
        );
      });
    } catch (error) {
      return new Error(
        error instanceof Error ? error.message : 'Error al verificar permisos',
      );
    }
  }

  async requestMultiple(
    types: PermissionType[],
  ): Promise<PermissionResult[] | Error> {
    try {
      const notificationTypes = types.filter(type => type === 'notifications');
      const regularTypes = types.filter(type => type !== 'notifications');

      const notificationResults = await Promise.all(
        notificationTypes.map(async type => {
          const response = await requestNotifications();
          return buildResult(
            type,
            mapStatus(response.status),
            response.status !== RESULTS.BLOCKED,
          );
        }),
      );

      const permissions = regularTypes
        .map(type => getPermission(type))
        .filter((p): p is Permission => p !== null);

      const results =
        permissions.length > 0 ? await requestMultiple(permissions) : null;

      const hasSupportedType =
        notificationResults.length > 0 || permissions.length > 0;

      if (!results && notificationResults.length === 0) {
        return types.map(type => buildResult(type, 'unavailable', false));
      }

      return types.map(type => {
        const notificationResult = notificationResults.find(
          result => result.type === type,
        );

        if (notificationResult) {
          return notificationResult;
        }

        const permission = getPermission(type);
        const status = permission
          ? results?.[permission] ?? RESULTS.UNAVAILABLE
          : RESULTS.UNAVAILABLE;
        return buildResult(
          type,
          mapStatus(status),
          permission ? status !== RESULTS.BLOCKED : hasSupportedType,
        );
      });
    } catch (error) {
      return new Error(
        error instanceof Error ? error.message : 'Error al solicitar permisos',
      );
    }
  }
}

function createPermissionsService(): PermissionsRepository {
  return new PermissionsService();
}

export default createPermissionsService();
