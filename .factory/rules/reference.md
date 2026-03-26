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
@assets/*       → src/assets/*
@components/*  → src/components/*
@config/*      → src/config/*
@modules/*     → src/modules/*
@navigation/*  → src/navigation/*
@providers/*  → src/providers/*
@theme/*       → src/theme/*
@utils/*  → src/utils/*
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
