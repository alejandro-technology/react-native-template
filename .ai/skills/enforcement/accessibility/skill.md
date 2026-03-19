---
name: accessibility
category: enforcement
layer: ui
priority: high
tags:
  - a11y
  - screen-reader
  - voiceover
  - talkback
  - touch-targets
triggers:
  - 'Creating UI components'
  - 'Reviewing accessibility'
  - 'Adding interactive elements'
description: Enforce accessibility standards for React Native components. Validates labels, roles, hints, touch targets, and screen reader support across all interactive UI elements.
---

# Accessibility Skill

Enforces accessibility (a11y) standards to ensure the app is usable with VoiceOver (iOS) and TalkBack (Android).

## When to Use

- Creating or modifying interactive UI components
- Reviewing existing screens for a11y compliance
- Adding new touchable/pressable elements
- Implementing form inputs or navigation elements

## Rules

### R1: Every Interactive Element Must Have `accessibilityLabel`

All touchable, pressable, and input elements require a descriptive `accessibilityLabel`.

```typescript
// ✅ CORRECT
<Button
  accessibilityLabel="Guardar producto"
  onPress={handleSave}
>
  Guardar
</Button>

<AnimatedPressable
  accessibilityLabel="Eliminar usuario"
  onPress={handleDelete}
>
  <Icon name="trash" />
</AnimatedPressable>

// ❌ INCORRECT: Missing label
<Button onPress={handleSave}>
  Guardar
</Button>

// ❌ INCORRECT: Icon-only button without label
<AnimatedPressable onPress={handleDelete}>
  <Icon name="trash" />
</AnimatedPressable>
```

**Exception**: Buttons/Pressables whose only child is a `<Text>` element with visible text — React Native auto-derives the label. Still, prefer explicit labels for clarity.

### R2: Use Correct `accessibilityRole`

Assign the semantic role that matches the element's function.

| Element | Role | Example |
|---------|------|---------|
| Buttons | `'button'` | `<AnimatedPressable accessibilityRole="button">` |
| Links | `'link'` | Navigation to external URL |
| Text inputs | `'none'` | Already semantic via `<TextInput>` |
| Images | `'image'` | `<Image accessibilityRole="image">` |
| Headers | `'header'` | Section titles in lists |
| Checkboxes | `'checkbox'` | `<Checkbox accessibilityRole="checkbox">` |
| Switches | `'switch'` | Toggle elements |
| Alerts | `'alert'` | Toast notifications |
| Search | `'search'` | Search input containers |

```typescript
// ✅ CORRECT
<AnimatedPressable
  accessibilityRole="button"
  accessibilityLabel="Agregar al carrito"
  onPress={handleAdd}
>
  <Icon name="cart-plus" />
</AnimatedPressable>

// ✅ CORRECT: Header in list
<Text variant="h2" accessibilityRole="header">
  Productos destacados
</Text>
```

### R3: Provide `accessibilityHint` for Non-Obvious Actions

When the label alone doesn't convey what will happen, add a hint.

```typescript
// ✅ CORRECT: Hint explains the consequence
<AnimatedPressable
  accessibilityRole="button"
  accessibilityLabel="Eliminar producto"
  accessibilityHint="Se eliminará permanentemente este producto"
  onPress={handleDelete}
>
  <Icon name="trash" />
</AnimatedPressable>

// ✅ CORRECT: No hint needed — action is obvious from label
<Button
  accessibilityLabel="Guardar cambios"
  onPress={handleSave}
>
  Guardar
</Button>
```

### R4: Communicate State with `accessibilityState`

Dynamic elements must expose their current state.

```typescript
// ✅ CORRECT: Checkbox communicates checked state
<Checkbox
  accessibilityRole="checkbox"
  accessibilityLabel="Acepto los términos"
  accessibilityState={{ checked: isChecked }}
  value={isChecked}
  onChange={toggleCheck}
/>

// ✅ CORRECT: Disabled button communicates state
<Button
  accessibilityLabel="Enviar formulario"
  accessibilityState={{ disabled: !isValid }}
  disabled={!isValid}
  onPress={handleSubmit}
>
  Enviar
</Button>

// ✅ CORRECT: Expandable section
<AnimatedPressable
  accessibilityRole="button"
  accessibilityLabel="Detalles del producto"
  accessibilityState={{ expanded: isExpanded }}
  onPress={toggleExpand}
>
  <Text>Detalles</Text>
</AnimatedPressable>
```

### R5: Minimum Touch Target Size (44x44 pts)

All interactive elements must have a minimum touch area of 44x44 points per Apple HIG and Android accessibility guidelines.

```typescript
// ✅ CORRECT: Explicit minimum size
<AnimatedPressable
  style={{
    minWidth: moderateScale(44),
    minHeight: moderateScale(44),
    justifyContent: 'center',
    alignItems: 'center',
  }}
  accessibilityLabel="Cerrar"
  onPress={handleClose}
>
  <Icon name="close" size={moderateScale(20)} />
</AnimatedPressable>

// ✅ CORRECT: Using hitSlop for small visual elements
<AnimatedPressable
  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
  accessibilityLabel="Más opciones"
  onPress={handleOptions}
>
  <Icon name="dots-vertical" size={moderateScale(20)} />
</AnimatedPressable>

// ❌ INCORRECT: Touch target too small
<AnimatedPressable
  style={{ width: 24, height: 24 }}
  onPress={handleClose}
>
  <Icon name="close" size={24} />
</AnimatedPressable>
```

### R6: Color Contrast Ratios

Text and UI elements must meet WCAG 2.1 AA contrast requirements.

| Element | Minimum Ratio | Applies To |
|---------|--------------|------------|
| Normal text (< 18pt) | 4.5:1 | Body, caption, labels |
| Large text (≥ 18pt bold or ≥ 24pt) | 3:1 | Headers h1-h3 |
| UI components & icons | 3:1 | Buttons, icons, borders |

```typescript
// ✅ CORRECT: Use semantic theme colors (already contrast-validated)
const theme = useTheme();
<View style={{ backgroundColor: theme.colors.background }}>
  <Text variant="body" color="text">Contenido legible</Text>
</View>

// ❌ INCORRECT: Custom colors without contrast validation
<View style={{ backgroundColor: '#F5F5F5' }}>
  <Text style={{ color: '#C0C0C0' }}>Texto ilegible</Text>
</View>
```

**Guideline**: The project's theme system (`src/theme/colors.ts`) should maintain contrast-compliant color pairs. When adding new colors, verify contrast ratios using a tool like WebAIM Contrast Checker.

### R7: Group Related Elements for Screen Readers

Use `accessible={true}` to group related elements so screen readers announce them as one unit.

```typescript
// ✅ CORRECT: Card announced as single element
<View
  accessible={true}
  accessibilityLabel={`${product.name}, precio ${product.price} pesos`}
  accessibilityRole="button"
  accessibilityHint="Abre los detalles del producto"
>
  <Image source={{ uri: product.image }} />
  <Text variant="h4">{product.name}</Text>
  <Text variant="body">${product.price}</Text>
</View>

// ❌ INCORRECT: Each child announced separately (noisy)
<View>
  <Image source={{ uri: product.image }} />
  <Text variant="h4">{product.name}</Text>
  <Text variant="body">${product.price}</Text>
</View>
```

### R8: Hide Decorative Elements

Purely decorative images and icons must be hidden from screen readers.

```typescript
// ✅ CORRECT: Decorative image hidden
<Image
  source={require('./bg-pattern.png')}
  accessibilityElementsHidden={true}
  importantForAccessibility="no-hide-descendants"
/>

// ✅ CORRECT: Decorative icon next to text (text provides context)
<View style={styles.row}>
  <Icon
    name="calendar"
    importantForAccessibility="no"
    accessibilityElementsHidden={true}
  />
  <Text variant="body" accessibilityLabel={`Fecha: ${formattedDate}`}>
    {formattedDate}
  </Text>
</View>
```

### R9: Form Inputs Must Have Accessible Labels

All TextInput components must have an accessible label, either via `accessibilityLabel` or an associated visible label.

```typescript
// ✅ CORRECT: Using project's TextInput component (label prop provides a11y)
<TextInput
  label="Nombre del producto"
  accessibilityLabel="Nombre del producto"
  value={name}
  onChangeText={setName}
/>

// ✅ CORRECT: Error state communicated
<TextInput
  label="Email"
  accessibilityLabel="Email"
  accessibilityState={{ disabled: false }}
  error={errors.email?.message}
  accessibilityHint={errors.email ? `Error: ${errors.email.message}` : undefined}
  value={email}
  onChangeText={setEmail}
/>
```

### R10: Live Regions for Dynamic Content

Content that updates dynamically (toasts, loading states, errors) must use live regions.

```typescript
// ✅ CORRECT: Toast uses live region
<View
  accessibilityRole="alert"
  accessibilityLiveRegion="assertive"
>
  <Text>{toastMessage}</Text>
</View>

// ✅ CORRECT: Loading state uses polite live region
<View accessibilityLiveRegion="polite">
  {isLoading ? (
    <Text accessibilityLabel="Cargando contenido">Cargando...</Text>
  ) : (
    <Text>{content}</Text>
  )}
</View>
```

## Integration with Existing Components

The project's core components (`@components/core`) should be the primary building blocks. When extending them:

| Component | Built-in A11y | What to Add |
|-----------|--------------|-------------|
| `Button` | Role, label from text | `accessibilityHint` for non-obvious actions |
| `TextInput` | Label from `label` prop | Error hints, disabled state |
| `Checkbox` | Role, checked state | Label describing what's being checked |
| `Select` | Label from `label` prop | Hint describing available options |
| `Modal` | — | `accessibilityViewIsModal={true}`, focus management |
| `Toast` | — | `accessibilityRole="alert"`, `accessibilityLiveRegion` |
| `Card` | — | Group with `accessible={true}`, combined label |

## Verification Checklist

```bash
# 1. Interactive elements without accessibilityLabel
grep -rn "onPress\|onLongPress" src/modules/*/ui --include="*.tsx" | \
  xargs -I{} grep -L "accessibilityLabel"
# Review results for missing labels

# 2. Icon-only buttons (highest risk for missing labels)
grep -rn "<Icon" src/modules/*/ui --include="*.tsx" -B2 | \
  grep "Pressable\|TouchableOpacity"
# Each must have accessibilityLabel

# 3. Images without a11y handling
grep -rn "<Image" src/modules/*/ui --include="*.tsx" | \
  grep -v "accessibilityLabel\|accessibilityElementsHidden\|importantForAccessibility"
# Each must be labeled or hidden

# 4. Touch targets — look for small fixed sizes
grep -rn "width: [0-3][0-9]," src/modules/*/ui --include="*.tsx"
# Review if these are interactive elements
```

## References

- Apple HIG Accessibility: developer.apple.com/accessibility
- Android Accessibility: developer.android.com/guide/topics/ui/accessibility
- WCAG 2.1 AA: w3.org/WAI/WCAG21/quickref
- React Native Accessibility: reactnative.dev/docs/accessibility
