# UI Layer Rules

The UI layer contains screens and screen-specific components.

## Core Mandates

1. **Screen Naming**:
   - CRUD modules: `{Entities}ListView`, `{Entity}DetailView`, `{Entity}FormView`
   - Non-CRUD modules: semantic names ending in `View` such as `SignInView`, `LandingView`, `DynamicListView`
2. **State Handling**: Use `LoadingState`, `ErrorState`, and `EmptyState` from `@components/layout` when the screen or screen component depends on async data.
3. **Lists**: Use `FlashList` from `@shopify/flash-list`.
4. **Forms**: Use `react-hook-form` with `yupResolver` for real form flows.
5. **Create Navigation from CRUD ListView**: When a CRUD list screen needs navigation to `{Entity}FormView`, there are two valid patterns:
   - Header action icon: `<Header onPress={onAdd{Entity}} pressIcon="plus" />`
   - Floating Action Button: `<RootLayout fab={{ icon: 'plus', onPress: onAdd{Entity} }} />`

## File Structure

```
src/modules/{module}/ui/
  # CRUD screens
  {Entities}ListView.tsx
  {Entity}DetailView.tsx
  {Entity}FormView.tsx
  components/
    {Entity}List.tsx
    {Entity}Item.tsx
    {Entity}Form.tsx
    {Entity}Detail.tsx

  # Non-CRUD screens
  SignInView.tsx
  SignUpView.tsx
  LandingView.tsx
  DynamicListView.tsx
  providers/
```

Use the subset that makes sense for the module. A module does not need to implement list/detail/form just to satisfy the folder convention.

## Golden Example: CRUD ListView Structure

```typescript
// Variant A: FAB in RootLayout (Products)
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

// Variant B: Header action icon (Users)
export function UsersListView() {
  const { navigate } = useNavigationUsers();
  const onAddUser = () => navigate(UsersRoutes.UserForm);

  return (
    <RootLayout scroll={false} toolbar={false}>
      <Header
        title="Usuarios"
        onPress={onAddUser}
        pressIcon="plus"
        searchbar="users"
      />
      <UserList />
    </RootLayout>
  );
}
```

## Golden Example: CRUD DetailView Structure

`{Entity}DetailView` is layout-only — it receives the route param and delegates everything to `{Entity}Detail`.

```typescript
export function ProductDetailView({
  route: {
    params: { productId },
  },
}: ProductsScreenProps<ProductsRoutes.ProductDetail>) {
  return (
    <RootLayout padding="md" title="Detalle de Producto">
      <ProductDetail productId={productId} />
    </RootLayout>
  );
}
```

## Golden Example: CRUD Detail Component

`{Entity}Detail` owns data fetching, loading/error/empty states, and all actions (edit, delete).

```typescript
export function ProductDetail({ productId }: { productId: string }) {
  const { goBack, navigate } = useNavigationProducts();
  const { data: product, isLoading, isError, error } = useProduct(productId);
  const { mutateAsync: deleteProductAsync } = useProductDelete();
  const { open } = useAppStorage(state => state.modal);

  function handleEdit() {
    product && navigate(ProductsRoutes.ProductForm, { product });
  }

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
  if (!product) return <ProductDetailEmpty onBack={goBack} />;

  return <View style={styles.content}>{/* cards + action buttons */}</View>;
}
```

## Golden Example: Non-CRUD View

Non-CRUD screens can orchestrate authentication, demos, source selection, or integrations without forcing a list/detail/form split.

```typescript
export function SignInView() {
  return (
    <RootLayout padding="lg" title="Iniciar Sesión">
      <SignInForm />
    </RootLayout>
  );
}
```

## Golden Example: List State Pattern

```typescript
if (isLoading) return <LoadingState />;
if (error) return <ErrorState message={error.message} />;
if (!data?.length) return <EmptyState />;
return <FlashList data={data} renderItem={...} />;
```
