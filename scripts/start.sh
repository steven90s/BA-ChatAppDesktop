#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MODE="${1:-desktop}"

case "$MODE" in
  web)
    exec npm run dev:web
    ;;
  desktop|app)
    exec npm run dev:desktop
    ;;
  *)
    echo "Usage: $0 [web|desktop]"
    echo "  web      Start only the Vite frontend"
    echo "  desktop  Start the Tauri app with Rust backend/service (default)"
    exit 1
    ;;
esac

