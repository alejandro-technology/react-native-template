# Components Rules

Three categories: core (primitives), form (react-hook-form wrappers), layout (screen structure).

## Architecture

```
src/components/
  core/    # AnimatedPressable, Avatar, Badge, Button, Card, Checkbox,
           # DatePicker, Icon, ImagePicker, Modal, Select, Text, TextInput, Toast
  form/    # Checkbox, DatePicker, ImagePicker, Select, TextInput
  layout/  # DeleteConfirmationSheet, EmptyState, ErrorBoundary, ErrorState,
           # Header, ItemSeparatorComponent, LoadingState, OfflineBanner,
           # RootLayout, Toolbar
```

Style factories in `src/theme/components/{Component}.styles.ts`.

_For usage examples and all prop variations, load the `components-gallery` skill._

## Core Component Pattern

```typescript
interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = 'primary',
  size = 'md',
  ...rest
}: ButtonProps) {
  const { mode } = useTheme();
  const styles = getButtonStyle({ mode, variant, size });
  return (
    <AnimatedPressable
      style={styles.container}
      accessibilityRole="button"
      {...rest}
    />
  );
}
```

## Form Component Pattern

```typescript
export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  ({ name, control, ...rest }, ref) => {
    const { field, fieldState } = useController({ name, control });
    return (
      <TextInputCore
        error={fieldState.error?.message}
        value={field.value}
        onChangeText={field.onChange}
        {...rest}
      />
    );
  },
);
```

## Creating Components

- **Core**: Component + style factory + export in `index.ts`
- **Form**: Wrapper with `useController` + export in `index.ts`
- **Layout**: Self-contained with `StyleSheet.create` + export in `index.ts`
