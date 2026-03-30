---
name: component-catalog
category: specialty
layer: ui
priority: high
last_updated: 2026-03-25
tags:
  - components
  - props
  - catalog
  - reference
  - ui-library
triggers:
  - 'Using UI components'
  - 'Building screens'
  - 'Choosing components'
  - 'Component props reference'
description: Complete catalog of all available components (core, form, layout) with their props, variants, sizes, defaults, and usage examples. Use as reference when building screens or choosing components.
---

# Component Catalog

Complete reference of all available components, their props, variants, and usage patterns.

## Quick Reference

### Component Inventory

| Tier | Components |
|------|-----------|
| **Core** | AnimatedPressable, Avatar, Badge, Button, Card, Checkbox, DatePicker, Icon, Modal, Select, Text, TextInput, Toast |
| **Form** | Checkbox, DatePicker, Select, TextInput |
| **Layout** | DeleteConfirmationSheet, EmptyState, ErrorBoundary, ErrorState, Header, ItemSeparatorComponent, LoadingState, RootLayout, Toolbar |

### Variant Matrix

| Component | Variants |
|-----------|----------|
| Button | `primary` · `secondary` · `outlined` · `ghost` |
| Text | `h1` · `h2` · `h3` · `h4` · `h5` · `h6` · `body` · `bodySmall` · `caption` · `button` · `overline` |
| TextInput | `default` · `outlined` · `filled` |
| Card | `elevated` · `outlined` · `filled` · `ghost` |
| Checkbox | `primary` · `error` |
| Badge | `admin` · `editor` · `viewer` · `default` |
| Toast | `success` · `error` · `info` |

### Size Matrix

| Component | sm | md | lg |
|-----------|----|----|-----|
| Button | 36px height | 48px height | 56px height |
| TextInput | — | 48px height | 56px height |
| Card | 8px padding | 12px padding | 24px padding |
| Modal | 80% width | 90% width | 94% width |
| Avatar | 32px | 48px | 64px |
| Checkbox | 16px box | 20px box | 24px box |
| Select | 36px height | 48px height | 56px height |

---

## Core Components

### Button

**Import**: `import { Button } from '@components/core'`
**Style factory**: `src/theme/components/Button.styles.ts`

```typescript
interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghost';  // default: 'primary'
  size?: 'sm' | 'md' | 'lg';                                  // default: 'md'
  disabled?: boolean;                                          // default: false
  loading?: boolean;                                           // default: false
  fullWidth?: boolean;                                         // default: false
  borderRadius?: BorderRadiusToken;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
```

**Behavior**:
- Shows `ActivityIndicator` when `loading=true` (auto-disables press)
- Icons positioned with auto margins
- Uses `AnimatedPressable` internally (scale + opacity animation)

```typescript
// Usage examples
<Button onPress={handleSave}>Guardar</Button>
<Button variant="outlined" size="sm" onPress={handleCancel}>Cancelar</Button>
<Button variant="ghost" leftIcon={<Icon name="plus" />} onPress={handleAdd}>Agregar</Button>
<Button loading={isPending} fullWidth onPress={handleSubmit}>Enviar</Button>
```

---

### Text

**Import**: `import { Text } from '@components/core'`
**Style factory**: `src/theme/components/Text.styles.ts`

```typescript
interface TextProps extends RNTextProps {
  children: React.ReactNode;
  variant?: TypographyVariant;                    // default: 'body'
  color?: ColorVariant;                           // default: 'text'
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  decoration?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  style?: TextStyle | TextStyle[];
}
```

**Typography variants**:

| Variant | Size | Weight | Line Height |
|---------|------|--------|-------------|
| `h1` | 32px | bold | 40 |
| `h2` | 28px | bold | 36 |
| `h3` | 24px | semiBold | 32 |
| `h4` | 20px | semiBold | 28 |
| `h5` | 18px | semiBold | 24 |
| `h6` | 16px | semiBold | 22 |
| `body` | 16px | regular | 24 |
| `bodySmall` | 14px | regular | 20 |
| `caption` | 12px | regular | 16 |
| `button` | 14px | semiBold | — (uppercase) |
| `overline` | 10px | medium | — (uppercase) |

**Color variants** (all `ColorVariant` keys): `text` · `textSecondary` · `primary` · `success` · `warning` · `error` · `info` · `background` · `surface` · `border` · `onPrimary` · `onSuccess` · `onError` · `onInfo`

```typescript
<Text variant="h1">Título principal</Text>
<Text variant="body" color="textSecondary">Texto secundario</Text>
<Text variant="caption" color="error">Mensaje de error</Text>
<Text variant="h3" align="center" transform="uppercase">Destacado</Text>
```

---

### TextInput

**Import**: `import { TextInput } from '@components/core'`
**Style factory**: `src/theme/components/TextInput.styles.ts`
**ForwardRef**: Yes

```typescript
interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: 'default' | 'outlined' | 'filled';   // default: 'default'
  size?: 'md' | 'lg';                             // default: 'md'
  fullWidth?: boolean;                             // default: false
  borderRadius?: BorderRadiusToken;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
}
```

**States**: default, focus (primary border), error (red border + message), disabled (reduced opacity)

```typescript
<TextInput label="Nombre" placeholder="Ingresa tu nombre" value={name} onChangeText={setName} />
<TextInput label="Email" error={errors.email} leftIcon={<Icon name="email" />} />
<TextInput variant="outlined" size="lg" label="Descripción" multiline numberOfLines={4} />
```

---

### Card

**Import**: `import { Card } from '@components/core'`
**Style factory**: `src/theme/components/Card.styles.ts`

```typescript
// Discriminated union: View when no onPress, Pressable when onPress provided
interface CardBaseProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled' | 'ghost';  // default: 'elevated'
  size?: 'sm' | 'md' | 'lg';                                // default: 'md'
  borderRadius?: BorderRadiusToken;
  fullWidth?: boolean;                                       // default: false
  style?: ViewStyle;
}

// Without onPress → renders as View
interface CardAsView extends CardBaseProps { onPress?: never; }

// With onPress → renders as AnimatedPressable
interface CardAsPressable extends CardBaseProps {
  onPress: () => void;
  disabled?: boolean;
}

type CardProps = CardAsView | CardAsPressable;
```

```typescript
<Card><Text>Contenido estático</Text></Card>
<Card variant="outlined" onPress={handlePress}><Text>Card presionable</Text></Card>
<Card variant="ghost" size="sm"><Text variant="caption">Nota</Text></Card>
```

---

### Modal

**Import**: `import { Modal } from '@components/core'`
**Style factory**: `src/theme/components/Modal.styles.ts`

```typescript
interface ModalProps extends PropsWithChildren {
  visible: boolean;
  onRequestClose?: () => void;
  title?: string;
  icon?: React.ReactNode;
  onPressIcon?: () => void;
  size?: 'sm' | 'md' | 'lg';                      // default: 'md'
  borderRadius?: BorderRadiusToken;
  closeOnBackdropPress?: boolean;                  // default: false
  style?: ViewStyle;
  overlayStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
}
```

**Behavior**:
- Fade animation, centered overlay with `rgba(0,0,0,0.5)`
- Header renders only if `title` or `icon` provided
- `closeOnBackdropPress` calls `onRequestClose` on backdrop tap

```typescript
<Modal visible={showModal} onRequestClose={() => setShowModal(false)} title="Confirmar">
  <Text>¿Estás seguro?</Text>
  <Button onPress={handleConfirm}>Sí</Button>
</Modal>
```

---

### Toast

**Import**: `import { Toast } from '@components/core'`
**Controlled globally via**: `useAppStorage().toast`

```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
  duration: number;           // milliseconds
  position: 'top' | 'bottom';
}
```

**Icons by type**: success → ✓, error → ✕, info → ℹ

**Usage** (no direct rendering needed — use the global store):

```typescript
const toast = useAppStorage(state => state.toast);

toast.show({ message: 'Producto creado', type: 'success' });
toast.show({ message: 'Error al guardar', type: 'error' });
toast.show({ message: 'Conexión restaurada', type: 'info', position: 'bottom', duration: 5000 });
```

---

### Avatar

**Import**: `import { Avatar } from '@components/core'`
**Style factory**: `src/theme/components/Avatar.styles.ts`

```typescript
interface AvatarProps {
  name: string;              // Used to derive initials (first + last char)
  userId: string;            // Hash to generate consistent background color
  size?: 'sm' | 'md' | 'lg'; // default: 'md'
  imageUrl?: string;          // If provided, shows image (FastImage)
}
```

**Behavior**:
- With `imageUrl` → renders FastImage
- Without `imageUrl` → shows initials on a pastel-colored circle (8 colors, deterministic from userId)

```typescript
<Avatar name="Juan Pérez" userId="user-123" />
<Avatar name="Ana García" userId="user-456" size="lg" imageUrl="https://..." />
```

---

### Badge

**Import**: `import { Badge } from '@components/core'`
**Style factory**: `src/theme/components/Badge.styles.ts`

```typescript
interface BadgeProps {
  label: string;
  variant?: 'admin' | 'editor' | 'viewer' | 'default';  // default: 'default'
}
```

**Variant colors**:
- `admin` → primary background, white text
- `editor` → success background, white text
- `viewer` → border background, text color
- `default` → surface background, textSecondary color

```typescript
<Badge label="Admin" variant="admin" />
<Badge label="Activo" variant="editor" />
<Badge label="Solo lectura" variant="viewer" />
```

---

### Checkbox

**Import**: `import { Checkbox } from '@components/core'`
**Style factory**: `src/theme/components/Checkbox.styles.ts`

```typescript
interface CheckboxProps extends Omit<PressableProps, 'style'> {
  checked?: boolean;                               // default: false
  label?: React.ReactNode;
  variant?: 'primary' | 'error';                   // default: 'primary'
  size?: 'sm' | 'md' | 'lg';                      // default: 'md'
  disabled?: boolean;                              // default: false
  borderRadius?: BorderRadiusToken;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onChange?: (checked: boolean) => void;
}
```

```typescript
<Checkbox checked={isActive} onChange={setIsActive} label="Activo" />
<Checkbox checked={hasError} variant="error" label="Tiene errores" disabled />
```

---

### Select

**Import**: `import { Select } from '@components/core'`
**Style factory**: `src/theme/components/Select.styles.ts`

```typescript
interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;                            // default: 'Seleccionar...'
  options: SelectOption[];
  value?: SelectOption | null;
  onChange?: (option: SelectOption | null) => void;
  size?: 'sm' | 'md' | 'lg';                      // default: 'md'
  borderRadius?: BorderRadiusToken;
  fullWidth?: boolean;                             // default: false
  disabled?: boolean;                              // default: false
  modalTitle?: string;                             // falls back to label
  containerStyle?: ViewStyle;
}
```

**Behavior**:
- Opens a Modal with scrollable options list (max 300px)
- Selected option highlighted with primary color + 15% opacity
- Dropdown indicator: "▾"

```typescript
const options = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
];

<Select
  label="Estado"
  options={options}
  value={selectedStatus}
  onChange={setSelectedStatus}
  placeholder="Seleccionar estado..."
/>
```

---

### DatePicker

**Import**: `import { DatePicker } from '@components/core'`
**ForwardRef**: Yes

```typescript
interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  mode?: 'date' | 'time' | 'datetime';            // default: 'date'
  variant?: 'default' | 'outlined' | 'filled';
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  borderRadius?: BorderRadiusToken;
  containerStyle?: ViewStyle;
}
```

**Behavior**:
- iOS: spinner picker inside modal with "Cancelar"/"Listo" buttons
- Android: native calendar/clock dialog
- `datetime` mode shows two pickers sequentially on iOS
- Icon: calendar (date mode), clock (time mode)

```typescript
<DatePicker label="Fecha de inicio" value={startDate} onChange={setStartDate} />
<DatePicker
  label="Hora"
  mode="time"
  value={time}
  onChange={setTime}
  minimumDate={new Date()}
/>
```

---

### AnimatedPressable

**Import**: `import { AnimatedPressable } from '@components/core'`

```typescript
interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  scaleValue?: number;       // default: 0.97
  opacityValue?: number;     // default: 0.9
  disabled?: boolean;        // default: false
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}
```

**Behavior**: Spring animation (scale + opacity) on press. Base building block for Button, Card, Checkbox.

```typescript
<AnimatedPressable onPress={handlePress} scaleValue={0.95}>
  <Text>Elemento interactivo</Text>
</AnimatedPressable>
```

---

### Icon

**Import**: `import { Icon } from '@components/core'`

```typescript
interface IconProps {
  name: IconName;
  size?: number;             // default: 20
  color?: ColorVariant;      // default: theme text color
  strokeWidth?: number;      // default: 1.8
}
```

**Available icons**: `sun` · `moon` · `search` · `check` · `email` · `lock` · `unlock` · `eye` · `key` · `number` · `mobile` · `phone` · `calendar` · `clock` · `warning` · `package` · `user` · `users` · `tag` · `bell` · `star` · `arrow-right` · `arrow-left` · `rocket` · `sparkles` · `palette` · `text` · `button` · `input` · `card` · `checkbox` · `modal` · `mailbox`

```typescript
<Icon name="search" size={24} color="primary" />
<Icon name="warning" color="error" />
<Icon name="check" color="success" strokeWidth={2.5} />
```

---

## Form Components

Form components are react-hook-form wrappers around core components. They replace `value`/`onChange` with `control`/`name` from react-hook-form.

**Import**: `import { TextInput, Select, Checkbox, DatePicker } from '@components/form'`

### Form.TextInput

```typescript
interface TextInputProps extends Omit<CoreTextInputProps, 'value' | 'onChangeText'> {
  control: Control<any, any>;
  name: string;
}
```

### Form.Select

```typescript
interface SelectProps extends Omit<CoreSelectProps, 'value' | 'onChange'> {
  control: Control<any, any>;
  name: string;
}
```

### Form.Checkbox

```typescript
interface CheckboxProps extends Omit<CoreCheckboxProps, 'checked' | 'onChange'> {
  control: Control<any, any>;
  name: string;
}
```

### Form.DatePicker

```typescript
interface DatePickerProps extends Omit<CoreDatePickerProps, 'value' | 'onChange'> {
  control: Control<any, any>;
  name: string;
}
```

**Usage pattern** (all form components):

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextInput, Select, Checkbox, DatePicker } from '@components/form';

const { control, handleSubmit } = useForm({
  resolver: yupResolver(schema),
});

<TextInput control={control} name="name" label="Nombre" placeholder="Ingresa nombre" />
<Select control={control} name="role" label="Rol" options={roleOptions} />
<Checkbox control={control} name="isActive" label="Activo" />
<DatePicker control={control} name="birthDate" label="Fecha de nacimiento" />
```

**Key difference from core**: Form components auto-display validation errors from the schema. No manual `error` prop needed.

---

## Layout Components

### RootLayout

**Import**: `import { RootLayout } from '@components/layout'`

```typescript
interface RootLayoutProps {
  scroll?: boolean;                   // default: true — ScrollView vs View
  padding?: SpacingToken;             // 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  toolbar?: boolean;                  // default: true
  title?: string;                     // Toolbar title
  rightOptions?: ToolbarOptions[];    // Toolbar right icons
  leftOptions?: ToolbarOptions[];     // default: [{ icon: 'arrow-left', onPress: goBack }]
}
```

**Behavior**:
- Fade-in animation on screen focus
- Background from theme
- Default left toolbar option = back button

```typescript
// Standard screen with toolbar
<RootLayout title="Productos">
  <FlashList ... />
</RootLayout>

// No scroll, no toolbar
<RootLayout scroll={false} toolbar={false}>
  <View>...</View>
</RootLayout>

// Custom toolbar actions
<RootLayout
  title="Detalle"
  rightOptions={[
    { icon: 'pencil', onPress: handleEdit },
    { icon: 'trash', onPress: handleDelete },
  ]}
>
  ...
</RootLayout>
```

---

### Header

**Import**: `import { Header } from '@components/layout'`

```typescript
interface HeaderProps {
  title: string;
  onPress: () => void;           // "Agregar" button action
  searchText: string;
  setSearchText: (text: string) => void;
}
```

**Fixed structure**: Title + "Agregar" button + search input. Designed for list screens.

```typescript
<Header
  title="Productos"
  onPress={() => navigation.navigate('ProductCreate')}
  searchText={search}
  setSearchText={setSearch}
/>
```

---

### Toolbar

**Import**: `import { Toolbar } from '@components/layout'`

```typescript
interface ToolbarOptions {
  icon: IconName;
  onPress?: () => void;
}

interface ToolbarProps {
  title?: string;
  rightOptions?: ToolbarOptions[];
  leftOptions?: ToolbarOptions[];
}
```

**Behavior**: Fixed 56px height, centered title, icon buttons on left/right. Usually consumed via `RootLayout` rather than directly.

---

### LoadingState

**Import**: `import { LoadingState } from '@components/layout'`

```typescript
interface LoadingStateProps {
  message?: string;   // default: 'Cargando...'
}
```

**Behavior**: Animated spinner (pulse + rotate) centered with message below.

```typescript
if (isLoading) return <LoadingState />;
if (isLoading) return <LoadingState message="Cargando productos..." />;
```

---

### ErrorState

**Import**: `import { ErrorState } from '@components/layout'`

```typescript
interface ErrorStateProps {
  title?: string;       // default: 'Error'
  message?: string;     // default: 'Ha ocurrido un error'
  onRetry?: () => void;
  retryLabel?: string;  // default: 'Reintentar'
}
```

**Behavior**: Shake animation on mount, warning icon, retry button (only if `onRetry` provided).

```typescript
if (isError) return <ErrorState onRetry={refetch} />;
if (isError) return <ErrorState title="Sin conexión" message="Verifica tu internet" onRetry={refetch} />;
```

---

### EmptyState

**Import**: `import { EmptyState } from '@components/layout'`

```typescript
interface EmptyStateProps {
  title?: string;          // default: 'No encontrado'
  message?: string;        // default: 'No se encontró la información solicitada'
  icon?: React.ReactNode;  // default: mailbox icon
  onAction?: () => void;
  actionLabel?: string;    // default: 'Volver'
}
```

**Behavior**: Bouncing icon animation, button only if `onAction` provided (variant="outlined").

```typescript
if (!data?.length) return <EmptyState message="No hay productos" />;
if (!data?.length) return (
  <EmptyState
    title="Sin resultados"
    message="No hay productos que coincidan"
    onAction={() => setSearch('')}
    actionLabel="Limpiar búsqueda"
  />
);
```

---

### DeleteConfirmationSheet

**Import**: `import { DeleteConfirmationSheet } from '@components/layout'`
**Controlled globally via**: `useAppStorage().modal`

```typescript
interface DeleteConfirmationSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;     // default: false
  entityName: string;      // e.g., "Laptop Pro"
  entityType: string;      // e.g., "producto"
}
```

**Usage** (via global store — no direct rendering needed):

```typescript
const modal = useAppStorage(state => state.modal);

modal.open({
  entityName: product.name,
  entityType: 'producto',
  onConfirm: () => deleteMutation.mutate(product.id),
});
```

---

### ItemSeparatorComponent

**Import**: `import { ItemSeparatorComponent } from '@components/layout'`

No props. Simple spacer (`height: spacing.md`) for FlashList/FlatList/SectionList.

```typescript
<FlatList
  data={data}
  renderItem={renderItem}
  ItemSeparatorComponent={ItemSeparatorComponent}
/>
```

---

## UI Guard Order Pattern

When building screens with data fetching, always follow this order:

```typescript
function MyListView() {
  const { data, isLoading, isError, refetch } = useMyData();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data?.length) return <EmptyState message="No hay elementos" />;

  return (
    <RootLayout>
      <FlatList data={data} ... />
    </RootLayout>
  );
}
```

## Components with ForwardRef

- `TextInput` (core & form)
- `DatePicker` (core & form)

## Components with Global State

- `Toast` → `useAppStorage().toast.show({ message, type })`
- `DeleteConfirmationSheet` → `useAppStorage().modal.open({ entityName, entityType, onConfirm })`

## Animated Components

| Component | Animation |
|-----------|-----------|
| AnimatedPressable | Spring scale + opacity on press |
| Button | Via AnimatedPressable |
| Card | Via AnimatedPressable (when pressable) |
| Checkbox | Via AnimatedPressable |
| LoadingState | Pulse + rotate spinner |
| ErrorState | Shake on mount |
| EmptyState | Bounce loop on icon |
| RootLayout | Fade-in on screen focus |
