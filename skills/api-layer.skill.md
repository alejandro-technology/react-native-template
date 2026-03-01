# Skill: Capa de API y Networking

## 1. Metadata

-   **Nombre**: `api-infrastructure`
-   **Descripción**: Define cómo se estructuran las llamadas a servicios externos (HTTP, Firebase, etc.).
-   **Propósito**: Abstraer las implementaciones concretas para facilitar el cambio de proveedores y el testing.
-   **Categoría**: Arquitectura, Testing, Seguridad

## 2. Trigger

-   **Cuándo**: Al integrar un nuevo endpoint, configurar un cliente HTTP, o manejar respuestas de error.
-   **Contexto**: `src/modules/*/infrastructure/*.service.ts`, `src/network`.
-   **Observa**: Implementación de repositorios, manejo de errores, y configuración de clientes.

## 3. Responsabilidades

-   **Valida**: Que todas las llamadas externas pasen por un `Repository` definido en la capa de `Domain`.
-   **Recomienda**: Usar `Adapters` para transformar los DTOs de la API al modelo de dominio.
-   **Previene**: Llamadas directas `fetch/axios` en componentes. Exponer secretos o tokens en el código fuente.
-   **Optimiza**: El manejo de errores centralizado y la intercepción de peticiones (Auth Headers).

## 4. Reglas

### Patrón Repository

1.  **Definición (Domain)**:
    -   `interface ProductRepository { getProduct(id: string): Promise<Product>; }`.
    -   Retorna siempre entidades de dominio, nunca `AxiosResponse` o `DocumentSnapshot`.

2.  **Implementación (Infrastructure)**:
    -   `class ProductHttpService implements ProductRepository`.
    -   O `class ProductFirebaseService implements ProductRepository`.
    -   Usa el cliente `http` o `firebase` configurado globalmente.

3.  **Adaptadores (Domain/Infrastructure)**:
    -   Transforman datos "sucios" de la API a datos "limpios" de la App.
    -   Manejan fechas (`string` -> `Date`), nulos (`null` -> `undefined`), y nombres de campos (`user_id` -> `userId`).

### Manejo de Errores

-   Capturar errores de red/API en la capa de infraestructura.
-   Lanzar errores de dominio tipados (`NetworkError`, `AuthError`) que la UI pueda entender.
-   Nunca dejar que un error 500 crashee la app sin control.

## 5. Output Esperado

-   **Feedback**: "La función 'getUser' retorna directamente la respuesta de Axios. Debes extraer 'response.data' y mapearlo al modelo 'User' usando un adaptador."
-   **Severidad**: Alta (Arquitectura).
-   **Corrección**: Crear un adaptador y retornar la entidad limpia.

## 6. Ejemplo Práctico

### Antes (Incorrecto)

```tsx
// Service
export const getUser = async (id) => {
  return axios.get(`/users/${id}`); // ❌ Retorna AxiosResponse
};

// Component
const { data } = useQuery(['user'], () => getUser(1));
return <Text>{data?.data?.user_name}</Text>; // ❌ Acoplamiento a la estructura de la API
```

### Después (Correcto)

```tsx
// 1. Adapter
const toUser = (dto: UserDTO): User => ({
  id: dto.id.toString(),
  name: dto.user_name,
  createdAt: new Date(dto.created_at),
});

// 2. Service
export const getUser = async (id: string): Promise<User> => {
  try {
    const { data } = await http.get<UserDTO>(`/users/${id}`);
    return toUser(data); // ✅ Retorna Entidad Limpia
  } catch (error) {
    throw new NetworkError('Failed to fetch user', error);
  }
};

// 3. Component
const { data: user } = useUser(1);
return <Text>{user.name}</Text>; // ✅ Desacoplado
```
