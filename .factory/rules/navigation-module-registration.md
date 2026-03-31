---
category: navigation
priority: high
tags: [navigation, routes, stacks, typed-routes]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de Registro de Navegación por Módulo

Todo módulo con pantallas propias debe registrarse completamente en la navegación tipada del proyecto.

---

## Regla 1: Cada módulo define sus rutas y tipos en `src/navigation/routes/`

**SIEMPRE**: crear un archivo `{feature}.routes.ts` con:

- `enum {Feature}sRoutes`
- `{Feature}sStackParamList`
- `{Feature}sScreenProps<T>`

```typescript
export enum ProductsRoutes {
  ProductList = 'ProductList',
  ProductDetail = 'ProductDetail',
  ProductForm = 'ProductForm',
}
```

---

## Regla 2: Registrar stack, hooks y parent navigator

**SIEMPRE** completar estos pasos:

1. crear `src/navigation/stacks/{Feature}sStackNavigator.tsx`
2. exportar rutas desde `src/navigation/routes/index.ts`
3. agregar `useNavigation{Feature}s` en `src/navigation/hooks/useNavigation.ts`
4. registrar el navigator en `Public` o `Private`

### Importante

- las screens deben usar `ScreenProps` tipados
- el hook de navegación del módulo debe usar su `StackParamList`
- no registrar rutas sueltas sin stack tipado

### Cómo verificar

```bash
# El módulo debe tener archivo de rutas
ls src/navigation/routes/*routes.ts

# El módulo debe tener hook de navegación
grep -r "useNavigationProducts\\|useNavigationUsers" src/navigation/hooks/*.ts
```

**Referencias**:
- `src/navigation/routes/products.routes.ts`
- `src/navigation/stacks/ProductsStackNavigator.tsx`
- `src/navigation/hooks/useNavigation.ts`
- `src/navigation/stacks/PrivateStackNavigator.tsx`
