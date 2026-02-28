---
alwaysApply: true
description: Naming conventions for React Native projects. Follow these patterns consistently.
---

# Naming Conventions

| Element           | Convention           | Example                             |
| ----------------- | -------------------- | ----------------------------------- |
| Components        | PascalCase           | `Button`, `SignUpForm`              |
| Functions         | camelCase            | `handleSubmit`, `createAuthService` |
| Interfaces        | PascalCase           | `ButtonProps`, `AuthRepository`     |
| Constants         | SCREAMING_SNAKE      | `API_ROUTES`, `AXIOS_MESSAGES`      |
| Files (component) | PascalCase           | `Button.tsx`, `SignUpView.tsx`      |
| Files (service)   | camelCase + .service | `auth.service.ts`                   |
| Test files        | PascalCase.test.tsx  | `Text.test.tsx`                     |
