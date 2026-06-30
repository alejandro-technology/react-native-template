# Layout Components — Full Reference

> Load this file when you need props or usage for screen structure and state display components.

## LAYOUT COMPONENTS

---

### RootLayout

Screen wrapper that provides a consistent layout with optional toolbar, scroll, and padding.

```typescript
import { RootLayout } from '@components/layout';

// Standard scrollable screen
<RootLayout>
  <Text>Contenido con scroll</Text>
</RootLayout>

// Non-scrollable (lists, maps)
<RootLayout scroll={false}>
  <FlashList data={items} renderItem={renderItem} estimatedItemSize={64} />
</RootLayout>

// With padding
<RootLayout padding="md">
  <Text>Con padding horizontal y vertical</Text>
</RootLayout>

// With title in toolbar
<RootLayout title="Mi Pantalla">
  <Text>Contenido</Text>
</RootLayout>

// Without toolbar (e.g. full-screen content)
<RootLayout toolbar={false}>
  <Text>Sin barra de herramientas</Text>
</RootLayout>

// With custom toolbar actions
<RootLayout
  title="Perfil"
  rightOptions={[{ icon: 'bell', onPress: () => navigate(NotifRoute) }]}
  leftOptions={[{ icon: 'arrow-left', onPress: goBack }]}
>
  <Text>Con botones en toolbar</Text>
</RootLayout>
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `scroll` | `boolean` | `true` | Wraps children in `ScrollView` |
| `padding` | `SpacingToken` | — | Uniform padding |
| `toolbar` | `boolean` | `true` | Shows/hides the `Toolbar` |
| `title` | `string` | — | Toolbar title |
| `rightOptions` | `ToolbarOptions[]` | bell icon | Right toolbar buttons |
| `leftOptions` | `ToolbarOptions[]` | back arrow | Left toolbar buttons |

---

### Header

List screen header with title, action icon, and integrated app searchbar state.

```typescript
import { Header } from '@components/layout';

<Header
  title="Productos"
  onPress={() => navigate(ProductsRoutes.ProductForm)}
  pressIcon="plus"
  searchbar="products"
/>;
```

**Props:**
| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Screen title (`h1` variant) |
| `onPress` | `() => void` | Header action handler |
| `pressIcon` | `IconName` | Optional action icon (`'menu'` by default) |
| `searchbar` | `SearchbarStorage` | Search storage key (`'products'`, `'users'`, etc.) |
| `onPressFilter` | `() => void` | Optional filter action handler |

---

### Toolbar

Navigation bar with optional title and left/right icon buttons.

```typescript
import { Toolbar } from '@components/layout';
import type { ToolbarOptions } from '@components/layout';

// Minimal
<Toolbar />

// With title
<Toolbar title="Detalle de Producto" />

// With navigation buttons
<Toolbar
  title="Editar"
  leftOptions={[{ icon: 'arrow-left', onPress: goBack }]}
  rightOptions={[
    { icon: 'bell', onPress: openNotifications },
    { icon: 'user', onPress: openProfile },
  ]}
/>
```

**Props:**
| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Centered title |
| `rightOptions` | `ToolbarOptions[]` | Right icon buttons |
| `leftOptions` | `ToolbarOptions[]` | Left icon buttons |

`ToolbarOptions`: `{ icon: IconName, onPress?: () => void }`

---

### LoadingState

Full-screen loading indicator with animated spinner and optional message.

```typescript
import { LoadingState } from '@components/layout';

// Default message: "Cargando..."
<LoadingState />

// Custom message
<LoadingState message="Cargando productos..." />
<LoadingState message="Iniciando sesión..." />

// Typical usage in screens:
if (isLoading) return <LoadingState message="Cargando..." />;
```

**Props:**
| Prop | Type | Default |
|---|---|---|
| `message` | `string` | `'Cargando...'` |

---

### ErrorState

Full-screen error display with animated shake entrance, title, message, and optional retry button.

```typescript
import { ErrorState } from '@components/layout';

// With retry
<ErrorState
  title="Error al cargar"
  message={error.message}
  onRetry={refetch}
/>

// Custom retry label
<ErrorState
  title="Sin conexión"
  message="No se pudo conectar al servidor"
  onRetry={goBack}
  retryLabel="Volver"
/>

// Without retry
<ErrorState
  title="Acceso denegado"
  message="No tienes permisos para ver esta página"
/>

// Typical usage:
if (isError) return (
  <ErrorState
    title="Error al cargar"
    message={error?.message}
    onRetry={refetch}
  />
);
```

**Props:**
| Prop | Type | Default |
|---|---|---|
| `title` | `string` | `'Error'` |
| `message` | `string` | `'Ha ocurrido un error'` |
| `onRetry` | `() => void` | — |
| `retryLabel` | `string` | `'Reintentar'` |

---

### EmptyState

Full-screen empty/not-found display with animated bounce icon, title, message, and optional action.

```typescript
import { EmptyState } from '@components/layout';
import { Icon } from '@components/core';

// Default (mailbox icon)
<EmptyState />

// Custom content
<EmptyState
  title="Sin productos"
  message="No hay productos disponibles en este momento"
  icon={<Icon name="package" size={42} />}
  onAction={() => navigate(ProductsRoutes.ProductForm)}
  actionLabel="Agregar producto"
/>

// For detail not found
<EmptyState
  title="Producto no encontrado"
  message="El producto que buscas no existe o fue eliminado"
  icon={<Icon name="package" size={42} />}
  onAction={goBack}
  actionLabel="Volver"
/>

// Typical usage:
if (!data?.length) return (
  <EmptyState
    title="Sin resultados"
    message="No se encontraron elementos"
  />
);
```

**Props:**
| Prop | Type | Default |
|---|---|---|
| `title` | `string` | `'No encontrado'` |
| `message` | `string` | `'No se encontró la información solicitada'` |
| `icon` | `ReactNode` | `<Icon name="mailbox">` |
| `onAction` | `() => void` | — |
| `actionLabel` | `string` | `'Volver'` |

---

### ErrorBoundary

Class component that catches render errors. **Import directly** (not in index).

```typescript
import { ErrorBoundary } from '@components/layout/ErrorBoundary';

// Wrap entire app or feature section
<ErrorBoundary>
  <MyScreen />
</ErrorBoundary>;

// Typically used in AppProvider wrapping the whole app
```

No props (only `children`). On error renders fallback with error details and a "Reintentar" button.

---

### DeleteConfirmationSheet

Modal confirmation dialog for destructive delete actions.

```typescript
import { DeleteConfirmationSheet } from '@components/layout';

<DeleteConfirmationSheet
  visible={isDeleteModalVisible}
  onClose={() => setIsDeleteModalVisible(false)}
  onConfirm={handleDelete}
  entityName={product.name}
  entityType="producto"
/>

// With loading state (during async delete)
<DeleteConfirmationSheet
  visible={isDeleteModalVisible}
  onClose={close}
  onConfirm={handleDelete}
  isLoading={isPending}
  entityName={user.fullName}
  entityType="usuario"
/>
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `visible` | `boolean` | required | Controls visibility |
| `onClose` | `() => void` | required | Cancel handler |
| `onConfirm` | `() => void` | required | Delete confirmation handler |
| `isLoading` | `boolean` | `false` | Shows spinner on confirm button |
| `entityName` | `string` | required | e.g. `"Juan Pérez"` |
| `entityType` | `string` | required | e.g. `"usuario"` |

---

### OfflineBanner

Auto-displayed banner when device is offline. **No props** — reads connectivity from `useConnectivityStore` automatically.

```typescript
import { OfflineBanner } from '@components/layout';

// Place once near the top of the screen layout
<View>
  <OfflineBanner />
  <YourContent />
</View>;

// Already included in RootLayout — typically no need to add manually
```

---

### ItemSeparatorComponent

Vertical spacer for use as `ItemSeparatorComponent` in FlashList.

```typescript
import { ItemSeparatorComponent } from '@components/layout';
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={64}
  ItemSeparatorComponent={ItemSeparatorComponent}
/>;
```

No props.

---

