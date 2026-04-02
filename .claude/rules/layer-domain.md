# Domain Layer Rules

The domain layer contains enterprise business rules, entity models, and abstract repository contracts.

## Core Mandates

1. **No External Dependencies**: MUST NOT depend on any other layer (infrastructure, application, UI). Only pure utility libraries (e.g., `yup`).
2. **Service Return Type**: Methods return `Promise<T | Error>` — never throw.

## File Structure

```
src/modules/{module}/domain/
  {entity}.model.ts       # Entity, Create/Update payloads, Filter
  {entity}.repository.ts  # Repository interface contract
  {entity}.scheme.ts      # Yup schema + InferType for FormData
  {entity}.adapter.ts     # Form-to-payload converters
```

## Golden Example: Repository Method Signature

```typescript
interface ProductRepository {
  getAll(filter?: ProductFilter): Promise<Product[] | Error>;
  getById(id: string): Promise<Product | Error>;
  create(data: CreateProductPayload): Promise<Product | Error>;
  update(id: string, data: UpdateProductPayload): Promise<Product | Error>;
  delete(id: string): Promise<void | Error>;
}
```

## Naming

- Interfaces: `Product`, `CreateProductPayload`, `UpdateProductPayload`, `ProductFilter`
- Functions: `productSchema`, `productFormToPayloadAdapter`
