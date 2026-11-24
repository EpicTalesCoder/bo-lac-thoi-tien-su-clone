#!/usr/bin/env bash
set -euo pipefail

# Installer for j2me-cpp-porter (Plugin or standalone Skills)
# Usage:
#   ./install.sh [--plugin | --skills | --workspace <dir>] [--dry-run]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="plugin"
WORKSPACE_DIR=""
DRY_RUN=0

while [ $# -gt 0 ]; do
    case "$1" in
        --plugin)
            MODE="plugin"
            shift
            ;;
        --skills)
            MODE="skills"
            shift
            ;;
        --workspace)
            MODE="workspace"
            WORKSPACE_DIR="${2:-}"
            if [ -z "$WORKSPACE_DIR" ]; then
                echo "Error: --workspace requires a directory path" >&2
                exit 1
            fi
            shift 2
            ;;
        --dry-run)
            DRY_RUN=1
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--plugin | --skills | --workspace <dir>] [--dry-run]"
            exit 0
            ;;
        *)
            echo "Unknown argument: $1" >&2
            exit 1
            ;;
    esac
done

install_dir() {
    local src="$1"
    local dst="$2"
    if [ "$DRY_RUN" -eq 1 ]; then
        echo "[DRY-RUN] Copy $src -> $dst"
        return 0
    fi
    mkdir -p "$(dirname "$dst")"
    rm -rf "$dst"
    cp -R "$src" "$dst"
    find "$dst" \( -name "*.sh" -o -name "*.py" \) -exec chmod +x {} + 2>/dev/null || true
    find "$dst" \( -name ".DS_Store" -o -name "__pycache__" \) -exec rm -rf {} + 2>/dev/null || true
    echo "[OK] Installed: $dst"
}

if [ "$MODE" = "plugin" ]; then
    install_dir "$SCRIPT_DIR" "${HOME}/.gemini/config/plugins/j2me-cpp-porter"
elif [ "$MODE" = "skills" ]; then
    install_dir "$SCRIPT_DIR/skills/jar-to-cpp-port" "${HOME}/.gemini/config/skills/jar-to-cpp-port"
    install_dir "$SCRIPT_DIR/skills/cpp-port-qa-debug" "${HOME}/.gemini/config/skills/cpp-port-qa-debug"
elif [ "$MODE" = "workspace" ]; then
    install_dir "$SCRIPT_DIR/skills/jar-to-cpp-port" "$WORKSPACE_DIR/.agents/skills/jar-to-cpp-port"
    install_dir "$SCRIPT_DIR/skills/cpp-port-qa-debug" "$WORKSPACE_DIR/.agents/skills/cpp-port-qa-debug"
fi

echo ""
echo "--- Checking host prerequisites ---"
for cmd in cmake clang++ g++ java python3; do
    if command -v "$cmd" >/dev/null 2>&1; then
        echo "  [OK] $cmd -> $(command -v "$cmd")"
    else
        echo "  [MISSING] $cmd (cần cài nếu port/build trên máy này)"
    fi
done
echo "Done! Start a new chat turn for your agent to load the installed plugin/skills."
