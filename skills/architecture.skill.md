# Skill: Arquitectura Modular de 4 Capas

## 1. Metadata

-   **Nombre**: `module-architecture`
-   **Descripción**: Define la estructura de módulos de la aplicación, separando las responsabilidades en 4 capas estrictas.
-   **Propósito**: Garantizar la escalabilidad y mantenibilidad al aislar la lógica de negocio de la UI y la infraestructura.
-   **Categoría**: Arquitectura, Calidad

## 2. Trigger

-   **Cuándo**: Al crear un nuevo módulo (Feature), refactorizar uno existente, o auditar la estructura de archivos.
-   **Contexto**: Carpetas dentro de `src/modules/*`.
-   **Observa**: Estructura de directorios y dependencias entre archivos.

## 3. Responsabilidades

-   **Valida**: Que cada módulo tenga las carpetas `application`, `domain`, `infrastructure`, `ui`.
-   **Recomienda**: Mover la lógica compleja a hooks personalizados en la capa de `application`.
-   **Previene**: Importaciones circulares entre capas. La UI no debe importar directamente de `infrastructure`.
-   **Optimiza**: La reutilización de lógica de negocio y la testabilidad.

## 4. Reglas

### Estructura Requerida

Cada módulo en `src/modules/<feature>` DEBE tener la siguiente estructura:

1.  **domain/** (Núcleo):
    *   `*.model.ts`: Tipos e interfaces de las entidades.
    *   `*.repository.ts`: Interfaces de los repositorios (contratos).
    *   `*.scheme.ts`: Esquemas de validación (Zod).
    *   **Regla**: NO debe tener dependencias de React ni de librerías de terceros (salvo utilidades puras como `zod` o `date-fns`).

2.  **infrastructure/** (Implementación):
    *   `*.service.ts`: Implementación concreta de los repositorios (API, Firebase, Storage).
    *   `*.adapter.ts`: Transformación de datos externos al modelo de dominio.
    *   **Regla**: Único lugar donde se permite importar `axios`, `firebase`, etc.

3.  **application/** (Casos de Uso):
    *   `*.queries.ts` / `*.mutations.ts`: Hooks de React Query que usan los repositorios.
    *   `*.hooks.ts`: Lógica de estado complejo o reglas de negocio que orquestan varios repositorios.
    *   **Regla**: Debe retornar datos listos para ser consumidos por la UI.

4.  **ui/** (Presentación):
    *   `components/`: Componentes específicos del módulo.
    *   `*View.tsx`: Pantallas principales.
    *   **Regla**: Solo debe importar de `application` y `domain`. NUNCA de `infrastructure`.

### Anti-patrones Prohibidos

-   ❌ Importar `axios` o `firebase` directamente en un componente UI.
-   ❌ Definir tipos de datos en la capa de UI.
-   ❌ Lógica de negocio compleja dentro de `useEffect` en la vista.
-   ❌ "God Objects" o servicios monolíticos que hacen todo.

## 5. Output Esperado

-   **Feedback**: "La estructura del módulo 'auth' viola la separación de capas. El archivo 'LoginView.tsx' está importando 'firebase-auth.service.ts' directamente."
-   **Severidad**: Alta (Error Arquitectónico).
-   **Corrección**: Mover la llamada a Firebase a un repositorio en `infrastructure`, crear un hook en `application` que lo use, y consumir ese hook en la vista.

## 6. Ejemplo Práctico

### Antes (Incorrecto)

```tsx
// src/modules/users/ui/UserList.tsx
import { useEffect, useState } from 'react';
import axios from 'axios'; // ❌ Violación: Infraestructura en UI

export const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/users').then(res => setUsers(res.data)); // ❌ Lógica en UI
  }, []);

  return <View>...</View>;
};
```

### Después (Correcto)

```tsx
// 1. Domain: src/modules/users/domain/user.repository.ts
export interface UserRepository {
  getUsers(): Promise<User[]>;
}

// 2. Infrastructure: src/modules/users/infrastructure/user.http.service.ts
import { http } from '@/network';
export const userHttpService: UserRepository = {
  getUsers: async () => {
    const { data } = await http.get('/users');
    return data.map(userAdapter.toDomain);
  }
};

// 3. Application: src/modules/users/application/user.queries.ts
import { useQuery } from '@tanstack/react-query';
import { userHttpService } from '../infrastructure/user.http.service';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userHttpService.getUsers
  });
};

// 4. UI: src/modules/users/ui/UserList.tsx
import { useUsers } from '../../application/user.queries';

export const UserList = () => {
  const { data: users, isLoading } = useUsers(); // ✅ Limpio y desacoplado

  if (isLoading) return <Loading />;
  return <FlatList data={users} ... />;
};
```
