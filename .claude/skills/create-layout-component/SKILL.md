---
name: create-layout-component
description: Create a layout component for screen structure or state display. Use when creating loading states, empty states, error states, headers, toolbars, or screen wrappers.
license: MIT
compatibility: opencode
metadata:
  layer: ui
  workflow: scaffold
  output: src/components/layout/{Component}.tsx
---

# Create Layout Component

Create a layout component named `$ARGUMENTS`.

## File to Create

```
src/components/layout/{Component}.tsx
src/components/layout/index.ts  # MODIFY: Add export
```

## Component Categories

### State Components

Display application states (loading, error, empty).

#### LoadingState

```typescript
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
// Components
import { Text } from '@components/core';
// Theme
import { useTheme } from '@theme/index';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text variant="body" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  message: {
    textAlign: 'center',
  },
});
```

#### ErrorState

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Button } from '@components/core';
// Theme
import { useTheme } from '@theme/index';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Ha ocurrido un error',
  onRetry,
}: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="h3" style={[styles.title, { color: theme.colors.error }]}>
        Error
      </Text>
      <Text variant="body" style={styles.message}>
        {message}
      </Text>
      {onRetry && (
        <Button variant="outlined" onPress={onRetry}>
          Reintentar
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
```

#### EmptyState

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Button, Icon } from '@components/core';
// Theme
import { useTheme } from '@theme/index';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'Sin resultados',
  message = 'No hay elementos para mostrar',
  icon = 'inbox',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={theme.colors.muted} />
      <Text variant="h3" style={styles.title}>
        {title}
      </Text>
      <Text
        variant="body"
        style={[styles.message, { color: theme.colors.muted }]}
      >
        {message}
      </Text>
      {onAction && actionLabel && (
        <Button variant="primary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
```

### Screen Components

#### RootLayout

```typescript
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Components
import { Toolbar } from './Toolbar';
// Theme
import { useTheme } from '@theme/index';

interface RootLayoutProps {
  children: React.ReactNode;
  scroll?: boolean;
  toolbar?: boolean;
}

export function RootLayout({
  children,
  scroll = true,
  toolbar = true,
}: RootLayoutProps) {
  const theme = useTheme();

  const content = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.container}>{children}</View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      {toolbar && <Toolbar />}
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
});
```

#### Header

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Button, TextInput } from '@components/core';
// Theme
import { useTheme } from '@theme/index';

interface HeaderProps {
  title: string;
  onPress?: () => void;
  searchText?: string;
  setSearchText?: (text: string) => void;
}

export function Header({
  title,
  onPress,
  searchText,
  setSearchText,
}: HeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderColor: theme.colors.border }]}>
      <View style={styles.row}>
        <Text variant="h1">{title}</Text>
        {onPress && (
          <Button variant="primary" size="sm" onPress={onPress}>
            Agregar
          </Button>
        )}
      </View>
      {setSearchText && (
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar..."
          style={styles.search}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  search: {
    marginTop: 8,
  },
});
```

### Utility Components

#### ItemSeparatorComponent

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';

export function ItemSeparatorComponent() {
  const theme = useTheme();

  return (
    <View
      style={[styles.separator, { backgroundColor: theme.colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
  },
});
```

#### DeleteConfirmationSheet

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
// Components
import { Text, Button, Modal } from '@components/core';

interface DeleteConfirmationSheetProps {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteConfirmationSheet({
  visible,
  title = '¿Eliminar elemento?',
  message = 'Esta acción no se puede deshacer.',
  onConfirm,
  onCancel,
  loading = false,
}: DeleteConfirmationSheetProps) {
  return (
    <Modal visible={visible} onClose={onCancel}>
      <View style={styles.container}>
        <Text variant="h3">{title}</Text>
        <Text variant="body">{message}</Text>
        <View style={styles.actions}>
          <Button variant="outlined" onPress={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onPress={onConfirm} loading={loading}>
            Eliminar
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});
```

## Step 2: Export Component

Add to `src/components/layout/index.ts`:

```typescript
export * from './{Component}';
```

## Rules

1. **Use `useTheme()`** for theme access
2. **Use theme tokens**: `spacing`, `colors`, `borderRadius`
3. **Import core components** from `@components/core`
4. **Default messages in Spanish**
5. **Include `accessibilityRole`** on interactive elements
6. **Co-located `StyleSheet.create`** for styles

## Checklist

- [ ] Component uses theme tokens
- [ ] Default props provided with Spanish messages
- [ ] StyleSheet defined at bottom of file
- [ ] Exported from `@components/layout/index.ts`

## Reference

- Example: `src/components/layout/LoadingState.tsx`
- Example: `src/components/layout/EmptyState.tsx`
- Example: `src/components/layout/RootLayout.tsx`
