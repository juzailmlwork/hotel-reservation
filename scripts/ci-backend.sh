#!/usr/bin/env bash
# Local copy of the "backend" job in .github/workflows/ci.yml.
# Usage (from anywhere):  bash scripts/ci-backend.sh
set -euo pipefail                      # stop on the first failing command

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/Backend"

step() { echo; echo "==> $1"; }

step "Node version: $(node -v)"

step "Install dependencies (clean install, like CI)"
npm ci

step "Lint"
npm run lint

step "Build (syntax check all source files)"
find src tests -name '*.js' -print0 | xargs -0 -n1 node --check

step "Build (verify app loads)"
node -e "require('./src/app')"

step "Run tests"
npm test

echo; echo "Backend: all checks passed"
