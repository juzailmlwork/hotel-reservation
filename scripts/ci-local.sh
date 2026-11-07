#!/usr/bin/env bash
# Runs the whole CI pipeline on a local testing machine:
#   1. backend checks and admin-frontend checks (in parallel, like CI jobs)
#   2. deploy - ONLY if both checks passed (what `needs:` does in ci.yml)
#
# Usage:
#   bash scripts/ci-local.sh
#   JWT_SECRET=abc API_URL=https://api.example.com/api bash scripts/ci-local.sh
#
# Here the "secret" and "variable" come from your shell environment instead
# of GitHub's Settings > Secrets and variables.
set -uo pipefail          # no -e: we want to collect both results ourselves

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOGS="$ROOT/.ci-logs"
mkdir -p "$LOGS"

NODE_VERSION=24
API_URL="${API_URL:-http://localhost:5004/api}"
JWT_SECRET="${JWT_SECRET:-}"

echo "Running checks in parallel - logs in .ci-logs/"
bash "$ROOT/scripts/ci-backend.sh"        > "$LOGS/backend.log" 2>&1 &
backend_pid=$!
bash "$ROOT/scripts/ci-admin-frontend.sh" > "$LOGS/admin-frontend.log" 2>&1 &
frontend_pid=$!

wait "$backend_pid";  backend_status=$?
wait "$frontend_pid"; frontend_status=$?

result() { [ "$1" -eq 0 ] && echo "passed" || echo "FAILED (see $2)"; }
echo "Backend:        $(result $backend_status .ci-logs/backend.log)"
echo "Admin frontend: $(result $frontend_status .ci-logs/admin-frontend.log)"

# ---- the `needs:` rule -------------------------------------------------
if [ "$backend_status" -ne 0 ] || [ "$frontend_status" -ne 0 ]; then
  echo; echo "Deploy SKIPPED: a check failed."
  exit 1
fi

# ---- deploy (demo) -----------------------------------------------------
echo; echo "==> Deploy (demo)"
node_major="$(node -v | sed 's/^v\([0-9]*\).*/\1/')"
if [ "$node_major" -lt "$NODE_VERSION" ]; then
  echo "Warning: CI uses Node $NODE_VERSION, you have $(node -v)"
fi
echo "API URL (variable): $API_URL"
if [ -z "$JWT_SECRET" ]; then
  echo "Warning: JWT_SECRET is not set"
else
  echo "JWT_SECRET is set (not printed - locally nothing masks it for you!)"
fi

cd "$ROOT/Admin-frontend"
VITE_API_URL="$API_URL" npm run build
echo "Build ready in Admin-frontend/dist - a real deploy would upload it here."
