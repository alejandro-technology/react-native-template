---
category: boundaries
priority: high
tags: [shared, feature, components, core]
enforcedBy: [AGENTS.md, CLAUDE.md]
---

# Regla de Límites entre Shared y Feature

La arquitectura debe distinguir claramente entre código compartido y código específico de un módulo.

---

## Regla 1: Lo visual reusable va en shared, lo específico queda en el módulo

### Va en `src/components/`

- componentes reutilizables por varios módulos
- wrappers de formulario genéricos
- layouts compartidos

### Va en `src/modules/{feature}/ui/components/`

- listas, ítems, formularios y secciones propias del módulo
- componentes que dependen del dominio del feature

### Regla práctica

Si un componente empieza a reutilizarse en más de un módulo, debe evaluarse moverlo a `src/components/`.

---

## Regla 2: Lo transversal va en módulos shared, no en features

### Va en módulos shared

- estado global en `src/modules/core`
- red en `src/modules/network`
- wrappers Firebase en `src/modules/firebase`

### Va en módulos feature

- lógica de negocio específica
- repositorios del feature
- pantallas y formularios del feature

**NUNCA**:

- duplicar wrappers de infraestructura transversal dentro de cada feature
- dejar lógica reusable atrapada dentro de un solo módulo si ya sirve a varios

### Cómo verificar

```bash
# Componentes feature-specific deben vivir dentro del módulo
ls src/modules/*/ui/components

# Wrappers transversales deben vivir en módulos shared
ls src/modules/core src/modules/network src/modules/firebase
```

**Referencias**:
- `src/components/`
- `src/modules/products/ui/components/`
- `src/modules/core/`
- `src/modules/network/`
- `src/modules/firebase/`
