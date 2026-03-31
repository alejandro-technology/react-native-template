#!/usr/bin/env bash
set -euo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repository."
  exit 1
fi

staged_files="$(git diff --cached --name-only)"

if [ -z "$staged_files" ]; then
  echo "No staged files. Nothing to validate."
  exit 0
fi

echo "== git status =="
git status --short
echo

echo "== git diff --cached (summary) =="
git diff --cached --stat
echo

echo "== scanning staged diff for potential secrets =="
secret_pattern='AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|ghp_[A-Za-z0-9]{36}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----|api[_-]?key|secret|token|password'

if git diff --cached -U0 | grep -E -i "$secret_pattern" >/dev/null; then
  echo "Potential secret detected in staged diff. Review before commit:"
  git diff --cached -U0 | grep -E -i "$secret_pattern" || true
  exit 1
fi

blocked_files_pattern='(^|/)\.env($|\.|_)|google-services\.json$|GoogleService-Info\.plist$'
if echo "$staged_files" | grep -E "$blocked_files_pattern" >/dev/null; then
  echo "Sensitive file detected in staging. Remove it before commit:"
  echo "$staged_files" | grep -E "$blocked_files_pattern" || true
  exit 1
fi

echo "Pre-commit guard passed."
