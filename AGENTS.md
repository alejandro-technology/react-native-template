---
name: rncatemplate
description: React Native Clean Architecture Template guidance for agents. Invoke when working on app architecture, UI, network, or tests in this repo.
---

# React Native Template Agent Guidance

## Project Overview

- React Native v0.84.0 with TypeScript and Jest tests.
- Core flow: App.tsx -> AppProvider -> RootNavigator.
- Architecture: 4-layer feature modules (Domain, Application, Infrastructure, UI).
- Node.js: >= 22.11.0

Additional patterns in `CLAUDE.md` (services, Zod, theme, navigation, providers).

---

## OpenCode Integration

El agente tiene acceso directo a `.ai/rules/`, `.ai/agents/`, y `.ai/skills/`. Usa el skill tool o lee el archivo correspondiente.

### Skills

**Enforcement:**

- Architecture: `@.ai/skills/enforcement/architecture/skill.md`
- Code Quality: `@.ai/skills/enforcement/code-quality/skill.md`
- Testing Strategy: `@.ai/skills/enforcement/testing-strategy/skill.md`
- UI Components: `@.ai/skills/enforcement/ui-components/skill.md`
- Scalability Patterns: `@.ai/skills/enforcement/scalability-patterns/skill.md`
- Security Hardening: `@.ai/skills/enforcement/security-hardening/skill.md`
- Performance Optimization: `@.ai/skills/enforcement/performance-optimization/skill.md`
- Error Handling: `@.ai/skills/enforcement/error-handling/skill.md`
- Theme Styling: `@.ai/skills/enforcement/theme-styling/skill.md`
- Forms Validation: `@.ai/skills/enforcement/forms-validation/skill.md`
- Navigation Patterns: `@.ai/skills/enforcement/navigation-patterns/skill.md`
- State Management: `@.ai/skills/enforcement/state-management/skill.md`
- API Layer: `@.ai/skills/enforcement/api-layer/skill.md`

**Generation:**

- Components: `@.ai/skills/generation/create-component/SKILL.md`
- Modules: `@.ai/skills/generation/create-module/SKILL.md`
- Forms: `@.ai/skills/generation/create-form/SKILL.md`
- Services: `@.ai/skills/generation/create-service/SKILL.md`
- Navigation: `@.ai/skills/generation/create-navigation/SKILL.md`
- Hooks: `@.ai/skills/generation/create-hook/SKILL.md`
- Providers: `@.ai/skills/generation/create-provider/SKILL.md`
- Stores: `@.ai/skills/generation/create-store/SKILL.md`
- Firebase Service: `@.ai/skills/generation/create-firebase-service/SKILL.md`

**Specialty:**

- Firebase: `@.ai/skills/specialty/react-native-firebase/SKILL.md`

### Rules

- Reference: `@.ai/rules/reference.md`

---

## Agents Available

- **scaffolder**: Create new modules (Users, Transactions, etc.) - `@.ai/agents/scaffolder.md`
- **test-writer**: Generate Jest tests - `@.ai/agents/test-writer.md`
- **theme-auditor**: Fix hardcoded colors/spacing - `@.ai/agents/theme-auditor.md`
- **ci-cd-architect**: GitHub Actions and deployment pipelines - `@.ai/agents/ci-cd-architect.md`

---

## Commands

### Development

| Command           | Description          |
| ----------------- | -------------------- |
| `npm install`     | Install dependencies |
| `npm start`       | Start Metro bundler  |
| `npm run ios`     | Run iOS simulator    |
| `npm run android` | Run Android emulator |

### Linting & Formatting

| Command            | Description          |
| ------------------ | -------------------- |
| `npm run lint`     | Run ESLint           |
| `npm run prettier` | Format with Prettier |

### Testing

| Command                                | Description         |
| -------------------------------------- | ------------------- |
| `npm test`                             | Run all tests       |
| `npm test -- --watch`                  | Watch mode          |
| `npm test -- --testPathPattern="file"` | Single test file    |
| `npm test -- --testNamePattern="name"` | Tests matching name |

### Cleanup

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `npm run clean-node`    | Remove node_modules      |
| `npm run clean-ios`     | Clean iOS (removes Pods) |
| `npm run clean-android` | Clean Android build      |
| `npm run clean-watch`   | Clean Watchman           |
| `npm run pod-install`   | Reinstall CocoaPods      |
| `npm run pod-cocoa`     | Bundle install           |

---

## Exclude from TypeScript

node_modules/, Pods/, android/build/, ios/build/
