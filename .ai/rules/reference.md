---
alwaysApply: true
description: Quick reference for architecture, commands, aliases, and naming. Complements CLAUDE.md (which covers behavioral patterns). For detailed enforcement, see .claude/skills/
---

# Quick Reference

Structural lookups and conventions. For behavioral patterns (factory, T|Error, Zod, adapters), see `CLAUDE.md`. For detailed enforcement, see `.claude/skills/`.

## Architecture

Clean Architecture with 4 layers per module:
```
src/modules/{feature}/
├── domain/         # Pure TypeScript (models, schemas, adapters)
├── infrastructure/ # Services (HTTP, Firebase)
├── application/    # React Query hooks
└── ui/             # React Native views + components
```

**Layer rules**: UI → application → infrastructure → domain
**Never**: UI imports from infrastructure
**Details**: See `.claude/skills/enforcement/architecture/`

## Commands

```bash
npm start              # Metro bundler
npm run ios            # iOS simulator
npm run android        # Android emulator
npm run lint           # ESLint
npm run prettier       # Format code
npm test               # Run tests
npm test -- --coverage # Run with coverage
```

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

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `Button`, `ProductItem` |
| Functions | camelCase | `handleSubmit` |
| Hooks | `use` + camelCase | `useProducts` |
| Constants | SCREAMING_SNAKE | `API_ROUTES` |

Full guide: `.claude/skills/enforcement/code-quality/`

---

**For detailed patterns, enforcement rules, and code generation**, see skills in `.claude/skills/`.
