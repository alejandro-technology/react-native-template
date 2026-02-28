# Product Infrastructure - Dependency Injection

This module implements dependency injection for the Product service, allowing easy switching between different data providers.

## Architecture

```
infrastructure/
├── product.config.ts          # Configuration file (change provider here)
├── product.service.ts         # Factory that returns the configured provider
├── product.http.service.ts    # HTTP/REST API implementation (Axios)
└── product.firebase.service.ts # Firebase Firestore implementation
```

## Available Providers

### 1. HTTP Service (Axios)
- **File**: `product.http.service.ts`
- **Use case**: Production applications with REST API backend
- **Features**:
  - RESTful API calls using Axios
  - Search filtering via query parameters
  - Centralized error handling with `manageAxiosError`
  - Configured base URL from `API_ROUTES.ROOT`

### 2. Firebase Service
- **File**: `product.firebase.service.ts`
- **Use case**: Rapid prototyping, MVPs, serverless applications
- **Features**:
  - Direct Firestore integration
  - Client-side filtering for search
  - Real-time capabilities (not implemented but available)
  - Error handling with `manageFirebaseError`

## How to Switch Providers

Open `product.config.ts` and change the `PRODUCT_SERVICE_PROVIDER` constant:

```typescript
// For HTTP/REST API (recommended for production)
export const PRODUCT_SERVICE_PROVIDER: ProductServiceProvider = 'http';

// For Firebase Firestore
export const PRODUCT_SERVICE_PROVIDER: ProductServiceProvider = 'firebase';
```

**No other code changes are needed!** The application layer remains completely unchanged.

## API Endpoints (HTTP Provider)

When using the HTTP provider, ensure your backend implements these endpoints:

```
GET    /products           - Get all products (supports ?search=term)
GET    /products/:id       - Get product by ID
POST   /products           - Create new product
PUT    /products/:id       - Update product
DELETE /products/:id       - Delete product
```

### Expected Response Format

```typescript
// Single Product
{
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// Product List
ProductEntity[]
```

## Adding a New Provider

1. Create a new service file (e.g., `product.graphql.service.ts`)
2. Implement the `ProductRepository` interface
3. Export a singleton instance
4. Add the provider to `ProductServiceProvider` type in `product.config.ts`
5. Update the switch statement in `product.service.ts`

Example:

```typescript
// product.graphql.service.ts
import { ProductRepository } from '../domain/product.repository';

class ProductGraphQLService implements ProductRepository {
  // Implementation here
}

export default new ProductGraphQLService();

// product.config.ts
export type ProductServiceProvider = 'http' | 'firebase' | 'graphql';

// product.service.ts
switch (PRODUCT_SERVICE_PROVIDER) {
  case 'http':
    return productHttpService;
  case 'firebase':
    return productFirebaseService;
  case 'graphql':
    return productGraphQLService;
}
```

## Testing Different Providers

You can easily test both implementations by switching the provider:

1. Start with Firebase for rapid prototyping
2. Switch to HTTP when your backend is ready
3. No changes needed in UI components or React Query hooks

## Notes

- Both implementations return `T | Error` instead of throwing
- Mutations in the application layer convert errors to throws for React Query
- Search filtering is handled differently:
  - **HTTP**: Server-side via query parameters
  - **Firebase**: Client-side filtering after fetching all documents
