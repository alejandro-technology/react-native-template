# Template Usage Guide

This guide covers what you need to do after cloning this template for a new project.

## Quick Start Checklist

### 1. Project Identity

- [ ] Update `package.json`:
  - Change `name` to your app's bundle identifier (e.g., `com.yourcompany.yourapp`)
  - Update `version` to `1.0.0`
- [ ] Update `app.json`:
  - Change `name` to your app's display name
  - Change `displayName` to your app's display name
- [ ] Android: Update `android/app/build.gradle`:
  - `applicationId` to your bundle identifier
  - Update version numbers
- [ ] iOS: Update `ios/rncatemplate.xcodeproj`:
  - Change bundle identifier in project settings
  - Rename scheme if needed

### 2. Environment Configuration

- [ ] Copy `.env.example` to `.env`
- [ ] Update values:
  - `API_URL`: Your backend URL
  - `SERVICE_PROVIDER`: `http`, `firebase`, or `mock`
  - `ROOT_USERNAME`/`ROOT_PASSWORD`: Remove or change for mock auth

### 3. Firebase (if using Firebase provider)

- [ ] Create Firebase project at [Firebase Console](https://console.firebase.google.com)
- [ ] Download `google-services.json` → `android/app/`
- [ ] Download `GoogleService-Info.plist` → `ios/`
- [ ] Both files are gitignored - add them locally

### 4. Security

- [ ] The MMKV encryption key is now managed via Keychain/Keystore
- [ ] For production, ensure `initSecureStorage()` is called before auth
- [ ] Review `ROOT_CREDENTIALS` - they should be removed for production

### 5. Clean Up

- [ ] Remove example modules if not needed:
  - `src/modules/examples/`
  - `src/navigation/stacks/ExampleStackNavigator.tsx`
  - Update navigation routes
- [ ] Remove or update mock services for production
- [ ] Update `CLAUDE.md` and `AGENTS.md` with your project details

### 6. Testing

- [ ] Run `bun run test` to ensure all tests pass
- [ ] Run `bun run typecheck` to check TypeScript
- [ ] Run `bun run lint` to check code style

### 7. CI/CD

- [ ] Update `.github/workflows/` for your needs
- [ ] Add any secrets needed for your CI (Firebase tokens, etc.)
- [ ] Configure Renovate/Dependabot for dependency updates

## Architecture Overview

This template follows **Clean Architecture** with 4 layers:

```
src/modules/{module}/
  domain/           → Entities, repository interfaces, Yup schemas
  infrastructure/   → Repository implementations (http, firebase, mock)
  application/     → React Query hooks (queries, mutations), Zustand stores
  ui/              → Screens and screen-specific components
```

### Key Patterns

- **Service Factory**: Change `SERVICE_PROVIDER` in `.env` to switch backends
- **Error Handling**: Services return `T | Error`, mutations throw on error
- **Navigation**: Typed routes with `useNavigation{Module}()` hooks
- **State**: Zustand for global state, React Query for server state

## Available Modules

| Module | Purpose | Notes |
|--------|---------|-------|
| `products` | CRUD reference | Copy this for new entities |
| `users` | User management | Full CRUD |
| `authentication` | Login/register | HTTP, Firebase, Mock providers |
| `core` | Global state | Toast, delete confirmation |
| `network` | HTTP layer | Axios with token refresh |
| `firebase` | Firebase services | Firestore, Storage, Auth |

## Component Library

### Core Components (`@components/core`)
`AnimatedPressable`, `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `DatePicker`, `Modal`, `Select`, `Text`, `TextInput`, `Toast`

### Layout Components (`@components/layout`)
`DeleteConfirmationSheet`, `EmptyState`, `ErrorBoundary`, `ErrorState`, `Header`, `ItemSeparatorComponent`, `LoadingState`, `RootLayout`, `Toolbar`

### Form Components (`@components/form`)
Wrappers around core components with `react-hook-form` integration.

## Theming

The template includes a complete theming system with 4 themes:
- `light` / `dark` - Base themes
- `primary` - Blue corporate theme
- `premium` - Purple elegant theme

```tsx
const { colors, isDark, toggleTheme } = useTheme();
```

## Adding a New Module

1. Create `src/modules/{entity}/`
2. Copy structure from `products/` module
3. Update domain, infrastructure, application, and ui layers
4. Add navigation routes in `src/navigation/routes/`
5. Register in `src/navigation/stacks/`
6. Export from `src/modules/{entity}/index.ts`

## Need Help?

- Check `CLAUDE.md` for project-specific guidelines
- Check `AGENTS.md` for AI agent configuration
- Check `.factory/rules/` for architectural rules
