# Skill: Componentes de UI y Sistema de Temas

## 1. Metadata

-   **Nombre**: `ui-components-theme`
-   **Descripción**: Define cómo crear, estructurar y estilizar componentes de UI reutilizables y consistentes.
-   **Propósito**: Asegurar la consistencia visual, accesibilidad y facilidad de mantenimiento.
-   **Categoría**: UI/UX, Calidad, Performance

## 2. Trigger

-   **Cuándo**: Al crear o modificar un componente en `src/components/*` o `src/modules/*/ui/*`.
-   **Contexto**: Carpetas de componentes y estilos.
-   **Observa**: Uso de tokens de tema, accesibilidad, tipado de props, y estructura de archivos.

## 3. Responsabilidades

-   **Valida**: Que los componentes sigan el patrón de diseño atómico.
-   **Recomienda**: Usar hooks del tema (`useTheme`) en lugar de valores hardcodeados.
-   **Previene**: Estilos inline complejos, falta de props de accesibilidad, y componentes monolíticos.
-   **Optimiza**: El re-renderizado mediante `React.memo` cuando sea necesario.

## 4. Reglas

### Convenciones Obligatorias

1.  **Atomic Design**:
    -   `src/components/core/`: Átomos/Moléculas genéricas (Botones, Inputs, Textos).
    -   `src/components/layout/`: Estructuras de página (Headers, Containers).
    -   `src/modules/*/ui/components/`: Organismos específicos del dominio (Listas de Productos, Formularios de Login).

2.  **Theming First**:
    -   ❌ Prohibido: `color: '#FF0000'`, `padding: 16`.
    -   ✅ Obligatorio: `color: theme.colors.error`, `padding: theme.spacing.m`.
    -   Usar `src/theme/components/*.styles.ts` para estilos complejos que dependan del tema.

3.  **Accesibilidad (A11y)**:
    -   Todo elemento interactivo DEBE tener `accessible={true}` y `accessibilityLabel` (o `accessibilityRole`).
    -   Los textos deben escalar con las preferencias del usuario (`allowFontScaling={true}` por defecto).

4.  **Tipado de Props**:
    -   Interfaces explícitas para props.
    -   Usar `React.FC<Props>` o definir props directamente en la función.
    -   Evitar `any` en los estilos.

### Anti-patrones Prohibidos

-   ❌ Definir componentes dentro de otros componentes (causa re-mounts).
-   ❌ Props drilling excesivo (más de 3 niveles). Usar Context o Zustand.
-   ❌ Lógica de negocio compleja dentro de componentes presentacionales.

## 5. Output Esperado

-   **Feedback**: "El componente 'Button' tiene colores hardcodeados ('#007AFF'). Usa 'theme.colors.primary' para mantener la consistencia con el modo oscuro."
-   **Severidad**: Media (Mantenibilidad/UI).
-   **Corrección**: Reemplazar valores fijos por tokens del tema.

## 6. Ejemplo Práctico

### Antes (Incorrecto)

```tsx
// src/components/MyButton.tsx
import { TouchableOpacity, Text } from 'react-native';

export const MyButton = ({ title, onPress }) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }} // ❌ Estilos inline y hardcodeados
  >
    <Text style={{ color: 'white' }}>{title}</Text>
  </TouchableOpacity>
);
```

### Después (Correcto)

```tsx
// src/components/core/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme, variant);

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.container}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const getStyles = (theme: Theme, variant: 'primary' | 'secondary') => StyleSheet.create({
  container: {
    backgroundColor: variant === 'primary' ? theme.colors.primary : theme.colors.secondary,
    padding: theme.spacing.m,
    borderRadius: theme.borders.radius.m,
    alignItems: 'center',
  },
  text: {
    color: theme.colors.text.inverse,
    ...theme.typography.button,
  },
});
```
