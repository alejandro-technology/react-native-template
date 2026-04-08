export type PermissionStatus =
  | 'unavailable'
  | 'denied'
  | 'limited'
  | 'granted'
  | 'blocked';

export type PermissionType =
  | 'location'
  | 'locationWhenInUse'
  | 'locationAlways'
  | 'camera'
  | 'microphone'
  | 'photoLibrary'
  | 'photoLibraryAdd'
  | 'contacts'
  | 'calendar'
  | 'reminders'
  | 'bluetooth'
  | 'motion'
  | 'siri'
  | 'speechRecognition'
  | 'mediaLibrary'
  | 'appTracking'
  | 'faceID'
  | 'health'
  | 'notifications';

export interface PermissionResult {
  type: PermissionType;
  status: PermissionStatus;
  canAskAgain: boolean;
}

export interface PermissionsRepository {
  check(type: PermissionType): Promise<PermissionStatus | Error>;
  request(type: PermissionType): Promise<PermissionResult | Error>;
  checkAndRequest(type: PermissionType): Promise<PermissionResult | Error>;
  openSettings(): Promise<void | Error>;
  checkMultiple(types: PermissionType[]): Promise<PermissionResult[] | Error>;
  requestMultiple(types: PermissionType[]): Promise<PermissionResult[] | Error>;
}
