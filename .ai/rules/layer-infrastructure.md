# Infrastructure Layer Rules

The infrastructure layer provides concrete service implementations that switch on `CONFIG.SERVICE_PROVIDER` when a module supports multiple backends.

## Core Mandates

1. **Service Factory**: Expose a single entry point that switches between the implementations that apply to the module. The template supports `http`, `firebase`, `supabase`, and `mock`, but a module only implements the providers it actually needs.
2. **Error Handling**: Services return `Error`, never throw intentionally. Use the shared error mappers for the backend in use (`manageAxiosError()`, `manageFirebaseError()`, or an equivalent module-specific mapper).
3. **Singleton Export**: Export the selected implementation as the module singleton: `export default createService()`.
4. **Provider Scope**: Do not force provider parity when it adds no value. If a module does not support a provider, omit that implementation and keep the factory aligned with the supported set.

## File Structure

```
src/modules/{module}/infrastructure/
  {entity}.service.ts           # Factory (switches on CONFIG when applicable)
  {entity}.http.service.ts      # Axios implementation (optional)
  {entity}.firebase.service.ts  # Firestore implementation (optional)
  {entity}.supabase.service.ts  # Supabase implementation (optional)
  {entity}.mock.service.ts      # In-memory mock (optional)
```

Provider files are optional. Keep only the implementations that make sense for the module contract.

## Golden Example: Service Factory

```typescript
function createProductService(): ProductRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return productHttpService;
    case 'firebase':
      return productFirebaseService;
    case 'supabase':
      return productSupabaseService;
    case 'mock':
      return productMockService;
    default:
      throw new Error(`Unknown provider: ${CONFIG.SERVICE_PROVIDER}`);
  }
}

export default createProductService();
```

## Golden Example: HTTP Method

```typescript
async getAll(filter?: ProductFilter): Promise<Product[] | Error> {
  try {
    const response = await axiosService.get<Product[]>(API_ROUTES.PRODUCTS, {
      params,
    });
    return response.data;
  } catch (error) {
    return manageAxiosError(error);
  }
}
```

## Do Not

- Do not add provider files that the module cannot actually support.
- Do not duplicate transport-level error parsing in feature services.
- Do not bypass the factory with ad-hoc imports from UI or application code.
