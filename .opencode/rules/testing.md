# Testing Rules

Testing uses Jest + `@testing-library/react-native`. Custom test utilities live in `src/utils/test-utils.tsx`.

## Core Mandates

1. **Custom Render**: Always use `import { render } from '@utils/test-utils'` — wraps components with QueryClient, ThemeProvider, and SafeAreaProvider.
2. **Provider Tests Exception**: Provider tests use `@testing-library/react-native` directly (not test-utils) to avoid circular wrapping.
3. **Test Location**: Tests live in `__tests__/` mirroring `src/` structure.
4. **Mocks Before Imports**: Place `jest.mock()` calls BEFORE importing the module under test.
5. **No Real Services**: Mock all infrastructure (HTTP, Firebase, MMKV, navigation).
6. **Spanish Test Descriptions**: Use Spanish for `it()` descriptions: `it('debe renderizar correctamente')`.

## File Structure

```
__tests__/
  components/
    core/Button.test.tsx
    form/TextInput.test.tsx
    layout/Header.test.tsx
  providers/AppProvider.test.tsx
  modules/{module}/application/{entity}.queries.test.ts
  theme/colors.test.ts
```

## Golden Example: Component Test

```typescript
import React from 'react';
import { render, fireEvent } from '@utils/test-utils';
import { Button } from '@components/core/Button';

describe('Button', () => {
  it('debe renderizar correctamente con texto', () => {
    const { getByText } = render(<Button>Hola Mundo</Button>);
    expect(getByText('Hola Mundo')).toBeTruthy();
  });

  it('debe ejecutar onPress al hacer click', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock}>Presionar</Button>,
    );
    fireEvent.press(getByText('Presionar'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

## Golden Example: Provider Test (no test-utils)

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('@modules/some-module', () => ({
  useSomeHook: () => ({ data: 'mocked' }),
}));

import SomeProvider from '../../src/providers/SomeProvider';

describe('SomeProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <SomeProvider>
        <Text>Child</Text>
      </SomeProvider>,
    );
    expect(getByText('Child')).toBeTruthy();
  });
});
```
