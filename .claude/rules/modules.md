---
alwaysApply: true
description: CRUD module blueprint and service patterns. Use this as the canonical reference when creating or modifying feature modules.
---

# CRUD Module Blueprint

Every feature module follows an identical structure. Replace `{entity}` with the entity name (e.g., product, user).

## File Structure

```
modules/{entities}/
├── domain/
│   ├── {entity}.model.ts        # Entity, CreatePayload, UpdatePayload, Filter
│   ├── {entity}.repository.ts   # Interface with 5 CRUD methods
│   ├── {entity}.scheme.ts       # Zod schema + inferred FormData type
│   ├── {entity}.adapter.ts      # formToPayload + entityAdapter functions
│   └── {entity}.utils.ts        # (optional) Domain-specific helpers
├── infrastructure/
│   ├── {entity}.service.ts      # Factory → returns configured provider singleton
│   ├── {entity}.http.service.ts # Axios implementation of repository
│   └── {entity}.firebase.service.ts # Firestore implementation of repository
├── application/
│   ├── {entity}.queries.ts      # useEntities(filter?, enabled) + useEntity(id, enabled)
│   └── {entity}.mutations.ts    # useEntityCreate + useEntityUpdate + useEntityDelete
└── ui/
    ├── {Entities}ListView.tsx    # Search + debounce + Header + List
    ├── {Entity}DetailView.tsx    # Detail card + Edit/Delete buttons + states
    ├── {Entity}FormView.tsx      # Create/Edit orchestrator with adapter
    └── components/
        ├── {Entity}Form.tsx      # react-hook-form + Zod + TextInputs
        ├── {Entity}Item.tsx      # Card that navigates to detail (single responsibility)
        └── {Entity}List.tsx      # FlatList + query hook + loading/error/empty states
```

## Domain Layer

### model.ts
```typescript
export interface {Entity}Entity {
  id: string;
  // entity-specific fields
  createdAt: string;
  updatedAt: string;
}
export interface Create{Entity}Payload { /* required fields */ }
export interface Update{Entity}Payload { /* all optional */ }
export interface {Entity}Filter { searchText?: string; }
```

### repository.ts — 5 methods, all return `T | Error`
```typescript
export interface {Entity}Repository {
  getAll(filter?: {Entity}Filter): Promise<{Entity}Entity[] | Error>;
  getById(id: string): Promise<{Entity}Entity | Error>;
  create(data: Create{Entity}Payload): Promise<{Entity}Entity | Error>;
  update(id: string, data: Update{Entity}Payload): Promise<{Entity}Entity | Error>;
  delete(id: string): Promise<void | Error>;
}
```

### scheme.ts — Zod validation
- Error messages in Spanish, string format: `.min(1, 'message')`
- `.max()` for all string fields, `.optional()` for optional fields
- `z.coerce.TYPE()` when form data needs conversion
- Export: `type {Entity}FormData = z.infer<typeof {entity}Schema>`

### adapter.ts — Two functions
- `{entity}FormToPayloadAdapter(form) → Create{Entity}Payload`
- `{entity}EntityAdapter(data) → {Entity}Entity`

## Infrastructure Layer

### Service Factory (`{entity}.service.ts`)
Reads `CONFIG.SERVICE_PROVIDER` from `src/config/config.ts` and returns the matching implementation as a singleton.

```typescript
import { CONFIG } from '@config/config';
function create{Entity}Service(): {Entity}Repository {
  switch (CONFIG.SERVICE_PROVIDER) {
    case 'http':    return {entity}HttpService;
    case 'firebase': return {entity}FirebaseService;
    default: throw new Error(`Unknown provider: ${CONFIG.SERVICE_PROVIDER}`);
  }
}
export default create{Entity}Service();
```

### Switching Providers
Change one value in `src/config/config.ts`:
```typescript
export const CONFIG: Config = { SERVICE_PROVIDER: 'http' };   // or 'firebase'
```
No other code changes needed. UI and application layers remain untouched.

### Adding a New Provider
1. Create `{entity}.{provider}.service.ts` implementing `{Entity}Repository`
2. Export singleton via factory: `export default create{Entity}{Provider}Service()`
3. Add provider name to `ServiceProvider` type in `src/config/config.ts`
4. Add case to switch in `{entity}.service.ts`

### HTTP Service Pattern
- Uses `axiosService` from `@modules/network/infrastructure/axios.service`
- Endpoints: `API_ROUTES.{ENTITIES}` (configured in `src/config/api.routes.ts`)
- Search: server-side via `{ params: { search: searchText } }`
- Errors: `manageAxiosError(error)` returns typed `Error`

### Firebase Service Pattern
- Uses `@react-native-firebase/firestore`
- Collection: `COLLECTIONS.{ENTITIES}` (configured in `src/config/collections.routes.ts`)
- Search: client-side filtering after fetching all documents
- Timestamps: sets `createdAt`/`updatedAt` as ISO strings
- Errors: `manageFirebaseError(error)` returns typed `Error`

### API Endpoint Convention (HTTP)
```
GET    /{entities}           # List (supports ?search=term)
GET    /{entities}/:id       # Detail
POST   /{entities}           # Create
PUT    /{entities}/:id       # Update
DELETE /{entities}/:id       # Delete
```
Response: `{Entity}Entity` or `{Entity}Entity[]`. Always includes `id`, `createdAt`, `updatedAt`.

## Application Layer

### queries.ts
```typescript
useEntities(filter?, enabled)  → queryKey: ['{entities}', 'list', searchText]
useEntity(id, enabled)         → queryKey: ['{entities}', 'detail', id]
```
Both convert `instanceof Error` to `throw` for React Query.

### mutations.ts
Each hook: `useQueryClient()` + `useAppStorage(s => s.toast)` for success feedback.
```typescript
useEntityCreate()  → invalidates ['{entities}'], toast "{Entidad} creado/a exitosamente"
useEntityUpdate()  → invalidates ['{entities}'] + ['{entities}', 'detail', id], toast "{Entidad} actualizado/a exitosamente"
useEntityDelete()  → invalidates ['{entities}'], toast "{Entidad} eliminado/a exitosamente"
```
All toasts: `type: 'success'`, `position: 'bottom'`.

## UI Layer

### ListView — search + debounce + header + list component
### DetailView — query + delete mutation + modal + edit/delete buttons + loading/error/empty guards
### FormView — create/update mutations + adapter + goBack on submit
### Form — react-hook-form + zodResolver + TextInputs + submit button
### Item — Card that navigates to detail on press (no mutations, no action buttons)
### List — FlatList + query hook + ItemSeparatorComponent + keyboard handling

## Navigation (per module)

Required files in `src/navigation/`:
1. `routes/{entities}.routes.ts` — enum + ParamList + ScreenProps type
2. `stacks/{Entities}StackNavigator.tsx` — 3 screens (List, Detail, Form)
3. `hooks/useNavigation.ts` — add `useNavigation{Entities}` typed hook
4. Register stack in `RootNavigator.tsx` and `RootStackParamList`
