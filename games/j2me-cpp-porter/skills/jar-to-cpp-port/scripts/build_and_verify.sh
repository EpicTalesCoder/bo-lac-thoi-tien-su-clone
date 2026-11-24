#!/usr/bin/env bash
set -euo pipefail

# Clean Desktop C++17 Release (-O2) + ASan/UBSan test runner & live smoke check
# Usage: ./build_and_verify.sh [project_dir] [target_name] [test_cpp1 ...]

PROJ_DIR="${1:-$(pwd)}"
TARGET="${2:-j2me_game}"
shift 2 || true
TEST_FILES=("$@")

cd "$PROJ_DIR"

echo "=== [1/3] Clean Desktop Release (-O2) Build ==="
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --clean-first -j 8 > /tmp/"${TARGET}_desktop_build.log" 2>&1 || {
    cat /tmp/"${TARGET}_desktop_build.log"
    rm -f /tmp/"${TARGET}_desktop_build.log"
    exit 1
}
if grep -F "$PROJ_DIR/src/" /tmp/"${TARGET}_desktop_build.log" | grep -qi "warning:"; then
    echo "[WARN] Project src warnings detected on Desktop build:"
    grep -F "$PROJ_DIR/src/" /tmp/"${TARGET}_desktop_build.log" | grep -i "warning:" || true
else
    echo "0 warnings in project src/ on Desktop!"
fi
rm -f /tmp/"${TARGET}_desktop_build.log"

echo "=== [2/3] ASan + UBSan Clean Build & Verification ==="
EXTRA_RPATH_FLAG=""
if [ "$(uname -s)" = "Darwin" ] && [ -d "/opt/homebrew/lib" ]; then
    EXTRA_RPATH_FLAG="-Wl,-rpath,/opt/homebrew/lib"
fi
cmake -B build_asan -DCMAKE_BUILD_TYPE=RelWithDebInfo \
    -DCMAKE_CXX_FLAGS="-O1 -g -fno-omit-frame-pointer -fsanitize=address,undefined -fno-sanitize-recover=all" \
    -DCMAKE_EXE_LINKER_FLAGS="-fsanitize=address,undefined ${EXTRA_RPATH_FLAG}"
cmake --build build_asan -j 8

ASAN_OBJS=()
while IFS= read -r obj; do
    ASAN_OBJS+=("$obj")
done < <(find build_asan/CMakeFiles/"$TARGET".dir/src -name "*.o" ! -name "main.cpp.o")

SDL_INC_FLAGS=()
SDL_LIB_FLAGS=()
if [ -n "$EXTRA_RPATH_FLAG" ]; then
    SDL_LIB_FLAGS+=("$EXTRA_RPATH_FLAG")
fi
if [ -f "build_asan/CMakeFiles/${TARGET}.dir/flags.make" ]; then
    while IFS= read -r tok; do
        [ -n "$tok" ] && SDL_INC_FLAGS+=("$tok")
    done < <(python3 -c '
import re, pathlib
txt = pathlib.Path("'"build_asan/CMakeFiles/${TARGET}.dir/flags.make"'").read_text()
m = re.search(r"CXX_INCLUDES\s*=\s*(.*)", txt)
if m:
    for p in re.findall(r"(?:-isystem\s+|-I)\S+", m.group(1)):
        print(p)
' | tr ' ' '\n')
fi
if [ -f "build_asan/CMakeFiles/${TARGET}.dir/link.txt" ]; then
    while IFS= read -r tok; do
        [ -n "$tok" ] && SDL_LIB_FLAGS+=("$tok")
    done < <(python3 -c '
import pathlib
txt = pathlib.Path("'"build_asan/CMakeFiles/${TARGET}.dir/link.txt"'").read_text()
for tok in txt.split():
    if "SDL2" in tok and (tok.endswith(".dylib") or tok.endswith(".so") or tok.endswith(".a") or tok.startswith("-lSDL2")):
        print(tok)
')
fi
if [ ${#SDL_INC_FLAGS[@]} -eq 0 ]; then
    SDL_INC_FLAGS=(-I/opt/homebrew/include -I/opt/homebrew/include/SDL2)
fi
if [ ${#SDL_LIB_FLAGS[@]} -le 1 ]; then
    SDL_LIB_FLAGS+=(-L/opt/homebrew/lib -lSDL2 -lSDL2_image -lSDL2_mixer -lSDL2_ttf)
fi

for tcpp in "${TEST_FILES[@]}"; do
    echo "--- Running [ASan+UBSan] $(basename "$tcpp") ---"
    tbin="/tmp/$(basename "$tcpp" .cpp)_asan"
    g++ -std=c++17 -O1 -g -fno-omit-frame-pointer \
        -fsanitize=address,undefined -fno-sanitize-recover=all \
        -fno-rtti -fno-exceptions -Isrc "${SDL_INC_FLAGS[@]}" \
        "$tcpp" "${ASAN_OBJS[@]}" \
        "${SDL_LIB_FLAGS[@]}" \
        -o "$tbin"
    ASAN_OPTIONS=detect_leaks=0 SDL_VIDEODRIVER=dummy SDL_AUDIODRIVER=dummy \
        perl -e 'alarm 45; exec @ARGV' "$tbin"
    rm -f "$tbin"
done

echo "=== [3/3] Launching real ASan binary headless (2.2s smoke check) ==="
python3 - "$TARGET" <<'PY'
import os, signal, subprocess, sys
target = sys.argv[1]
env = dict(os.environ, ASAN_OPTIONS="detect_leaks=0", HOME=f"/tmp/{target}_asan_home", SDL_VIDEODRIVER="dummy", SDL_AUDIODRIVER="dummy")
p = subprocess.Popen([f"./build_asan/{target}"], env=env)
try:
    rc = p.wait(timeout=2.2)
    raise SystemExit(f"Real ASan binary exited unexpectedly early with code {rc}")
except subprocess.TimeoutExpired:
    p.send_signal(signal.SIGTERM)
    rc = p.wait(timeout=5)
    print(f"Real binary 2.2s ASan smoke OK (signal/exit={rc})")
PY
rm -rf build_asan
echo "ALL DESKTOP VERIFICATION CHECKS PASSED!"
