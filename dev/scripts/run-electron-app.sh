#!/bin/bash

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

ELECTRON_EXEC=$(sh ${REPO_ROOT}/dev/scripts/forge-path.sh)
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
  nohup open -n "${ELECTRON_EXEC}" >${REPO_ROOT}/electron.log 2>&1 &
else
  nohup ${ELECTRON_EXEC} >${REPO_ROOT}/electron.log 2>&1 &
fi
