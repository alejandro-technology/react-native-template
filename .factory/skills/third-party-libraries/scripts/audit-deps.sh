#!/usr/bin/env bash
# audit-deps.sh
# Scans source files for prohibited React Native primitives.
# Usage: ./audit-deps.sh [path]
# If path is omitted, scans the current git diff (staged changes).
# Example: ./audit-deps.sh src/modules/orders/

set -euo pipefail

TARGET="${1:-}"
VIOLATIONS=0

check_pattern() {
  local pattern="$1"
  local message="$2"
  local files="$3"

  if echo "$files" | xargs grep -l "$pattern" 2>/dev/null | grep -q .; then
    echo "  ❌ VIOLATION: $message"
    echo "$files" | xargs grep -rn "$pattern" 2>/dev/null | head -5
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
}

if [[ -z "$TARGET" ]]; then
  echo "→ Scanning git staged diff for dependency violations..."
  FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)
else
  echo "→ Scanning $TARGET for dependency violations..."
  FILES=$(find "$TARGET" -name "*.ts" -o -name "*.tsx" 2>/dev/null || true)
fi

if [[ -z "$FILES" ]]; then
  echo "  No TypeScript files to scan."
  exit 0
fi

echo ""
echo "Checking prohibited primitives..."

check_pattern "from 'react-native'.*FlatList\|<FlatList" \
  "Use FlashList (@shopify/flash-list) instead of FlatList" \
  "$FILES"

check_pattern "from 'react-native'.*SectionList\|<SectionList" \
  "Use FlashList (@shopify/flash-list) instead of SectionList" \
  "$FILES"

check_pattern "from 'react-native'.*\bImage\b\|<Image\b" \
  "Use FastImage (react-native-fast-image) instead of Image" \
  "$FILES"

check_pattern "@react-native-async-storage/async-storage\|AsyncStorage" \
  "Use MMKV (react-native-mmkv) instead of AsyncStorage" \
  "$FILES"

check_pattern "axios\.create\(\)\|new axios" \
  "Use shared axios instance from @modules/network — never create a new axios instance" \
  "$FILES"

check_pattern "import.*useState.*useEffect.*fetch\|fetch(" \
  "Use React Query (@tanstack/react-query) for server state — never useEffect + fetch" \
  "$FILES"

echo ""
if [[ $VIOLATIONS -eq 0 ]]; then
  echo "✓ No dependency violations found."
  exit 0
else
  echo "✗ Found $VIOLATIONS violation(s). Fix before committing."
  exit 1
fi
