# UI Layer Rules

The UI layer contains screens and screen-specific components.

## Core Mandates

1. **Screen Naming**: `{Entities}ListView`, `{Entity}DetailView`, `{Entity}FormView`
2. **State Handling**: Use `LoadingState`, `ErrorState`, `EmptyState` from `@components/layout`
3. **Lists**: Use `FlashList` from `@shopify/flash-list`
4. **Forms**: Use `react-hook-form` with `yupResolver`
5. **Create Navigation from ListView**: There are two valid patterns to open `{Entity}FormView` from `{Entities}ListView`:
   - Header action icon: `<Header onPress={onAdd{Entity}} pressIcon="plus" />`
   - Floating Action Button: `<RootLayout fab={{ icon: 'plus', onPress: onAdd{Entity} }} />`

## File Structure

```
src/modules/{module}/ui/
  {Entities}ListView.tsx    # List screen with search
  {Entity}DetailView.tsx    # Detail screen (layout only)
  {Entity}FormView.tsx      # Create/Edit form
  components/
    {Entity}List.tsx        # FlashList container
    {Entity}Item.tsx        # Single item row
    {Entity}Form.tsx        # Form fields
    {Entity}Detail.tsx      # Detail content + data fetching
```

## Golden Example: ListView Structure

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

## Golden Example: DetailView Structure

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

## Golden Example: Detail Component

`{Entity}Detail` owns data fetching, loading/error/empty states, and all actions (edit, delete).

```typescript
export function ProductDetail({ productId }: { productId: string }) {
  const { goBack, navigate } = useNavigationProducts();
  const { data: product, isLoading, isError, error } = useProduct(productId);
  const { mutateAsync: deleteProductAsync } = useProductDelete();
  const { open, close } = useAppStorage(state => state.modal);

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

export function ProductDetailEmpty({ onBack }: { onBack: () => void }) {
  return (
    <EmptyState
      title="Producto no encontrado"
      message="El producto que buscas no existe o fue eliminado"
      icon={<Icon name="package" size={42} />}
      onAction={onBack}
      actionLabel="Volver"
    />
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
