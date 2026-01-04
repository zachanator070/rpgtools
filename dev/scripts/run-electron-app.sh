#!/bin/bash

# This script runs the built Electron app considering OS specifics.

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

ELECTRON_APP=$(sh ${REPO_ROOT}/dev/scripts/electron-app-location.sh)
. ${REPO_ROOT}/.env
echo "SQLITE_DIRECTORY_PATH: ${SQLITE_DIRECTORY_PATH}"
export SQLITE_DIRECTORY_PATH=${SQLITE_DIRECTORY_PATH}

OS=$(uname -s)
# lowercase the OS
OS=$(echo "$OS" | tr '[:upper:]' '[:lower:]')
if [ "$OS" = "darwin" ]
then
  # `open` reuses an existing running instance by default; `-n` forces a new instance
  # so code changes inside the app bundle are actually picked up.
  nohup open -n "${ELECTRON_APP}" >${REPO_ROOT}/electron.log 2>&1 &
else
  nohup ${ELECTRON_APP} >${REPO_ROOT}/electron.log 2>&1 &
fi
