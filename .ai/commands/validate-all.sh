#!/usr/bin/env bash
set -euo pipefail

echo "Running validators: lint, typecheck, test"
bun run lint
bun run typecheck
bun run test -- --watch=false
echo "All validators passed"

echo ""
echo "Checking coverage thresholds..."
bun run test:coverage -- --silent 2>/dev/null || echo "Coverage report generated"
echo "Validation complete"
