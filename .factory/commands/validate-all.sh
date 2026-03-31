#!/usr/bin/env bash
set -euo pipefail

echo "Running validators: lint, typecheck, test"
bun run lint
bun run typecheck
bun run test -- --watch=false
echo "All validators passed"
