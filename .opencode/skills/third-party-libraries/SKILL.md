---
name: third-party-libraries
description: Verifies and enforces the usage of approved third-party libraries over generic React Native primitives. Use when implementing lists, images, storage, forms, state management, or network requests.
license: MIT
compatibility: opencode
metadata:
  layer: all
  workflow: review
  output: src/**/*.{ts,tsx}
---

# Third-Party Libraries

Review and implement task: $ARGUMENTS

## Approved Tech Stack

When working on this project, ALWAYS prefer the curated third-party libraries over generic React Native primitives. This ensures performance, security, and developer experience consistency.

### 1. Lists & ScrollViews

- **DO NOT** use `FlatList` or `SectionList` from `react-native`.
- **ALWAYS USE** `FlashList` from `@shopify/flash-list`.
- **Why**: Performance optimization for long lists and memory management.

### 2. Images & Assets

- **DO NOT** use `Image` from `react-native` for network or heavy local assets.
- **ALWAYS USE** `FastImage` from `react-native-fast-image`.
- **SVGs**: Use `react-native-svg` and import SVGs as components (`*.svg`).

### 3. Local Storage & Persistence

- **DO NOT** use `@react-native-async-storage/async-storage`.
- **ALWAYS USE** `react-native-mmkv` for synchronous, fast key-value storage.
- **Sensitive Data**: Use `react-native-keychain` for JWTs, passwords, and tokens.

### 4. Forms & Validation

- **DO NOT** use raw controlled components with `useState` for complex forms.
- **ALWAYS USE** `react-hook-form` paired with `yup` and `@hookform/resolvers/yup`.
- **Pattern**: Wrap inputs with `useController` in `src/components/form/`. Form schemas belong in the domain layer (`{entity}.scheme.ts`).

### 5. State Management

- **Local/Transient UI State**: `useState` is fine.
- **Global App State**: Use `zustand` (persist with MMKV if necessary). Do not create custom Context providers unless required for dependency injection.
- **Server State**: Use `@tanstack/react-query` for all data fetching and mutations. Do not use `useEffect` + `axios` manually for queries.

### 6. Network & APIs

- **HTTP Client**: Use `axios` via the shared instance in `src/modules/network/infrastructure/axios.service.ts`.
- **Connectivity**: Use hooks from `src/modules/network/application/use-netinfo.ts` (wrapper around `@react-native-community/netinfo`).

### 7. Security

- Root/Jailbreak detection is handled by `jail-monkey`.

## Working Rules

1. Before writing `import { FlatList, Image } from 'react-native'`, stop and use the approved library.
2. If you are scaffolding a new screen with a list, start directly with `FlashList`.
3. If building a form, create a Yup schema first, then wire `useForm`.
4. If persisting data across sessions, inject `MMKV` instead of searching for `AsyncStorage`.
5. Keep library imports properly sorted according to the project's standard.

## Checklist

- [ ] Are lists using `FlashList`?
- [ ] Are images using `FastImage`?
- [ ] Is server data handled by `react-query`?
- [ ] Are forms managed by `react-hook-form`?
- [ ] Is storage using `react-native-mmkv` or `react-native-keychain`?
- [ ] Run `bun run lint` and `bun run typecheck`.
