# Infrastructure Layer Rules

The infrastructure layer provides concrete service implementations switching on `CONFIG.SERVICE_PROVIDER`.

## Core Mandates

1. **Service Factory**: Single entry point that switches between HTTP, Firebase, Mock.
2. **Error Handling**: Services return `Error`, never throw. Use `manageAxiosError()` or `manageFirebaseError()`.
3. **Singleton Export**: `export default createService()`.

## File Structure

```
src/modules/{module}/infrastructure/
  {entity}.service.ts          # Factory (switches on CONFIG)
  {entity}.http.service.ts     # Axios implementation
  {entity}.firebase.service.ts # Firestore implementation
  {entity}.mock.service.ts     # In-memory mock
```

## Golden Example: Service Factory

```typescript
function createProductService(): ProductRepository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':
      return productHttpService;
    case 'firebase':
      return productFirebaseService;
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
    const response = await axiosService.get<Product[]>(API_ROUTES.PRODUCTS, { params });
    return response.data;
  } catch (error) {
    return manageAxiosError(error);
  }
}
```
