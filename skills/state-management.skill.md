# Skill: Estrategia de Gestión de Estado

## 1. Metadata

-   **Nombre**: `state-management-strategy`
-   **Descripción**: Define cómo y dónde debe almacenarse el estado de la aplicación.
-   **Propósito**: Evitar la complejidad accidental, problemas de sincronización y código "spaghetti".
-   **Categoría**: Arquitectura, Performance, DX

## 2. Trigger

-   **Cuándo**: Al añadir lógica de estado a componentes, crear stores, o integrar APIs.
-   **Contexto**: Hooks personalizados, componentes, y stores globales.
-   **Observa**: Uso de `useState`, `useEffect`, `useContext`, `zustand`, `react-query`.

## 3. Responsabilidades

-   **Valida**: La separación correcta entre Estado del Servidor (Server State) y Estado del Cliente (Client State).
-   **Recomienda**: Usar `react-query` para datos asíncronos y `zustand` para UI global.
-   **Previene**: Sincronización manual de datos (`useEffect` para fetch), props drilling excesivo, y estado global innecesario.
-   **Optimiza**: El re-renderizado mediante selectores en Zustand y claves de query estables.

## 4. Reglas

### Clasificación de Estado

1.  **Server State (Datos de API/DB)**:
    -   **Herramienta**: `TanStack Query` (React Query).
    -   **Regla**: NUNCA guardar datos de la API en Redux/Zustand/Context manualmente. Dejar que RQ maneje caché, reintentos y invalidación.
    -   **Ubicación**: `src/modules/*/application/*.queries.ts`.

2.  **Client Global State (UI Transversal)**:
    -   **Herramienta**: `Zustand`.
    -   **Casos de uso**: Tema actual, Usuario autenticado (sesión), Carrito de compras, Modales globales.
    -   **Ubicación**: `src/modules/*/infrastructure/*.storage.ts` o `src/store`.

3.  **Form State (Formularios)**:
    -   **Herramienta**: `React Hook Form` + `Zod`.
    -   **Regla**: Componentes controlados solo cuando sea estrictamente necesario. Validaciones en esquema Zod.
    -   **Ubicación**: `src/modules/*/ui/components/*Form.tsx`.

4.  **Local UI State (Efímero)**:
    -   **Herramienta**: `useState`, `useReducer`.
    -   **Casos de uso**: Toggle de acordeón, input de búsqueda temporal, pestañas activas.

### Anti-patrones Prohibidos

-   ❌ Usar `useEffect` para llamar a la API y setear un `useState`. (Usar `useQuery`).
-   ❌ Guardar todo en un store global "por si acaso".
-   ❌ Mutar el estado directamente (en React/Zustand sin Immer).
-   ❌ Prop drilling de más de 3 niveles para pasar estado y callbacks.

## 5. Output Esperado

-   **Feedback**: "Estás usando `useEffect` para cargar la lista de usuarios. Refactoriza usando `useQuery` en la capa de aplicación para manejar caché y estados de carga automáticamente."
-   **Severidad**: Alta (Performance/Mantenibilidad).
-   **Corrección**: Implementar custom hook con `useQuery`.

## 6. Ejemplo Práctico

### Antes (Incorrecto)

```tsx
// src/modules/products/ui/ProductList.tsx
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;
  return <List data={products} />;
};
```

### Después (Correcto)

```tsx
// 1. Application Layer: src/modules/products/application/product.queries.ts
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: productRepository.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
};

// 2. UI Layer
const ProductList = () => {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState />;
  
  return <List data={products} />;
};
```
