# Screen Patterns — Full Reference

> Load this file when you need a complete screen composition example.

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
