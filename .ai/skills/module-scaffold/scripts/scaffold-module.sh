#!/usr/bin/env bash
# scaffold-module.sh
# Creates the base directory structure for a new Clean Architecture module.
# Usage: ./scaffold-module.sh <module-name> <EntityName>
# Example: ./scaffold-module.sh orders Order
#
# This script is called by the agent after confirming the module name.
# It creates empty placeholder files that the agent will fill in.

set -euo pipefail

MODULE="${1:-}"
ENTITY="${2:-}"

if [[ -z "$MODULE" || -z "$ENTITY" ]]; then
  echo "Usage: $0 <module-name> <EntityName>"
  echo "Example: $0 orders Order"
  exit 1
fi

MODULE_LOWER="${MODULE,,}"
ENTITY_LOWER="${ENTITY,,}"
SRC="src/modules/${MODULE_LOWER}"

echo "→ Scaffolding module: ${MODULE_LOWER} (entity: ${ENTITY})"

# Domain layer
mkdir -p "${SRC}/domain"
touch "${SRC}/domain/${ENTITY_LOWER}.model.ts"
touch "${SRC}/domain/${ENTITY_LOWER}.repository.ts"
touch "${SRC}/domain/${ENTITY_LOWER}.scheme.ts"
touch "${SRC}/domain/${ENTITY_LOWER}.adapter.ts"
touch "${SRC}/domain/${ENTITY_LOWER}.error.ts"
touch "${SRC}/domain/${ENTITY_LOWER}.messages.ts"

# Infrastructure layer
mkdir -p "${SRC}/infrastructure"
touch "${SRC}/infrastructure/${ENTITY_LOWER}.service.ts"
touch "${SRC}/infrastructure/${ENTITY_LOWER}.http.service.ts"
touch "${SRC}/infrastructure/${ENTITY_LOWER}.mock.service.ts"

# Application layer
mkdir -p "${SRC}/application"
touch "${SRC}/application/${ENTITY_LOWER}.storage.ts"
touch "${SRC}/application/${MODULE_LOWER}.queries.ts"
touch "${SRC}/application/${MODULE_LOWER}.mutations.ts"

# UI layer
mkdir -p "${SRC}/ui/components"
touch "${SRC}/ui/${ENTITY}sListView.tsx"
touch "${SRC}/ui/${ENTITY}DetailView.tsx"
touch "${SRC}/ui/${ENTITY}FormView.tsx"
touch "${SRC}/ui/components/${ENTITY}List.tsx"
touch "${SRC}/ui/components/${ENTITY}Item.tsx"
touch "${SRC}/ui/components/${ENTITY}Form.tsx"

# Navigation
mkdir -p "src/navigation/routes"
mkdir -p "src/navigation/stacks"
mkdir -p "src/navigation/hooks"
touch "src/navigation/routes/${MODULE_LOWER}.routes.ts"
touch "src/navigation/stacks/${ENTITY}StackNavigator.tsx"
touch "src/navigation/hooks/use-navigation-${MODULE_LOWER}.ts"

# Module index
touch "${SRC}/index.ts"

echo ""
echo "✓ Module scaffolded at ${SRC}/"
echo ""
echo "Next steps for the agent:"
echo "  1. Fill each file using the layer-* skills"
echo "  2. Register QUERY_KEYS in src/config/query.keys.ts"
echo "  3. Register API_ROUTES in src/config/api.routes.ts"
echo "  4. Register routes in src/navigation/routes/index.ts"
echo "  5. Register stack in src/navigation/stacks/PrivateStackNavigator.tsx"
