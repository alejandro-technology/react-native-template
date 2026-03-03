---
name: error-handling
description: Enforce the centralized error handling strategy, error types, and user-facing error patterns. Use when implementing error flows, creating error messages, or reviewing error handling code.
---

# Error Handling Skill

Enforces the centralized error strategy across service, application, and UI layers.

## When to Use

- Implementing service error handling
- Creating user-facing error messages
- Reviewing error flow patterns
- Adding new error types

## Error Flow Architecture

```
Service Layer           Application Layer        UI Layer
──────────────         ──────────────────       ─────────
try/catch              instanceof Error check   React Query states
  ├─ manageAxiosError    ├─ throw result        ├─ isError
  └─ manageFirebaseError └─ return result       ├─ error.message
                                                └─ ErrorState component
```

## Service Layer: Return Errors, Never Throw

```typescript
// src/modules/network/domain/network.error.ts
export function manageAxiosError(error: unknown): Error {
  if (error instanceof AxiosError) {
    if (error.code?.includes('ERR_NETWORK')) {
      return new Error(AXIOS_MESSAGES.NETWORK_ERROR);
    }
    if (error.status === 400) {
      if (error.response?.data?.errors) {
        const e = new Error(JSON.stringify(error.response.data.errors));
        e.name = 'FormError';
        return e;
      }
      if (error.response?.data?.message?.includes('Duplicate identifier')) {
        const e = new Error(error.response.data.message);
        e.name = 'DuplicateIdentifierError';
        return e;
      }
    }
    // ...more cases
  }
  return new Error(AXIOS_MESSAGES.UNKNOWN_ERROR);
}
```

### Error Types

| Error Name | `error.name` | When |
|---|---|---|
| Generic | `'Error'` | Default fallback |
| Form validation | `'FormError'` | 400 with `errors` array |
| Duplicate | `'DuplicateIdentifierError'` | 400 with duplicate message |
| Network | `'Error'` | `ERR_NETWORK` code |
| Connection | `'Error'` | `ECONNREFUSED` code |

### Error Messages (Spanish)

```typescript
// src/modules/network/domain/network.messages.ts
export const AXIOS_MESSAGES = {
  NETWORK_ERROR: 'No pudimos conectar con el servidor. Revisa tu conexion a internet.',
  CONNECTION_REFUSED: 'El servicio no esta disponible en este momento.',
  UNKNOWN_ERROR: 'Ocurrio un error inesperado. Por favor, intentalo de nuevo.',
  BAD_REQUEST: 'Solicitud incorrecta. Por favor, verifica los datos ingresados.',
};
```

## Application Layer: Convert to Throws

```typescript
// Queries
queryFn: async () => {
  const result = await productService.getAll(filter);
  if (result instanceof Error) {
    throw result; // React Query catches this
  }
  return result;
},

// Mutations
mutationFn: async (data) => {
  const result = await productService.create(data);
  if (result instanceof Error) {
    throw result;
  }
  return result;
},
```

## UI Layer: State-Based Error Display

### List Screens

```typescript
if (isError) {
  return (
    <ErrorState
      title="Error al cargar"
      message={error?.message || 'No se pudieron cargar los productos'}
    />
  );
}
```

### Detail Screens

```typescript
if (isError) {
  return (
    <ErrorState
      title="Error al cargar"
      message={error?.message || 'No se pudo cargar el producto'}
      onRetry={goBack}
      retryLabel="Volver"
    />
  );
}
```

### Empty State

```typescript
if (!product) {
  return (
    <EmptyState
      title="Producto no encontrado"
      message="El producto que buscas no existe o fue eliminado"
      icon="icon"
      onAction={goBack}
      actionLabel="Volver"
    />
  );
}
```

## UI Guard Order

Every detail/list view MUST check states in this order:

```typescript
// 1. Loading first
if (isLoading) return <LoadingState message="Cargando..." />;

// 2. Error second
if (isError) return <ErrorState ... />;

// 3. Empty third
if (!data || data.length === 0) return <EmptyState ... />;

// 4. Success last (render data)
return <DataView data={data} />;
```

## Validation Rules

| Rule | Description |
|---|---|
| R1 | Services return `T \| Error`, never throw |
| R2 | HTTP errors use `manageAxiosError()` |
| R3 | Firebase errors use `manageFirebaseError()` |
| R4 | Application hooks check `instanceof Error` then `throw` |
| R5 | UI uses `isLoading` -> `isError` -> empty -> success order |
| R6 | Error messages are in Spanish |
| R7 | List error messages use plural ("los productos") |
| R8 | Detail error messages use singular ("el producto") |
| R9 | `ErrorState` on detail screens includes `onRetry={goBack}` |
| R10 | `EmptyState` on detail screens includes `onAction={goBack}` |
| R11 | Mutation success shows toast via `useAppStorage(s => s.toast).show()` |

## Anti-Patterns

```typescript
// WRONG: Throwing in service
async getAll(): Promise<Product[]> {
  const response = await axios.get('/products');
  return response.data; // Throws on error
}

// WRONG: try/catch in UI component
try {
  const data = await productService.getAll();
} catch (error) {
  setError(error.message);
}

// WRONG: English error messages
return new Error('Product not found');

// CORRECT: Spanish
return new Error('Producto no encontrado');

// WRONG: Missing error guard in UI
const { data } = useProducts();
return <ProductList data={data} />; // Crashes if data is undefined
```
