---
name: generation
description: Index of all generation skills that scaffold new code, modules, and components following project standards.
last_updated: 2026-03-25
---

# Generation Skills

These skills are designed to accelerate development by scaffolding new code structures that automatically adhere to the project's architectural and quality standards.

## Available Skills

| Skill | Layer | Priority | Description |
| --- | --- | --- | --- |
| [Create Module](create-module/skill.md) | cross-cutting | high | Scaffolds complete 4-layer feature modules with Clean Architecture. Generates domain (models, repository, schemas, adapters), infrastructure (3-provider service factory: HTTP/Firebase/Mock), application (queries, mutations with QUERY_KEYS and toast), and UI (views, components with FlashList). |
| [Create Component](create-component/skill.md) | ui | high | Scaffolds theme-aware components in the 3-tier system (core/form/layout). Core components use factory pattern (`getXxxStyle`) from `theme/components/`. Form components wrap core with `useController`. |
| [Create Screen](create-screen/skill.md) | ui | high | Scaffolds new screens with RootLayout, Toolbar, and navigation integration. Templates for List (FlashList + Header), Detail, Form, and Settings screens. Uses typed `{Feature}sScreenProps<Route>` and `useNavigation{Feature}s` hook. |
| [Create Navigation](create-navigation/skill.md) | ui | high | Scaffolds typed navigation: route enum, param list, `NativeStackScreenProps` type, stack navigator, typed navigation hook, and registration in parent navigator (Public/Private). |
| [Create Form](create-form/skill.md) | ui | high | Scaffolds form implementation: Yup schema with Spanish messages, `InferType` FormData, react-hook-form with `control` prop pattern, form-to-payload adapter, and form component with Button from `@components/core`. |
| [Create Service](create-service/skill.md) | infrastructure | high | Scaffolds 3-provider service architecture: repository interface, HTTP (Axios + `manageAxiosError`), Firebase (Firestore + `manageFirebaseError`), Mock (in-memory), and factory with `CONFIG.SERVICE_PROVIDER` switching. All return `T \| Error`. |
| [Create Firebase Service](create-firebase-service/skill.md) | infrastructure | medium | Scaffolds Firebase/Firestore service implementing repository interface. Uses `manageFirebaseError`, `COLLECTIONS` from `@config/collections.routes`, and integrates with 3-provider factory pattern. |
| [Create Adapter](create-adapter/skill.md) | domain | medium | Scaffolds pure data adapters: entity adapters (typed input, not Record), form-to-payload adapters (FormData → CreatePayload). Strict typing with named exports in domain layer. |
| [Create Hook](create-hook/skill.md) | application | medium | Scaffolds custom React hooks: feature hooks in `application/`, theme hooks in `theme/hooks/`. Not for React Query (use queries/mutations) or Zustand (use create-store). |
| [Create Provider](create-provider/skill.md) | ui | medium | Scaffolds React Context providers with custom hook, error guard, and composition in `AppProvider`. Documents current provider order (ErrorBoundary → SecureProvider → QueryClient → Theme → SafeArea → GestureHandler → Auth → Navigation). |
| [Create Store](create-store/skill.md) | application | medium | Scaffolds Zustand stores with optional MMKV persistence. Shows basic store, persistent store (`mmkvStorage`/`secureMMKVStorage`), and nested slice pattern. Stores in `application/{feature}.storage.ts`. |
