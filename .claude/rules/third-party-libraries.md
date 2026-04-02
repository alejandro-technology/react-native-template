---
paths:
  - 'src/**/*.{ts,tsx}'
---

# Third-Party Libraries Rules

The project strictly relies on a curated set of third-party libraries to guarantee performance, security, and developer experience. Do not use generic React Native primitives when an approved library exists.

## Core Replacements

1. **Lists**: NEVER use `FlatList` or `SectionList` from `react-native`. ALWAYS use `FlashList` from `@shopify/flash-list`.
2. **Images**: NEVER use `Image` from `react-native`. ALWAYS use `FastImage` from `react-native-fast-image`. For SVGs, use `react-native-svg` and `react-native-svg-transformer`.
3. **Storage**: NEVER use `@react-native-async-storage/async-storage`. ALWAYS use `react-native-mmkv` for fast, synchronous persistence.
4. **State**: NEVER create raw Context providers for app state unless strictly necessary. ALWAYS use `zustand` (with MMKV for persistence if needed).
5. **Server State**: NEVER use `useEffect` + `fetch`/`axios` directly for data fetching. ALWAYS use `@tanstack/react-query`.

## Forms & Validation

- Use `react-hook-form` for all forms.
- Use `yup` for schema definitions.
- Combine them with `@hookform/resolvers/yup`.
- Example: Build your schemas in `domain/{entity}.scheme.ts` and wrap form inputs using `useController` in `src/components/form/`.

## Navigation

- Use `@react-navigation/native` and `@react-navigation/native-stack`.
- Ensure routes are strongly typed.
- Hook wrappers should live in `src/navigation/hooks/useNavigation.ts`.

## Security

- Use `react-native-keychain` for securely storing sensitive tokens (JWT, refresh tokens).
- Use `jail-monkey` for root/jailbreak detection (configured in `SecureProvider`).

## Network & Backend

- HTTP Client: `axios` (wrapped in `src/modules/network/infrastructure/axios.service.ts`).
- Network Status: `@react-native-community/netinfo` (wrapped in `src/modules/network/infrastructure/netinfo.service.ts`).
- Firebase: `@react-native-firebase/app`, `auth`, `firestore`, `storage`.

## File & Hardware

- Images/Camera: `react-native-image-picker`.
- Permissions: `react-native-permissions` (wrapped in `src/modules/core/infrastructure/permissions.service.ts`).
- Dates: `@react-native-community/datetimepicker`.
