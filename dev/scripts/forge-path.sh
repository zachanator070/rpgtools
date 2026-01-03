#!/bin/bash

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

OS=$(uname -s)
# lowercase the OS
OS=$(echo "$OS" | tr '[:upper:]' '[:lower:]')
OS_ARCH=$(uname -m)
#if x86_64, use x64
if [ "$OS_ARCH" = "x86_64" ]
then
  OS_ARCH="x64"
fi

EXEC_NAME="@rpgtools-server"
if [ "$OS" = "darwin" ]
then
  EXEC_NAME="rpgtools.app"
fi

echo "${REPO_ROOT}/out/rpgtools-${OS}-${OS_ARCH}/${EXEC_NAME}"