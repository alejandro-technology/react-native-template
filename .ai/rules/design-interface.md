---
category: ui-ux
priority: critical
tags: [theme-system, component-styles, design-tokens, responsive]
enforcedBy: [CLAUDE.md]
---

# Reglas Fundamentales de Diseño UI/UX

Estas son las 2 reglas de diseño UI/UX que **SIEMPRE** deben seguirse en este proyecto.

---

## Regla 1: Sistema de Temas Obligatorio (Sin Hardcoding)

**SIEMPRE**: Usar `useTheme()` y tokens de diseño. NUNCA hardcodear colores hex o valores en pixels.

### Tokens Obligatorios

| Token        | Uso                                           | NO usar                      |
| ------------ | --------------------------------------------- | ---------------------------- |
| **Colors**   | `theme.colors.primary`, `theme.colors.error`  | `'#007AFF'`, `'#FF0000'`     |
| **Spacing**  | `spacing.md`, `spacing.lg`                    | `16`, `24` (pixels raw)      |
| **Typography** | `<Text variant="h1">`, `typography.body`    | `fontSize: 24` inline        |
| **Responsive** | `wScale(100)`, `moderateScale(16)`          | `width: 100`, `fontSize: 16` |

### Ejemplo Correcto vs Incorrecto

```typescript
// ✅ CORRECTO: Usando sistema de temas
import { useTheme, spacing } from '@theme/index';
import { Text } from '@components/core/Text';

function MyScreen() {
  const theme = useTheme();

  return (
    <View style={{
      backgroundColor: theme.colors.background,
      padding: spacing.md,
    }}>
      <Text variant="h1" color="primary">
        Título
      </Text>
    </View>
  );
}
```

```typescript
// ❌ INCORRECTO: Hardcoding valores
function MyScreen() {
  return (
    <View style={{
      backgroundColor: '#FFFFFF',  // ❌ Color hex hardcodeado
      padding: 16,                 // ❌ Spacing hardcodeado
    }}>
      <Text style={{
        fontSize: 24,              // ❌ Font size hardcodeado
        color: '#007AFF',          // ❌ Color hex hardcodeado
      }}>
        Título
      </Text>
    </View>
  );
}
```

### Tokens Disponibles

**Colors** (semánticos):
- `primary`, `success`, `warning`, `error`, `info`
- `background`, `surface`, `border`
- `text`, `textSecondary`
- `onPrimary`, `onSuccess`, `onError`, `onInfo` (texto sobre fondos de color)

**ThemeMode**: `'light' | 'dark' | 'primary' | 'premium'`

**Spacing** (escala basada en 4px):
- `xs` (4px), `sm` (8px), `md` (12px), `base` (16px), `lg` (24px), `xl` (32px), `2xl` (48px), `3xl` (64px)

**Typography** (variants):
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- `body`, `bodySmall`, `caption`, `button`, `overline`

**Responsive** (funciones):
- `wScale(size)` - escala horizontal
- `hScale(size)` - escala vertical
- `moderateScale(size)` - escala moderada (factor configurable)
- `fScale(size)` - escala de fuente (para iconos y elementos no-Text que deben escalar)
- `wp(percent)` - porcentaje de ancho
- `hp(percent)` - porcentaje de alto

### Cómo Verificar

```bash
# 1. Buscar colores hex hardcodeados en UI
grep -r "#[0-9A-Fa-f]\{6\}" src/components src/modules/*/ui --include="*.tsx" --exclude="*.styles.ts"
# Debe retornar: Mínimos resultados (solo excepciones justificadas)

# 2. Verificar uso de useTheme en componentes
grep -r "useTheme()" src/components/core --include="*.tsx"
# Debe retornar: Matches en todos los componentes estilizados

# 3. Buscar spacing hardcodeado (revisión manual)
# Buscar patrones como "padding: 16" o "margin: 20"
```

**Referencias**:
- Tokens: `src/theme/index.ts`
- Ejemplo correcto: `src/components/core/Button.tsx`

---

## Regla 2: Factory Pattern para Estilos de Componentes

**SIEMPRE**: Todo componente estilizado debe tener una función factory en `src/theme/components/ComponentName.styles.ts`.

### Patrón Obligatorio

```typescript
// src/theme/components/Button.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { ThemeMode, colors } from '../colors';
import { spacing } from '../spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  mode?: ThemeMode;           // ⚠️ OBLIGATORIO
  disabled?: boolean;
  fullWidth?: boolean;
}

export function getButtonStyle(props: ButtonStyleProps): {
  container: ViewStyle;
  text: TextStyle;
} {
  const { mode = 'light', variant = 'primary', size = 'md' } = props;
  const themeColors = colors[mode];

  // Implementación que combina variant, size, mode
  return {
    container: { /* estilos */ },
    text: { /* estilos */ },
  };
}
```

### Uso en Componente

```typescript
// src/components/core/Button.tsx
import { useTheme } from '@theme/index';
import { getButtonStyle, ButtonVariant, ButtonSize } from '@theme/components/Button.styles';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // ... otros props
}

export function Button(props: ButtonProps) {
  const theme = useTheme();

  const styles = getButtonStyle({
    mode: theme.mode,        // ⚠️ Pasar mode del tema
    variant: props.variant,
    size: props.size,
    disabled: props.disabled,
  });

  return (
    <Pressable style={styles.container}>
      <Text style={styles.text}>{props.children}</Text>
    </Pressable>
  );
}
```

### Beneficios del Patrón

✅ **Consistencia visual** - Todos los componentes respetan los mismos variants y sizes
✅ **Soporte automático de temas** - Dark mode funciona sin código adicional
✅ **Type-safe** - Variants y sizes son enums tipados
✅ **Reutilizable** - Un solo componente Button para toda la app
✅ **Testeable** - Factory pura sin dependencias de React

### Estructura Obligatoria de Factory

1. **Exports de tipos**: `ComponentVariant`, `ComponentSize`
2. **Interface de props**: Incluir `mode: ThemeMode`
3. **Función factory**: Nombre `get{Component}Style`
4. **Return type**: Objeto con keys descriptivas (`container`, `text`, `icon`, etc.)
5. **Acceso a colores**: Vía `colors[mode]` para soporte de temas

### Cómo Verificar

```bash
# 1. Cada componente debe tener factory correspondiente
ls src/components/core/ src/theme/components/
# Comparar: Button.tsx → Button.styles.ts, Card.tsx → Card.styles.ts

# 2. Factories deben aceptar parámetro 'mode'
grep -r "mode.*ThemeMode" src/theme/components/*.styles.ts
# Debe retornar: Matches en todas las factories

# 3. Componentes deben usar factories
grep -r "get.*Style" src/components/core --include="*.tsx"
# Debe retornar: Imports de factories en componentes
```

**Referencias**:
- Factory completo: `src/theme/components/Button.styles.ts`
- Consumo: `src/components/core/Button.tsx`
- Otros ejemplos: `Card.styles.ts`, `TextInput.styles.ts`, `Text.styles.ts`

---

## Resumen de Enforcement

| Regla                    | Verificación Rápida                                                    |
| ------------------------ | ---------------------------------------------------------------------- |
| Sistema de temas         | `grep "#[0-9A-F]\{6\}" src/modules/*/ui` → Mínimos resultados         |
| Factory pattern          | Todo componente en `components/` tiene `.styles.ts` correspondiente    |
| useTheme() obligatorio   | `grep "useTheme()" src/components/core` → Matches en todos styled     |
| Mode en factory          | `grep "mode.*ThemeMode" src/theme/components/*.styles.ts` → Todos      |

**Nota**: Para reglas detalladas de componentes específicos, ver `CLAUDE.md` sección "Theme System".
