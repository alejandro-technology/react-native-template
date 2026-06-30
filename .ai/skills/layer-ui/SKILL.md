---
name: layer-ui
description: >
  Create the UI layer for a Clean Architecture module: list view, detail view,
  and form view screens (layout-only, delegate logic to sibling components),
  plus EntityList with FlashList, EntityItem, and EntityForm with react-hook-form.
  Use when scaffolding screens for a new feature, adding CRUD views to a module,
  or implementing the presentation layer of a Clean Architecture feature.
license: MIT
compatibility: React Native 0.83+, TypeScript strict mode, bun package manager. Requires project structure from react-native-template.
metadata:
  version: "1.0"
  category: architecture-layer
  layer: ui
  workflow: scaffold
  output: src/modules/{module}/ui/**
---

# UI Layer

Create the UI layer for entity `$ARGUMENTS`.

## Files to Create

```
src/modules/{module}/ui/
  {Entities}ListView.tsx      # List screen with search
  {Entity}DetailView.tsx      # Detail screen (layout only)
  {Entity}FormView.tsx        # Create/Edit form screen
  components/
    {Entity}List.tsx          # List container (FlashList)
    {Entity}Item.tsx          # Single item row
    {Entity}Form.tsx          # Form fields component
    {Entity}Detail.tsx        # Detail content + data fetching
```

## Templates
Includes templates for: EntitiesListView, EntityDetailView, EntityDetail, EntityFormView, EntityList, EntityItem, EntityForm.
→ See [references/templates.md](references/templates.md) for full code.

## Reference

- Example module: `src/modules/products/ui/`
