# Manifesto de Habilidades del Agente (Agent Skills Manifest)

Este documento define la filosofía, principios y reglas operativas para el desarrollo de aplicaciones React Native utilizando este template. Estas "skills" transforman el repositorio en un framework opinionado que guía al desarrollador y al agente de IA para mantener la calidad, escalabilidad y consistencia del proyecto.

## Filosofía del Template

1.  **Escalabilidad Modular**: La arquitectura está diseñada para crecer horizontalmente mediante módulos independientes (Features) que encapsulan su propia lógica de dominio, aplicación, infraestructura y UI.
2.  **Separación de Responsabilidades**: Cada capa tiene un propósito único y reglas estrictas de comunicación. La UI no debe conocer la implementación de la API; el Dominio no debe conocer a React.
3.  **Tipado Estricto (TypeScript First)**: No se permite `any`. Todo debe estar tipado, desde las respuestas de la API hasta los props de los componentes.
4.  **Composición sobre Herencia**: Se prefieren componentes pequeños y compuestables sobre grandes componentes monolíticos con múltiples props booleanos.
5.  **Estado Predictible**: El estado del servidor (Server State) pertenece a React Query. El estado global de la UI (Client State) pertenece a Zustand. El estado local pertenece a `useState`.

## Principios de Diseño

*   **Atomic Design Adaptado**: Componentes divididos en `core` (átomos/moléculas genéricas) y `modules/*/ui/components` (organismos específicos del dominio).
*   **Theming First**: No se hardcodean colores ni tamaños. Todo debe provenir de los tokens del tema (`src/theme`).
*   **Repository Pattern**: La capa de infraestructura debe ser intercambiable (ej. Firebase <-> REST) sin afectar al resto de la aplicación.

## Reglas de Contribución

1.  **Nuevas Features**: Deben seguir estrictamente la estructura de carpetas de 4 capas.
2.  **Estilos**: Usar siempre `StyleSheet.create` o los hooks del tema. Evitar estilos en línea para performance.
3.  **Testing**: Cada módulo crítico (Dominio/Aplicación) debe tener tests unitarios. Las pantallas complejas deben tener tests de integración.

## Modo de Uso de las Skills

Estas skills están diseñadas para ser consumidas por agentes de IA (como Trae) para auditar, refactorizar y generar código.

1.  **Auditoría**: Ejecuta la skill correspondiente para verificar que el código existente cumple con los estándares.
2.  **Generación**: Al pedir código nuevo, el agente consultará estas skills para estructurar la solución correctamente.
3.  **Onboarding**: Los nuevos desarrolladores pueden leer estas skills para entender "la forma correcta" de hacer las cosas en este proyecto.

## Índice de Skills

Las definiciones detalladas se encuentran en el directorio `/skills`:

*   [Arquitectura Modular](skills/architecture.skill.md)
*   [Componentes y UI](skills/components.skill.md)
*   [Gestión de Estado](skills/state-management.skill.md)
*   [Navegación](skills/navigation.skill.md)
*   [Capa de API y Networking](skills/api-layer.skill.md)
*   [Testing y Calidad](skills/testing.skill.md)
*   [Performance](skills/performance.skill.md)
