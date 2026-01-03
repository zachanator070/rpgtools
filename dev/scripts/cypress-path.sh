#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

# If CYPRESS_CACHE_FOLDER is set, use it (Makefile exports it). Otherwise, fall
# back to a typical per-OS cache location (avoid invoking `npx` at parse-time).
if [ -n "${CYPRESS_CACHE_FOLDER:-}" ]; then
  CYPRESS_PATH="${CYPRESS_CACHE_FOLDER}"
else
  CYPRESS_PATH="${REPO_ROOT}/.cache/Cypress"
fi

# Get the Cypress version from package-lock.json instead of invoking `npx`.
# npm lockfile v2/v3 usually stores it at:
# - .packages["node_modules/cypress"].version
# Fallback:
# - .dependencies.cypress.version
if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to determine Cypress version from package-lock.json" >&2
  exit 1
fi

CYPRESS_VERSION="$(
  jq -r '(.packages["node_modules/cypress"].version // .dependencies.cypress.version // empty)' "${REPO_ROOT}/package-lock.json"
)"

if [ -z "${CYPRESS_VERSION}" ]; then
  echo "Unable to determine Cypress version from ${REPO_ROOT}/package-lock.json" >&2
  exit 1
fi

CYPRESS_EXEC="Cypress/Cypress"

OS=$(uname -s)
# lowercase the OS
OS=$(echo "$OS" | tr '[:upper:]' '[:lower:]')
if [ "$OS" = "darwin" ]
then
  CYPRESS_EXEC="Cypress.app/Contents/MacOS/Cypress"
fi

# print the path to the cypress binary
echo "${CYPRESS_PATH}/${CYPRESS_VERSION}/${CYPRESS_EXEC}"