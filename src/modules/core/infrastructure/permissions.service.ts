import {
  check,
  request,
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

// Map our permission types to react-native-permissions Permission type
function getPermission(type: PermissionType): Permission | null {
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

class PermissionsService implements PermissionsRepository {
  async check(type: PermissionType): Promise<PermissionStatus | Error> {
    try {
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
      const permission = getPermission(type);
      if (!permission) {
        return {
          type,
          status: 'unavailable',
          canAskAgain: false,
        };
      }
      const status = await request(permission);
      return {
        type,
        status: mapStatus(status),
        canAskAgain: status !== RESULTS.BLOCKED,
      };
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
        return {
          type,
          status: 'granted',
          canAskAgain: false,
        };
      }

      if (currentStatus === RESULTS.BLOCKED) {
        return {
          type,
          status: 'blocked',
          canAskAgain: false,
        };
      }

      const newStatus = await request(permission);
      return {
        type,
        status: mapStatus(newStatus),
        canAskAgain: newStatus !== RESULTS.BLOCKED,
      };
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
      const permissions = types
        .map(type => getPermission(type))
        .filter((p): p is Permission => p !== null);

      if (permissions.length === 0) {
        return types.map(type => ({
          type,
          status: 'unavailable' as PermissionStatus,
          canAskAgain: false,
        }));
      }

      const results = await checkMultiple(permissions);

      return types.map(type => {
        const permission = getPermission(type);
        const status = permission ? results[permission] : RESULTS.UNAVAILABLE;
        return {
          type,
          status: mapStatus(status),
          canAskAgain: status !== RESULTS.BLOCKED,
        };
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
      const permissions = types
        .map(type => getPermission(type))
        .filter((p): p is Permission => p !== null);

      if (permissions.length === 0) {
        return types.map(type => ({
          type,
          status: 'unavailable' as PermissionStatus,
          canAskAgain: false,
        }));
      }

      const results = await requestMultiple(permissions);

      return types.map(type => {
        const permission = getPermission(type);
        const status = permission ? results[permission] : RESULTS.UNAVAILABLE;
        return {
          type,
          status: mapStatus(status),
          canAskAgain: status !== RESULTS.BLOCKED,
        };
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
