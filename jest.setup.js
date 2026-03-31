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
