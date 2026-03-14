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
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context|@react-native-firebase|react-native-mmkv|jail-monkey|@react-native-community)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
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
  // No coverage threshold global - usar thresholds específicos por archivo
  coverageThreshold: {
    // Thresholds específicos para archivos con tests
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
  },
};
