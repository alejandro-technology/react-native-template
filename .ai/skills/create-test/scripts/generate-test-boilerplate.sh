#!/usr/bin/env bash
# generate-test-boilerplate.sh
# Prints the test boilerplate for a given source file type.
# Usage: ./generate-test-boilerplate.sh <type> <ComponentName>
# Types: component | provider | query-hook | mutation-hook | service | store
# Example: ./generate-test-boilerplate.sh component Button

set -euo pipefail

TYPE="${1:-}"
NAME="${2:-MyComponent}"

if [[ -z "$TYPE" ]]; then
  echo "Usage: $0 <type> <Name>"
  echo "Types: component | provider | query-hook | mutation-hook | service | store"
  exit 1
fi

case "$TYPE" in
  component)
    cat <<EOF
import React from 'react';
import { screen } from '@testing-library/react-native';
// Custom render with providers
import { render } from '@utils/test-utils';
// Component under test
import { ${NAME} } from '@components/core';

describe('${NAME}', () => {
  it('debe renderizar correctamente', () => {
    render(<${NAME} />);
    // TODO: add assertions
  });
});
EOF
    ;;
  provider)
    cat <<EOF
import React from 'react';
import { render, screen } from '@testing-library/react-native';
// NOTE: providers use @testing-library directly — NOT test-utils (circular wrapping)
import { Text } from 'react-native';
import ${NAME} from '@/providers/${NAME}';

describe('${NAME}', () => {
  it('debe renderizar sus hijos correctamente', () => {
    render(
      <${NAME}>
        <Text testID="child">hijo</Text>
      </${NAME}>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });
});
EOF
    ;;
  query-hook)
    cat <<EOF
import { renderHook, waitFor } from '@testing-library/react-native';
import { createWrapper } from '@utils/test-utils';

// Mock the service before importing the hook
jest.mock('@modules/{module}/infrastructure/{entity}.service', () => ({
  {entity}Service: {
    getAll: jest.fn(),
  },
}));

import { use${NAME}s } from '@modules/{module}/application/{module}.queries';
import { {entity}Service } from '@modules/{module}/infrastructure/{entity}.service';

const mockService = {entity}Service as jest.Mocked<typeof {entity}Service>;

describe('use${NAME}s', () => {
  it('debe retornar los datos correctamente', async () => {
    mockService.getAll.mockResolvedValue([]);
    const { result } = renderHook(() => use${NAME}s(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
EOF
    ;;
  store)
    cat <<EOF
import { act } from '@testing-library/react-native';
// Import the store directly — no React wrapper needed
import { use${NAME}Store } from '@modules/{module}/application/{entity}.storage';

describe('${NAME}Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    use${NAME}Store.setState({ items: [], isLoading: false });
  });

  it('debe tener estado inicial correcto', () => {
    const state = use${NAME}Store.getState();
    expect(state.items).toEqual([]);
  });
});
EOF
    ;;
  *)
    echo "Unknown type: $TYPE"
    echo "Valid types: component | provider | query-hook | mutation-hook | service | store"
    exit 1
    ;;
esac
