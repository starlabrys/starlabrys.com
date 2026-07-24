#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "需要 npm。可先运行 ./start.sh 安装 Node。"
  exit 1
fi

if ! command -v uv >/dev/null 2>&1; then
  echo "需要 uv: https://docs.astral.sh/uv/"
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Installing npm dependencies..."
  npm install
fi

echo "Syncing Advisor Python env (uv)..."
uv python install --directory advisor
uv sync --directory advisor

echo "Building static site..."
npm run build

echo "Starting website + advisor (production)..."
exec node scripts/prod-all.mjs
