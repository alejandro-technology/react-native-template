---
name: generation
description: Index of all generation skills that scaffold new code, modules, and components following project standards.
---

# Generation Skills

These skills are designed to accelerate development by scaffolding new code structures that automatically adhere to the project's architectural and quality standards.

## Available Skills

| Skill                                                       | Layer          | Priority | Description                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------- | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Create Component](create-component/SKILL.md)               | ui             | high     | Scaffolds theme-aware components in the 3-tier system (core/form/layout). Generates component file, style factory in `theme/components/`, barrel export registration, and type-safe props interface with variant/size/disabled pattern.                                  |
| [Create Firebase Service](create-firebase-service/SKILL.md) | infrastructure | medium   | Scaffolds Firebase/Firestore service implementations that implement repository interfaces. Generates service class with CRUD methods (collection queries, document operations), error handling with `manageFirebaseError`, and integration with factory pattern.         |
| [Create Form](create-form/SKILL.md)                         | ui             | high     | Scaffolds complete form implementation: Yup schema with Spanish validation messages (string format), inferred FormData type, react-hook-form integration, form-to-payload adapter, and form component with error display and submit handler.                             |
| [Create Hook](create-hook/SKILL.md)                         | application    | medium   | Scaffolds custom React hooks following project conventions: proper naming (`use` prefix), TypeScript types, dependency arrays, cleanup functions, and integration with theme/navigation systems. Includes templates for data fetching, UI state, and effect-based hooks. |
| [Create Module](create-module/SKILL.md)                     | cross-cutting  | high     | Scaffolds complete 4-layer feature modules with Clean Architecture. Generates domain (models, repository, schemas, adapters), infrastructure (service factory), application (queries, mutations), and UI (views, components) with full CRUD operations and type safety.  |
| [Create Navigation](create-navigation/SKILL.md)             | ui             | high     | Scaffolds typed navigation: stack navigator with screens, route param types in `RootStackParamList`, route constants in `routes/`, type-safe navigation hook (`useNavigation{Module}`), and registration in root navigator.                                              |
| [Create Provider](create-provider/SKILL.md)                 | ui             | medium   | Scaffolds React Context providers with TypeScript types, custom hook for context consumption, error boundary for missing provider, composition in `AppProvider`, and optional persistence integration with MMKV or AsyncStorage.                                         |
| [Create Service](create-service/SKILL.md)                   | infrastructure | high     | Scaffolds dual-provider service architecture: repository interface, HTTP implementation (Axios + error handling), Firebase implementation (Firestore), factory function with `CONFIG.SERVICE_PROVIDER` switching, and singleton export with `T \| Error` return pattern. |
| [Create Store](create-store/SKILL.md)                       | application    | medium   | Scaffolds Zustand stores with TypeScript types, MMKV persistence integration, devtools support, slice pattern for large stores, and selectors for optimal re-render control. Includes patterns for theme storage, user preferences, and app state.                      |
