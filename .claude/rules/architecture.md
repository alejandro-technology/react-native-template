---
category: architecture
priority: critical
tags: [clean-architecture, layer-boundaries, error-handling]
enforcedBy: [.ai/skills/enforcement/architecture, .ai/skills/enforcement/error-handling]
---

# Reglas Fundamentales de Arquitectura

Estas son las 2 reglas arquitectónicas que **SIEMPRE** deben seguirse en este proyecto.

---

## Regla 1: Clean Architecture con 4 Capas Obligatorias

**SIEMPRE**: Todo módulo de features debe tener exactamente 4 capas con dependencias unidireccionales hacia adentro.

### Estructura Obligatoria

```
src/modules/{feature}/
├── domain/         # Capa 1: Lógica de negocio (TypeScript puro)
├── infrastructure/ # Capa 2: Servicios externos (HTTP/Firebase)
├── application/    # Capa 3: React Query hooks
└── ui/             # Capa 4: Vistas y componentes
```

### Flujo de Dependencias

```
UI → Application → Infrastructure → Domain
```

### Restricciones Estrictas por Capa

| Capa               | ✅ PUEDE importar de      | ❌ NUNCA importar de               |
| ------------------ | ------------------------- | ---------------------------------- |
| **domain**         | Nada (TypeScript puro)    | react, react-native, axios, @tanstack |
| **infrastructure** | domain                    | application, ui                    |
| **application**    | domain, infrastructure    | ui                                 |
| **ui**             | application, domain (tipos) | infrastructure                     |

### Ejemplo Correcto vs Incorrecto

```typescript
// ❌ INCORRECTO: UI importando de infrastructure
// En src/modules/products/ui/ProductsListView.tsx
import productService from '../infrastructure/product.service';

// ✅ CORRECTO: UI importa de application
// En src/modules/products/ui/ProductsListView.tsx
import { useProducts } from '../application/product.queries';
```

```typescript
// ❌ INCORRECTO: Domain importando React
// En src/modules/products/domain/product.model.ts
import { useState } from 'react';

// ✅ CORRECTO: Domain es TypeScript puro
// En src/modules/products/domain/product.model.ts
export interface ProductEntity {
  id: string;
  name: string;
  price: number;
}
```

### Cómo Verificar

```bash
# 1. Verificar que domain NO importa React/frameworks
grep -r "import.*from 'react'" src/modules/*/domain/
# Debe retornar: 0 resultados

# 2. Verificar que UI NO importa de infrastructure
grep -r "from.*infrastructure" src/modules/*/ui/ --include="*.tsx"
# Debe retornar: 0 resultados (excluyendo comentarios)

# 3. Verificar estructura de 4 capas en cada módulo
find src/modules -type d -maxdepth 2
# Cada módulo debe tener: domain/, infrastructure/, application/, ui/
```

**Referencias**: Ver `.ai/skills/enforcement/architecture/skill.md` (reglas R1-R6)

---

## Regla 2: Patrón T | Error (Sin Throws en Servicios)

**SIEMPRE**: Los servicios retornan `Promise<T | Error>`, NUNCA lanzan excepciones. Las mutaciones convierten Error en throw para React Query.

### Patrón en Infrastructure

```typescript
// ✅ CORRECTO: Servicio retorna Error, NO lanza excepción
// En src/modules/users/infrastructure/user.http.service.ts
async getById(id: string): Promise<UserEntity | Error> {
  try {
    const response = await axiosService.get<UserEntity>(`/users/${id}`);
    return response.data;
  } catch (error) {
    return manageAxiosError(error); // Retorna Error, NO throw
  }
}
```

```typescript
// ❌ INCORRECTO: Servicio lanzando excepción
async getById(id: string): Promise<UserEntity> {
  const response = await axiosService.get<UserEntity>(`/users/${id}`);
  return response.data; // Si falla, lanza excepción (MAL)
}
```

### Patrón en Application

```typescript
// ✅ CORRECTO: Mutation convierte Error en throw + toast + invalidación
// En src/modules/users/application/user.mutations.ts
export function useUserCreate() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);
  return useMutation({
    mutationFn: async (form: UserFormData) => {
      const payload = userFormToPayloadAdapter(form);
      const result = await userService.create(payload);
      if (result instanceof Error) {
        throw result; // Convertir para React Query
      }
      return result;
    },
    onSuccess: () => {
      show({ message: 'Usuario creado exitosamente', type: 'success' });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS() });
    },
    onError: (error: Error) => {
      show({ message: error.message, type: 'error' });
    },
  });
}
```

**Nota**: El adapter (`userFormToPayloadAdapter`) se llama en la capa de application (dentro de `mutationFn`), NO en la capa de UI. El FormView pasa `FormData` directamente a la mutation.

### Por Qué Este Patrón

- **Infrastructure**: Maneja errores sin excepciones → código predecible y testeable
- **Application**: Convierte a throws → React Query maneja estado de error automáticamente
- **UI**: Recibe estado de error consistente → muestra ErrorState cuando `isError === true`

### Cómo Verificar

```bash
# 1. Servicios NO deben tener throw (dentro de métodos async)
grep "throw" src/modules/*/infrastructure/*.service.ts
# Debe retornar: Solo en factory (línea "Unknown provider"), no en métodos

# 2. Mutations DEBEN convertir Error en throw
grep "instanceof Error" src/modules/*/application/*.mutations.ts
# Debe retornar: Múltiples matches (uno por mutation)
```

**Referencias**:
- Servicio ejemplo: `src/modules/users/infrastructure/user.http.service.ts` (líneas 13-70)
- Mutation ejemplo: `src/modules/users/application/user.mutations.ts`
- Ver `.ai/skills/enforcement/error-handling/skill.md` para detalles completos
