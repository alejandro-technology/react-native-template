module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '__tests__/App.test.tsx', // App.test.tsx tiene dependencias complejas, usar tests de componentes individuales
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-native-firebase|react-native-mmkv|jail-monkey|@react-native-community|react-native-config|react-native-keychain)/)',
  ],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.styles.ts',
    '!src/**/*.types.ts',
    '!src/**/*.scheme.ts',
    '!src/**/*.adapter.ts',
    '!src/**/*.routes.ts',
    '!src/**/index.ts',
    '!src/utils/test-utils.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 25,
      statements: 25,
    },
    // Thresholds específicos para componentes core
    './src/components/core/Button.tsx': {
      branches: 70,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/components/core/TextInput.tsx': {
      branches: 90,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/components/core/Text.tsx': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    // Thresholds para componentes layout
    './src/components/layout/ErrorBoundary.tsx': {
      branches: 50,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/layout/DeleteConfirmationSheet.tsx': {
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/components/layout/Header.tsx': {
      functions: 100,
      lines: 100,
      statements: 100,
    },
    // Threshold para Zustand store
    './src/modules/core/application/app.storage.ts': {
      branches: 80,
      functions: 65,
      lines: 80,
      statements: 80,
    },
  },
};
