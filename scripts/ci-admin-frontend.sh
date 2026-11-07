#!/usr/bin/env bash
# Local copy of the "admin-frontend" job in .github/workflows/ci.yml.
# Usage (from anywhere):  bash scripts/ci-admin-frontend.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/Admin-frontend"

step() { echo; echo "==> $1"; }

step "Node version: $(node -v)"

step "Install dependencies (clean install, like CI)"
npm ci

step "Lint"
npm run lint

step "Build"
npm run build

step "Run tests"
npm test

echo; echo "Admin frontend: all checks passed"
