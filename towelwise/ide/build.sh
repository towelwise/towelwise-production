#!/usr/bin/env bash
# Builds a portable Windows Towelwise AI zip from this fork's committed HEAD, VSCodium-style.
# Run from Git Bash: "C:\Program Files\Git\bin\bash.exe" towelwise/ide/build.sh
# Uncommitted changes are not built.
# The VSCodium checkout and build output live outside the repo (TW_BUILD_DIR) to keep paths short.
# Timings are appended to $TW_BUILD_DIR/build-times.log.

set -eo pipefail

IDE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="$( dirname "$( dirname "${IDE_DIR}" )" )"
TW_BUILD_DIR="${TW_BUILD_DIR:-/c/tw-build}"
VSCODIUM_DIR="${TW_BUILD_DIR}/vscodium"

# shellcheck disable=SC1091
. "${IDE_DIR}/upstream.env"

for tool in git node npm jq python 7z cargo; do
  command -v "${tool}" >/dev/null || { echo "Missing tool: ${tool}" >&2; exit 1; }
done

log_time() { echo "$( date -Is ) $1" | tee -a "${TW_BUILD_DIR}/build-times.log"; }

mkdir -p "${TW_BUILD_DIR}"
log_time "start: VSCodium ${VSCODIUM_TAG}"

# 1. VSCodium at the pinned tag, clean.
if [[ ! -d "${VSCODIUM_DIR}/.git" ]]; then
  git clone --quiet --depth 1 --branch "${VSCODIUM_TAG}" https://github.com/VSCodium/vscodium.git "${VSCODIUM_DIR}"
fi
cd "${VSCODIUM_DIR}"
git fetch --quiet --depth 1 origin tag "${VSCODIUM_TAG}"
git reset --quiet --hard
git clean --quiet -fdx
git checkout --quiet "${VSCODIUM_TAG}"

# 2. Code-OSS comes from this fork, not Microsoft: swap the two lines of get_repo.sh that name the source.
# Its version logic (MS_TAG, MS_COMMIT from upstream/stable.json) stays VSCodium's.
FORK_SRC="$( cygpath -m "${REPO_DIR}" )"
sed -i \
  -e "s|^git remote add origin https://github.com/Microsoft/vscode.git\$|git remote add origin \"${FORK_SRC}\"|" \
  -e 's|^git fetch --depth 1 origin "${MS_COMMIT}"$|git fetch --depth 1 origin HEAD|' \
  get_repo.sh
grep -qxF "git remote add origin \"${FORK_SRC}\"" get_repo.sh && grep -qxF 'git fetch --depth 1 origin HEAD' get_repo.sh \
  || { echo "get_repo.sh did not match; update the clone swap for ${VSCODIUM_TAG}" >&2; exit 1; }

# 3. Identity: VSCodium merges its root product.json over the generated one.
jq -s '.[0] * .[1]' product.json "${IDE_DIR}/product.overlay.json" > product.json.tmp
mv product.json.tmp product.json

# Our own app icon and Windows tiles replace VSCodium's (a file overlay, not a patch).
cp "${IDE_DIR}"/icons/win32/* src/stable/resources/win32/
# Our core patches go in VSCodium's own hook for extra patches, which its prepare step applies after its
# own. This must stay after the reset and clean above, or the clean would delete them. See towelwise/ide/patches/README.md.
if compgen -G "${IDE_DIR}/patches/*.patch" > /dev/null; then
  mkdir -p patches/user
  cp "${IDE_DIR}"/patches/*.patch patches/user/
fi
# The small logo at the left of the title bar.
cp "${IDE_DIR}/icons/code-icon.svg" src/stable/src/vs/workbench/browser/media/code-icon.svg
# The faint mark in an empty editor replaces VSCodium's (the same four file names, one per theme kind).
mkdir -p src/stable/src/vs/workbench/browser/parts/editor/media
cp "${IDE_DIR}"/icons/letterpress/*.svg src/stable/src/vs/workbench/browser/parts/editor/media/

# The mark beside the product name on the Welcome page (patch 0002 points the page at it).
mkdir -p src/stable/src/vs/workbench/contrib/welcomeGettingStarted/browser/media
cp "${IDE_DIR}/icons/code-icon.svg" src/stable/src/vs/workbench/contrib/welcomeGettingStarted/browser/media/towelwise-mark.svg

# 4. Same settings as VSCodium's dev/build.sh, with our naming.
export APP_NAME="Towelwise AI"
export ASSETS_REPOSITORY="towelwise/towelwise"
export BINARY_NAME="towelwise-ai"
export GLOBAL_DIRNAME="towelwise-ai"
export CI_BUILD="no"
# No VSCodium update or download feed: Towelwise must never offer to update itself to VSCodium.
export DISABLE_UPDATE="yes"
export GH_REPO_PATH="towelwise/towelwise"
export ORG_NAME="Towelwise"
export SHOULD_BUILD="yes"
export SKIP_ASSETS="yes"
export SKIP_BUILD="no"
export SKIP_SOURCE="no"
export VSCODE_LATEST="no"
export VSCODE_QUALITY="stable"
export VSCODE_SKIP_NODE_VERSION_CHECK="yes"
export OS_NAME="windows"
export VSCODE_ARCH="x64"
export NODE_OPTIONS="--max-old-space-size=8192"

rm -rf vscode* VSCode*
# shellcheck disable=SC1091
. get_repo.sh
# shellcheck disable=SC1091
. version.sh
log_time "source fetched: ${MS_TAG}, fork $( git -C vscode rev-parse --short HEAD )"

# shellcheck disable=SC1091
. build.sh
log_time "app built"

# 5. Portable zip.
DIST="${TW_BUILD_DIR}/dist"
mkdir -p "${DIST}"
ZIP="${DIST}/TowelwiseAI-win32-x64-${RELEASE_VERSION}.zip"
rm -f "${ZIP}"
( cd "${VSCODIUM_DIR}/VSCode-win32-x64" && 7z a -tzip -mx=5 "$( cygpath -w "${ZIP}" )" . >/dev/null )
log_time "zipped: ${ZIP} ($( du -h "${ZIP}" | cut -f1 ))"
