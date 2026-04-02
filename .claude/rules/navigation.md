# Navigation Rules

React Navigation with nested native stack navigators.

## Architecture

```
RootNavigator → PublicNavigator | PrivateNavigator
PrivateNavigator → ProductsNavigator, UsersNavigator, ...
```

## File Structure

```
src/navigation/
  routes/{entities}.routes.ts        # Enum + ParamList + ScreenProps
  stacks/{Entities}StackNavigator.tsx
  hooks/useNavigation.ts             # Typed hooks
```

## Golden Example: Routes File

```typescript
export enum ProductsRoutes {
  ProductList = 'ProductList',
  ProductDetail = 'ProductDetail',
  ProductForm = 'ProductForm',
}

export type ProductsStackParamList = {
  [ProductsRoutes.ProductList]: undefined;
  [ProductsRoutes.ProductDetail]: { productId: string };
  [ProductsRoutes.ProductForm]?: { product: Product };
};
```

## Registration Checklist

1. Create `routes/{entities}.routes.ts`
2. Create `stacks/{Entities}StackNavigator.tsx`
3. Register in `private.routes.ts` enum + ParamList
4. Export from `routes/index.ts`
5. Add screen in `PrivateStackNavigator.tsx`
6. Add hook in `useNavigation.ts`
