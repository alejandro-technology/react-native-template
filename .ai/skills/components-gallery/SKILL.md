---
name: components-gallery
description: Complete usage gallery for every component in src/components/ (core, form, layout) with all props, variants, and real code examples. Load when implementing UI, choosing components, or checking available props/variants.
license: MIT
compatibility: opencode
metadata:
  layer: ui
  workflow: reference
  output: src/components/**/*.tsx
---

# Components Gallery

Import paths:

- Core: `import { Button, Text, ... } from '@components/core'`
- Form: `import { TextInput, Select, ... } from '@components/form'`
- Layout: `import { RootLayout, Header, ... } from '@components/layout'`
- ErrorBoundary (direct): `import { ErrorBoundary } from '@components/layout/ErrorBoundary'`

---

## CORE COMPONENTS

---

### AnimatedPressable

Spring-animated pressable wrapper. Use as the base for any interactive element that needs press feedback.

```typescript
import { AnimatedPressable } from '@components/core';

// Default (scale 0.97, opacity 0.9)
<AnimatedPressable onPress={handlePress}>
  <Text>Presionar</Text>
</AnimatedPressable>

// Custom animation values
<AnimatedPressable
  scaleValue={0.95}
  opacityValue={0.7}
  onPress={handlePress}
  style={styles.card}
>
  <Text>Con animación personalizada</Text>
</AnimatedPressable>

// Disabled state (no animation, no press)
<AnimatedPressable disabled onPress={handlePress}>
  <Text>Deshabilitado</Text>
</AnimatedPressable>
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `scaleValue` | `number` | `0.97` | Scale target on press |
| `opacityValue` | `number` | `0.9` | Opacity target on press |
| `disabled` | `boolean` | `false` | Disables interaction and animation |
| `style` | `StyleProp<ViewStyle>` | — | Container style |
| `children` | `ReactNode` | required | Content |

---

### Avatar

Circular avatar: shows image if `imageUrl` provided, otherwise initials derived from `name`.

```typescript
import { Avatar } from '@components/core';

// Initials (deterministic color from userId)
<Avatar name="Juan Pérez" userId="user-123" />

// All sizes
<Avatar name="Ana García" userId="user-456" size="sm" />
<Avatar name="Ana García" userId="user-456" size="md" />  // default
<Avatar name="Ana García" userId="user-456" size="lg" />
<Avatar name="Ana García" userId="user-456" size="xl" />

// With image
<Avatar
  name="Juan Pérez"
  userId="user-123"
  size="lg"
  imageUrl="https://example.com/avatar.jpg"
/>
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | required | Used for initials |
| `userId` | `string` | required | Deterministic color seed |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Avatar diameter |
| `imageUrl` | `string` | — | Shows `FastImage` instead of initials |

---

### Badge

Colored label chip for roles, statuses, or tags.

```typescript
import { Badge } from '@components/core';

// Variants
<Badge label="Admin" variant="admin" />
<Badge label="Editor" variant="editor" />
<Badge label="Visualizador" variant="viewer" />
<Badge label="Activo" variant="default" />  // default

// Sizes
<Badge label="Admin" variant="admin" size="sm" />
<Badge label="Admin" variant="admin" size="md" />  // default
<Badge label="Admin" variant="admin" size="lg" />
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | required | Display text |
| `variant` | `'admin' \| 'editor' \| 'viewer' \| 'default'` | `'default'` | Color scheme |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Text and padding size |

---

### Button

Primary interactive element. Extends `PressableProps` (minus `style`).

```typescript
import { Button } from '@components/core';

// Variants
<Button onPress={handlePress}>Guardar</Button>
<Button variant="primary" onPress={handlePress}>Guardar</Button>   // default
<Button variant="secondary" onPress={handlePress}>Cancelar</Button>
<Button variant="outlined" onPress={handlePress}>Ver más</Button>
<Button variant="ghost" onPress={handlePress}>Omitir</Button>

// Sizes
<Button size="sm" onPress={handlePress}>Pequeño</Button>
<Button size="md" onPress={handlePress}>Mediano</Button>   // default
<Button size="lg" onPress={handlePress}>Grande</Button>

// States
<Button disabled onPress={handlePress}>Deshabilitado</Button>
<Button loading onPress={handlePress}>Cargando...</Button>

// Full width
<Button fullWidth onPress={handlePress}>Acción principal</Button>

// With icons
<Button leftIcon={<Icon name="user" size={16} />} onPress={handlePress}>
  Perfil
</Button>
<Button rightIcon={<Icon name="arrow-right" size={16} />} onPress={handlePress}>
  Continuar
</Button>

// Custom border radius
<Button borderRadius="full" onPress={handlePress}>Píldora</Button>
<Button borderRadius="none" onPress={handlePress}>Sin redondeo</Button>

// Async mutation pattern
<Button
  loading={isPending}
  disabled={isPending}
  onPress={handleSubmit}
  fullWidth
>
  {isPending ? 'Guardando...' : 'Guardar'}
</Button>
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'outlined' \| 'ghost'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding and font size |
| `disabled` | `boolean` | `false` | Blocks press and dims |
| `loading` | `boolean` | `false` | Shows `ActivityIndicator`, blocks press |
| `fullWidth` | `boolean` | `false` | 100% width |
| `borderRadius` | `BorderRadiusToken` | theme default | Corner radius override |
| `leftIcon` | `ReactNode` | — | Icon before text |
| `rightIcon` | `ReactNode` | — | Icon after text |
| `style` | `ViewStyle` | — | Container override |
| `textStyle` | `TextStyle` | — | Text style override |

---

### Card

Container with variants. Becomes pressable when `onPress` is provided.

```typescript
import { Card } from '@components/core';

// Static variants
<Card variant="elevated">
  <Text>Elevado (sombra)</Text>
</Card>
<Card variant="outlined">
  <Text>Con borde</Text>
</Card>
<Card variant="filled">
  <Text>Relleno</Text>
</Card>
<Card variant="ghost">
  <Text>Sin fondo</Text>
</Card>

// Sizes
<Card size="sm"><Text>Pequeño</Text></Card>
<Card size="md"><Text>Mediano</Text></Card>   // default
<Card size="lg"><Text>Grande</Text></Card>

// Pressable card (onPress makes it tappable with AnimatedPressable)
<Card variant="outlined" onPress={() => navigate(route)}>
  <Text variant="h4">Producto</Text>
  <Text>Descripción del producto</Text>
</Card>

// Pressable + disabled
<Card variant="elevated" onPress={handlePress} disabled>
  <Text>No interactivo</Text>
</Card>

// Full width
<Card fullWidth variant="elevated">
  <Text>Ocupa todo el ancho</Text>
</Card>

// Custom border radius
<Card borderRadius="xl" variant="elevated">
  <Text>Más redondeado</Text>
</Card>
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'elevated' \| 'outlined' \| 'filled' \| 'ghost'` | `'elevated'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| `onPress` | `PressableProps['onPress']` | — | Makes card pressable |
| `disabled` | `boolean` | — | Only valid when `onPress` is set |
| `fullWidth` | `boolean` | `false` | 100% width |
| `borderRadius` | `BorderRadiusToken` | theme default | Corner radius override |
| `style` | `ViewStyle` | — | Container override |

---

### Checkbox

Toggle with optional label. Controlled via `checked` + `onChange`.

```typescript
import { Checkbox } from '@components/core';

// Basic
<Checkbox
  checked={isAccepted}
  onChange={setIsAccepted}
  label="Acepto los términos y condiciones"
/>

// Variants
<Checkbox checked={true} onChange={fn} variant="primary" label="Primario" />
<Checkbox checked={false} onChange={fn} variant="error" label="Con error" />

// Sizes
<Checkbox checked={true} onChange={fn} size="sm" label="Pequeño" />
<Checkbox checked={true} onChange={fn} size="md" label="Mediano" />   // default
<Checkbox checked={true} onChange={fn} size="lg" label="Grande" />

// Disabled
<Checkbox checked={true} onChange={fn} disabled label="Deshabilitado" />

// No label
<Checkbox checked={isSelected} onChange={setIsSelected} />

// Custom border radius
<Checkbox checked={true} onChange={fn} borderRadius="sm" label="Cuadrado" />
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | `false` | Controlled state |
| `onChange` | `(checked: boolean) => void` | — | State change handler |
| `label` | `ReactNode` | — | Optional label text |
| `variant` | `'primary' \| 'error'` | `'primary'` | Color scheme |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Box size |
| `disabled` | `boolean` | `false` | Blocks interaction |
| `borderRadius` | `BorderRadiusToken` | theme default | Corner radius |

---

### DatePicker

Date/time picker with native `DateTimePicker`. Shows a read-only input that opens the picker on press.

```typescript
import { DatePicker } from '@components/core';

// Date only
<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  label="Fecha de nacimiento"
  placeholder="Selecciona una fecha"
/>

// Time only
<DatePicker
  value={selectedTime}
  onChange={setSelectedTime}
  mode="time"
  label="Hora de inicio"
/>

// Date + Time
<DatePicker
  value={selectedDateTime}
  onChange={setSelectedDateTime}
  mode="datetime"
  label="Fecha y hora del evento"
/>

// With date range constraints
<DatePicker
  value={date}
  onChange={setDate}
  minimumDate={new Date()}
  maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
  label="Fecha de entrega"
/>

// With error and helper text
<DatePicker
  value={date}
  onChange={setDate}
  label="Fecha de vencimiento"
  error="La fecha es obligatoria"
  helperText="Formato: DD/MM/YYYY"
/>

// Variants (visual style of the trigger input)
<DatePicker value={date} onChange={setDate} variant="default" />
<DatePicker value={date} onChange={setDate} variant="outlined" />
<DatePicker value={date} onChange={setDate} variant="filled" />

// Disabled
<DatePicker value={date} onChange={setDate} disabled label="No editable" />

// Full width
<DatePicker value={date} onChange={setDate} fullWidth />
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `Date \| null` | required | Controlled date value |
| `onChange` | `(date: Date \| null) => void` | required | Change handler |
| `mode` | `'date' \| 'time' \| 'datetime'` | `'date'` | Picker mode |
| `variant` | `'default' \| 'outlined' \| 'filled'` | — | Trigger input style |
| `minimumDate` | `Date` | — | Lower bound |
| `maximumDate` | `Date` | — | Upper bound |
| `placeholder` | `string` | — | Empty state text |
| `label` | `string` | — | Field label |
| `error` | `string` | — | Error message (red) |
| `helperText` | `string` | — | Helper text below |
| `disabled` | `boolean` | — | Blocks interaction |
| `fullWidth` | `boolean` | — | 100% width |
| `borderRadius` | `BorderRadiusToken` | — | Corner radius |
| `containerStyle` | `ViewStyle` | — | Outer container style |

---

### Icon

SVG icon from a fixed set of 35 named icons.

```typescript
import { Icon } from '@components/core';
import type { IconName } from '@components/core';

// Basic usage
<Icon name="user" />
<Icon name="search" />
<Icon name="bell" />

// Custom size
<Icon name="warning" size={32} />

// Custom color (uses ColorVariant — theme-aware)
<Icon name="check" color="success" />
<Icon name="warning" color="warning" />
<Icon name="close" color="error" />
<Icon name="user" color="primary" />
<Icon name="star" color="text" />         // default

// Custom stroke width
<Icon name="arrow-right" strokeWidth={2.5} />

// All available icon names:
// 'sun' | 'moon' | 'search' | 'check' | 'email' | 'lock' | 'unlock'
// 'eye' | 'key' | 'number' | 'mobile' | 'phone' | 'calendar' | 'clock'
// 'warning' | 'package' | 'user' | 'users' | 'tag' | 'bell' | 'star'
// 'arrow-right' | 'arrow-left' | 'rocket' | 'sparkles' | 'palette'
// 'text' | 'button' | 'input' | 'card' | 'checkbox' | 'modal'
// 'mailbox' | 'camera' | 'close' | 'image'

// In a Button
<Button
  leftIcon={<Icon name="user" size={16} color="onPrimary" />}
  onPress={handlePress}
>
  Perfil
</Button>
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `IconName` | required | Icon identifier |
| `size` | `number` | `20` | Width and height in dp |
| `color` | `ColorVariant` | theme `text` | Stroke color |
| `strokeWidth` | `number` | `1.8` | SVG stroke width |

**All `ColorVariant` values:** `background`, `surface`, `border`, `text`, `textSecondary`, `primary`, `success`, `warning`, `error`, `info`, `onPrimary`, `onSuccess`, `onError`, `onInfo`

---

### ImagePicker

Avatar + picker trigger that opens a Modal with Camera/Gallery options. Handles permissions internally.

```typescript
import { ImagePicker } from '@components/core';

// Basic — required props
<ImagePicker
  displayName="Juan Pérez"
  onChange={uri => setAvatarUri(uri)}
/>

// With initial value
<ImagePicker
  displayName="Ana García"
  userId="user-789"
  value={currentImageUri}
  onChange={uri => setAvatarUri(uri)}
  label="Foto de perfil"
/>

// With placeholder text
<ImagePicker
  displayName="Carlos López"
  onChange={uri => setAvatarUri(uri)}
  placeholder="Toca para añadir una foto"
/>

// With error
<ImagePicker
  displayName="María Torres"
  onChange={uri => setAvatarUri(uri)}
  error="La imagen es obligatoria"
/>

// Clear image (onChange called with null)
// The "Eliminar" option is shown automatically when value is set
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `displayName` | `string` | required | Used for `Avatar` initials/color |
| `onChange` | `(uri: string \| null) => void` | required | URI of selected image or `null` on remove |
| `value` | `string \| null` | — | Current image URI |
| `userId` | `string` | `'default'` | Seed for avatar color |
| `label` | `string` | — | Field label |
| `placeholder` | `string` | `'Toca para seleccionar imagen'` | Empty state text |
| `error` | `string` | — | Error message |

---

### Modal

Controlled modal overlay. Transparent background with animated fade entrance.

```typescript
import { Modal } from '@components/core';

// Basic with title
<Modal
  visible={isVisible}
  onRequestClose={() => setIsVisible(false)}
  title="Confirmar acción"
>
  <Text>¿Estás seguro de continuar?</Text>
  <Button onPress={() => setIsVisible(false)}>Cerrar</Button>
</Modal>

// Sizes
<Modal visible={isVisible} size="sm" title="Pequeño">
  <Text>Contenido compacto</Text>
</Modal>
<Modal visible={isVisible} size="md" title="Mediano">   {/* default */}
  <Text>Contenido estándar</Text>
</Modal>
<Modal visible={isVisible} size="lg" title="Grande">
  <Text>Contenido extenso</Text>
</Modal>

// Close on backdrop press
<Modal
  visible={isVisible}
  onRequestClose={() => setIsVisible(false)}
  closeOnBackdropPress
  title="Cerrar al tocar fuera"
>
  <Text>Toca fuera para cerrar</Text>
</Modal>

// With icon in header
<Modal
  visible={isVisible}
  title="Configuración"
  icon={<Icon name="close" />}
  onPressIcon={() => setIsVisible(false)}
>
  <Text>Contenido del modal</Text>
</Modal>

// Custom border radius
<Modal visible={isVisible} borderRadius="xl" title="Redondeado">
  <Text>Contenido</Text>
</Modal>
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `visible` | `boolean` | required | Controls visibility |
| `onRequestClose` | `() => void` | — | Called on Android back press |
| `title` | `string` | — | Header title |
| `icon` | `ReactNode` | — | Icon in header (right side) |
| `onPressIcon` | `() => void` | — | Icon press handler |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Modal width |
| `borderRadius` | `BorderRadiusToken` | theme default | Corner radius |
| `closeOnBackdropPress` | `boolean` | `false` | Close when pressing backdrop |
| `style` | `ViewStyle` | — | Container override |
| `overlayStyle` | `ViewStyle` | — | Backdrop overlay override |
| `headerStyle` | `ViewStyle` | — | Header row override |
| `titleStyle` | `TextStyle` | — | Title text override |
| `contentStyle` | `ViewStyle` | — | Content area override |

---

### Select

Single-value dropdown backed by a Modal with scrollable options.

```typescript
import { Select } from '@components/core';
import type { SelectOption } from '@components/core';

const options: SelectOption[] = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'Pendiente', value: 'pending' },
];

// Basic
<Select
  options={options}
  value={selectedOption}
  onChange={setSelectedOption}
  label="Estado"
/>

// With placeholder and modal title
<Select
  options={options}
  value={selectedOption}
  onChange={setSelectedOption}
  label="Estado"
  placeholder="Selecciona un estado"
  modalTitle="Elegir estado"
/>

// Sizes
<Select options={options} value={selected} onChange={fn} size="sm" />
<Select options={options} value={selected} onChange={fn} size="md" />   // default
<Select options={options} value={selected} onChange={fn} size="lg" />

// With error and helper text
<Select
  options={options}
  value={selectedOption}
  onChange={setSelectedOption}
  label="Categoría"
  error="Debes seleccionar una categoría"
  helperText="Elige la categoría que mejor describe el elemento"
/>

// Disabled
<Select
  options={options}
  value={selectedOption}
  onChange={setSelectedOption}
  disabled
  label="No editable"
/>

// Full width
<Select options={options} value={selected} onChange={fn} fullWidth />

// Clear selection (onChange called with null)
// User can deselect by pressing the currently selected item
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `SelectOption[]` | required | Available choices |
| `value` | `SelectOption \| null` | — | Controlled selection |
| `onChange` | `(option: SelectOption \| null) => void` | — | Selection handler |
| `label` | `string` | — | Field label |
| `helperText` | `string` | — | Helper text below |
| `error` | `string` | — | Error message (red) |
| `placeholder` | `string` | `'Seleccionar...'` | Empty state text |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input height |
| `borderRadius` | `BorderRadiusToken` | — | Corner radius |
| `fullWidth` | `boolean` | `false` | 100% width |
| `disabled` | `boolean` | `false` | Blocks interaction |
| `modalTitle` | `string` | — | Modal header title |
| `containerStyle` | `ViewStyle` | — | Outer container style |

---

### Text

Themed typography wrapper. All text in the app should use this instead of RN `Text`.

```typescript
import { Text } from '@components/core';

// Typography variants
<Text variant="h1">Título principal</Text>
<Text variant="h2">Subtítulo</Text>
<Text variant="h3">Encabezado 3</Text>
<Text variant="h4">Encabezado 4</Text>
<Text variant="h5">Encabezado 5</Text>
<Text variant="h6">Encabezado 6</Text>
<Text variant="body">Texto de cuerpo</Text>          // default
<Text variant="bodySmall">Texto pequeño</Text>
<Text variant="caption">Leyenda o nota</Text>
<Text variant="button">TEXTO DE BOTÓN</Text>
<Text variant="overline">ETIQUETA SOBRE</Text>

// Colors
<Text color="primary">Primario</Text>
<Text color="text">Por defecto</Text>                // default
<Text color="textSecondary">Secundario</Text>
<Text color="success">Éxito</Text>
<Text color="warning">Advertencia</Text>
<Text color="error">Error</Text>
<Text color="info">Información</Text>

// Alignment
<Text align="center">Centrado</Text>
<Text align="right">Derecha</Text>
<Text align="left">Izquierda</Text>                  // default

// Text transform
<Text transform="uppercase">mayúsculas</Text>
<Text transform="lowercase">MINÚSCULAS</Text>
<Text transform="capitalize">primera Letra</Text>

// Text decoration
<Text decoration="underline">Subrayado</Text>
<Text decoration="line-through">Tachado</Text>

// Combined
<Text variant="h3" color="primary" align="center">
  Título centrado en primario
</Text>

// Custom style override
<Text variant="body" style={{ letterSpacing: 1 }}>
  Espaciado personalizado
</Text>
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'h1'...'h6' \| 'body' \| 'bodySmall' \| 'caption' \| 'button' \| 'overline'` | `'body'` | Typography scale |
| `color` | `ColorVariant` | `'text'` | Text color token |
| `align` | `TextStyle['textAlign']` | — | Text alignment |
| `transform` | `TextStyle['textTransform']` | — | Text transform |
| `decoration` | `TextStyle['textDecorationLine']` | — | Underline, strikethrough |
| `style` | `TextStyle \| TextStyle[]` | — | Style override |

---

### TextInput

Themed text input with label, error, helper text, and icon slots.

```typescript
import { TextInput } from '@components/core';

// Basic
<TextInput
  label="Nombre"
  placeholder="Ingresa tu nombre"
  value={name}
  onChangeText={setName}
/>

// Variants
<TextInput placeholder="Por defecto" variant="default" />   // default
<TextInput placeholder="Con borde" variant="outlined" />
<TextInput placeholder="Relleno" variant="filled" />

// Sizes
<TextInput placeholder="Mediano" size="md" />   // default
<TextInput placeholder="Grande" size="lg" />

// With icons
<TextInput
  leftIcon={<Icon name="search" size={18} />}
  placeholder="Buscar..."
/>
<TextInput
  rightIcon={<Icon name="close" size={18} />}
  placeholder="Con icono derecho"
/>

// With error
<TextInput
  label="Email"
  placeholder="correo@ejemplo.com"
  error="El email no es válido"
  keyboardType="email-address"
/>

// With helper text
<TextInput
  label="Contraseña"
  secureTextEntry
  helperText="Mínimo 8 caracteres"
/>

// Disabled
<TextInput
  label="Campo fijo"
  value="No editable"
  editable={false}
/>

// Full width
<TextInput placeholder="Ocupa todo el ancho" fullWidth />

// Multiline
<TextInput
  label="Descripción"
  multiline
  numberOfLines={4}
  placeholder="Escribe una descripción..."
/>

// Custom border radius
<TextInput placeholder="Más redondeado" borderRadius="xl" />

// Ref forwarding
const inputRef = useRef<TextInput>(null);
<TextInput ref={inputRef} placeholder="Con ref" />
```

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Label above input |
| `helperText` | `string` | — | Helper text below |
| `error` | `string` | — | Error message (red, replaces helperText) |
| `variant` | `'default' \| 'outlined' \| 'filled'` | `'default'` | Visual style |
| `size` | `'md' \| 'lg'` | `'md'` | Input height |
| `fullWidth` | `boolean` | `false` | 100% width |
| `borderRadius` | `BorderRadiusToken` | theme default | Corner radius |
| `leftIcon` | `ReactNode` | — | Icon inside left |
| `rightIcon` | `ReactNode` | — | Icon inside right |
| `containerStyle` | `ViewStyle` | — | Outer wrapper override |
| `inputStyle` | `ViewStyle` | — | Input element override |

---

### Toast

Auto-hiding notification banner. **Do not use directly** — use `useAppStorage(s => s.toast).show(...)` instead. The global `<Toast>` instance lives in `AppProvider`.

```typescript
// Trigger via store (correct pattern):
import { useAppStorage } from '@modules/core';

function MyComponent() {
  const { show } = useAppStorage(state => state.toast);

  function handleSave() {
    show({
      message: 'Guardado correctamente',
      type: 'success',
    });
  }

  function handleError() {
    show({
      message: 'Error al guardar',
      type: 'error',
      duration: 5000,
      position: 'bottom',
    });
  }
}

// Toast types: 'success' | 'error' | 'info'
// Toast positions: 'top' | 'bottom'
// Default duration: 3000ms
// Default position: 'top'
```

**Direct props (for custom usage only):**
| Prop | Type | Description |
|---|---|---|
| `message` | `string` | Display text |
| `type` | `'success' \| 'error' \| 'info'` | Icon and color |
| `visible` | `boolean` | Controls visibility |
| `onHide` | `() => void` | Called when dismissed |
| `duration` | `number` | Auto-hide delay (ms) |
| `position` | `'top' \| 'bottom'` | Screen position |

---

## FORM COMPONENTS

Form components wrap their core counterparts with `useController` from `react-hook-form`. They replace `value`/`onChange` with `control` + `name`.

```typescript
import {
  TextInput,
  Select,
  Checkbox,
  DatePicker,
  ImagePicker,
} from '@components/form';
```

---

### form/TextInput

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextInput } from '@components/form';

const { control, handleSubmit } = useForm({ resolver: yupResolver(schema) });

// All core TextInput props work here except value/onChangeText
<TextInput
  control={control}
  name="email"
  label="Email"
  placeholder="correo@ejemplo.com"
  keyboardType="email-address"
  autoCapitalize="none"
/>

<TextInput
  control={control}
  name="password"
  label="Contraseña"
  secureTextEntry
  helperText="Mínimo 8 caracteres"
/>

<TextInput
  control={control}
  name="description"
  label="Descripción"
  multiline
  numberOfLines={3}
/>
```

---

### form/Checkbox

```typescript
import { Checkbox } from '@components/form';

<Checkbox
  control={control}
  name="acceptTerms"
  label="Acepto los términos y condiciones"
/>

<Checkbox
  control={control}
  name="isActive"
  label="Usuario activo"
  size="lg"
/>
```

---

### form/Select

```typescript
import { Select } from '@components/form';
import type { SelectOption } from '@components/core';

const roleOptions: SelectOption[] = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Visualizador', value: 'viewer' },
];

<Select
  control={control}
  name="role"
  label="Rol"
  options={roleOptions}
  placeholder="Selecciona un rol"
  modalTitle="Elegir rol"
/>;
```

---

### form/DatePicker

```typescript
import { DatePicker } from '@components/form';

<DatePicker
  control={control}
  name="birthDate"
  label="Fecha de nacimiento"
  mode="date"
  maximumDate={new Date()}
/>

<DatePicker
  control={control}
  name="appointmentTime"
  label="Hora de la cita"
  mode="time"
/>
```

---

### form/ImagePicker

```typescript
import { ImagePicker } from '@components/form';

<ImagePicker
  control={control}
  name="avatarUrl"
  displayName={watchedName || 'Usuario'}
  userId={userId}
  label="Foto de perfil"
/>;
```

---

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

## STANDARD LIST SCREEN PATTERN

Complete pattern combining layout components with FlashList (FAB navigation variant):

```typescript
import React from 'react';
import { RootLayout, Header } from '@components/layout';
import { ProductList } from '@modules/products/ui/components/ProductList';

export function ProductsListView() {
  const { navigate } = useNavigationProducts();
  const onAddProduct = () => navigate(ProductsRoutes.ProductForm);

  return (
    <RootLayout
      scroll={false}
      toolbar={false}
      fab={{ icon: 'plus', onPress: onAddProduct }}
    >
      <Header title="Productos" searchbar="products" />
      <ProductList />
    </RootLayout>
  );
}
```

---

## DETAIL SCREEN PATTERN

```typescript
export function ProductDetail({ productId }: { productId: string }) {
  const { goBack, navigate } = useNavigationProducts();
  const { data: product, isLoading, isError, error } = useProduct(productId);
  const { mutateAsync: deleteProductAsync } = useProductDelete();
  const { open } = useAppStorage(state => state.modal);

  function handleDelete() {
    if (!product) return;
    open({
      type: 'delete',
      entityName: product.name,
      entityType: 'producto',
      onConfirm: async () => {
        await deleteProductAsync(productId);
        goBack();
      },
    });
  }

  if (isLoading) return <LoadingState message="Cargando producto..." />;
  if (isError)
    return (
      <ErrorState
        title="Error al cargar"
        message={error?.message}
        onRetry={goBack}
        retryLabel="Volver"
      />
    );
  if (!product)
    return (
      <EmptyState
        title="Producto no encontrado"
        icon={<Icon name="package" size={42} />}
        onAction={goBack}
        actionLabel="Volver"
      />
    );

  return (
    <View>
      <Text variant="h2">{product.name}</Text>
      <Button
        variant="outlined"
        onPress={() => navigate(ProductsRoutes.ProductForm, { product })}
      >
        Editar
      </Button>
      <Button variant="ghost" onPress={handleDelete}>
        Eliminar
      </Button>
    </View>
  );
}
```
