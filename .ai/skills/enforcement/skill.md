---
name: enforcement
description: Index of all enforcement skills that ensure architectural integrity, code quality, and best practices.
---

# Enforcement Skills

These skills are designed to enforce architectural patterns, code quality standards, and best practices across the codebase. They act as guardrails during development.

## Available Skills

| Skill                                                         | Layer          | Priority | Description                                                         |
| ------------------------------------------------------------- | -------------- | -------- | ------------------------------------------------------------------- |
| [API Layer](api-layer/skill.md)                               | infrastructure | high     | Enforces dual-provider service architecture and error contracts.    |
| [Architecture](architecture/skill.md)                         | cross-cutting  | high     | Enforces 4-layer Clean Architecture per module.                     |
| [Code Quality](code-quality/skill.md)                         | cross-cutting  | high     | Enforces naming conventions, imports, and formatting.               |
| [Error Handling](error-handling/skill.md)                     | cross-cutting  | high     | Enforces centralized error handling and UI guard rails.             |
| [Forms & Validation](forms-validation/skill.md)               | ui             | high     | Enforces Zod schemas and react-hook-form usage.                     |
| [Navigation Patterns](navigation-patterns/skill.md)           | ui             | medium   | Enforces typed navigation and route definitions.                    |
| [Performance Optimization](performance-optimization/skill.md) | cross-cutting  | medium   | Enforces performance best practices like FlashList and memoization. |
| [Scalability Patterns](scalability-patterns/skill.md)         | cross-cutting  | medium   | Enforces module isolation and scalable patterns.                    |
| [Security Hardening](security-hardening/skill.md)             | cross-cutting  | high     | Enforces security best practices and secure storage.                |
| [State Management](state-management/skill.md)                 | application    | high     | Enforces state management decision matrix (Query vs Zustand).       |
| [Testing Strategy](testing-strategy/skill.md)                 | cross-cutting  | high     | Enforces testing patterns and coverage requirements.                |
| [Theme & Styling](theme-styling/skill.md)                     | ui             | high     | Enforces the 5-mode theme system and design tokens.                 |
| [UI Components](ui-components/skill.md)                       | ui             | high     | Enforces the 3-tier component system and style factories.           |
