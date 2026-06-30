#!/usr/bin/env bash
# check-registration.sh
# Verifies that a module's navigation is properly registered.
# Usage: ./check-registration.sh <ModuleName>
# Example: ./check-registration.sh Orders

set -euo pipefail

MODULE="${1:-}"

if [[ -z "$MODULE" ]]; then
  echo "Usage: $0 <ModuleName>"
  echo "Example: $0 Orders"
  exit 1
fi

MODULE_LOWER="${MODULE,,}"
ERRORS=0

check_file_contains() {
  local file="$1"
  local pattern="$2"
  local description="$3"

  if [[ ! -f "$file" ]]; then
    echo "  ⚠️  FILE NOT FOUND: $file"
    ERRORS=$((ERRORS + 1))
    return
  fi

  if grep -q "$pattern" "$file"; then
    echo "  ✓ $description"
  else
    echo "  ❌ MISSING: $description"
    echo "     in: $file"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "→ Checking navigation registration for: $MODULE"
echo ""

# 1. Routes file exists
if [[ -f "src/navigation/routes/${MODULE_LOWER}.routes.ts" ]]; then
  echo "  ✓ Routes file exists: src/navigation/routes/${MODULE_LOWER}.routes.ts"
else
  echo "  ❌ MISSING routes file: src/navigation/routes/${MODULE_LOWER}.routes.ts"
  ERRORS=$((ERRORS + 1))
fi

# 2. Exported from routes index
check_file_contains \
  "src/navigation/routes/index.ts" \
  "${MODULE_LOWER}.routes" \
  "${MODULE}Routes exported from src/navigation/routes/index.ts"

# 3. Stack navigator exists
if [[ -f "src/navigation/stacks/${MODULE}StackNavigator.tsx" ]]; then
  echo "  ✓ Stack navigator exists: src/navigation/stacks/${MODULE}StackNavigator.tsx"
else
  echo "  ❌ MISSING stack navigator: src/navigation/stacks/${MODULE}StackNavigator.tsx"
  ERRORS=$((ERRORS + 1))
fi

# 4. Registered in PrivateStackNavigator
check_file_contains \
  "src/navigation/stacks/PrivateStackNavigator.tsx" \
  "${MODULE}Stack\|${MODULE_LOWER}Stack" \
  "${MODULE}Stack registered in PrivateStackNavigator"

# 5. Typed hook exists
if [[ -f "src/navigation/hooks/use-navigation-${MODULE_LOWER}.ts" ]]; then
  echo "  ✓ Typed hook exists: src/navigation/hooks/use-navigation-${MODULE_LOWER}.ts"
else
  echo "  ❌ MISSING typed hook: src/navigation/hooks/use-navigation-${MODULE_LOWER}.ts"
  ERRORS=$((ERRORS + 1))
fi

echo ""
if [[ $ERRORS -eq 0 ]]; then
  echo "✓ Navigation fully registered for $MODULE."
  exit 0
else
  echo "✗ Found $ERRORS missing registration(s). Complete before proceeding."
  exit 1
fi
