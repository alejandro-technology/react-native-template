# Application Layer Rules

The application layer orchestrates domain use cases with React Query, Zustand, and offline support.

## Core Mandates

1. **Queries**: Use `QUERY_KEYS`, check `getIsConnected()` for offline fallback, use `placeholderData` from storage.
2. **Mutations**: Check connectivity before server call, sync local storage on success, show toast, invalidate queries.
3. **Storage**: Zustand with MMKV persistence, handle Date rehydration.

## File Structure

```
src/modules/{module}/application/
  {entities}.storage.ts   # Zustand store with MMKV
  {entity}.queries.ts     # useQuery hooks with offline fallback
  {entity}.mutations.ts   # useMutation hooks with toast
  {module}.hooks.ts       # Optional utility hooks
```

## Golden Example: Query with Offline Fallback

```typescript
export function useProducts(filter?: ProductFilter) {
  const getProducts = useProductsStorage.getState().getProducts;
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS(filter?.searchText),
    queryFn: async () => {
      if (!getIsConnected()) return getProducts(filter);
      const result = await productService.getAll(filter);
      if (result instanceof Error) throw result;
      return result;
    },
    placeholderData: () => getProducts(filter),
  });
}
```

## Golden Example: Mutation Pattern

```typescript
const result = await productService.create(payload);
if (result instanceof Error) throw result;
addProduct(result); // sync local storage
```
