# Form Components — Full Reference

> Load this file when you need props or usage for react-hook-form wrapper components.

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

