# Skills Manifest

> **Opinionated React Native Framework** — Agent Skills Registry
> Version 2.1 — Unified with .ai/skills structure

---

## Global Description

This skill system transforms the React Native Clean Architecture Template into an **opinionated framework** that automatically guides development decisions. Each skill is a production-ready enforcement document grounded in the actual codebase patterns — not theoretical guidelines.

The skills cover the complete lifecycle: from creating a new feature module to deploying it, ensuring consistency across teams, preventing anti-patterns before they reach code review, and accelerating onboarding.

## Design Philosophy

### Core Principles

1. **Layer Isolation** — Every feature module has 4 layers (domain, infrastructure, application, UI) with strict dependency direction. UI never touches infrastructure.

2. **Contract-First** — Repository interfaces in domain define the contract. Infrastructure implements it. Application bridges it. UI consumes it. Swapping providers requires zero code changes outside infrastructure.

3. **Error Safety** — Services return `T | Error` (never throw). Application hooks convert to throws for React Query. UI renders states in strict guard order: loading → error → empty → success.

4. **Token-Based Theming** — 5 theme modes (light, dark, primary, secondary, premium) powered by design tokens. Zero hardcoded colors, spacing, or typography values anywhere.

5. **Composition Over Inheritance** — Provider chain composes capabilities. Components compose from core primitives. Modules compose independently.

6. **Predictable Naming** — Every file, function, hook, type, and constant follows documented naming conventions. Code is greppable, discoverable, and self-documenting.

### Technical Stack

| Concern | Tool | Location |
|---|---|---|
| Framework | React Native 0.84 + React 19 | Root |
| Language | TypeScript (strict) | All `src/` |
| Navigation | React Navigation 7 (Native Stack) | `src/navigation/` |
| Server State | TanStack React Query 5 | `src/modules/*/application/` |
| Client State | Zustand 5 | `src/modules/core/infrastructure/` |
| Persistence | MMKV | `src/config/storage.ts` |
| Forms | react-hook-form 7 + Zod 4 | `src/modules/*/domain/*.scheme.ts` |
| HTTP | Axios | `src/modules/network/` |
| Firebase | @react-native-firebase | `src/modules/firebase/` |
| Lists | FlashList (Shopify) | `src/modules/*/ui/components/` |
| Testing | Jest + RNTL | `__tests__/` |
| Security | JailMonkey | `src/providers/SecureProvider.tsx` |

---

## Skill Registry

All enforcement skills are located in `.ai/skills/enforcement/`.

### Architecture & Structure (3 skills)

| Skill | File | Purpose |
|---|---|---|
| **[Architecture](#architecture)** | `.ai/skills/enforcement/architecture/skill.md` | Clean Architecture 4-layer enforcement per module |
| **[Scalability](#scalability)** | `.ai/skills/enforcement/scalability-patterns/skill.md` | Module isolation, provider composition, bootstrapping |
| **[Code Quality](#code-quality)** | `.ai/skills/enforcement/code-quality/skill.md` | Naming, imports, formatting, TypeScript standards |

### Data & Services (3 skills)

| Skill | File | Purpose |
|---|---|---|
| **[API Layer](#api-layer)** | `.ai/skills/enforcement/api-layer/skill.md` | Dual-provider services, factory pattern, `T\|Error` contract |
| **[State Management](#state-management)** | `.ai/skills/enforcement/state-management/skill.md` | React Query vs Zustand vs useState decision matrix |
| **[Error Handling](#error-handling)** | `.ai/skills/enforcement/error-handling/skill.md` | Centralized errors, typed names, UI guard order |

### UI & Presentation (4 skills)

| Skill | File | Purpose |
|---|---|---|
| **[Components](#components)** | `.ai/skills/enforcement/ui-components/skill.md` | 3-tier component system, style factories |
| **[Theme & Styling](#theme-styling)** | `.ai/skills/enforcement/theme-styling/skill.md` | 5-mode themes, design tokens, responsive utilities |
| **[Navigation](#navigation)** | `.ai/skills/enforcement/navigation-patterns/skill.md` | Typed routes, stack navigators, navigation hooks |
| **[Forms & Validation](#forms-validation)** | `.ai/skills/enforcement/forms-validation/skill.md` | Zod schemas, react-hook-form, Spanish messages |

### Quality & Operations (3 skills)

| Skill | File | Purpose |
|---|---|---|
| **[Performance](#performance)** | `.ai/skills/enforcement/performance-optimization/skill.md` | FlashList, React.memo, debouncing, animations |
| **[Testing](#testing)** | `.ai/skills/enforcement/testing-strategy/skill.md` | Jest, RNTL, service mocking, layer testing |
| **[Security](#security)** | `.ai/skills/enforcement/security-hardening/skill.md` | JailMonkey, MMKV, error message security |

---

## Skill Interaction Map

```
                    ┌───────────────────┐
                    │   ARCHITECTURE    │
                    │  (4-layer rules)  │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │  API LAYER   │ │    STATE     │ │  NAVIGATION  │
     │ (services)   │ │ MANAGEMENT   │ │  (routing)   │
     └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
            │                │                │
            ▼                ▼                ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │    ERROR     │ │    FORMS     │ │    THEME     │
     │  HANDLING    │ │ VALIDATION   │ │   STYLING    │
     └──────────────┘ └──────────────┘ └──────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           ┌──────────────┐    ┌──────────────┐
           │ COMPONENTS   │    │  CODE        │
           │ (UI system)  │    │  QUALITY     │
           └──────┬───────┘    └──────┬───────┘
                  │                   │
           ┌──────┴─────┐     ┌──────┴───────┐
           ▼            ▼     ▼              ▼
    ┌────────────┐ ┌──────────┐    ┌──────────────┐
    │PERFORMANCE │ │ TESTING  │    │ SCALABILITY  │
    │            │ │          │    │              │
    └────────────┘ └──────────┘    └──────────────┘
                                          │
                                   ┌──────┴───────┐
                                   ▼              ▼
                            ┌────────────┐  (feeds back
                            │  SECURITY  │   to Architecture)
                            └────────────┘
```

---

## Contribution Rules

### Adding a New Skill

1. Create `.ai/skills/enforcement/{name}/skill.md` following the 6-section format:
   - Metadata, Trigger, Responsibilities, Rules, Expected Output, Practical Example
2. Ground all rules in actual codebase patterns (reference real files)
3. Include at least one Before/After example with real project code
4. Add the skill to this manifest with file path and purpose
5. Update the interaction map if the skill depends on or feeds other skills

### Modifying an Existing Skill

1. Verify the rule change against actual codebase patterns
2. Update all affected Before/After examples
3. Ensure no contradiction with other skills
4. Update this manifest if severity levels or triggers change

---

## Usage Guide

### For New Projects

```bash
# 1. Copy the .ai/skills directory into your React Native project
cp -r .ai/skills/ /your-project/.ai/skills/

# 2. Reference skills in your CLAUDE.md or agent configuration
# 3. The agent will automatically enforce patterns when tasks match triggers
```

### For Auditing Existing Code

```
"Audit the orders module against the architecture skill"
"Review ProductItem against the performance skill"
"Check the auth form against the forms-validation skill"
"Run a security audit on the providers"
"Validate theme compliance in the users module"
```

### For Code Generation

```
"Create a new orders module"               → architecture + api-layer + forms-validation
"Create a search component"                → components + theme-styling + code-quality
"Add a new navigation stack for payments"  → navigation + scalability
"Create a Zustand store for cart"          → state-management + security
"Add form validation for checkout"         → forms-validation + error-handling
```

### For Onboarding New Developers

Read skills in this order for progressive understanding:

1. **Architecture** — understand the 4-layer module structure
2. **Code Quality** — understand naming, imports, formatting
3. **API Layer** + **State Management** — understand data flow
4. **Forms & Validation** + **Error Handling** — understand user interactions
5. **Theme & Styling** + **Components** — understand the UI system
6. **Navigation** — understand routing patterns
7. **Performance** — understand optimization rules
8. **Testing** — understand test strategy
9. **Security** + **Scalability** — understand production concerns
