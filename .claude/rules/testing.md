---
alwaysApply: false
description: Use this rule when writing or modifying tests with Jest or @testing-library/react-native. Edit to adapt it to your project.
---

# Testing Rules

- Keep tests under **__tests__/** at the root and respect the module structure of src/.
- Use test helpers from jest/test-utils.tsx for rendering instead of @testing-library/react-native. Example: import { render, screen, fireEvent, waitFor } from '@test-utils';
- Mock infrastructure services when necessary at the beginning of the file: jest.mock('@modules/.../infrastructure/service');
- Clear mocks before each test: beforeEach(() => jest.clearAllMocks());
- Keep tests deterministic and isolated.
- Exclude from testing: index.ts files, *.model.ts and *.repository.ts (they only contain interfaces).

## Testing Utils

- Test utils in: jest/test-utils.tsx
- Test folder: **__tests__/**
- Service mocks: jest.mock('@modules/.../infrastructure/service')
- Required providers in tests: QueryClientProvider, ThemeProvider, SafeAreaProvider, NavigationContainer
