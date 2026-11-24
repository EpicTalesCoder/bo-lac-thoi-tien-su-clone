#!/usr/bin/env bash
set -euo pipefail

# Unpack a J2ME / Java .jar into decompiled_java/{raw_assets,src_vineflower,src_cfr}
# Usage: ./decompile_jar.sh <path/to/game.jar> [project_dir]

if [ $# -lt 1 ]; then
    echo "Usage: $0 <game.jar> [project_dir]" >&2
    exit 1
fi

JAR_PATH="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
PROJ_DIR="${2:-$(pwd)}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$PROJ_DIR/decompiled_java/raw_assets" \
         "$PROJ_DIR/decompiled_java/src_vineflower" \
         "$PROJ_DIR/decompiled_java/src_cfr"

echo "[1/3] Unpacking raw assets & classes from $JAR_PATH..."
unzip -q -o "$JAR_PATH" -d "$PROJ_DIR/decompiled_java/raw_assets"

echo "[2/3] Decompiling with Vineflower..."
java -jar "$SCRIPT_DIR/vineflower-1.12.0.jar" "$JAR_PATH" "$PROJ_DIR/decompiled_java/src_vineflower"

echo "[3/3] Decompiling with CFR (cross-check decompiler for obfuscated bytecode)..."
java -jar "$SCRIPT_DIR/cfr-0.152.jar" "$JAR_PATH" --outputdir "$PROJ_DIR/decompiled_java/src_cfr"

echo "Done! MANIFEST.MF:"
cat "$PROJ_DIR/decompiled_java/raw_assets/META-INF/MANIFEST.MF" 2>/dev/null || true
echo ""
echo "Summary of extracted directories:"
find "$PROJ_DIR/decompiled_java/raw_assets" -maxdepth 3 -type d | sort
