#!/usr/bin/env bash
set -euo pipefail

echo "FADEN setup — install dependencies"
pnpm install

echo "Copy .env.example to app env files if missing"
[ -f apps/web/.env.local ] || cp .env.example apps/web/.env.local
[ -f apps/admin/.env.local ] || cp .env.example apps/admin/.env.local

echo "Done. Run: pnpm dev"
