/* eslint-disable no-undef */
import '@testing-library/jest-native/extend-expect';

// Mock de react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    Gesture: {},
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
  };
});

// Mock de MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    contains: jest.fn(),
  })),
  createMMKV: jest.fn(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    contains: jest.fn(),
  })),
}));

// Mock de @react-native-firebase
jest.mock('@react-native-firebase/app', () => ({
  firebase: {
    app: jest.fn(),
  },
}));

jest.mock('@react-native-firebase/auth', () => ({
  firebase: {
    auth: jest.fn(() => ({
      signInWithEmailAndPassword: jest.fn(),
      createUserWithEmailAndPassword: jest.fn(),
      signOut: jest.fn(),
      currentUser: null,
    })),
  },
}));

jest.mock('@react-native-firebase/firestore', () => ({
  firebase: {
    firestore: jest.fn(() => ({
      collection: jest.fn(),
    })),
  },
}));

// Mock de @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setParams: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock de jail-monkey
jest.mock('jail-monkey', () => ({
  default: {
    isJailBroken: () => false,
    canMockLocation: () => false,
    trustFall: () => false,
  },
}));

// Mock de react-native-keychain
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() =>
    Promise.resolve({ username: 'encryption-key', password: 'test-key-1234' }),
  ),
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  },
}));

// Mock de react-native-config
jest.mock('react-native-config', () => ({
  API_URL: 'https://api.example.com',
  SERVICE_PROVIDER: 'mock',
  ROOT_USERNAME: 'pruebas@gmail.com',
  ROOT_PASSWORD: 'pruebas123',
  RAWG_API_KEY: '',
  CURRENCY: 'COP',
  LOCALE: 'es-CO',
}));

// Mock de react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Svg: (props: any) => React.createElement(View, props),
    Path: (props: any) => React.createElement(View, props),
    Circle: (props: any) => React.createElement(View, props),
    Rect: (props: any) => React.createElement(View, props),
    G: (props: any) => React.createElement(View, props),
    Polyline: (props: any) => React.createElement(View, props),
    Polygon: (props: any) => React.createElement(View, props),
    Line: (props: any) => React.createElement(View, props),
    Defs: (props: any) => React.createElement(View, props),
    LinearGradient: (props: any) => React.createElement(View, props),
    Stop: (props: any) => React.createElement(View, props),
  };
});

// Mock de @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  default: {
    fetch: jest.fn(() =>
      Promise.resolve({
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        isWifiEnabled: true,
        isConnectionExpensive: false,
        details: {},
      }),
    ),
    addEventListener: jest.fn(() => jest.fn()),
  },
  NetInfoStateType: {
    unknown: 'unknown',
    none: 'none',
    cellular: 'cellular',
    wifi: 'wifi',
    bluetooth: 'bluetooth',
    ethernet: 'ethernet',
    wimax: 'wimax',
    vpn: 'vpn',
    other: 'other',
  },
}));

// Mock de react-native-permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn(() => Promise.resolve('granted')),
  request: jest.fn(() => Promise.resolve('granted')),
  checkMultiple: jest.fn(() =>
    Promise.resolve({
      'android.permission.CAMERA': 'granted',
    }),
  ),
  requestMultiple: jest.fn(() =>
    Promise.resolve({
      'android.permission.CAMERA': 'granted',
    }),
  ),
  openSettings: jest.fn(() => Promise.resolve()),
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    LIMITED: 'limited',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
  },
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      MICROPHONE: 'ios.permission.MICROPHONE',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
      PHOTO_LIBRARY_ADD_ONLY: 'ios.permission.PHOTO_LIBRARY_ADD_ONLY',
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
      LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS',
      NOTIFICATIONS: 'ios.permission.NOTIFICATIONS',
      CONTACTS: 'ios.permission.CONTACTS',
      CALENDARS: 'ios.permission.CALENDARS',
      BLUETOOTH: 'ios.permission.BLUETOOTH',
      MOTION: 'ios.permission.MOTION',
      APP_TRACKING_TRANSPARENCY: 'ios.permission.APP_TRACKING_TRANSPARENCY',
      FACE_ID: 'ios.permission.FACE_ID',
      SIRI: 'ios.permission.SIRI',
      SPEECH_RECOGNITION: 'ios.permission.SPEECH_RECOGNITION',
      MEDIA_LIBRARY: 'ios.permission.MEDIA_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
      READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
      READ_MEDIA_VIDEO: 'android.permission.READ_MEDIA_VIDEO',
      READ_MEDIA_VISUAL_USER_SELECTED: 'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
      POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
      READ_CONTACTS: 'android.permission.READ_CONTACTS',
      READ_CALENDAR: 'android.permission.READ_CALENDAR',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
      ACTIVITY_RECOGNITION: 'android.permission.ACTIVITY_RECOGNITION',
      BODY_SENSORS: 'android.permission.BODY_SENSORS',
    },
  },
}));

// Mock de react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(() =>
    Promise.resolve({
      didCancel: false,
      assets: [{ uri: 'mock-camera-uri', type: 'image/jpeg' }],
    }),
  ),
  launchImageLibrary: jest.fn(() =>
    Promise.resolve({
      didCancel: false,
      assets: [{ uri: 'mock-library-uri', type: 'image/jpeg' }],
    }),
  ),
}));

// Silenciar warnings específicos
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: useLayoutEffect') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Animated: `useNativeDriver`')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Cleanup automático después de cada test
afterEach(() => {
  // Limpiar todos los mocks
  jest.clearAllMocks();

  // Limpiar timers pendientes
  jest.clearAllTimers();
});
