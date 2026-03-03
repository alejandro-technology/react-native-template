---
alwaysApply: true
category: rules
layer: cross-cutting
priority: high
tags:
  - reference
  - quick-lookup
  - aliases
  - naming
triggers:
  - 'Quick lookup for aliases'
  - 'Quick lookup for naming conventions'
description: Quick reference for path aliases and naming conventions. For commands and architecture overview, see AGENTS.md. For detailed enforcement, see .ai/skills/
---

# Quick Reference

Quick lookup for path aliases and naming conventions. For commands and architecture, see `AGENTS.md`.

## Path Aliases

```typescript
@components/*  → src/components/*
@modules/*     → src/modules/*
@theme/*       → src/theme/*
@config/*      → src/config/*
@navigation/*  → src/navigation/*
@hooks/*       → src/hooks/*
```

## Naming Conventions

| Element    | Convention        | Example                 |
| ---------- | ----------------- | ----------------------- |
| Components | PascalCase        | `Button`, `ProductItem` |
| Functions  | camelCase         | `handleSubmit`          |
| Hooks      | `use` + camelCase | `useProducts`           |
| Constants  | SCREAMING_SNAKE   | `API_ROUTES`            |

---

For detailed patterns, enforcement rules, and code generation, see skills in `.ai/skills/`.
